---
phase: 01-instruction-hardening
plan: 02
subsystem: household-files, agent-instructions
tags: [format-headers, startup-checklist, instruction-hardening]
dependency_graph:
  requires: []
  provides: [machine-readable-formats, explicit-startup-protocol]
  affects: [household-files, AGENTS.md]
tech_stack:
  added: [HTML-comment-format-headers]
  patterns: [embedded-instructions, numbered-protocols]
key_files:
  created:
    - household/todos.md
    - household/shopping.md
    - household/notes.md
    - household/bills.md
    - household/maintenance.md
    - household/calendar.md
    - household/meals/this-week.md
  modified: []
decisions:
  - decision: "Use HTML comments for format headers"
    rationale: "Invisible to humans, visible to LLMs parsing files"
    impact: "LLMs can read format specs without cluttering human view"
  - decision: "Numbered steps in AGENTS.md startup checklist"
    rationale: "Cheap LLMs need mechanical, step-by-step instructions"
    impact: "Eliminates interpretation - every step is explicit"
metrics:
  duration_minutes: 2
  tasks_completed: 2
  files_modified: 7
  commits: 1
  completed_date: "2026-02-09"
---

# Phase 01 Plan 02: Instruction Hardening for Household Files

**One-liner:** Added machine-readable FORMAT headers to 7 household markdown files and explicit numbered startup checklist to AGENTS.md.

## Overview

This plan added explicit, machine-readable format instructions to every household markdown file (todos, shopping, notes, bills, maintenance, calendar, meals) and rewrote the AGENTS.md startup checklist to be unambiguous for cheap LLMs. The goal is to eliminate guesswork when a cheap LLM encounters these files for the first time.

## Tasks Completed

### Task 1: Add format headers to all 7 household markdown files
**Status:** ✓ Complete
**Commit:** dfb4f2d

Added HTML comment format headers to all household files with:
- Purpose statement
- Exact line format specification
- Precise add/modify/remove instructions
- Rules and constraints
- Example lines

Replaced placeholder data with realistic examples matching format specs:
- `todos.md`: Checkbox format with sample tasks
- `shopping.md`: Simple list format with capitalized items
- `notes.md`: Pacific timestamp format with example notes
- `bills.md`: Pipe-separated format with unpaid/paid examples
- `maintenance.md`: Date + status format with chronological log
- `calendar.md`: Annual and one-time event format
- `meals/this-week.md`: All 7 days of week with meal plans

**Files created:**
- household/todos.md
- household/shopping.md
- household/notes.md
- household/bills.md
- household/maintenance.md
- household/calendar.md
- household/meals/this-week.md

### Task 2: Rewrite AGENTS.md startup checklist with exact file paths
**Status:** ✓ Already Complete (from plan 01-01)
**Commit:** 4de15fe (previous plan)

The AGENTS.md startup checklist was already rewritten in plan 01-01 with:
- 6 numbered steps with exact file paths (/SOUL.md, /USER.md, etc.)
- Timezone warning in Step 3 (use `node calendar.js now`, not `date`)
- Memory section updated with exact path patterns
- All other sections preserved

**No additional commit needed** - verification confirmed current state matches plan requirements.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule N/A - Overlap] Task 2 already completed in previous plan**
- **Found during:** Task 2 execution
- **Issue:** AGENTS.md startup checklist was already rewritten in plan 01-01 with identical specifications
- **Resolution:** Verified current state matches all requirements, no changes needed
- **Files affected:** AGENTS.md
- **Commit:** None required (already at 4de15fe)

This overlap indicates that plan 01-01 and 01-02 had some redundancy in their task definitions. The work was not duplicated - I verified the existing state and confirmed it matched requirements.

## Verification Results

All verification criteria passed:

1. ✓ All 7 household files have FORMAT headers
2. ✓ FORMAT headers include Purpose, Line format, To add, Rules, and Example fields
3. ✓ AGENTS.md has numbered Steps 1-6 with exact file paths
4. ✓ AGENTS.md Step 3 includes timezone warning (DO NOT use `date`)
5. ✓ bills.md uses pipe-separated structured format
6. ✓ meals/this-week.md has all 7 days listed

## Success Criteria Met

A cheap LLM encountering this workspace for the first time can now:

- ✓ Follow AGENTS.md Steps 1-6 in order, loading all correct files
- ✓ Open any household file and immediately know exact line format from header
- ✓ Add a new bill in correct pipe-separated format
- ✓ Add a note with Pacific timestamp (not UTC)
- ✓ Know meals/this-week.md must have all 7 days listed
- ✓ Understand how to add/complete/remove items in each file type

## Key Decisions

1. **HTML comment format for headers** - Makes format specs invisible to humans but parseable by LLMs
2. **Explicit timezone warnings** - Embedded in format headers and startup steps to prevent UTC mistakes
3. **Example data as living documentation** - Each file contains realistic examples matching its format spec
4. **Numbered startup protocol** - Removes all ambiguity from AGENTS.md session initialization

## Impact

**Before:**
- Household files had simple headers like "## Shared Task List"
- AGENTS.md said "Read SOUL.md" without path or explanation
- Cheap LLMs had to guess line formats and file conventions

**After:**
- Every household file has embedded format specification
- AGENTS.md has 6 explicit steps with exact paths and commands
- Cheap LLMs can mechanically follow instructions without interpretation

## Files Modified

| File | Lines Added | Purpose |
|------|-------------|---------|
| household/todos.md | 13 | Format header + realistic task examples |
| household/shopping.md | 13 | Format header + grocery items |
| household/notes.md | 12 | Format header + timestamped notes |
| household/bills.md | 15 | Format header + structured bill tracker |
| household/maintenance.md | 12 | Format header + maintenance log |
| household/calendar.md | 12 | Format header + annual events |
| household/meals/this-week.md | 16 | Format header + 7-day meal plan |

**Total:** 7 files created, 93 lines of format specifications and example data

## Self-Check: PASSED

**Created files verification:**
```
✓ FOUND: household/todos.md
✓ FOUND: household/shopping.md
✓ FOUND: household/notes.md
✓ FOUND: household/bills.md
✓ FOUND: household/maintenance.md
✓ FOUND: household/calendar.md
✓ FOUND: household/meals/this-week.md
```

**Commit verification:**
```
✓ FOUND: dfb4f2d (Task 1 - household format headers)
✓ FOUND: 4de15fe (Task 2 - AGENTS.md from plan 01-01)
```

All claimed files exist. All referenced commits exist.
