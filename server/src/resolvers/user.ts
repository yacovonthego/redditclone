import argon2 from "argon2";
import { COOKIE_NAME } from "../constants";
import { MyContext } from "../types";
import {
  Arg,
  Ctx,
  Field,
  InputType,
  Mutation,
  ObjectType,
  Query,
  Resolver,
} from "type-graphql";
import { UserEntity } from "../entities/User";

@InputType()
class UserDataInput {
  @Field(() => String)
  username: string;

  @Field(() => String)
  password: string;
}

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

  @Mutation(() => UserResponse)
  async register(
    @Arg("input", () => UserDataInput) input: UserDataInput,
    @Ctx() { req, em }: MyContext
  ): Promise<UserResponse> {
    if (input.username.length < 3)
      return {
        errors: [
          {
            field: "username",
            message: "Username should be at least 3 characters long",
          },
        ],
      };

    if (input.password.length < 3)
      return {
        errors: [
          {
            field: "password",
            message: "Password should be at least 3 characters long ",
          },
        ],
      };

    const hashedPassword = await argon2.hash(input.password);
    const user = em.create(UserEntity, {
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
  async login(
    @Arg("input", () => UserDataInput) input: UserDataInput,
    @Ctx() { em, req }: MyContext
  ): Promise<UserResponse> {
    const user = await em.findOne(UserEntity, {
      username: input.username,
    });
    if (!user) {
      return {
        errors: [
          {
            field: "username",
            message: "Username doesn't exist",
          },
        ],
      };
    }
    const valid = await argon2.verify(user.password, input.password);
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
