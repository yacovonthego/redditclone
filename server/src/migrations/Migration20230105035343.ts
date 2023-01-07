import { Migration } from '@mikro-orm/migrations';

export class Migration20230105035343 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table "user_entity" ("_id" serial primary key, "created_at" timestamptz(0) not null, "updated_at" timestamptz(0) not null, "username" text not null, "password" text not null);');
    this.addSql('alter table "user_entity" add constraint "user_entity_username_unique" unique ("username");');

    this.addSql('drop table if exists "user" cascade;');
  }

  async down(): Promise<void> {
    this.addSql('create table "user" ("_id" serial primary key, "created_at" timestamptz(0) not null, "updated_at" timestamptz(0) not null, "usesrname" text not null, "password" text not null);');
    this.addSql('alter table "user" add constraint "user_usesrname_unique" unique ("usesrname");');

    this.addSql('drop table if exists "user_entity" cascade;');
  }

}
