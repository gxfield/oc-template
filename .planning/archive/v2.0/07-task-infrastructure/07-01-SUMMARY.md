---
phase: 07-task-infrastructure
plan: 01
subsystem: task-architecture
tags: [foundation, types, normalization, contracts]

dependency_graph:
  requires: []
  provides:
    - NormalizedTaskRequest shape (input contract)
    - LLMPayload shape (output contract)
    - Request normalization (string and object)
  affects:
    - task-orchestrator (INFRA-01)
    - all task runners (INFRA-04+)
    - cache layer (INFRA-02)

tech_stack:
  added: []
  patterns:
    - Factory functions for type construction
    - CommonJS module exports
    - Input validation with descriptive errors

key_files:
  created:
    - tasks/types.js: "Core type constructors (NormalizedTaskRequest, LLMPayload)"
    - tasks/read-msg.js: "Request normalization for string/object inputs"
  modified: []

decisions:
  - choice: "Factory functions instead of classes for type construction"
    rationale: "Simpler, lighter weight, follows project conventions"
  - choice: "String format supports default intent='get' for single-token input"
    rationale: "Allows 'calendar' to mean 'calendar get' for convenience"
  - choice: "Preserve raw input in NormalizedTaskRequest.raw field"
    rationale: "Enables debugging and audit trails"

metrics:
  duration_seconds: 75
  duration_minutes: 1.25
  tasks_completed: 2
  files_created: 2
  commits: 2
  completed_date: "2026-02-11"
---

# Phase 7 Plan 1: Request Normalization and Type Constructors Summary

**One-liner:** Created factory functions for NormalizedTaskRequest (input) and LLMPayload (output) shapes, plus string/object request normalizer.

## What Was Built

Established the core data contracts for the v2.0 task architecture:

**types.js** provides three factory functions:
- `createTaskRequest(task, intent, parameters, raw)` - Builds NormalizedTaskRequest with validation
- `createLLMPayload(task, intent, parameters, data, meta)` - Builds LLMPayload with timestamp/cached/error defaults
- `createErrorPayload(task, intent, parameters, errorMessage)` - Shorthand for error responses

**read-msg.js** provides request normalization:
- `normalizeRequest(input)` - Converts string or object input to NormalizedTaskRequest
- String format: `"calendar get today"` → `{task: 'calendar', intent: 'get', parameters: {query: 'today'}}`
- Object format: `{task, intent, parameters}` → validates and normalizes
- Default intent to 'get' for single-token strings like `"calendar"`

## Verification Results

All verification checks passed:
- ✓ types.js loads without error
- ✓ read-msg.js loads without error
- ✓ String input normalization works correctly
- ✓ Object input normalization works correctly
- ✓ Validation throws descriptive errors on invalid input
- ✓ LLMPayload factory produces correct shape with defaults
- ✓ Error payload factory produces correct shape

## Deviations from Plan

None - plan executed exactly as written.

## Commits

1. **1f0c37a** - feat(07-01): create types.js with NormalizedTaskRequest and LLMPayload constructors
2. **14224d8** - feat(07-01): create read-msg.js request normalizer

## Dependencies

**Provides for:**
- 07-02 (task orchestrator) - will use normalizeRequest and createLLMPayload
- 07-03 (cache layer) - will use LLMPayload shape for cache entries
- 07-04+ (task runners) - will use createLLMPayload for responses

**Blocks:** None

## Next Steps

Ready for Phase 7 Plan 2: Task Orchestrator (INFRA-01) - will consume these types to route requests to task runners.

## Self-Check: PASSED

Verified all created files exist:
- FOUND: tasks/types.js
- FOUND: tasks/read-msg.js

Verified all commits exist:
- FOUND: 1f0c37a
- FOUND: 14224d8
