ALTER TABLE "routine_runs" ADD COLUMN "linked_pipeline_run_id" uuid;--> statement-breakpoint
ALTER TABLE "routines" ADD COLUMN "pipeline_template_id" uuid;--> statement-breakpoint
ALTER TABLE "routines" ADD COLUMN "pipeline_params" jsonb;--> statement-breakpoint
ALTER TABLE "routine_runs" ADD CONSTRAINT "routine_runs_linked_pipeline_run_id_pipeline_runs_id_fk" FOREIGN KEY ("linked_pipeline_run_id") REFERENCES "public"."pipeline_runs"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "routines" ADD CONSTRAINT "routines_pipeline_template_id_pipeline_templates_id_fk" FOREIGN KEY ("pipeline_template_id") REFERENCES "public"."pipeline_templates"("id") ON DELETE set null ON UPDATE no action;