import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_guides_topic" AS ENUM('visados', 'trabajo', 'vivienda', 'dinero', 'vida-cotidiana', 'preparacion');
  CREATE TYPE "public"."enum_guides_verification_review_status" AS ENUM('unverified', 'verified', 'needs_review');
  CREATE TYPE "public"."enum_guides_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__guides_v_version_topic" AS ENUM('visados', 'trabajo', 'vivienda', 'dinero', 'vida-cotidiana', 'preparacion');
  CREATE TYPE "public"."enum__guides_v_version_verification_review_status" AS ENUM('unverified', 'verified', 'needs_review');
  CREATE TYPE "public"."enum__guides_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_countries_topic_intros_topic" AS ENUM('visados', 'trabajo', 'vivienda', 'dinero', 'vida-cotidiana', 'preparacion');
  CREATE TYPE "public"."enum_countries_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__countries_v_version_topic_intros_topic" AS ENUM('visados', 'trabajo', 'vivienda', 'dinero', 'vida-cotidiana', 'preparacion');
  CREATE TYPE "public"."enum__countries_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_pathways_eligible_passports" AS ENUM('ES');
  CREATE TYPE "public"."enum_pathways_category" AS ENUM('working_holiday', 'study', 'skilled', 'employer_sponsored', 'family', 'other');
  CREATE TYPE "public"."enum_pathways_verification_review_status" AS ENUM('unverified', 'verified', 'needs_review');
  CREATE TYPE "public"."enum_pathways_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__pathways_v_version_eligible_passports" AS ENUM('ES');
  CREATE TYPE "public"."enum__pathways_v_version_category" AS ENUM('working_holiday', 'study', 'skilled', 'employer_sponsored', 'family', 'other');
  CREATE TYPE "public"."enum__pathways_v_version_verification_review_status" AS ENUM('unverified', 'verified', 'needs_review');
  CREATE TYPE "public"."enum__pathways_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_requirements_scope_passports" AS ENUM('ES');
  CREATE TYPE "public"."enum_requirements_rule_mode" AS ENUM('rule', 'self_declared', 'not_evaluated');
  CREATE TYPE "public"."enum_requirements_rule_criterion" AS ENUM('age', 'passport', 'funds', 'education', 'english', 'dependentChildren', 'previousVisa');
  CREATE TYPE "public"."enum_requirements_rule_operator" AS ENUM('between', 'gte', 'lte', 'in', 'isTrue', 'isFalse');
  CREATE TYPE "public"."enum_requirements_verification_review_status" AS ENUM('unverified', 'verified', 'needs_review');
  CREATE TYPE "public"."enum_requirements_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__requirements_v_version_scope_passports" AS ENUM('ES');
  CREATE TYPE "public"."enum__requirements_v_version_rule_mode" AS ENUM('rule', 'self_declared', 'not_evaluated');
  CREATE TYPE "public"."enum__requirements_v_version_rule_criterion" AS ENUM('age', 'passport', 'funds', 'education', 'english', 'dependentChildren', 'previousVisa');
  CREATE TYPE "public"."enum__requirements_v_version_rule_operator" AS ENUM('between', 'gte', 'lte', 'in', 'isTrue', 'isFalse');
  CREATE TYPE "public"."enum__requirements_v_version_verification_review_status" AS ENUM('unverified', 'verified', 'needs_review');
  CREATE TYPE "public"."enum__requirements_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_sources_kind" AS ENUM('official_government', 'official_statistics', 'public_body', 'industry_data', 'job_ads', 'media', 'other');
  CREATE TYPE "public"."enum_sources_verification_review_status" AS ENUM('unverified', 'verified', 'needs_review');
  CREATE TYPE "public"."enum_users_role" AS ENUM('admin', 'editor');
  CREATE TABLE "guides_key_points" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "guides" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"slug" varchar,
  	"country_id" integer,
  	"topic" "enum_guides_topic",
  	"summary" varchar,
  	"body" jsonb,
  	"seo_meta_title" varchar,
  	"verification_review_status" "enum_guides_verification_review_status" DEFAULT 'unverified',
  	"verification_last_verified_at" timestamp(3) with time zone,
  	"verification_verified_by_id" integer,
  	"verification_valid_from" timestamp(3) with time zone,
  	"verification_valid_until" timestamp(3) with time zone,
  	"verification_review_note" varchar,
  	"is_demo" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_guides_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "guides_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"pathways_id" integer,
  	"sources_id" integer
  );
  
  CREATE TABLE "_guides_v_version_key_points" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_guides_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_slug" varchar,
  	"version_country_id" integer,
  	"version_topic" "enum__guides_v_version_topic",
  	"version_summary" varchar,
  	"version_body" jsonb,
  	"version_seo_meta_title" varchar,
  	"version_verification_review_status" "enum__guides_v_version_verification_review_status" DEFAULT 'unverified',
  	"version_verification_last_verified_at" timestamp(3) with time zone,
  	"version_verification_verified_by_id" integer,
  	"version_verification_valid_from" timestamp(3) with time zone,
  	"version_verification_valid_until" timestamp(3) with time zone,
  	"version_verification_review_note" varchar,
  	"version_is_demo" boolean DEFAULT false,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__guides_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "_guides_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"pathways_id" integer,
  	"sources_id" integer
  );
  
  CREATE TABLE "countries_topic_intros" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"topic" "enum_countries_topic_intros_topic",
  	"text" varchar
  );
  
  CREATE TABLE "countries" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"slug" varchar,
  	"iso_code" varchar,
  	"tagline" varchar,
  	"intro" varchar,
  	"is_demo" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_countries_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_countries_v_version_topic_intros" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"topic" "enum__countries_v_version_topic_intros_topic",
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_countries_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_name" varchar,
  	"version_slug" varchar,
  	"version_iso_code" varchar,
  	"version_tagline" varchar,
  	"version_intro" varchar,
  	"version_is_demo" boolean DEFAULT false,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__countries_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "pathways_eligible_passports" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_pathways_eligible_passports",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "pathways" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"slug" varchar,
  	"official_name" varchar,
  	"official_code" varchar,
  	"country_id" integer,
  	"category" "enum_pathways_category",
  	"summary" varchar,
  	"not_covered" varchar,
  	"verification_review_status" "enum_pathways_verification_review_status" DEFAULT 'unverified',
  	"verification_last_verified_at" timestamp(3) with time zone,
  	"verification_verified_by_id" integer,
  	"verification_valid_from" timestamp(3) with time zone,
  	"verification_valid_until" timestamp(3) with time zone,
  	"verification_review_note" varchar,
  	"is_demo" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_pathways_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "pathways_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"sources_id" integer
  );
  
  CREATE TABLE "_pathways_v_version_eligible_passports" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__pathways_v_version_eligible_passports",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_pathways_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_name" varchar,
  	"version_slug" varchar,
  	"version_official_name" varchar,
  	"version_official_code" varchar,
  	"version_country_id" integer,
  	"version_category" "enum__pathways_v_version_category",
  	"version_summary" varchar,
  	"version_not_covered" varchar,
  	"version_verification_review_status" "enum__pathways_v_version_verification_review_status" DEFAULT 'unverified',
  	"version_verification_last_verified_at" timestamp(3) with time zone,
  	"version_verification_verified_by_id" integer,
  	"version_verification_valid_from" timestamp(3) with time zone,
  	"version_verification_valid_until" timestamp(3) with time zone,
  	"version_verification_review_note" varchar,
  	"version_is_demo" boolean DEFAULT false,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__pathways_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "_pathways_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"sources_id" integer
  );
  
  CREATE TABLE "requirements_scope_passports" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_requirements_scope_passports",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "requirements" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"pathway_id" integer,
  	"order" numeric DEFAULT 10,
  	"statement" varchar,
  	"details" varchar,
  	"scope_note" varchar,
  	"rule_mode" "enum_requirements_rule_mode" DEFAULT 'not_evaluated',
  	"rule_criterion" "enum_requirements_rule_criterion",
  	"rule_operator" "enum_requirements_rule_operator",
  	"rule_min" numeric,
  	"rule_max" numeric,
  	"rule_unit" varchar,
  	"rule_question" varchar,
  	"verification_review_status" "enum_requirements_verification_review_status" DEFAULT 'unverified',
  	"verification_last_verified_at" timestamp(3) with time zone,
  	"verification_verified_by_id" integer,
  	"verification_valid_from" timestamp(3) with time zone,
  	"verification_valid_until" timestamp(3) with time zone,
  	"verification_review_note" varchar,
  	"is_demo" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_requirements_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "requirements_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "requirements_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"sources_id" integer
  );
  
  CREATE TABLE "_requirements_v_version_scope_passports" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__requirements_v_version_scope_passports",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_requirements_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_pathway_id" integer,
  	"version_order" numeric DEFAULT 10,
  	"version_statement" varchar,
  	"version_details" varchar,
  	"version_scope_note" varchar,
  	"version_rule_mode" "enum__requirements_v_version_rule_mode" DEFAULT 'not_evaluated',
  	"version_rule_criterion" "enum__requirements_v_version_rule_criterion",
  	"version_rule_operator" "enum__requirements_v_version_rule_operator",
  	"version_rule_min" numeric,
  	"version_rule_max" numeric,
  	"version_rule_unit" varchar,
  	"version_rule_question" varchar,
  	"version_verification_review_status" "enum__requirements_v_version_verification_review_status" DEFAULT 'unverified',
  	"version_verification_last_verified_at" timestamp(3) with time zone,
  	"version_verification_verified_by_id" integer,
  	"version_verification_valid_from" timestamp(3) with time zone,
  	"version_verification_valid_until" timestamp(3) with time zone,
  	"version_verification_review_note" varchar,
  	"version_is_demo" boolean DEFAULT false,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__requirements_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "_requirements_v_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "_requirements_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"sources_id" integer
  );
  
  CREATE TABLE "sources" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"publisher" varchar NOT NULL,
  	"kind" "enum_sources_kind" NOT NULL,
  	"url" varchar NOT NULL,
  	"country_id" integer,
  	"limitations" varchar,
  	"internal_notes" varchar,
  	"verification_review_status" "enum_sources_verification_review_status" DEFAULT 'unverified' NOT NULL,
  	"verification_last_verified_at" timestamp(3) with time zone,
  	"verification_verified_by_id" integer,
  	"verification_valid_from" timestamp(3) with time zone,
  	"verification_valid_until" timestamp(3) with time zone,
  	"verification_review_note" varchar,
  	"is_demo" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"role" "enum_users_role" DEFAULT 'editor' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"reset_password_requested_at" timestamp(3) with time zone,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"guides_id" integer,
  	"countries_id" integer,
  	"pathways_id" integer,
  	"requirements_id" integer,
  	"sources_id" integer,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "guides_key_points" ADD CONSTRAINT "guides_key_points_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."guides"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "guides" ADD CONSTRAINT "guides_country_id_countries_id_fk" FOREIGN KEY ("country_id") REFERENCES "public"."countries"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "guides" ADD CONSTRAINT "guides_verification_verified_by_id_users_id_fk" FOREIGN KEY ("verification_verified_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "guides_rels" ADD CONSTRAINT "guides_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."guides"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "guides_rels" ADD CONSTRAINT "guides_rels_pathways_fk" FOREIGN KEY ("pathways_id") REFERENCES "public"."pathways"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "guides_rels" ADD CONSTRAINT "guides_rels_sources_fk" FOREIGN KEY ("sources_id") REFERENCES "public"."sources"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_guides_v_version_key_points" ADD CONSTRAINT "_guides_v_version_key_points_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_guides_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_guides_v" ADD CONSTRAINT "_guides_v_parent_id_guides_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."guides"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_guides_v" ADD CONSTRAINT "_guides_v_version_country_id_countries_id_fk" FOREIGN KEY ("version_country_id") REFERENCES "public"."countries"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_guides_v" ADD CONSTRAINT "_guides_v_version_verification_verified_by_id_users_id_fk" FOREIGN KEY ("version_verification_verified_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_guides_v_rels" ADD CONSTRAINT "_guides_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_guides_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_guides_v_rels" ADD CONSTRAINT "_guides_v_rels_pathways_fk" FOREIGN KEY ("pathways_id") REFERENCES "public"."pathways"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_guides_v_rels" ADD CONSTRAINT "_guides_v_rels_sources_fk" FOREIGN KEY ("sources_id") REFERENCES "public"."sources"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "countries_topic_intros" ADD CONSTRAINT "countries_topic_intros_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."countries"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_countries_v_version_topic_intros" ADD CONSTRAINT "_countries_v_version_topic_intros_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_countries_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_countries_v" ADD CONSTRAINT "_countries_v_parent_id_countries_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."countries"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pathways_eligible_passports" ADD CONSTRAINT "pathways_eligible_passports_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pathways"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pathways" ADD CONSTRAINT "pathways_country_id_countries_id_fk" FOREIGN KEY ("country_id") REFERENCES "public"."countries"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pathways" ADD CONSTRAINT "pathways_verification_verified_by_id_users_id_fk" FOREIGN KEY ("verification_verified_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pathways_rels" ADD CONSTRAINT "pathways_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pathways"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pathways_rels" ADD CONSTRAINT "pathways_rels_sources_fk" FOREIGN KEY ("sources_id") REFERENCES "public"."sources"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pathways_v_version_eligible_passports" ADD CONSTRAINT "_pathways_v_version_eligible_passports_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_pathways_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pathways_v" ADD CONSTRAINT "_pathways_v_parent_id_pathways_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pathways"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pathways_v" ADD CONSTRAINT "_pathways_v_version_country_id_countries_id_fk" FOREIGN KEY ("version_country_id") REFERENCES "public"."countries"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pathways_v" ADD CONSTRAINT "_pathways_v_version_verification_verified_by_id_users_id_fk" FOREIGN KEY ("version_verification_verified_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pathways_v_rels" ADD CONSTRAINT "_pathways_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_pathways_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pathways_v_rels" ADD CONSTRAINT "_pathways_v_rels_sources_fk" FOREIGN KEY ("sources_id") REFERENCES "public"."sources"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "requirements_scope_passports" ADD CONSTRAINT "requirements_scope_passports_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."requirements"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "requirements" ADD CONSTRAINT "requirements_pathway_id_pathways_id_fk" FOREIGN KEY ("pathway_id") REFERENCES "public"."pathways"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "requirements" ADD CONSTRAINT "requirements_verification_verified_by_id_users_id_fk" FOREIGN KEY ("verification_verified_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "requirements_texts" ADD CONSTRAINT "requirements_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."requirements"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "requirements_rels" ADD CONSTRAINT "requirements_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."requirements"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "requirements_rels" ADD CONSTRAINT "requirements_rels_sources_fk" FOREIGN KEY ("sources_id") REFERENCES "public"."sources"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_requirements_v_version_scope_passports" ADD CONSTRAINT "_requirements_v_version_scope_passports_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_requirements_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_requirements_v" ADD CONSTRAINT "_requirements_v_parent_id_requirements_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."requirements"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_requirements_v" ADD CONSTRAINT "_requirements_v_version_pathway_id_pathways_id_fk" FOREIGN KEY ("version_pathway_id") REFERENCES "public"."pathways"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_requirements_v" ADD CONSTRAINT "_requirements_v_version_verification_verified_by_id_users_id_fk" FOREIGN KEY ("version_verification_verified_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_requirements_v_texts" ADD CONSTRAINT "_requirements_v_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_requirements_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_requirements_v_rels" ADD CONSTRAINT "_requirements_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_requirements_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_requirements_v_rels" ADD CONSTRAINT "_requirements_v_rels_sources_fk" FOREIGN KEY ("sources_id") REFERENCES "public"."sources"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "sources" ADD CONSTRAINT "sources_country_id_countries_id_fk" FOREIGN KEY ("country_id") REFERENCES "public"."countries"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "sources" ADD CONSTRAINT "sources_verification_verified_by_id_users_id_fk" FOREIGN KEY ("verification_verified_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_guides_fk" FOREIGN KEY ("guides_id") REFERENCES "public"."guides"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_countries_fk" FOREIGN KEY ("countries_id") REFERENCES "public"."countries"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_pathways_fk" FOREIGN KEY ("pathways_id") REFERENCES "public"."pathways"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_requirements_fk" FOREIGN KEY ("requirements_id") REFERENCES "public"."requirements"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_sources_fk" FOREIGN KEY ("sources_id") REFERENCES "public"."sources"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "guides_key_points_order_idx" ON "guides_key_points" USING btree ("_order");
  CREATE INDEX "guides_key_points_parent_id_idx" ON "guides_key_points" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "guides_slug_idx" ON "guides" USING btree ("slug");
  CREATE INDEX "guides_country_idx" ON "guides" USING btree ("country_id");
  CREATE INDEX "guides_verification_verification_verified_by_idx" ON "guides" USING btree ("verification_verified_by_id");
  CREATE INDEX "guides_is_demo_idx" ON "guides" USING btree ("is_demo");
  CREATE INDEX "guides_updated_at_idx" ON "guides" USING btree ("updated_at");
  CREATE INDEX "guides_created_at_idx" ON "guides" USING btree ("created_at");
  CREATE INDEX "guides__status_idx" ON "guides" USING btree ("_status");
  CREATE INDEX "guides_rels_order_idx" ON "guides_rels" USING btree ("order");
  CREATE INDEX "guides_rels_parent_idx" ON "guides_rels" USING btree ("parent_id");
  CREATE INDEX "guides_rels_path_idx" ON "guides_rels" USING btree ("path");
  CREATE INDEX "guides_rels_pathways_id_idx" ON "guides_rels" USING btree ("pathways_id");
  CREATE INDEX "guides_rels_sources_id_idx" ON "guides_rels" USING btree ("sources_id");
  CREATE INDEX "_guides_v_version_key_points_order_idx" ON "_guides_v_version_key_points" USING btree ("_order");
  CREATE INDEX "_guides_v_version_key_points_parent_id_idx" ON "_guides_v_version_key_points" USING btree ("_parent_id");
  CREATE INDEX "_guides_v_parent_idx" ON "_guides_v" USING btree ("parent_id");
  CREATE INDEX "_guides_v_version_version_slug_idx" ON "_guides_v" USING btree ("version_slug");
  CREATE INDEX "_guides_v_version_version_country_idx" ON "_guides_v" USING btree ("version_country_id");
  CREATE INDEX "_guides_v_version_verification_version_verification_veri_idx" ON "_guides_v" USING btree ("version_verification_verified_by_id");
  CREATE INDEX "_guides_v_version_version_is_demo_idx" ON "_guides_v" USING btree ("version_is_demo");
  CREATE INDEX "_guides_v_version_version_updated_at_idx" ON "_guides_v" USING btree ("version_updated_at");
  CREATE INDEX "_guides_v_version_version_created_at_idx" ON "_guides_v" USING btree ("version_created_at");
  CREATE INDEX "_guides_v_version_version__status_idx" ON "_guides_v" USING btree ("version__status");
  CREATE INDEX "_guides_v_created_at_idx" ON "_guides_v" USING btree ("created_at");
  CREATE INDEX "_guides_v_updated_at_idx" ON "_guides_v" USING btree ("updated_at");
  CREATE INDEX "_guides_v_latest_idx" ON "_guides_v" USING btree ("latest");
  CREATE INDEX "_guides_v_rels_order_idx" ON "_guides_v_rels" USING btree ("order");
  CREATE INDEX "_guides_v_rels_parent_idx" ON "_guides_v_rels" USING btree ("parent_id");
  CREATE INDEX "_guides_v_rels_path_idx" ON "_guides_v_rels" USING btree ("path");
  CREATE INDEX "_guides_v_rels_pathways_id_idx" ON "_guides_v_rels" USING btree ("pathways_id");
  CREATE INDEX "_guides_v_rels_sources_id_idx" ON "_guides_v_rels" USING btree ("sources_id");
  CREATE INDEX "countries_topic_intros_order_idx" ON "countries_topic_intros" USING btree ("_order");
  CREATE INDEX "countries_topic_intros_parent_id_idx" ON "countries_topic_intros" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "countries_slug_idx" ON "countries" USING btree ("slug");
  CREATE INDEX "countries_is_demo_idx" ON "countries" USING btree ("is_demo");
  CREATE INDEX "countries_updated_at_idx" ON "countries" USING btree ("updated_at");
  CREATE INDEX "countries_created_at_idx" ON "countries" USING btree ("created_at");
  CREATE INDEX "countries__status_idx" ON "countries" USING btree ("_status");
  CREATE INDEX "_countries_v_version_topic_intros_order_idx" ON "_countries_v_version_topic_intros" USING btree ("_order");
  CREATE INDEX "_countries_v_version_topic_intros_parent_id_idx" ON "_countries_v_version_topic_intros" USING btree ("_parent_id");
  CREATE INDEX "_countries_v_parent_idx" ON "_countries_v" USING btree ("parent_id");
  CREATE INDEX "_countries_v_version_version_slug_idx" ON "_countries_v" USING btree ("version_slug");
  CREATE INDEX "_countries_v_version_version_is_demo_idx" ON "_countries_v" USING btree ("version_is_demo");
  CREATE INDEX "_countries_v_version_version_updated_at_idx" ON "_countries_v" USING btree ("version_updated_at");
  CREATE INDEX "_countries_v_version_version_created_at_idx" ON "_countries_v" USING btree ("version_created_at");
  CREATE INDEX "_countries_v_version_version__status_idx" ON "_countries_v" USING btree ("version__status");
  CREATE INDEX "_countries_v_created_at_idx" ON "_countries_v" USING btree ("created_at");
  CREATE INDEX "_countries_v_updated_at_idx" ON "_countries_v" USING btree ("updated_at");
  CREATE INDEX "_countries_v_latest_idx" ON "_countries_v" USING btree ("latest");
  CREATE INDEX "pathways_eligible_passports_order_idx" ON "pathways_eligible_passports" USING btree ("order");
  CREATE INDEX "pathways_eligible_passports_parent_idx" ON "pathways_eligible_passports" USING btree ("parent_id");
  CREATE UNIQUE INDEX "pathways_slug_idx" ON "pathways" USING btree ("slug");
  CREATE INDEX "pathways_country_idx" ON "pathways" USING btree ("country_id");
  CREATE INDEX "pathways_verification_verification_verified_by_idx" ON "pathways" USING btree ("verification_verified_by_id");
  CREATE INDEX "pathways_is_demo_idx" ON "pathways" USING btree ("is_demo");
  CREATE INDEX "pathways_updated_at_idx" ON "pathways" USING btree ("updated_at");
  CREATE INDEX "pathways_created_at_idx" ON "pathways" USING btree ("created_at");
  CREATE INDEX "pathways__status_idx" ON "pathways" USING btree ("_status");
  CREATE INDEX "pathways_rels_order_idx" ON "pathways_rels" USING btree ("order");
  CREATE INDEX "pathways_rels_parent_idx" ON "pathways_rels" USING btree ("parent_id");
  CREATE INDEX "pathways_rels_path_idx" ON "pathways_rels" USING btree ("path");
  CREATE INDEX "pathways_rels_sources_id_idx" ON "pathways_rels" USING btree ("sources_id");
  CREATE INDEX "_pathways_v_version_eligible_passports_order_idx" ON "_pathways_v_version_eligible_passports" USING btree ("order");
  CREATE INDEX "_pathways_v_version_eligible_passports_parent_idx" ON "_pathways_v_version_eligible_passports" USING btree ("parent_id");
  CREATE INDEX "_pathways_v_parent_idx" ON "_pathways_v" USING btree ("parent_id");
  CREATE INDEX "_pathways_v_version_version_slug_idx" ON "_pathways_v" USING btree ("version_slug");
  CREATE INDEX "_pathways_v_version_version_country_idx" ON "_pathways_v" USING btree ("version_country_id");
  CREATE INDEX "_pathways_v_version_verification_version_verification_ve_idx" ON "_pathways_v" USING btree ("version_verification_verified_by_id");
  CREATE INDEX "_pathways_v_version_version_is_demo_idx" ON "_pathways_v" USING btree ("version_is_demo");
  CREATE INDEX "_pathways_v_version_version_updated_at_idx" ON "_pathways_v" USING btree ("version_updated_at");
  CREATE INDEX "_pathways_v_version_version_created_at_idx" ON "_pathways_v" USING btree ("version_created_at");
  CREATE INDEX "_pathways_v_version_version__status_idx" ON "_pathways_v" USING btree ("version__status");
  CREATE INDEX "_pathways_v_created_at_idx" ON "_pathways_v" USING btree ("created_at");
  CREATE INDEX "_pathways_v_updated_at_idx" ON "_pathways_v" USING btree ("updated_at");
  CREATE INDEX "_pathways_v_latest_idx" ON "_pathways_v" USING btree ("latest");
  CREATE INDEX "_pathways_v_rels_order_idx" ON "_pathways_v_rels" USING btree ("order");
  CREATE INDEX "_pathways_v_rels_parent_idx" ON "_pathways_v_rels" USING btree ("parent_id");
  CREATE INDEX "_pathways_v_rels_path_idx" ON "_pathways_v_rels" USING btree ("path");
  CREATE INDEX "_pathways_v_rels_sources_id_idx" ON "_pathways_v_rels" USING btree ("sources_id");
  CREATE INDEX "requirements_scope_passports_order_idx" ON "requirements_scope_passports" USING btree ("order");
  CREATE INDEX "requirements_scope_passports_parent_idx" ON "requirements_scope_passports" USING btree ("parent_id");
  CREATE INDEX "requirements_pathway_idx" ON "requirements" USING btree ("pathway_id");
  CREATE INDEX "requirements_verification_verification_verified_by_idx" ON "requirements" USING btree ("verification_verified_by_id");
  CREATE INDEX "requirements_is_demo_idx" ON "requirements" USING btree ("is_demo");
  CREATE INDEX "requirements_updated_at_idx" ON "requirements" USING btree ("updated_at");
  CREATE INDEX "requirements_created_at_idx" ON "requirements" USING btree ("created_at");
  CREATE INDEX "requirements__status_idx" ON "requirements" USING btree ("_status");
  CREATE INDEX "requirements_texts_order_parent" ON "requirements_texts" USING btree ("order","parent_id");
  CREATE INDEX "requirements_rels_order_idx" ON "requirements_rels" USING btree ("order");
  CREATE INDEX "requirements_rels_parent_idx" ON "requirements_rels" USING btree ("parent_id");
  CREATE INDEX "requirements_rels_path_idx" ON "requirements_rels" USING btree ("path");
  CREATE INDEX "requirements_rels_sources_id_idx" ON "requirements_rels" USING btree ("sources_id");
  CREATE INDEX "_requirements_v_version_scope_passports_order_idx" ON "_requirements_v_version_scope_passports" USING btree ("order");
  CREATE INDEX "_requirements_v_version_scope_passports_parent_idx" ON "_requirements_v_version_scope_passports" USING btree ("parent_id");
  CREATE INDEX "_requirements_v_parent_idx" ON "_requirements_v" USING btree ("parent_id");
  CREATE INDEX "_requirements_v_version_version_pathway_idx" ON "_requirements_v" USING btree ("version_pathway_id");
  CREATE INDEX "_requirements_v_version_verification_version_verificatio_idx" ON "_requirements_v" USING btree ("version_verification_verified_by_id");
  CREATE INDEX "_requirements_v_version_version_is_demo_idx" ON "_requirements_v" USING btree ("version_is_demo");
  CREATE INDEX "_requirements_v_version_version_updated_at_idx" ON "_requirements_v" USING btree ("version_updated_at");
  CREATE INDEX "_requirements_v_version_version_created_at_idx" ON "_requirements_v" USING btree ("version_created_at");
  CREATE INDEX "_requirements_v_version_version__status_idx" ON "_requirements_v" USING btree ("version__status");
  CREATE INDEX "_requirements_v_created_at_idx" ON "_requirements_v" USING btree ("created_at");
  CREATE INDEX "_requirements_v_updated_at_idx" ON "_requirements_v" USING btree ("updated_at");
  CREATE INDEX "_requirements_v_latest_idx" ON "_requirements_v" USING btree ("latest");
  CREATE INDEX "_requirements_v_texts_order_parent" ON "_requirements_v_texts" USING btree ("order","parent_id");
  CREATE INDEX "_requirements_v_rels_order_idx" ON "_requirements_v_rels" USING btree ("order");
  CREATE INDEX "_requirements_v_rels_parent_idx" ON "_requirements_v_rels" USING btree ("parent_id");
  CREATE INDEX "_requirements_v_rels_path_idx" ON "_requirements_v_rels" USING btree ("path");
  CREATE INDEX "_requirements_v_rels_sources_id_idx" ON "_requirements_v_rels" USING btree ("sources_id");
  CREATE INDEX "sources_country_idx" ON "sources" USING btree ("country_id");
  CREATE INDEX "sources_verification_verification_verified_by_idx" ON "sources" USING btree ("verification_verified_by_id");
  CREATE INDEX "sources_is_demo_idx" ON "sources" USING btree ("is_demo");
  CREATE INDEX "sources_updated_at_idx" ON "sources" USING btree ("updated_at");
  CREATE INDEX "sources_created_at_idx" ON "sources" USING btree ("created_at");
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_guides_id_idx" ON "payload_locked_documents_rels" USING btree ("guides_id");
  CREATE INDEX "payload_locked_documents_rels_countries_id_idx" ON "payload_locked_documents_rels" USING btree ("countries_id");
  CREATE INDEX "payload_locked_documents_rels_pathways_id_idx" ON "payload_locked_documents_rels" USING btree ("pathways_id");
  CREATE INDEX "payload_locked_documents_rels_requirements_id_idx" ON "payload_locked_documents_rels" USING btree ("requirements_id");
  CREATE INDEX "payload_locked_documents_rels_sources_id_idx" ON "payload_locked_documents_rels" USING btree ("sources_id");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "guides_key_points" CASCADE;
  DROP TABLE "guides" CASCADE;
  DROP TABLE "guides_rels" CASCADE;
  DROP TABLE "_guides_v_version_key_points" CASCADE;
  DROP TABLE "_guides_v" CASCADE;
  DROP TABLE "_guides_v_rels" CASCADE;
  DROP TABLE "countries_topic_intros" CASCADE;
  DROP TABLE "countries" CASCADE;
  DROP TABLE "_countries_v_version_topic_intros" CASCADE;
  DROP TABLE "_countries_v" CASCADE;
  DROP TABLE "pathways_eligible_passports" CASCADE;
  DROP TABLE "pathways" CASCADE;
  DROP TABLE "pathways_rels" CASCADE;
  DROP TABLE "_pathways_v_version_eligible_passports" CASCADE;
  DROP TABLE "_pathways_v" CASCADE;
  DROP TABLE "_pathways_v_rels" CASCADE;
  DROP TABLE "requirements_scope_passports" CASCADE;
  DROP TABLE "requirements" CASCADE;
  DROP TABLE "requirements_texts" CASCADE;
  DROP TABLE "requirements_rels" CASCADE;
  DROP TABLE "_requirements_v_version_scope_passports" CASCADE;
  DROP TABLE "_requirements_v" CASCADE;
  DROP TABLE "_requirements_v_texts" CASCADE;
  DROP TABLE "_requirements_v_rels" CASCADE;
  DROP TABLE "sources" CASCADE;
  DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TYPE "public"."enum_guides_topic";
  DROP TYPE "public"."enum_guides_verification_review_status";
  DROP TYPE "public"."enum_guides_status";
  DROP TYPE "public"."enum__guides_v_version_topic";
  DROP TYPE "public"."enum__guides_v_version_verification_review_status";
  DROP TYPE "public"."enum__guides_v_version_status";
  DROP TYPE "public"."enum_countries_topic_intros_topic";
  DROP TYPE "public"."enum_countries_status";
  DROP TYPE "public"."enum__countries_v_version_topic_intros_topic";
  DROP TYPE "public"."enum__countries_v_version_status";
  DROP TYPE "public"."enum_pathways_eligible_passports";
  DROP TYPE "public"."enum_pathways_category";
  DROP TYPE "public"."enum_pathways_verification_review_status";
  DROP TYPE "public"."enum_pathways_status";
  DROP TYPE "public"."enum__pathways_v_version_eligible_passports";
  DROP TYPE "public"."enum__pathways_v_version_category";
  DROP TYPE "public"."enum__pathways_v_version_verification_review_status";
  DROP TYPE "public"."enum__pathways_v_version_status";
  DROP TYPE "public"."enum_requirements_scope_passports";
  DROP TYPE "public"."enum_requirements_rule_mode";
  DROP TYPE "public"."enum_requirements_rule_criterion";
  DROP TYPE "public"."enum_requirements_rule_operator";
  DROP TYPE "public"."enum_requirements_verification_review_status";
  DROP TYPE "public"."enum_requirements_status";
  DROP TYPE "public"."enum__requirements_v_version_scope_passports";
  DROP TYPE "public"."enum__requirements_v_version_rule_mode";
  DROP TYPE "public"."enum__requirements_v_version_rule_criterion";
  DROP TYPE "public"."enum__requirements_v_version_rule_operator";
  DROP TYPE "public"."enum__requirements_v_version_verification_review_status";
  DROP TYPE "public"."enum__requirements_v_version_status";
  DROP TYPE "public"."enum_sources_kind";
  DROP TYPE "public"."enum_sources_verification_review_status";
  DROP TYPE "public"."enum_users_role";`)
}
