import { MikroORM } from "@mikro-orm/core";
import { ApolloServer } from "apollo-server-express";
import express from "express";
import { buildSchema } from "type-graphql";
import config from "./mikro-orm.config";
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/user";

const main = async () => {
  const orm = await MikroORM.init(config);
  await orm.getMigrator().up();
  const em = orm.em.fork();

  const app = express();

  const apoloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver, UserResolver],
      validate: false,
    }),
    context: () => ({ em }),
  });

  // TODO: maybe use request context helper
  // const post = em.create(Post, {
  //   title: "let me see this nice first post!",
  // } as Post);
  // await em.persistAndFlush(post)

  // const posts = await em.find(Post, {})
  // console.log(posts)

  await apoloServer.start();
  apoloServer.applyMiddleware({ app });

  app.listen("4000", () => {
    console.log("server started on localhost:4000");
  });
};

main().catch((err) => console.log(err));
