import argon2 from "argon2";
import {
  Arg,
  Ctx,
  Field,
  Mutation,
  ObjectType,
  Query,
  Resolver,
} from "type-graphql";
import { COOKIE_NAME, FORGOT_PASSWORD_PREFIX } from "../constants";
import { UserEntity } from "../entities/User";
import { MyContext } from "../types";
import { sendEmail } from "../utils/sendEmail";
import ValidateRegister from "../utils/validateRegister";
import { UserDataInput } from "./UserDataInput";
import { v4 } from "uuid";

@ObjectType()
class FieldError {
  @Field(() => String)
  field: string;

  @Field(() => String)
  message: string;
}

@ObjectType()
class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => UserEntity, { nullable: true })
  user?: UserEntity;
}

@Resolver()
export class UserResolver {
  @Query(() => UserEntity, { nullable: true })
  async me(@Ctx() { req, em }: MyContext): Promise<UserEntity | null> {
    if (!req.session.user) {
      return null;
    }

    const user = await em.findOne(UserEntity, { _id: req.session.user.id });
    return user;
  }

  @Mutation(() => Boolean)
  async forgotPassword(
    @Arg("email") email: string,
    @Ctx() { em, redis }: MyContext
  ): Promise<Boolean> {
    const user = await em.findOne(UserEntity, { email });
    if (!user) return true;
    const token = v4();

    await redis.set(
      FORGOT_PASSWORD_PREFIX + token,
      user._id,
      "EX",
      1000 * 60 * 24 * 3
    ); // 3 days

    await sendEmail(
      email,
      `<a href="http://localhost:3000/change-password/${token}">reset password</a>`
    );
    return true;
  }

  @Mutation(() => UserResponse)
  async register(
    @Arg("input", () => UserDataInput) input: UserDataInput,
    @Ctx() { req, em }: MyContext
  ): Promise<UserResponse> {
    const errors = ValidateRegister(input);
    if (errors) return { errors };

    const hashedPassword = await argon2.hash(input.password);
    const user = em.create(UserEntity, {
      email: input.email,
      username: input.username,
      password: hashedPassword,
    } as UserEntity);
    try {
      await em.persistAndFlush(user);
    } catch (err) {
      if (err.detail.includes("already exists")) {
        // duplicate username
        return {
          errors: [
            {
              field: "username",
              message: "Username already taken",
            },
          ],
        };
      }
    }
    // auto login cookie
    req.session.user = { id: user._id };
    return { user };
  }

  @Mutation(() => UserResponse)
  async changePassword(
    @Arg("token") token: string,
    @Arg("newPassword") newPassword: string,
    @Ctx() { em, redis }: MyContext
  ): Promise<UserResponse> {
    if (newPassword.length < 3)
      return {
        errors: [
          {
            field: "newPassword",
            message: "New password should be at least 3 characters long ",
          },
        ],
      };

    const redisKey = FORGOT_PASSWORD_PREFIX + token;
    const userId = await redis.get(redisKey);

    if (!userId)
      return {
        errors: [
          {
            field: "token",
            message: "bad token",
          },
        ],
      };

    const user = await em.findOne(UserEntity, { _id: +userId });

    if (!user)
      return {
        errors: [
          {
            field: "token",
            message: "user not existent",
          },
        ],
      };

    user.password = await argon2.hash(newPassword);
    await em.persistAndFlush(user);

    await redis.del(redisKey);

    return { user };
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg("usernameOrEmail") usernameOrEmail: string,
    @Arg("password") password: string,
    @Ctx() { em, req }: MyContext
  ): Promise<UserResponse> {
    const user = await em.findOne(
      UserEntity,
      usernameOrEmail.includes("@")
        ? { email: usernameOrEmail }
        : { username: usernameOrEmail }
    );
    if (!user) {
      return {
        errors: [
          {
            field: "usernameOrEmail",
            message: "Username or Email doesn't exist",
          },
        ],
      };
    }
    const valid = await argon2.verify(user.password, password);
    if (!valid) {
      return {
        errors: [
          {
            field: "password",
            message: "Incorrect password",
          },
        ],
      };
    }
    req.session.user = { id: user._id };

    return {
      user,
    };
  }

  @Mutation(() => Boolean)
  async logout(@Ctx() { req, res }: MyContext): Promise<Boolean> {
    return new Promise((resolve) =>
      req.session.destroy((err) => {
        res.clearCookie(COOKIE_NAME);
        if (err) {
          console.log(err);
          resolve(false);
        } else {
          resolve(true);
        }
      })
    );
  }
}
