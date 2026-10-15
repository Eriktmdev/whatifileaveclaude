import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_regions_verification_review_status" AS ENUM('unverified', 'verified', 'needs_review');
  CREATE TYPE "public"."enum_regions_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__regions_v_version_verification_review_status" AS ENUM('unverified', 'verified', 'needs_review');
  CREATE TYPE "public"."enum__regions_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_requirements_type" AS ENUM('eligibility', 'document', 'financial', 'health_character', 'quota', 'other');
  CREATE TYPE "public"."enum_requirements_volatility" AS ENUM('low', 'medium', 'high');
  CREATE TYPE "public"."enum__requirements_v_version_type" AS ENUM('eligibility', 'document', 'financial', 'health_character', 'quota', 'other');
  CREATE TYPE "public"."enum__requirements_v_version_volatility" AS ENUM('low', 'medium', 'high');
  CREATE TYPE "public"."enum_opportunities_signals_kind" AS ENUM('listed_occupation', 'shortage_evidence', 'current_vacancies', 'salary_reference');
  CREATE TYPE "public"."enum_opportunities_sector" AS ENUM('tecnologia', 'mineria-energia', 'construccion', 'sanidad', 'hosteleria-turismo', 'agricultura', 'educacion', 'logistica', 'administracion', 'otros');
  CREATE TYPE "public"."enum_opportunities_verification_review_status" AS ENUM('unverified', 'verified', 'needs_review');
  CREATE TYPE "public"."enum_opportunities_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__opportunities_v_version_signals_kind" AS ENUM('listed_occupation', 'shortage_evidence', 'current_vacancies', 'salary_reference');
  CREATE TYPE "public"."enum__opportunities_v_version_sector" AS ENUM('tecnologia', 'mineria-energia', 'construccion', 'sanidad', 'hosteleria-turismo', 'agricultura', 'educacion', 'logistica', 'administracion', 'otros');
  CREATE TYPE "public"."enum__opportunities_v_version_verification_review_status" AS ENUM('unverified', 'verified', 'needs_review');
  CREATE TYPE "public"."enum__opportunities_v_version_status" AS ENUM('draft', 'published');
  CREATE TABLE "guides_faqs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"answer" varchar
  );
  
  CREATE TABLE "_guides_v_version_faqs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"answer" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "regions_characteristics" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "regions" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"slug" varchar,
  	"country_id" integer,
  	"main_city" varchar,
  	"summary" varchar,
  	"labour_market" varchar,
  	"cost_of_living" varchar,
  	"mobility" varchar,
  	"image_src" varchar,
  	"image_alt" varchar,
  	"image_credit" varchar,
  	"image_credit_url" varchar,
  	"verification_review_status" "enum_regions_verification_review_status" DEFAULT 'unverified',
  	"verification_last_verified_at" timestamp(3) with time zone,
  	"verification_verified_by_id" integer,
  	"verification_valid_from" timestamp(3) with time zone,
  	"verification_valid_until" timestamp(3) with time zone,
  	"verification_flagged_at" timestamp(3) with time zone,
  	"verification_review_note" varchar,
  	"is_demo" boolean DEFAULT false,
  	"review_requested" boolean DEFAULT false,
  	"last_edited_by_id" integer,
  	"archived" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_regions_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "regions_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"sources_id" integer
  );
  
  CREATE TABLE "_regions_v_version_characteristics" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_regions_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_name" varchar,
  	"version_slug" varchar,
  	"version_country_id" integer,
  	"version_main_city" varchar,
  	"version_summary" varchar,
  	"version_labour_market" varchar,
  	"version_cost_of_living" varchar,
  	"version_mobility" varchar,
  	"version_image_src" varchar,
  	"version_image_alt" varchar,
  	"version_image_credit" varchar,
  	"version_image_credit_url" varchar,
  	"version_verification_review_status" "enum__regions_v_version_verification_review_status" DEFAULT 'unverified',
  	"version_verification_last_verified_at" timestamp(3) with time zone,
  	"version_verification_verified_by_id" integer,
  	"version_verification_valid_from" timestamp(3) with time zone,
  	"version_verification_valid_until" timestamp(3) with time zone,
  	"version_verification_flagged_at" timestamp(3) with time zone,
  	"version_verification_review_note" varchar,
  	"version_is_demo" boolean DEFAULT false,
  	"version_review_requested" boolean DEFAULT false,
  	"version_last_edited_by_id" integer,
  	"version_archived" boolean DEFAULT false,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__regions_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "_regions_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"sources_id" integer
  );
  
  CREATE TABLE "pathways_advantages" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "pathways_restrictions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "pathways_official_bodies" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"url" varchar
  );
  
  CREATE TABLE "pathways_known_costs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"concept" varchar,
  	"amount" numeric,
  	"currency" varchar DEFAULT 'AUD',
  	"source_id" integer,
  	"note" varchar
  );
  
  CREATE TABLE "_pathways_v_version_advantages" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pathways_v_version_restrictions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pathways_v_version_official_bodies" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"url" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pathways_v_version_known_costs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"concept" varchar,
  	"amount" numeric,
  	"currency" varchar DEFAULT 'AUD',
  	"source_id" integer,
  	"note" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "opportunities_signals" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"kind" "enum_opportunities_signals_kind",
  	"observed_at" timestamp(3) with time zone,
  	"source_id" integer,
  	"statement" varchar,
  	"value" varchar
  );
  
  CREATE TABLE "opportunities" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"slug" varchar,
  	"country_id" integer,
  	"sector" "enum_opportunities_sector",
  	"summary" varchar,
  	"entry_requirements" varchar,
  	"barriers" varchar,
  	"verification_review_status" "enum_opportunities_verification_review_status" DEFAULT 'unverified',
  	"verification_last_verified_at" timestamp(3) with time zone,
  	"verification_verified_by_id" integer,
  	"verification_valid_from" timestamp(3) with time zone,
  	"verification_valid_until" timestamp(3) with time zone,
  	"verification_flagged_at" timestamp(3) with time zone,
  	"verification_review_note" varchar,
  	"is_demo" boolean DEFAULT false,
  	"review_requested" boolean DEFAULT false,
  	"last_edited_by_id" integer,
  	"archived" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_opportunities_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "opportunities_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "opportunities_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"regions_id" integer,
  	"pathways_id" integer,
  	"sources_id" integer
  );
  
  CREATE TABLE "_opportunities_v_version_signals" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"kind" "enum__opportunities_v_version_signals_kind",
  	"observed_at" timestamp(3) with time zone,
  	"source_id" integer,
  	"statement" varchar,
  	"value" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_opportunities_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_slug" varchar,
  	"version_country_id" integer,
  	"version_sector" "enum__opportunities_v_version_sector",
  	"version_summary" varchar,
  	"version_entry_requirements" varchar,
  	"version_barriers" varchar,
  	"version_verification_review_status" "enum__opportunities_v_version_verification_review_status" DEFAULT 'unverified',
  	"version_verification_last_verified_at" timestamp(3) with time zone,
  	"version_verification_verified_by_id" integer,
  	"version_verification_valid_from" timestamp(3) with time zone,
  	"version_verification_valid_until" timestamp(3) with time zone,
  	"version_verification_flagged_at" timestamp(3) with time zone,
  	"version_verification_review_note" varchar,
  	"version_is_demo" boolean DEFAULT false,
  	"version_review_requested" boolean DEFAULT false,
  	"version_last_edited_by_id" integer,
  	"version_archived" boolean DEFAULT false,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__opportunities_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "_opportunities_v_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "_opportunities_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"regions_id" integer,
  	"pathways_id" integer,
  	"sources_id" integer
  );
  
  CREATE TABLE "homepage_faqs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"question" varchar NOT NULL,
  	"answer" varchar NOT NULL
  );
  
  CREATE TABLE "homepage" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"hero_title" varchar DEFAULT '¿Y si te fueras?' NOT NULL,
  	"hero_subtitle" varchar DEFAULT 'Descubre oportunidades reales para vivir y trabajar fuera, entiende qué te pedirían y convierte la idea en un plan.' NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "homepage_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"guides_id" integer
  );
  
  ALTER TABLE "guides" ADD COLUMN "verification_flagged_at" timestamp(3) with time zone;
  ALTER TABLE "guides" ADD COLUMN "review_requested" boolean DEFAULT false;
  ALTER TABLE "guides" ADD COLUMN "last_edited_by_id" integer;
  ALTER TABLE "guides" ADD COLUMN "archived" boolean DEFAULT false;
  ALTER TABLE "guides_rels" ADD COLUMN "guides_id" integer;
  ALTER TABLE "_guides_v" ADD COLUMN "version_verification_flagged_at" timestamp(3) with time zone;
  ALTER TABLE "_guides_v" ADD COLUMN "version_review_requested" boolean DEFAULT false;
  ALTER TABLE "_guides_v" ADD COLUMN "version_last_edited_by_id" integer;
  ALTER TABLE "_guides_v" ADD COLUMN "version_archived" boolean DEFAULT false;
  ALTER TABLE "_guides_v_rels" ADD COLUMN "guides_id" integer;
  ALTER TABLE "countries" ADD COLUMN "currency_code" varchar;
  ALTER TABLE "countries" ADD COLUMN "review_requested" boolean DEFAULT false;
  ALTER TABLE "countries" ADD COLUMN "last_edited_by_id" integer;
  ALTER TABLE "countries" ADD COLUMN "archived" boolean DEFAULT false;
  ALTER TABLE "_countries_v" ADD COLUMN "version_currency_code" varchar;
  ALTER TABLE "_countries_v" ADD COLUMN "version_review_requested" boolean DEFAULT false;
  ALTER TABLE "_countries_v" ADD COLUMN "version_last_edited_by_id" integer;
  ALTER TABLE "_countries_v" ADD COLUMN "version_archived" boolean DEFAULT false;
  ALTER TABLE "pathways" ADD COLUMN "limits" varchar;
  ALTER TABLE "pathways" ADD COLUMN "verification_flagged_at" timestamp(3) with time zone;
  ALTER TABLE "pathways" ADD COLUMN "review_requested" boolean DEFAULT false;
  ALTER TABLE "pathways" ADD COLUMN "last_edited_by_id" integer;
  ALTER TABLE "pathways" ADD COLUMN "archived" boolean DEFAULT false;
  ALTER TABLE "_pathways_v" ADD COLUMN "version_limits" varchar;
  ALTER TABLE "_pathways_v" ADD COLUMN "version_verification_flagged_at" timestamp(3) with time zone;
  ALTER TABLE "_pathways_v" ADD COLUMN "version_review_requested" boolean DEFAULT false;
  ALTER TABLE "_pathways_v" ADD COLUMN "version_last_edited_by_id" integer;
  ALTER TABLE "_pathways_v" ADD COLUMN "version_archived" boolean DEFAULT false;
  ALTER TABLE "requirements" ADD COLUMN "type" "enum_requirements_type" DEFAULT 'eligibility';
  ALTER TABLE "requirements" ADD COLUMN "volatility" "enum_requirements_volatility" DEFAULT 'medium';
  ALTER TABLE "requirements" ADD COLUMN "verification_flagged_at" timestamp(3) with time zone;
  ALTER TABLE "requirements" ADD COLUMN "review_requested" boolean DEFAULT false;
  ALTER TABLE "requirements" ADD COLUMN "last_edited_by_id" integer;
  ALTER TABLE "requirements" ADD COLUMN "archived" boolean DEFAULT false;
  ALTER TABLE "_requirements_v" ADD COLUMN "version_type" "enum__requirements_v_version_type" DEFAULT 'eligibility';
  ALTER TABLE "_requirements_v" ADD COLUMN "version_volatility" "enum__requirements_v_version_volatility" DEFAULT 'medium';
  ALTER TABLE "_requirements_v" ADD COLUMN "version_verification_flagged_at" timestamp(3) with time zone;
  ALTER TABLE "_requirements_v" ADD COLUMN "version_review_requested" boolean DEFAULT false;
  ALTER TABLE "_requirements_v" ADD COLUMN "version_last_edited_by_id" integer;
  ALTER TABLE "_requirements_v" ADD COLUMN "version_archived" boolean DEFAULT false;
  ALTER TABLE "sources" ADD COLUMN "published_at" timestamp(3) with time zone;
  ALTER TABLE "sources" ADD COLUMN "accessed_at" timestamp(3) with time zone;
  ALTER TABLE "sources" ADD COLUMN "verification_flagged_at" timestamp(3) with time zone;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "regions_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "opportunities_id" integer;
  ALTER TABLE "guides_faqs" ADD CONSTRAINT "guides_faqs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."guides"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_guides_v_version_faqs" ADD CONSTRAINT "_guides_v_version_faqs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_guides_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "regions_characteristics" ADD CONSTRAINT "regions_characteristics_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."regions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "regions" ADD CONSTRAINT "regions_country_id_countries_id_fk" FOREIGN KEY ("country_id") REFERENCES "public"."countries"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "regions" ADD CONSTRAINT "regions_verification_verified_by_id_users_id_fk" FOREIGN KEY ("verification_verified_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "regions" ADD CONSTRAINT "regions_last_edited_by_id_users_id_fk" FOREIGN KEY ("last_edited_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "regions_rels" ADD CONSTRAINT "regions_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."regions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "regions_rels" ADD CONSTRAINT "regions_rels_sources_fk" FOREIGN KEY ("sources_id") REFERENCES "public"."sources"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_regions_v_version_characteristics" ADD CONSTRAINT "_regions_v_version_characteristics_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_regions_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_regions_v" ADD CONSTRAINT "_regions_v_parent_id_regions_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."regions"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_regions_v" ADD CONSTRAINT "_regions_v_version_country_id_countries_id_fk" FOREIGN KEY ("version_country_id") REFERENCES "public"."countries"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_regions_v" ADD CONSTRAINT "_regions_v_version_verification_verified_by_id_users_id_fk" FOREIGN KEY ("version_verification_verified_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_regions_v" ADD CONSTRAINT "_regions_v_version_last_edited_by_id_users_id_fk" FOREIGN KEY ("version_last_edited_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_regions_v_rels" ADD CONSTRAINT "_regions_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_regions_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_regions_v_rels" ADD CONSTRAINT "_regions_v_rels_sources_fk" FOREIGN KEY ("sources_id") REFERENCES "public"."sources"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pathways_advantages" ADD CONSTRAINT "pathways_advantages_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pathways"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pathways_restrictions" ADD CONSTRAINT "pathways_restrictions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pathways"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pathways_official_bodies" ADD CONSTRAINT "pathways_official_bodies_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pathways"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pathways_known_costs" ADD CONSTRAINT "pathways_known_costs_source_id_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."sources"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pathways_known_costs" ADD CONSTRAINT "pathways_known_costs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pathways"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pathways_v_version_advantages" ADD CONSTRAINT "_pathways_v_version_advantages_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pathways_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pathways_v_version_restrictions" ADD CONSTRAINT "_pathways_v_version_restrictions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pathways_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pathways_v_version_official_bodies" ADD CONSTRAINT "_pathways_v_version_official_bodies_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pathways_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pathways_v_version_known_costs" ADD CONSTRAINT "_pathways_v_version_known_costs_source_id_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."sources"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pathways_v_version_known_costs" ADD CONSTRAINT "_pathways_v_version_known_costs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pathways_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "opportunities_signals" ADD CONSTRAINT "opportunities_signals_source_id_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."sources"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "opportunities_signals" ADD CONSTRAINT "opportunities_signals_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."opportunities"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "opportunities" ADD CONSTRAINT "opportunities_country_id_countries_id_fk" FOREIGN KEY ("country_id") REFERENCES "public"."countries"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "opportunities" ADD CONSTRAINT "opportunities_verification_verified_by_id_users_id_fk" FOREIGN KEY ("verification_verified_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "opportunities" ADD CONSTRAINT "opportunities_last_edited_by_id_users_id_fk" FOREIGN KEY ("last_edited_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "opportunities_texts" ADD CONSTRAINT "opportunities_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."opportunities"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "opportunities_rels" ADD CONSTRAINT "opportunities_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."opportunities"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "opportunities_rels" ADD CONSTRAINT "opportunities_rels_regions_fk" FOREIGN KEY ("regions_id") REFERENCES "public"."regions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "opportunities_rels" ADD CONSTRAINT "opportunities_rels_pathways_fk" FOREIGN KEY ("pathways_id") REFERENCES "public"."pathways"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "opportunities_rels" ADD CONSTRAINT "opportunities_rels_sources_fk" FOREIGN KEY ("sources_id") REFERENCES "public"."sources"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_opportunities_v_version_signals" ADD CONSTRAINT "_opportunities_v_version_signals_source_id_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."sources"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_opportunities_v_version_signals" ADD CONSTRAINT "_opportunities_v_version_signals_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_opportunities_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_opportunities_v" ADD CONSTRAINT "_opportunities_v_parent_id_opportunities_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."opportunities"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_opportunities_v" ADD CONSTRAINT "_opportunities_v_version_country_id_countries_id_fk" FOREIGN KEY ("version_country_id") REFERENCES "public"."countries"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_opportunities_v" ADD CONSTRAINT "_opportunities_v_version_verification_verified_by_id_users_id_fk" FOREIGN KEY ("version_verification_verified_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_opportunities_v" ADD CONSTRAINT "_opportunities_v_version_last_edited_by_id_users_id_fk" FOREIGN KEY ("version_last_edited_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_opportunities_v_texts" ADD CONSTRAINT "_opportunities_v_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_opportunities_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_opportunities_v_rels" ADD CONSTRAINT "_opportunities_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_opportunities_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_opportunities_v_rels" ADD CONSTRAINT "_opportunities_v_rels_regions_fk" FOREIGN KEY ("regions_id") REFERENCES "public"."regions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_opportunities_v_rels" ADD CONSTRAINT "_opportunities_v_rels_pathways_fk" FOREIGN KEY ("pathways_id") REFERENCES "public"."pathways"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_opportunities_v_rels" ADD CONSTRAINT "_opportunities_v_rels_sources_fk" FOREIGN KEY ("sources_id") REFERENCES "public"."sources"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_faqs" ADD CONSTRAINT "homepage_faqs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_rels" ADD CONSTRAINT "homepage_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."homepage"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_rels" ADD CONSTRAINT "homepage_rels_guides_fk" FOREIGN KEY ("guides_id") REFERENCES "public"."guides"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "guides_faqs_order_idx" ON "guides_faqs" USING btree ("_order");
  CREATE INDEX "guides_faqs_parent_id_idx" ON "guides_faqs" USING btree ("_parent_id");
  CREATE INDEX "_guides_v_version_faqs_order_idx" ON "_guides_v_version_faqs" USING btree ("_order");
  CREATE INDEX "_guides_v_version_faqs_parent_id_idx" ON "_guides_v_version_faqs" USING btree ("_parent_id");
  CREATE INDEX "regions_characteristics_order_idx" ON "regions_characteristics" USING btree ("_order");
  CREATE INDEX "regions_characteristics_parent_id_idx" ON "regions_characteristics" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "regions_slug_idx" ON "regions" USING btree ("slug");
  CREATE INDEX "regions_country_idx" ON "regions" USING btree ("country_id");
  CREATE INDEX "regions_verification_verification_verified_by_idx" ON "regions" USING btree ("verification_verified_by_id");
  CREATE INDEX "regions_is_demo_idx" ON "regions" USING btree ("is_demo");
  CREATE INDEX "regions_last_edited_by_idx" ON "regions" USING btree ("last_edited_by_id");
  CREATE INDEX "regions_archived_idx" ON "regions" USING btree ("archived");
  CREATE INDEX "regions_updated_at_idx" ON "regions" USING btree ("updated_at");
  CREATE INDEX "regions_created_at_idx" ON "regions" USING btree ("created_at");
  CREATE INDEX "regions__status_idx" ON "regions" USING btree ("_status");
  CREATE INDEX "regions_rels_order_idx" ON "regions_rels" USING btree ("order");
  CREATE INDEX "regions_rels_parent_idx" ON "regions_rels" USING btree ("parent_id");
  CREATE INDEX "regions_rels_path_idx" ON "regions_rels" USING btree ("path");
  CREATE INDEX "regions_rels_sources_id_idx" ON "regions_rels" USING btree ("sources_id");
  CREATE INDEX "_regions_v_version_characteristics_order_idx" ON "_regions_v_version_characteristics" USING btree ("_order");
  CREATE INDEX "_regions_v_version_characteristics_parent_id_idx" ON "_regions_v_version_characteristics" USING btree ("_parent_id");
  CREATE INDEX "_regions_v_parent_idx" ON "_regions_v" USING btree ("parent_id");
  CREATE INDEX "_regions_v_version_version_slug_idx" ON "_regions_v" USING btree ("version_slug");
  CREATE INDEX "_regions_v_version_version_country_idx" ON "_regions_v" USING btree ("version_country_id");
  CREATE INDEX "_regions_v_version_verification_version_verification_ver_idx" ON "_regions_v" USING btree ("version_verification_verified_by_id");
  CREATE INDEX "_regions_v_version_version_is_demo_idx" ON "_regions_v" USING btree ("version_is_demo");
  CREATE INDEX "_regions_v_version_version_last_edited_by_idx" ON "_regions_v" USING btree ("version_last_edited_by_id");
  CREATE INDEX "_regions_v_version_version_archived_idx" ON "_regions_v" USING btree ("version_archived");
  CREATE INDEX "_regions_v_version_version_updated_at_idx" ON "_regions_v" USING btree ("version_updated_at");
  CREATE INDEX "_regions_v_version_version_created_at_idx" ON "_regions_v" USING btree ("version_created_at");
  CREATE INDEX "_regions_v_version_version__status_idx" ON "_regions_v" USING btree ("version__status");
  CREATE INDEX "_regions_v_created_at_idx" ON "_regions_v" USING btree ("created_at");
  CREATE INDEX "_regions_v_updated_at_idx" ON "_regions_v" USING btree ("updated_at");
  CREATE INDEX "_regions_v_latest_idx" ON "_regions_v" USING btree ("latest");
  CREATE INDEX "_regions_v_rels_order_idx" ON "_regions_v_rels" USING btree ("order");
  CREATE INDEX "_regions_v_rels_parent_idx" ON "_regions_v_rels" USING btree ("parent_id");
  CREATE INDEX "_regions_v_rels_path_idx" ON "_regions_v_rels" USING btree ("path");
  CREATE INDEX "_regions_v_rels_sources_id_idx" ON "_regions_v_rels" USING btree ("sources_id");
  CREATE INDEX "pathways_advantages_order_idx" ON "pathways_advantages" USING btree ("_order");
  CREATE INDEX "pathways_advantages_parent_id_idx" ON "pathways_advantages" USING btree ("_parent_id");
  CREATE INDEX "pathways_restrictions_order_idx" ON "pathways_restrictions" USING btree ("_order");
  CREATE INDEX "pathways_restrictions_parent_id_idx" ON "pathways_restrictions" USING btree ("_parent_id");
  CREATE INDEX "pathways_official_bodies_order_idx" ON "pathways_official_bodies" USING btree ("_order");
  CREATE INDEX "pathways_official_bodies_parent_id_idx" ON "pathways_official_bodies" USING btree ("_parent_id");
  CREATE INDEX "pathways_known_costs_order_idx" ON "pathways_known_costs" USING btree ("_order");
  CREATE INDEX "pathways_known_costs_parent_id_idx" ON "pathways_known_costs" USING btree ("_parent_id");
  CREATE INDEX "pathways_known_costs_source_idx" ON "pathways_known_costs" USING btree ("source_id");
  CREATE INDEX "_pathways_v_version_advantages_order_idx" ON "_pathways_v_version_advantages" USING btree ("_order");
  CREATE INDEX "_pathways_v_version_advantages_parent_id_idx" ON "_pathways_v_version_advantages" USING btree ("_parent_id");
  CREATE INDEX "_pathways_v_version_restrictions_order_idx" ON "_pathways_v_version_restrictions" USING btree ("_order");
  CREATE INDEX "_pathways_v_version_restrictions_parent_id_idx" ON "_pathways_v_version_restrictions" USING btree ("_parent_id");
  CREATE INDEX "_pathways_v_version_official_bodies_order_idx" ON "_pathways_v_version_official_bodies" USING btree ("_order");
  CREATE INDEX "_pathways_v_version_official_bodies_parent_id_idx" ON "_pathways_v_version_official_bodies" USING btree ("_parent_id");
  CREATE INDEX "_pathways_v_version_known_costs_order_idx" ON "_pathways_v_version_known_costs" USING btree ("_order");
  CREATE INDEX "_pathways_v_version_known_costs_parent_id_idx" ON "_pathways_v_version_known_costs" USING btree ("_parent_id");
  CREATE INDEX "_pathways_v_version_known_costs_source_idx" ON "_pathways_v_version_known_costs" USING btree ("source_id");
  CREATE INDEX "opportunities_signals_order_idx" ON "opportunities_signals" USING btree ("_order");
  CREATE INDEX "opportunities_signals_parent_id_idx" ON "opportunities_signals" USING btree ("_parent_id");
  CREATE INDEX "opportunities_signals_source_idx" ON "opportunities_signals" USING btree ("source_id");
  CREATE UNIQUE INDEX "opportunities_slug_idx" ON "opportunities" USING btree ("slug");
  CREATE INDEX "opportunities_country_idx" ON "opportunities" USING btree ("country_id");
  CREATE INDEX "opportunities_verification_verification_verified_by_idx" ON "opportunities" USING btree ("verification_verified_by_id");
  CREATE INDEX "opportunities_is_demo_idx" ON "opportunities" USING btree ("is_demo");
  CREATE INDEX "opportunities_last_edited_by_idx" ON "opportunities" USING btree ("last_edited_by_id");
  CREATE INDEX "opportunities_archived_idx" ON "opportunities" USING btree ("archived");
  CREATE INDEX "opportunities_updated_at_idx" ON "opportunities" USING btree ("updated_at");
  CREATE INDEX "opportunities_created_at_idx" ON "opportunities" USING btree ("created_at");
  CREATE INDEX "opportunities__status_idx" ON "opportunities" USING btree ("_status");
  CREATE INDEX "opportunities_texts_order_parent" ON "opportunities_texts" USING btree ("order","parent_id");
  CREATE INDEX "opportunities_rels_order_idx" ON "opportunities_rels" USING btree ("order");
  CREATE INDEX "opportunities_rels_parent_idx" ON "opportunities_rels" USING btree ("parent_id");
  CREATE INDEX "opportunities_rels_path_idx" ON "opportunities_rels" USING btree ("path");
  CREATE INDEX "opportunities_rels_regions_id_idx" ON "opportunities_rels" USING btree ("regions_id");
  CREATE INDEX "opportunities_rels_pathways_id_idx" ON "opportunities_rels" USING btree ("pathways_id");
  CREATE INDEX "opportunities_rels_sources_id_idx" ON "opportunities_rels" USING btree ("sources_id");
  CREATE INDEX "_opportunities_v_version_signals_order_idx" ON "_opportunities_v_version_signals" USING btree ("_order");
  CREATE INDEX "_opportunities_v_version_signals_parent_id_idx" ON "_opportunities_v_version_signals" USING btree ("_parent_id");
  CREATE INDEX "_opportunities_v_version_signals_source_idx" ON "_opportunities_v_version_signals" USING btree ("source_id");
  CREATE INDEX "_opportunities_v_parent_idx" ON "_opportunities_v" USING btree ("parent_id");
  CREATE INDEX "_opportunities_v_version_version_slug_idx" ON "_opportunities_v" USING btree ("version_slug");
  CREATE INDEX "_opportunities_v_version_version_country_idx" ON "_opportunities_v" USING btree ("version_country_id");
  CREATE INDEX "_opportunities_v_version_verification_version_verificati_idx" ON "_opportunities_v" USING btree ("version_verification_verified_by_id");
  CREATE INDEX "_opportunities_v_version_version_is_demo_idx" ON "_opportunities_v" USING btree ("version_is_demo");
  CREATE INDEX "_opportunities_v_version_version_last_edited_by_idx" ON "_opportunities_v" USING btree ("version_last_edited_by_id");
  CREATE INDEX "_opportunities_v_version_version_archived_idx" ON "_opportunities_v" USING btree ("version_archived");
  CREATE INDEX "_opportunities_v_version_version_updated_at_idx" ON "_opportunities_v" USING btree ("version_updated_at");
  CREATE INDEX "_opportunities_v_version_version_created_at_idx" ON "_opportunities_v" USING btree ("version_created_at");
  CREATE INDEX "_opportunities_v_version_version__status_idx" ON "_opportunities_v" USING btree ("version__status");
  CREATE INDEX "_opportunities_v_created_at_idx" ON "_opportunities_v" USING btree ("created_at");
  CREATE INDEX "_opportunities_v_updated_at_idx" ON "_opportunities_v" USING btree ("updated_at");
  CREATE INDEX "_opportunities_v_latest_idx" ON "_opportunities_v" USING btree ("latest");
  CREATE INDEX "_opportunities_v_texts_order_parent" ON "_opportunities_v_texts" USING btree ("order","parent_id");
  CREATE INDEX "_opportunities_v_rels_order_idx" ON "_opportunities_v_rels" USING btree ("order");
  CREATE INDEX "_opportunities_v_rels_parent_idx" ON "_opportunities_v_rels" USING btree ("parent_id");
  CREATE INDEX "_opportunities_v_rels_path_idx" ON "_opportunities_v_rels" USING btree ("path");
  CREATE INDEX "_opportunities_v_rels_regions_id_idx" ON "_opportunities_v_rels" USING btree ("regions_id");
  CREATE INDEX "_opportunities_v_rels_pathways_id_idx" ON "_opportunities_v_rels" USING btree ("pathways_id");
  CREATE INDEX "_opportunities_v_rels_sources_id_idx" ON "_opportunities_v_rels" USING btree ("sources_id");
  CREATE INDEX "homepage_faqs_order_idx" ON "homepage_faqs" USING btree ("_order");
  CREATE INDEX "homepage_faqs_parent_id_idx" ON "homepage_faqs" USING btree ("_parent_id");
  CREATE INDEX "homepage_rels_order_idx" ON "homepage_rels" USING btree ("order");
  CREATE INDEX "homepage_rels_parent_idx" ON "homepage_rels" USING btree ("parent_id");
  CREATE INDEX "homepage_rels_path_idx" ON "homepage_rels" USING btree ("path");
  CREATE INDEX "homepage_rels_guides_id_idx" ON "homepage_rels" USING btree ("guides_id");
  ALTER TABLE "guides" ADD CONSTRAINT "guides_last_edited_by_id_users_id_fk" FOREIGN KEY ("last_edited_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "guides_rels" ADD CONSTRAINT "guides_rels_guides_fk" FOREIGN KEY ("guides_id") REFERENCES "public"."guides"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_guides_v" ADD CONSTRAINT "_guides_v_version_last_edited_by_id_users_id_fk" FOREIGN KEY ("version_last_edited_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_guides_v_rels" ADD CONSTRAINT "_guides_v_rels_guides_fk" FOREIGN KEY ("guides_id") REFERENCES "public"."guides"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "countries" ADD CONSTRAINT "countries_last_edited_by_id_users_id_fk" FOREIGN KEY ("last_edited_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_countries_v" ADD CONSTRAINT "_countries_v_version_last_edited_by_id_users_id_fk" FOREIGN KEY ("version_last_edited_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pathways" ADD CONSTRAINT "pathways_last_edited_by_id_users_id_fk" FOREIGN KEY ("last_edited_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pathways_v" ADD CONSTRAINT "_pathways_v_version_last_edited_by_id_users_id_fk" FOREIGN KEY ("version_last_edited_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "requirements" ADD CONSTRAINT "requirements_last_edited_by_id_users_id_fk" FOREIGN KEY ("last_edited_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_requirements_v" ADD CONSTRAINT "_requirements_v_version_last_edited_by_id_users_id_fk" FOREIGN KEY ("version_last_edited_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_regions_fk" FOREIGN KEY ("regions_id") REFERENCES "public"."regions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_opportunities_fk" FOREIGN KEY ("opportunities_id") REFERENCES "public"."opportunities"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "guides_last_edited_by_idx" ON "guides" USING btree ("last_edited_by_id");
  CREATE INDEX "guides_archived_idx" ON "guides" USING btree ("archived");
  CREATE INDEX "guides_rels_guides_id_idx" ON "guides_rels" USING btree ("guides_id");
  CREATE INDEX "_guides_v_version_version_last_edited_by_idx" ON "_guides_v" USING btree ("version_last_edited_by_id");
  CREATE INDEX "_guides_v_version_version_archived_idx" ON "_guides_v" USING btree ("version_archived");
  CREATE INDEX "_guides_v_rels_guides_id_idx" ON "_guides_v_rels" USING btree ("guides_id");
  CREATE INDEX "countries_last_edited_by_idx" ON "countries" USING btree ("last_edited_by_id");
  CREATE INDEX "countries_archived_idx" ON "countries" USING btree ("archived");
  CREATE INDEX "_countries_v_version_version_last_edited_by_idx" ON "_countries_v" USING btree ("version_last_edited_by_id");
  CREATE INDEX "_countries_v_version_version_archived_idx" ON "_countries_v" USING btree ("version_archived");
  CREATE INDEX "pathways_last_edited_by_idx" ON "pathways" USING btree ("last_edited_by_id");
  CREATE INDEX "pathways_archived_idx" ON "pathways" USING btree ("archived");
  CREATE INDEX "_pathways_v_version_version_last_edited_by_idx" ON "_pathways_v" USING btree ("version_last_edited_by_id");
  CREATE INDEX "_pathways_v_version_version_archived_idx" ON "_pathways_v" USING btree ("version_archived");
  CREATE INDEX "requirements_last_edited_by_idx" ON "requirements" USING btree ("last_edited_by_id");
  CREATE INDEX "requirements_archived_idx" ON "requirements" USING btree ("archived");
  CREATE INDEX "_requirements_v_version_version_last_edited_by_idx" ON "_requirements_v" USING btree ("version_last_edited_by_id");
  CREATE INDEX "_requirements_v_version_version_archived_idx" ON "_requirements_v" USING btree ("version_archived");
  CREATE INDEX "payload_locked_documents_rels_regions_id_idx" ON "payload_locked_documents_rels" USING btree ("regions_id");
  CREATE INDEX "payload_locked_documents_rels_opportunities_id_idx" ON "payload_locked_documents_rels" USING btree ("opportunities_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "guides_faqs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_guides_v_version_faqs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "regions_characteristics" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "regions" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "regions_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_regions_v_version_characteristics" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_regions_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_regions_v_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pathways_advantages" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pathways_restrictions" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pathways_official_bodies" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pathways_known_costs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pathways_v_version_advantages" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pathways_v_version_restrictions" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pathways_v_version_official_bodies" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pathways_v_version_known_costs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "opportunities_signals" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "opportunities" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "opportunities_texts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "opportunities_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_opportunities_v_version_signals" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_opportunities_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_opportunities_v_texts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_opportunities_v_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "homepage_faqs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "homepage" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "homepage_rels" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "guides_faqs" CASCADE;
  DROP TABLE "_guides_v_version_faqs" CASCADE;
  DROP TABLE "regions_characteristics" CASCADE;
  DROP TABLE "regions" CASCADE;
  DROP TABLE "regions_rels" CASCADE;
  DROP TABLE "_regions_v_version_characteristics" CASCADE;
  DROP TABLE "_regions_v" CASCADE;
  DROP TABLE "_regions_v_rels" CASCADE;
  DROP TABLE "pathways_advantages" CASCADE;
  DROP TABLE "pathways_restrictions" CASCADE;
  DROP TABLE "pathways_official_bodies" CASCADE;
  DROP TABLE "pathways_known_costs" CASCADE;
  DROP TABLE "_pathways_v_version_advantages" CASCADE;
  DROP TABLE "_pathways_v_version_restrictions" CASCADE;
  DROP TABLE "_pathways_v_version_official_bodies" CASCADE;
  DROP TABLE "_pathways_v_version_known_costs" CASCADE;
  DROP TABLE "opportunities_signals" CASCADE;
  DROP TABLE "opportunities" CASCADE;
  DROP TABLE "opportunities_texts" CASCADE;
  DROP TABLE "opportunities_rels" CASCADE;
  DROP TABLE "_opportunities_v_version_signals" CASCADE;
  DROP TABLE "_opportunities_v" CASCADE;
  DROP TABLE "_opportunities_v_texts" CASCADE;
  DROP TABLE "_opportunities_v_rels" CASCADE;
  DROP TABLE "homepage_faqs" CASCADE;
  DROP TABLE "homepage" CASCADE;
  DROP TABLE "homepage_rels" CASCADE;
  ALTER TABLE "guides" DROP CONSTRAINT "guides_last_edited_by_id_users_id_fk";
  
  ALTER TABLE "guides_rels" DROP CONSTRAINT "guides_rels_guides_fk";
  
  ALTER TABLE "_guides_v" DROP CONSTRAINT "_guides_v_version_last_edited_by_id_users_id_fk";
  
  ALTER TABLE "_guides_v_rels" DROP CONSTRAINT "_guides_v_rels_guides_fk";
  
  ALTER TABLE "countries" DROP CONSTRAINT "countries_last_edited_by_id_users_id_fk";
  
  ALTER TABLE "_countries_v" DROP CONSTRAINT "_countries_v_version_last_edited_by_id_users_id_fk";
  
  ALTER TABLE "pathways" DROP CONSTRAINT "pathways_last_edited_by_id_users_id_fk";
  
  ALTER TABLE "_pathways_v" DROP CONSTRAINT "_pathways_v_version_last_edited_by_id_users_id_fk";
  
  ALTER TABLE "requirements" DROP CONSTRAINT "requirements_last_edited_by_id_users_id_fk";
  
  ALTER TABLE "_requirements_v" DROP CONSTRAINT "_requirements_v_version_last_edited_by_id_users_id_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_regions_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_opportunities_fk";
  
  DROP INDEX "guides_last_edited_by_idx";
  DROP INDEX "guides_archived_idx";
  DROP INDEX "guides_rels_guides_id_idx";
  DROP INDEX "_guides_v_version_version_last_edited_by_idx";
  DROP INDEX "_guides_v_version_version_archived_idx";
  DROP INDEX "_guides_v_rels_guides_id_idx";
  DROP INDEX "countries_last_edited_by_idx";
  DROP INDEX "countries_archived_idx";
  DROP INDEX "_countries_v_version_version_last_edited_by_idx";
  DROP INDEX "_countries_v_version_version_archived_idx";
  DROP INDEX "pathways_last_edited_by_idx";
  DROP INDEX "pathways_archived_idx";
  DROP INDEX "_pathways_v_version_version_last_edited_by_idx";
  DROP INDEX "_pathways_v_version_version_archived_idx";
  DROP INDEX "requirements_last_edited_by_idx";
  DROP INDEX "requirements_archived_idx";
  DROP INDEX "_requirements_v_version_version_last_edited_by_idx";
  DROP INDEX "_requirements_v_version_version_archived_idx";
  DROP INDEX "payload_locked_documents_rels_regions_id_idx";
  DROP INDEX "payload_locked_documents_rels_opportunities_id_idx";
  ALTER TABLE "guides" DROP COLUMN "verification_flagged_at";
  ALTER TABLE "guides" DROP COLUMN "review_requested";
  ALTER TABLE "guides" DROP COLUMN "last_edited_by_id";
  ALTER TABLE "guides" DROP COLUMN "archived";
  ALTER TABLE "guides_rels" DROP COLUMN "guides_id";
  ALTER TABLE "_guides_v" DROP COLUMN "version_verification_flagged_at";
  ALTER TABLE "_guides_v" DROP COLUMN "version_review_requested";
  ALTER TABLE "_guides_v" DROP COLUMN "version_last_edited_by_id";
  ALTER TABLE "_guides_v" DROP COLUMN "version_archived";
  ALTER TABLE "_guides_v_rels" DROP COLUMN "guides_id";
  ALTER TABLE "countries" DROP COLUMN "currency_code";
  ALTER TABLE "countries" DROP COLUMN "review_requested";
  ALTER TABLE "countries" DROP COLUMN "last_edited_by_id";
  ALTER TABLE "countries" DROP COLUMN "archived";
  ALTER TABLE "_countries_v" DROP COLUMN "version_currency_code";
  ALTER TABLE "_countries_v" DROP COLUMN "version_review_requested";
  ALTER TABLE "_countries_v" DROP COLUMN "version_last_edited_by_id";
  ALTER TABLE "_countries_v" DROP COLUMN "version_archived";
  ALTER TABLE "pathways" DROP COLUMN "limits";
  ALTER TABLE "pathways" DROP COLUMN "verification_flagged_at";
  ALTER TABLE "pathways" DROP COLUMN "review_requested";
  ALTER TABLE "pathways" DROP COLUMN "last_edited_by_id";
  ALTER TABLE "pathways" DROP COLUMN "archived";
  ALTER TABLE "_pathways_v" DROP COLUMN "version_limits";
  ALTER TABLE "_pathways_v" DROP COLUMN "version_verification_flagged_at";
  ALTER TABLE "_pathways_v" DROP COLUMN "version_review_requested";
  ALTER TABLE "_pathways_v" DROP COLUMN "version_last_edited_by_id";
  ALTER TABLE "_pathways_v" DROP COLUMN "version_archived";
  ALTER TABLE "requirements" DROP COLUMN "type";
  ALTER TABLE "requirements" DROP COLUMN "volatility";
  ALTER TABLE "requirements" DROP COLUMN "verification_flagged_at";
  ALTER TABLE "requirements" DROP COLUMN "review_requested";
  ALTER TABLE "requirements" DROP COLUMN "last_edited_by_id";
  ALTER TABLE "requirements" DROP COLUMN "archived";
  ALTER TABLE "_requirements_v" DROP COLUMN "version_type";
  ALTER TABLE "_requirements_v" DROP COLUMN "version_volatility";
  ALTER TABLE "_requirements_v" DROP COLUMN "version_verification_flagged_at";
  ALTER TABLE "_requirements_v" DROP COLUMN "version_review_requested";
  ALTER TABLE "_requirements_v" DROP COLUMN "version_last_edited_by_id";
  ALTER TABLE "_requirements_v" DROP COLUMN "version_archived";
  ALTER TABLE "sources" DROP COLUMN "published_at";
  ALTER TABLE "sources" DROP COLUMN "accessed_at";
  ALTER TABLE "sources" DROP COLUMN "verification_flagged_at";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "regions_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "opportunities_id";
  DROP TYPE "public"."enum_regions_verification_review_status";
  DROP TYPE "public"."enum_regions_status";
  DROP TYPE "public"."enum__regions_v_version_verification_review_status";
  DROP TYPE "public"."enum__regions_v_version_status";
  DROP TYPE "public"."enum_requirements_type";
  DROP TYPE "public"."enum_requirements_volatility";
  DROP TYPE "public"."enum__requirements_v_version_type";
  DROP TYPE "public"."enum__requirements_v_version_volatility";
  DROP TYPE "public"."enum_opportunities_signals_kind";
  DROP TYPE "public"."enum_opportunities_sector";
  DROP TYPE "public"."enum_opportunities_verification_review_status";
  DROP TYPE "public"."enum_opportunities_status";
  DROP TYPE "public"."enum__opportunities_v_version_signals_kind";
  DROP TYPE "public"."enum__opportunities_v_version_sector";
  DROP TYPE "public"."enum__opportunities_v_version_verification_review_status";
  DROP TYPE "public"."enum__opportunities_v_version_status";`)
}
