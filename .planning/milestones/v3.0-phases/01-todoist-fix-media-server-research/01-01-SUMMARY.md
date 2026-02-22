---
phase: 01-todoist-fix-media-server-research
plan: 01
subsystem: todoist-integration
tags: [integration, api-migration, credentials]
requires: []
provides: [todoist-get, todoist-add, todoist-done]
affects: [task-orchestrator]
tech-stack:
  added: []
  patterns: [credential-management, api-versioning]
key-files:
  created: [credentials.json]
  modified:
    - tasks/todoist/helpers/fetch-tasks.js
    - tasks/todoist/helpers/create-task.js
    - tasks/todoist/helpers/complete-task.js
decisions:
  - summary: "Migrated to Todoist API v1 after discovering v2 deprecation"
    context: "REST v2 endpoint returned 410 Gone during testing"
    rationale: "v1 is current stable API, v2 was officially deprecated"
    impact: "All three Todoist intents now working correctly"
metrics:
  duration: 167
  completed: 2026-02-15T20:15:18Z
---

# Phase 01 Plan 01: Todoist Integration Fix Summary

**One-liner:** Fixed Todoist integration by adding credentials and migrating from deprecated REST v2 to v1 API

## Execution Summary

**Status:** Complete ✓
**Tasks completed:** 2/2
**Duration:** 2.78 minutes

Successfully restored Todoist integration functionality. The code was already correct but lacked credentials. During verification, discovered the REST v2 API was deprecated (410 error), requiring migration to v1 API with response format adjustments.

## Tasks Completed

### Task 1: Create credentials.json with Todoist API key and project IDs
**Type:** checkpoint:human-action
**Status:** Complete (user action)
**Commit:** N/A (gitignored file)

User successfully created credentials.json with:
- Todoist API token from Settings > Integrations > Developer
- Project IDs for both `todos` and `shopping` projects

### Task 2: Verify all Todoist intents end-to-end and clean up
**Type:** auto
**Status:** Complete
**Commit:** b0b4fef

Verified all three Todoist intents (get, add, done) for both projects:
1. ✓ GET todos: Returns tasks array with count
2. ✓ GET shopping: Returns empty tasks array (no items)
3. ✓ ADD: Created test task successfully
4. ✓ DONE: Completed and removed test task
5. ✓ Cleanup verified: Task removed from list

TOOLS.md documentation reviewed - already accurate, no changes needed.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Migrated from deprecated Todoist REST v2 to v1 API**
- **Found during:** Task 2, first API call attempt
- **Issue:** Todoist REST v2 API endpoint returned 410 Gone (deprecated)
- **Fix:**
  - Changed `/rest/v2/` to `/api/v1/` in all three helper files
  - Updated fetch-tasks.js to handle new response format: `response.results || response`
  - v1 API returns `{ results: [], next_cursor: null }` instead of bare array
- **Files modified:**
  - tasks/todoist/helpers/fetch-tasks.js
  - tasks/todoist/helpers/create-task.js
  - tasks/todoist/helpers/complete-task.js
- **Commit:** b0b4fef
- **Verification:** All three intents tested successfully with v1 API

## Decisions Made

1. **API Migration Strategy:** Fixed inline during testing rather than creating separate task
   - **Rationale:** Blocking bug preventing verification, Rule 1 applies
   - **Impact:** Immediate resolution, no plan deviation needed

## Verification Results

All success criteria met:
- ✓ `node tasks/index.js "todoist get project=todos"` returns valid response
- ✓ `node tasks/index.js "todoist get project=shopping"` returns valid response
- ✓ `node tasks/index.js "todoist add project=todos content=Test"` creates task
- ✓ `node tasks/index.js "todoist done taskId=ID"` completes task
- ✓ API migration from v2 to v1 successful

## Integration Impact

**Provides:**
- Working Todoist GET intent for todos and shopping projects
- Working Todoist ADD intent with project selection
- Working Todoist DONE intent with task ID

**Dependencies:**
- credentials.json (gitignored, user-managed)
- Todoist API v1 (external service)

**Affects:**
- Task orchestrator can now execute all Todoist commands
- Agent can manage household todos and shopping lists via Todoist

## Self-Check

Verifying all claimed artifacts exist:

**Files:**
- ✓ FOUND: credentials.json
- ✓ FOUND: tasks/todoist/helpers/fetch-tasks.js
- ✓ FOUND: tasks/todoist/helpers/create-task.js
- ✓ FOUND: tasks/todoist/helpers/complete-task.js

**Commits:**
- ✓ FOUND: b0b4fef (fix: migrate Todoist API)

**Self-Check: PASSED**
