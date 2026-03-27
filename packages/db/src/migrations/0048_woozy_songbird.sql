CREATE TABLE "training_configs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"skill_id" uuid,
	"skill_slug" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"evaluator_instructions" text NOT NULL,
	"generator_scenarios" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"rubric" jsonb,
	"benchmark_ref" text,
	"max_iterations" integer DEFAULT 6 NOT NULL,
	"convergence_threshold" integer DEFAULT 85 NOT NULL,
	"baseline_score" integer,
	"status" text DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "training_iterations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"training_run_id" uuid NOT NULL,
	"iteration_number" integer NOT NULL,
	"generator_output" text,
	"evaluator_critique" text,
	"scores" jsonb,
	"score_percent" integer,
	"score_delta" integer,
	"critique_accountability" jsonb,
	"not_done" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"generator_duration_ms" integer,
	"evaluator_duration_ms" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "training_runs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"skill_id" uuid,
	"skill_slug" text NOT NULL,
	"config_id" uuid,
	"status" text DEFAULT 'pending' NOT NULL,
	"current_iteration" integer DEFAULT 0 NOT NULL,
	"max_iterations" integer DEFAULT 6 NOT NULL,
	"convergence_threshold" integer DEFAULT 85 NOT NULL,
	"baseline_score" integer,
	"final_score" integer,
	"best_score" integer,
	"best_iteration" integer,
	"scenario" text,
	"evaluator_instructions" text,
	"proposed_skill_update" text,
	"update_applied" text DEFAULT 'pending' NOT NULL,
	"trigger_source" text DEFAULT 'manual' NOT NULL,
	"trigger_pipeline_run_id" uuid,
	"error" text,
	"started_at" timestamp with time zone,
	"finished_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "training_configs" ADD CONSTRAINT "training_configs_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "training_configs" ADD CONSTRAINT "training_configs_skill_id_company_skills_id_fk" FOREIGN KEY ("skill_id") REFERENCES "public"."company_skills"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "training_iterations" ADD CONSTRAINT "training_iterations_training_run_id_training_runs_id_fk" FOREIGN KEY ("training_run_id") REFERENCES "public"."training_runs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "training_runs" ADD CONSTRAINT "training_runs_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "training_runs" ADD CONSTRAINT "training_runs_skill_id_company_skills_id_fk" FOREIGN KEY ("skill_id") REFERENCES "public"."company_skills"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "training_runs" ADD CONSTRAINT "training_runs_config_id_training_configs_id_fk" FOREIGN KEY ("config_id") REFERENCES "public"."training_configs"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "training_configs_company_skill_idx" ON "training_configs" USING btree ("company_id","skill_slug");--> statement-breakpoint
CREATE INDEX "training_configs_company_status_idx" ON "training_configs" USING btree ("company_id","status");--> statement-breakpoint
CREATE INDEX "training_iterations_run_iteration_idx" ON "training_iterations" USING btree ("training_run_id","iteration_number");--> statement-breakpoint
CREATE INDEX "training_runs_company_status_idx" ON "training_runs" USING btree ("company_id","status");--> statement-breakpoint
CREATE INDEX "training_runs_company_skill_idx" ON "training_runs" USING btree ("company_id","skill_slug");--> statement-breakpoint
CREATE INDEX "training_runs_company_created_idx" ON "training_runs" USING btree ("company_id","created_at");