import { Migration } from '@mikro-orm/migrations';

export class Migration20230108223829 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "user_entity" add column "email" text not null;');
    this.addSql('alter table "user_entity" add constraint "user_entity_email_unique" unique ("email");');
  }

  async down(): Promise<void> {
    this.addSql('alter table "user_entity" drop constraint "user_entity_email_unique";');
    this.addSql('alter table "user_entity" drop column "email";');
  }

}
