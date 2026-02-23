---
phase: 06-poll-to-grocery-pipeline
plan: 01
subsystem: documentation
tags: [polls, grocery, todoist, recipes, meal-planning, pipeline]

# Dependency graph
requires:
  - phase: 05-grocery-section-support
    provides: Section listing and section_id-based grocery addition documented in TOOLS.md
  - phase: 04-recipe-library
    provides: Recipe library in household/meals/recipes/ with structured Ingredients sections
provides:
  - Full poll-to-grocery pipeline documentation in TOOLS.md Downstream Actions
  - QUICKSTART.md reference to recipe-to-grocery auto-add on poll resolution
affects: [any agent consuming TOOLS.md poll or downstream actions documentation]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Pipeline pattern: poll resolution -> meal plan update -> recipe match -> ingredient extraction -> grocery add"
    - "Stop-at-boundary rule: if no recipe match, stop after meal plan update (no inference)"
    - "No-confirmation rule: recipe-based ingredient addition requires no user confirmation; name-based does"

key-files:
  created: []
  modified:
    - TOOLS.md
    - QUICKSTART.md

key-decisions:
  - "Pipeline only runs for meal-related polls (keyword detection: dinner, meal, eat, food, lunch)"
  - "No recipe match = stop at meal plan update; do NOT infer ingredients from meal name"
  - "Recipe match = auto-add ingredients without confirmation (structured file = reliable data)"
  - "Pipeline references existing Recipe to Grocery List section rather than duplicating quantity-stripping rules"

patterns-established:
  - "Pipeline documentation pattern: numbered steps + important rules + DO/DO NOT row"
  - "QUICKSTART brevity: single bullet expansion, no new sections"

requirements-completed: [PIPE-01, PIPE-02, PIPE-03, PIPE-04]

# Metrics
duration: 5min
completed: 2026-02-23
---

# Phase 06 Plan 01: Poll-to-Grocery Pipeline Summary

**End-to-end poll-to-grocery pipeline documented in TOOLS.md: poll resolution triggers meal plan update, recipe match, ingredient extraction, and Todoist section-aware grocery addition**

## Performance

- **Duration:** ~5 min
- **Started:** 2026-02-23T22:53:24Z
- **Completed:** 2026-02-23T22:58:41Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments

- Added "Poll-to-Grocery Pipeline" subsection to TOOLS.md with 11-step numbered pipeline covering the full flow from poll resolution to Todoist grocery addition
- Updated Downstream Actions table to reference the full pipeline instead of just meal plan update
- Added DO/DO NOT row distinguishing recipe-based auto-add (no confirmation) from meal-name-based inference (requires confirmation)
- Expanded QUICKSTART.md Polls section bullet to reference recipe-to-grocery auto-add

## Task Commits

Each task was committed atomically:

1. **Task 1: Expand Downstream Actions with full poll-to-grocery pipeline** - `29ab941` (feat)
2. **Task 2: Update QUICKSTART.md Polls section with pipeline reference** - `9ab366f` (feat)

## Files Created/Modified

- `TOOLS.md` - Added Poll-to-Grocery Pipeline subsection (11 steps), updated Downstream Actions table, added DO/DO NOT row
- `QUICKSTART.md` - Expanded Polls section bullet list with recipe-to-grocery reference

## Decisions Made

- Pipeline stops at meal plan update if no recipe match — never infers ingredients from a meal name (too unreliable for cheap LLMs)
- Recipe-based ingredient addition does NOT require user confirmation because ingredients come from a structured file
- Pipeline documentation references the existing "Recipe to Grocery List" section for quantity-stripping rules rather than duplicating them
- QUICKSTART kept to single-bullet expansion (no new section) to maintain brevity convention

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Phase 06 plan 01 complete; all four PIPE requirements (PIPE-01 through PIPE-04) addressed
- No blockers — pipeline documentation is self-contained and references existing working infrastructure

## Self-Check: PASSED

- FOUND: TOOLS.md
- FOUND: QUICKSTART.md
- FOUND: 06-01-SUMMARY.md
- FOUND: commit 29ab941 (Task 1)
- FOUND: commit 9ab366f (Task 2)

---
*Phase: 06-poll-to-grocery-pipeline*
*Completed: 2026-02-23*
