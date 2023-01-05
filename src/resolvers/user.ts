import { MyContext } from "src/types";
import {
  Arg,
  Ctx,
  Field,
  InputType,
  Mutation,
  ObjectType,
  Resolver,
} from "type-graphql";
import { UserEntity } from "../entities/User";
import argon2 from "argon2";

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
  @Mutation(() => UserResponse)
  async register(
    @Arg("input", () => UserDataInput) input: UserDataInput,
    // @Arg("username") username: string,
    // @Arg("password") password: string,
    @Ctx() { em }: MyContext
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
            message: "Password should be at least 3 characters long",
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
      if (err.code === "23505" || err.detail.includes("already exists")) {
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
    return { user };
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg("input", () => UserDataInput) input: UserDataInput,
    // @Arg("username") username: string,
    // @Arg("password") password: string,
    @Ctx() { em }: MyContext
  ): Promise<UserResponse> {
    // try {

    //   await em.persistAndFlush(user);
    //   return user;
    // } catch (err) {
    //   return null;
    // }
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

    return {
      user,
    };
  }
}
