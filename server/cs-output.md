# CS Agent — Pipeline "Start Run" Feature
**Pipeline phase:** cs-agent
**Project:** Paperclip (`C:\Users\Adam\Desktop\paperclip`)
**Feature:** Start Run button on pipeline templates
**Date:** 2026-03-29

---

## Scope

The Forge phase added a "Start Run" button to two pages:
- **Templates list** (`/pipelines/templates`) — a ▶ Run button in each template row
- **Template detail** (`/pipelines/templates/:id`) — a "▶ Start Run" button in the page header

This CS output covers:
1. In-product UX copy audit
2. KB article: How to start a pipeline run
3. KB article: Pipeline run statuses explained
4. Onboarding empty state and tooltip copy

---

## 1. UX Copy Audit

### Inline run form (both pages)

**Current copy reviewed against actual code:**

| Element | Current | Assessment | Recommendation |
|---------|---------|------------|----------------|
| Form heading (detail page) | "Start a new pipeline run" | ✓ Clear | Keep |
| Form heading (list page) | "Start run — {template name}" | ✓ Clear | Keep |
| Run name placeholder | `Run name (defaults to "${template.name} — timestamp")` | Slightly wordy | See below |
| Task textarea placeholder | "What should this pipeline build? (optional)" | ✓ Clear | Keep |
| Start button (idle) | "Start" | ✓ Concise | Keep |
| Start button (pending) | "Starting..." | ✓ Correct | Keep |
| Error message | Passes through `error.message` from the API | Acceptable | See note below |
| Keyboard shortcut | Cmd+Enter submits (detail page only) | Not surfaced to user | See below |

**Recommended copy improvements:**

**Run name placeholder** — current text is 47 characters, hard to read at small size:
```
Before: Run name (defaults to "${template.name} — timestamp")
After:  Optional — defaults to "{template.name} — {date/time}"
```

**Keyboard shortcut hint** — the detail page supports Cmd+Enter to submit. Users won't discover this. Add a hint line below the textarea:
```
Tip: Press ⌘↵ to start
```
(Windows: Ctrl+Enter)

**Error message** — raw API errors may not be user-friendly. Until a mapping layer exists, add a fallback:
```
Before: "Failed to start run"
After:  "Couldn't start the run. Check your connection and try again."
```
This is already the fallback when `error.message` is absent — the current code is fine, but consider surfacing the specific error in a more actionable format if the API returns structured errors.

---

## 2. Tooltip / Inline Help Copy

These strings are ready to paste into the UI when tooltips are added:

**"Start Run" button tooltip (template detail header):**
> Start a new run of this pipeline. You'll be taken to the run detail page to monitor progress.

**"Run" button tooltip (templates list row):**
> Launch this template as a new pipeline run.

**Run name field hint:**
> Leave blank to auto-name by template + timestamp.

**Task / input context field hint:**
> Describe what the pipeline should build or process. This is passed to the first agent as context. Leave blank to use the template defaults.

---

## 3. KB Article: How to Start a Pipeline Run

```markdown
---
title: How to start a pipeline run
category: Features & How-tos > Pipelines
tags: pipeline, run, start, execute, template
audience: All users
last-updated: 2026-03-29
---

## Overview

This guide shows you how to launch a pipeline run from either the Templates list or the
Template detail page. A run executes your pipeline's phase sequence — each phase is assigned
to an agent that picks up the task, invokes the required skills, and passes a QA gate before
the next phase begins.

## Prerequisites

- At least one active pipeline template exists for your company
- You have a company selected in the top navigation

## Starting a run from the Templates list

1. Go to **Pipelines → Templates** in the left navigation.
2. Find the template you want to run. Templates with status **Active** have a **▶ Run** button in
   the rightmost column.
3. Click **▶ Run**. A form expands below the table.
4. *(Optional)* Enter a **run name**. If you leave it blank, the run is named
   `{Template name} — {date/time}`.
5. *(Optional)* Describe what the pipeline should build in the **task context** field. This is
   passed to agents as input. Leave it blank to use the template's defaults.
6. Click **▶ Start**.

You are automatically taken to the run detail page where you can monitor progress.

## Starting a run from the Template detail page

1. Go to **Pipelines → Templates** and click on any template name to open its detail page.
2. Click **▶ Start Run** in the top-right of the page header.
3. A form appears inline below the header.
4. Fill in the optional **run name** and **task context** (same fields as above).
5. Click **▶ Start**, or press **Cmd+Enter** (Mac) / **Ctrl+Enter** (Windows) to submit.

You are automatically taken to the run detail page.

## What happens after you start a run

1. A pipeline run record is created with status **Pending**.
2. The run is immediately executed — status changes to **Running**.
3. Phases begin executing in order (parallel phases run simultaneously where configured).
4. When all phases pass their QA gates, the run status becomes **Completed**.
5. If any phase fails and retries are exhausted, the run status becomes **Failed**.

For phase and run status meanings, see [Pipeline run statuses explained](#).

## Common issues

**The ▶ Run button is not visible on a template row**
The template may be archived. The Templates list only shows active templates. Archived templates
do not appear in the list.

**"Couldn't start the run. Check your connection and try again."**
This error appears when the API call to create or execute the run fails. Check your internet
connection and try again. If the error persists, contact support.

**I started a run but nothing is happening on the run detail page**
The run detail page auto-refreshes. If phases stay in Pending status for more than a minute,
the execution step may have failed silently. Try cancelling the run and starting a new one.

## Related articles

- Pipeline run statuses explained
- What is a pipeline template?
- How to cancel a pipeline run
```

