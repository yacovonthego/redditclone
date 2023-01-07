import { Migration } from '@mikro-orm/migrations';

export class Migration20230105030816 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table "user" ("_id" serial primary key, "created_at" timestamptz(0) not null, "updated_at" timestamptz(0) not null, "usesrname" text not null, "password" text not null);');
    this.addSql('alter table "user" add constraint "user_usesrname_unique" unique ("usesrname");');
  }

  async down(): Promise<void> {
    this.addSql('drop table if exists "user" cascade;');
  }

}
