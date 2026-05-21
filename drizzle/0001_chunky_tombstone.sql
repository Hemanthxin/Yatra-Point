CREATE TABLE IF NOT EXISTS "destinations" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" varchar(100) NOT NULL,
	"name" varchar(120) NOT NULL,
	"state" varchar(60) NOT NULL,
	"district" varchar(80),
	"category" varchar(40) NOT NULL,
	"description" text NOT NULL,
	"short_description" varchar(220) NOT NULL,
	"image_url" text,
	"budget_per_day" integer NOT NULL,
	"recommended_days" integer DEFAULT 2 NOT NULL,
	"best_months" text,
	"is_hidden" boolean DEFAULT false NOT NULL,
	"popularity" integer DEFAULT 50 NOT NULL,
	"latitude" varchar(20),
	"longitude" varchar(20),
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "destinations_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "favorites" (
	"user_id" text NOT NULL,
	"destination_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "favorites_user_id_destination_id_pk" PRIMARY KEY("user_id","destination_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "trip_plan_items" (
	"trip_plan_id" text NOT NULL,
	"destination_id" text NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "trip_plan_items_trip_plan_id_destination_id_pk" PRIMARY KEY("trip_plan_id","destination_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "trip_plans" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"name" varchar(140) NOT NULL,
	"total_budget" integer NOT NULL,
	"days" integer NOT NULL,
	"travellers" integer DEFAULT 1 NOT NULL,
	"category" varchar(40),
	"status" varchar(20) DEFAULT 'draft' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "favorites" ADD CONSTRAINT "favorites_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "favorites" ADD CONSTRAINT "favorites_destination_id_destinations_id_fk" FOREIGN KEY ("destination_id") REFERENCES "public"."destinations"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "trip_plan_items" ADD CONSTRAINT "trip_plan_items_trip_plan_id_trip_plans_id_fk" FOREIGN KEY ("trip_plan_id") REFERENCES "public"."trip_plans"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "trip_plan_items" ADD CONSTRAINT "trip_plan_items_destination_id_destinations_id_fk" FOREIGN KEY ("destination_id") REFERENCES "public"."destinations"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "trip_plans" ADD CONSTRAINT "trip_plans_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
