CREATE TABLE "pipeline_phases" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"run_id" uuid NOT NULL,
	"phase_key" text NOT NULL,
	"phase_name" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"agent_id" uuid,
	"heartbeat_run_id" uuid,
	"attempt" integer DEFAULT 1 NOT NULL,
	"retry_of_phase_id" uuid,
	"task_prompt" text,
	"agent_output" text,
	"skill_gate_result" jsonb,
	"scores" jsonb,
	"qa_threshold" integer,
	"qa_passed" text,
	"required_skills" jsonb DEFAULT '[]'::jsonb,
	"used_skills" jsonb DEFAULT '[]'::jsonb,
	"error" text,
	"duration_ms" integer,
	"started_at" timestamp with time zone,
	"finished_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pipeline_runs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"template_id" uuid NOT NULL,
	"name" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"current_phase_key" text,
	"input_context" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"skill_plan" jsonb,
	"eval_results" jsonb,
	"triggered_by_agent_id" uuid,
	"triggered_by_user_id" uuid,
	"trigger_source" text DEFAULT 'manual' NOT NULL,
	"retry_of_run_id" uuid,
	"total_skill_gate_failures" integer DEFAULT 0 NOT NULL,
	"total_retries" integer DEFAULT 0 NOT NULL,
	"error" text,
	"started_at" timestamp with time zone,
	"finished_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pipeline_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"phases" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"signal_config" jsonb,
	"default_qa_threshold" integer DEFAULT 80 NOT NULL,
	"default_max_retries" integer DEFAULT 1 NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"archived_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "pipeline_phases" ADD CONSTRAINT "pipeline_phases_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pipeline_phases" ADD CONSTRAINT "pipeline_phases_run_id_pipeline_runs_id_fk" FOREIGN KEY ("run_id") REFERENCES "public"."pipeline_runs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pipeline_phases" ADD CONSTRAINT "pipeline_phases_agent_id_agents_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."agents"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pipeline_phases" ADD CONSTRAINT "pipeline_phases_heartbeat_run_id_heartbeat_runs_id_fk" FOREIGN KEY ("heartbeat_run_id") REFERENCES "public"."heartbeat_runs"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pipeline_runs" ADD CONSTRAINT "pipeline_runs_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pipeline_runs" ADD CONSTRAINT "pipeline_runs_template_id_pipeline_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."pipeline_templates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pipeline_runs" ADD CONSTRAINT "pipeline_runs_triggered_by_agent_id_agents_id_fk" FOREIGN KEY ("triggered_by_agent_id") REFERENCES "public"."agents"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pipeline_runs" ADD CONSTRAINT "pipeline_runs_retry_of_run_id_pipeline_runs_id_fk" FOREIGN KEY ("retry_of_run_id") REFERENCES "public"."pipeline_runs"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pipeline_templates" ADD CONSTRAINT "pipeline_templates_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "pipeline_phases_run_phase_idx" ON "pipeline_phases" USING btree ("run_id","phase_key");--> statement-breakpoint
CREATE INDEX "pipeline_phases_company_run_idx" ON "pipeline_phases" USING btree ("company_id","run_id");--> statement-breakpoint
CREATE INDEX "pipeline_phases_run_status_idx" ON "pipeline_phases" USING btree ("run_id","status");--> statement-breakpoint
CREATE INDEX "pipeline_runs_company_status_idx" ON "pipeline_runs" USING btree ("company_id","status");--> statement-breakpoint
CREATE INDEX "pipeline_runs_company_template_idx" ON "pipeline_runs" USING btree ("company_id","template_id");--> statement-breakpoint
CREATE INDEX "pipeline_runs_company_created_idx" ON "pipeline_runs" USING btree ("company_id","created_at");--> statement-breakpoint
CREATE INDEX "pipeline_templates_company_slug_idx" ON "pipeline_templates" USING btree ("company_id","slug");--> statement-breakpoint
CREATE INDEX "pipeline_templates_company_status_idx" ON "pipeline_templates" USING btree ("company_id","status");