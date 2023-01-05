import { Options } from '@mikro-orm/core';
import { __prod__ } from "./constants";
import { Post } from "./entities/Post";
import { UserEntity } from "./entities/User";
import path from 'path';

export default {
  migrations: {
    path: path.join(__dirname,'./migrations'), 
    pathTs: undefined, 
    glob: '!(*.d).{js,ts}', 
  },
  entities: [Post, UserEntity],
  dbName: "redditclone",
  user: "yakov",
  password: "freekiller99",
  type: "postgresql",
  debug: !__prod__,
} as Options; // expected type for MikroORM.init
