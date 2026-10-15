import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_countries_quick_facts_icon" AS ENUM('capital', 'language', 'currency', 'time', 'other');
  CREATE TYPE "public"."enum__countries_v_version_quick_facts_icon" AS ENUM('capital', 'language', 'currency', 'time', 'other');
  CREATE TABLE "countries_quick_facts" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"icon" "enum_countries_quick_facts_icon" DEFAULT 'other',
  	"label" varchar,
  	"value" varchar,
  	"source_id" integer
  );
  
  CREATE TABLE "_countries_v_version_quick_facts" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"icon" "enum__countries_v_version_quick_facts_icon" DEFAULT 'other',
  	"label" varchar,
  	"value" varchar,
  	"source_id" integer,
  	"_uuid" varchar
  );
  
  ALTER TABLE "guides" ADD COLUMN "image_src" varchar;
  ALTER TABLE "guides" ADD COLUMN "image_alt" varchar;
  ALTER TABLE "guides" ADD COLUMN "image_credit" varchar;
  ALTER TABLE "guides" ADD COLUMN "image_credit_url" varchar;
  ALTER TABLE "_guides_v" ADD COLUMN "version_image_src" varchar;
  ALTER TABLE "_guides_v" ADD COLUMN "version_image_alt" varchar;
  ALTER TABLE "_guides_v" ADD COLUMN "version_image_credit" varchar;
  ALTER TABLE "_guides_v" ADD COLUMN "version_image_credit_url" varchar;
  ALTER TABLE "countries" ADD COLUMN "hero_image_src" varchar;
  ALTER TABLE "countries" ADD COLUMN "hero_image_alt" varchar;
  ALTER TABLE "countries" ADD COLUMN "hero_image_credit" varchar;
  ALTER TABLE "countries" ADD COLUMN "hero_image_credit_url" varchar;
  ALTER TABLE "_countries_v" ADD COLUMN "version_hero_image_src" varchar;
  ALTER TABLE "_countries_v" ADD COLUMN "version_hero_image_alt" varchar;
  ALTER TABLE "_countries_v" ADD COLUMN "version_hero_image_credit" varchar;
  ALTER TABLE "_countries_v" ADD COLUMN "version_hero_image_credit_url" varchar;
  ALTER TABLE "countries_quick_facts" ADD CONSTRAINT "countries_quick_facts_source_id_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."sources"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "countries_quick_facts" ADD CONSTRAINT "countries_quick_facts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."countries"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_countries_v_version_quick_facts" ADD CONSTRAINT "_countries_v_version_quick_facts_source_id_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."sources"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_countries_v_version_quick_facts" ADD CONSTRAINT "_countries_v_version_quick_facts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_countries_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "countries_quick_facts_order_idx" ON "countries_quick_facts" USING btree ("_order");
  CREATE INDEX "countries_quick_facts_parent_id_idx" ON "countries_quick_facts" USING btree ("_parent_id");
  CREATE INDEX "countries_quick_facts_source_idx" ON "countries_quick_facts" USING btree ("source_id");
  CREATE INDEX "_countries_v_version_quick_facts_order_idx" ON "_countries_v_version_quick_facts" USING btree ("_order");
  CREATE INDEX "_countries_v_version_quick_facts_parent_id_idx" ON "_countries_v_version_quick_facts" USING btree ("_parent_id");
  CREATE INDEX "_countries_v_version_quick_facts_source_idx" ON "_countries_v_version_quick_facts" USING btree ("source_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "countries_quick_facts" CASCADE;
  DROP TABLE "_countries_v_version_quick_facts" CASCADE;
  ALTER TABLE "guides" DROP COLUMN "image_src";
  ALTER TABLE "guides" DROP COLUMN "image_alt";
  ALTER TABLE "guides" DROP COLUMN "image_credit";
  ALTER TABLE "guides" DROP COLUMN "image_credit_url";
  ALTER TABLE "_guides_v" DROP COLUMN "version_image_src";
  ALTER TABLE "_guides_v" DROP COLUMN "version_image_alt";
  ALTER TABLE "_guides_v" DROP COLUMN "version_image_credit";
  ALTER TABLE "_guides_v" DROP COLUMN "version_image_credit_url";
  ALTER TABLE "countries" DROP COLUMN "hero_image_src";
  ALTER TABLE "countries" DROP COLUMN "hero_image_alt";
  ALTER TABLE "countries" DROP COLUMN "hero_image_credit";
  ALTER TABLE "countries" DROP COLUMN "hero_image_credit_url";
  ALTER TABLE "_countries_v" DROP COLUMN "version_hero_image_src";
  ALTER TABLE "_countries_v" DROP COLUMN "version_hero_image_alt";
  ALTER TABLE "_countries_v" DROP COLUMN "version_hero_image_credit";
  ALTER TABLE "_countries_v" DROP COLUMN "version_hero_image_credit_url";
  DROP TYPE "public"."enum_countries_quick_facts_icon";
  DROP TYPE "public"."enum__countries_v_version_quick_facts_icon";`)
}
