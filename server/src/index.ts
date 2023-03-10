import { MikroORM } from "@mikro-orm/core";
import { ApolloServer } from "apollo-server-express";
import connectRedis from "connect-redis";
import cors from "cors";
import express from "express";
import session from "express-session";
import Redis from "ioredis";
import { buildSchema } from "type-graphql";
import { COOKIE_NAME, __prod__ } from "./constants";
import config from "./mikro-orm.config";
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/user";
import { MyContext } from "./types";

const main = async () => {
  // sendEmail('bob@bob.ru', 'hello brother')
  const RedisStore = connectRedis(session);
  const redis = new Redis();

  // const redisClient = createClient({
  //   legacyMode: true,
  // });

  // await redisClient.connect();

  const orm = await MikroORM.init(config);
  await orm.getMigrator().up();
  const em = orm.em.fork();
  const app = express();
  app.use(
    cors({
      maxAge: 84600,
      credentials: true,
      origin: "http://localhost:3000",
    })
  );
  app.set("trust proxy", 1);
  app.use(
    session({
      name: COOKIE_NAME,
      saveUninitialized: true,
      store: new RedisStore({
        client: redis,
        disableTouch: true,
      }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 years
        httpOnly: true,
        sameSite: "lax",
        secure: !__prod__, // only https cookie in prod
      },
      secret: "qqweqqwwe",
      resave: false,
    })
  );

  const apoloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver, UserResolver],
      validate: false,
    }),
    context: ({ req, res }): MyContext => ({ em, req, res, redis }),
  });

  await apoloServer.start();
  apoloServer.applyMiddleware({
    app,
    cors: false,
  });

  app.listen("8080", () => {
    console.log("server started on localhost:8080");
  });
};

main().catch((err) => console.log(err));
