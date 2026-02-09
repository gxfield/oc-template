---
phase: 03-meal-planning
plan: 01
subsystem: household-assistant
tags: [documentation, meal-planning, command-handlers, llm-instructions]
dependency-graph:
  requires: [02-quick-capture]
  provides: [meal-planning-handlers, shopping-from-meals]
  affects: [TOOLS.md, household/meals/this-week.md]
tech-stack:
  added: []
  patterns: [trigger-phrase-tables, DO-DO-NOT-tables, input-output-examples]
key-files:
  created: []
  modified:
    - TOOLS.md
    - household/meals/this-week.md
decisions:
  - "Meal Planning section placed after Quick Capture for logical flow (capture -> planning)"
  - "Shopping from meals requires user confirmation before adding to shopping.md due to vague meal descriptions"
  - "Calendar CLI path references use node calendar/calendar.js now (not node calendar.js now)"
  - "Format header emphasizes meal description specificity for ingredient inference"
metrics:
  duration: 92s
  tasks: 2
  commits: 2
  files-modified: 2
  completed: 2026-02-09
---

# Phase 03 Plan 01: Meal Planning Command Handlers Summary

**One-liner:** Comprehensive Meal Planning command handlers in TOOLS.md with shopping generation workflow and refined this-week.md format header for ingredient inference.

## Objectives Achieved

Added Meal Planning command handlers to TOOLS.md following the established Quick Capture pattern. Cheap LLMs can now reliably:
- Set weekly dinner plans ("set Monday to lasagna")
- Query tonight's meal ("what's for dinner")
- Generate shopping lists from meal plans with user confirmation
- Handle edge cases like "No plan" days and unspecified day defaults

## Work Completed

### Task 1: Add Meal Planning Section to TOOLS.md
- Added comprehensive Meal Planning section at line 296 (after Quick Capture, before Edge Cases)
- Created trigger phrase table with 6 patterns covering set/query/shopping workflows
- Documented parsing rules for setting meals (preserve all 7 days, update specified lines)
- Documented parsing rules for querying meals (today/tomorrow/week using calendar CLI)
- Documented parsing rules for shopping generation (propose ingredients, require confirmation)
- Added 6 input/output examples with Input/Action/Response format
- Created DO/DO NOT table with 5 rows (day names, file preservation, confirmation, capitalization)
- Documented 3 edge cases (no plan, unspecified day, clearing meals)
- All calendar references use correct path: `node calendar/calendar.js now`
- All file references use correct path: `household/meals/this-week.md`

### Task 2: Refine this-week.md Format Header
- Added shopping list generation workflow note to format header
- Clarified that agent identifies ingredients and proposes before adding to shopping.md
- Added guidance for meal description specificity (enable ingredient inference)
- Updated example to show detailed format: "Chicken stir fry with rice and vegetables"
- All existing meal data preserved unchanged (Monday-Sunday entries intact)

## Deviations from Plan

**1. [Pre-existing Work] Task 1 was partially complete before execution**
- **Found during:** Initial file read
- **Issue:** TOOLS.md already contained Meal Planning section matching all requirements
- **Resolution:** Verified completeness against plan requirements, committed existing work
- **Files affected:** TOOLS.md
- **Commit:** be463e1

This was not a bug or missing functionality - the work had been done but never committed according to GSD protocol. All requirements were met, so I verified and committed it as Task 1.

## Key Files

### Modified Files

**TOOLS.md**
- Added Meal Planning section (93 lines)
- Trigger phrase table, parsing rules, examples, DO/DO NOT table, edge cases
- Follows same pattern as Quick Capture for consistency

**household/meals/this-week.md**
- Enhanced format header with shopping workflow guidance
- Added meal description specificity rule
- Updated example to show detailed meal format

## Technical Implementation

### Pattern: Trigger Phrase Tables
Continued the trigger phrase table pattern from Quick Capture. This enables cheap LLMs to quickly match user input patterns without complex NLP:
- Set meals: "set Monday to lasagna"
- Query meals: "what's for dinner tonight"
- Generate shopping: "shopping list from meals"

### Pattern: Confirmation Before Auto-add
Unlike calendar/todos/shopping which auto-add, meal-to-shopping requires confirmation because:
- Meal names are vague descriptions, not recipes
- "Tacos" could mean dozens of different ingredient combinations
- User needs to review and edit proposed ingredient list

### Pattern: Calendar CLI for Day Names
Consistently using `node calendar/calendar.js now` across all meal planning operations ensures correct Pacific day name derivation (avoiding UTC system clock issues after 4 PM Pacific).

## Verification Results

All success criteria met:
- ✅ TOOLS.md contains "## Meal Planning" section at correct location
- ✅ Section has trigger phrase table with 6+ trigger patterns
- ✅ Parsing rules for set, query, and shopping generation present
- ✅ 6 input/output examples with Input/Action/Response format
- ✅ DO/DO NOT table with 5 rows
- ✅ Edge cases documented (no plan, unspecified day, clearing)
- ✅ File path references consistent: household/meals/this-week.md
- ✅ Calendar CLI references use correct path: node calendar/calendar.js now
- ✅ this-week.md format header includes shopping generation guidance
- ✅ All meal data preserved unchanged
- ✅ Format header mentions ingredient inference specificity

## Impact

### For Cheap LLMs
The Meal Planning section provides unambiguous instructions for handling meal-related commands. Trigger phrase tables enable fast pattern matching. DO/DO NOT tables prevent common mistakes (wrong day after 4 PM Pacific, deleting unmentioned days, auto-adding vague ingredients).

### For Users
Users can now:
- Set dinner plans naturally: "set Thursday to chicken parmesan"
- Query tonight's meal: "what's for dinner"
- Generate shopping lists from the week's meal plan with review before adding

### For System Reliability
Consistent use of `node calendar/calendar.js now` for day name lookups ensures Pacific timezone correctness across all meal planning operations. Format header changes guide LLMs to create more detailed meal descriptions, improving shopping list generation quality.

## Next Steps

Phase 03 Plan 02 will add Meal Planning quick reference to QUICKSTART.md, following the same pattern established for Quick Capture documentation.

## Self-Check

Verifying all claims:

### Created/Modified Files
```bash
[ -f "/Users/greg/ai/assistant/workspace-fixed/TOOLS.md" ] && echo "FOUND: TOOLS.md" || echo "MISSING: TOOLS.md"
[ -f "/Users/greg/ai/assistant/workspace-fixed/household/meals/this-week.md" ] && echo "FOUND: household/meals/this-week.md" || echo "MISSING: household/meals/this-week.md"
```

### Commits Exist
```bash
git log --oneline --all | grep -q "be463e1" && echo "FOUND: be463e1" || echo "MISSING: be463e1"
git log --oneline --all | grep -q "16177f7" && echo "FOUND: 16177f7" || echo "MISSING: 16177f7"
```

## Self-Check: PASSED

All files and commits verified:
- ✅ FOUND: TOOLS.md
- ✅ FOUND: household/meals/this-week.md
- ✅ FOUND: be463e1 (Task 1 commit)
- ✅ FOUND: 16177f7 (Task 2 commit)