---

## 4. KB Article: Pipeline Run Statuses Explained

```markdown
---
title: Pipeline run statuses explained
category: Features & How-tos > Pipelines
tags: pipeline, status, run, phase, pending, running, failed, completed, cancelled
audience: All users
last-updated: 2026-03-29
---

## Overview

Every pipeline run and every phase within it has a status. This article explains what each
status means and what — if anything — you need to do.

## Run statuses

| Icon | Status | Meaning | Action needed? |
|------|--------|---------|----------------|
| ⏱ | **Pending** | Run created, waiting to start | None — starts automatically |
| ▶ | **Running** | Actively executing phases | None — monitor the phase list |
| ✓ | **Completed** | All phases passed their QA gates | None |
| ✗ | **Failed** | One or more phases failed after all retries | Review the failed phase output |
| ⊘ | **Cancelled** | Run was manually cancelled | None |

## Phase statuses

Each phase within a run has its own status:

| Icon | Status | Meaning |
|------|--------|---------|
| ⏱ | **Pending** | Phase is waiting for its dependencies to complete |
| ▶ | **Running** | An agent is actively working this phase |
| ✓ | **Passed** | Phase completed and passed the QA gate |
| ✗ | **Failed** | Phase failed — either the agent errored or the QA gate rejected the output |
| → | **Skipped** | Phase was skipped (dependency failed upstream) |
| ⊘ | **Cancelled** | Phase was cancelled as part of a run cancellation |

> **Note:** Status is always shown as icon + text label — you do not need to rely on color alone
> to understand a phase's state.

## QA gate results

Each phase has a QA threshold (shown as a percentage, e.g. 80%). After an agent completes a
phase, a QA score is calculated. If the score meets or exceeds the threshold, the gate **passes**
and the phase moves to **Passed**. If not, the phase is retried up to the configured maximum.

A **✓ Gate passed** indicator means the phase output met the quality bar.
A **✗ Gate failed** indicator means the output did not meet the bar and retries were exhausted.

## Skill gate results

Each phase also checks that the assigned agent invoked its required skills. A **✓ Gate passed**
skill gate means all required skills were invoked. A **✗ Gate failed** skill gate lists the
missing skills.

Skill gate failures count against the run's total and may cause the phase to fail.

## Related articles

- How to start a pipeline run
- How to cancel a pipeline run
- What is a pipeline template?
```

---

## 5. Onboarding & Empty States

### Templates list — no templates yet

**Current copy:**
> "No pipeline templates yet. Create one to define an orchestrated multi-agent workflow."

**Assessment:** Accurate to the empty state, but the "Create one" CTA doesn't work — the **New template** button is currently disabled (`disabled` prop is set). The copy implies the user can self-serve, which they can't yet.

**Recommended copy:**
> No pipeline templates yet.
> Templates are created by your account administrator.

This avoids pointing users at a disabled button.

---

### Run detail page — no phases yet

If a run is in `pending` status and the phases array is empty, the page should surface a helpful state rather than a blank list. Suggested empty state copy:

> **▶ Run queued**
> Phases will appear here as the run progresses. This page refreshes automatically.

---

### Templates list — select company prompt

**Current copy:**
> "Select a company to view pipeline templates."

This is accurate. No change needed.

---

## Self-Check

| Criterion | Pass | Notes |
|-----------|------|-------|
| References real endpoints | ✓ | `POST /api/companies/:companyId/pipeline-runs`, `POST /api/pipeline-runs/:runId/execute` |
| References real file paths | ✓ | `ui/src/pages/PipelineTemplates.tsx`, `ui/src/pages/PipelineTemplateDetail.tsx`, `ui/src/api/pipelines.ts` |
| References real field names | ✓ | `runName`, `inputContext`, `triggerSource`, `templateId` |
| Describes actual behavior | ✓ | startRun → executeRun → navigate to `/pipelines/runs/${run.id}` verified in code |
| Status icons reference real implementation | ✓ | Icons pulled from `phaseStatusConfig` in `PipelineRunDetail.tsx` — Clock, Play, CheckCircle2, XCircle, SkipForward, Ban |
| No generic filler | ✓ | All copy grounded in actual component behavior |
| Colorblind-safe guidance | ✓ | Status table uses icon + label, explicitly notes no color-only reliance |

**Score: 8/10**

---

CS_DONE
