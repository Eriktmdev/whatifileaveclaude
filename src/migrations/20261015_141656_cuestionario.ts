import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "economics_exchange_rates" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"from" varchar DEFAULT 'EUR' NOT NULL,
  	"to" varchar DEFAULT 'AUD' NOT NULL,
  	"rate" numeric NOT NULL,
  	"observed_at" timestamp(3) with time zone NOT NULL,
  	"source_id" integer NOT NULL
  );
  
  CREATE TABLE "economics" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "economics_exchange_rates" ADD CONSTRAINT "economics_exchange_rates_source_id_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."sources"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "economics_exchange_rates" ADD CONSTRAINT "economics_exchange_rates_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."economics"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "economics_exchange_rates_order_idx" ON "economics_exchange_rates" USING btree ("_order");
  CREATE INDEX "economics_exchange_rates_parent_id_idx" ON "economics_exchange_rates" USING btree ("_parent_id");
  CREATE INDEX "economics_exchange_rates_source_idx" ON "economics_exchange_rates" USING btree ("source_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "economics_exchange_rates" CASCADE;
  DROP TABLE "economics" CASCADE;`)
}
