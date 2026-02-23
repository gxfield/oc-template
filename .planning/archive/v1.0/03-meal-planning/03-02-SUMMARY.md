---
phase: 03-meal-planning
plan: 02
subsystem: household-assistant
tags: [documentation, meal-planning, quickstart, agents-startup, llm-instructions]
dependency-graph:
  requires: [03-01]
  provides: [quickstart-meals-reference, agents-meal-awareness]
  affects: [QUICKSTART.md, AGENTS.md]
tech-stack:
  added: []
  patterns: [condensed-command-reference, startup-priming]
key-files:
  created: []
  modified:
    - QUICKSTART.md
    - AGENTS.md
decisions:
  - "Meals section expansion adds 5 additional instruction lines while keeping total file under 100 lines (89 total)"
  - "Meal Planning mention placed after Quick Capture in AGENTS.md Step 4 for consistency"
  - "DO NOT auto-add rule explicitly stated in QUICKSTART.md to prevent vague ingredient additions"
metrics:
  duration: 61s
  tasks: 2
  commits: 2
  files-modified: 2
  completed: 2026-02-09
---

# Phase 03 Plan 02: QUICKSTART and AGENTS Meal Planning References Summary

**One-liner:** Expanded QUICKSTART.md Meals section with condensed set/query/shopping commands and added Meal Planning mention to AGENTS.md startup checklist for agent priming.

## Objectives Achieved

Ensured cheap LLMs have condensed meal planning reference in QUICKSTART.md and are primed to recognize meal commands via AGENTS.md startup checklist. Follows the same documentation pattern established in Phase 02-02 for Quick Capture.

## Work Completed

### Task 1: Expand Meals section in QUICKSTART.md
- Expanded Meals section from 5 lines to 10 lines
- Added "what's for dinner tomorrow" instruction with day computation
- Added set meal instruction with explicit "Keep all 7 days" rule
- Added default behavior when no day specified ("assume tonight")
- Added shopping from meals workflow (propose ingredients, confirm before adding)
- Added explicit "Do NOT auto-add ingredients" rule
- Verified file stays under 100 lines (89 total, was 84)
- All other sections unchanged

### Task 2: Add meal planning mention to AGENTS.md Step 4
- Added Meal Planning bullet point in Step 4 after Quick Capture tip
- Mentions three key capabilities: set dinners, "what's for dinner", shopping lists
- References TOOLS.md Meal Planning section for full triggers/examples
- Primes agents to recognize meal planning commands at session start
- No other changes to file

## Deviations from Plan

None - plan executed exactly as written.

## Key Files

### Modified Files

**QUICKSTART.md**
- Meals section expanded from 5 to 10 lines
- Covers set, query (today/tomorrow), and shopping generation workflows
- Maintains condensed style (no verbose explanations)
- Total file length: 89 lines (under 100 line requirement)

**AGENTS.md**
- Step 4 now includes Meal Planning awareness bullet
- Placed after Quick Capture for consistency with Phase 02-02 pattern
- References TOOLS.md for full documentation

## Technical Implementation

### Pattern: Condensed Command Reference
QUICKSTART.md uses terse bullet format to pack maximum information into minimal lines:
- "What's for dinner tomorrow?" instruction includes implicit day computation step
- Set meal instruction combines read/modify/write in single line
- Shopping workflow compressed to two bullets: propose + confirm rule

### Pattern: Startup Priming
AGENTS.md Step 4 primes agents at session start with key capabilities. This follows the same pattern as Quick Capture (added in Phase 02-02). Agents loading AGENTS.md during startup are now aware of:
1. Quick Capture shortcuts ("remember X", "we need X", "todo X")
2. Meal Planning commands (set dinners, query dinner, shopping from meals)

### Pattern: Explicit Negative Rules
"Do NOT auto-add ingredients -- always confirm with user first" in QUICKSTART.md prevents cheap LLMs from making the common mistake of auto-adding vague ingredients. This mirrors the same rule in TOOLS.md but in condensed format.

## Verification Results

All success criteria met:
- ✅ QUICKSTART.md Meals section has "set meal" instruction
- ✅ QUICKSTART.md Meals section has "shopping from meals" instruction
- ✅ QUICKSTART.md Meals section references `node calendar/calendar.js now` for day lookup
- ✅ QUICKSTART.md total file length is under 100 lines (89)
- ✅ All other QUICKSTART.md sections unchanged
- ✅ AGENTS.md Step 4 contains "Meal Planning:" bullet point
- ✅ Bullet mentions "what's for dinner" and "shopping lists from meals"
- ✅ References "TOOLS.md Meal Planning section"
- ✅ No other changes to AGENTS.md

## Impact

### For Cheap LLMs
Cheap LLMs loading QUICKSTART.md now have a condensed single-page reference for all meal planning operations. Combined with AGENTS.md startup priming, they're aware and equipped to handle meal commands without needing to load the full TOOLS.md documentation.

### For Users
Users benefit from faster, more reliable meal planning responses. Even when using cheap LLMs with tight context budgets, the essential meal planning commands are available in the quick reference.

### For System Consistency
This completes the documentation trilogy for Meal Planning:
1. TOOLS.md: Full documentation with trigger tables, examples, edge cases (Phase 03-01)
2. QUICKSTART.md: Condensed single-page reference (Phase 03-02)
3. AGENTS.md: Startup priming for capability awareness (Phase 03-02)

This mirrors the same pattern established for Quick Capture in Phase 02.

## Next Steps

Phase 03 Meal Planning is now complete. Phase 04 will begin next major feature development according to ROADMAP.md.

## Self-Check

Verifying all claims:

### Created/Modified Files
```bash
[ -f "/Users/greg/ai/assistant/workspace-fixed/QUICKSTART.md" ] && echo "FOUND: QUICKSTART.md" || echo "MISSING: QUICKSTART.md"
[ -f "/Users/greg/ai/assistant/workspace-fixed/AGENTS.md" ] && echo "FOUND: AGENTS.md" || echo "MISSING: AGENTS.md"
```

### Commits Exist
```bash
git log --oneline --all | grep -q "c28d07e" && echo "FOUND: c28d07e" || echo "MISSING: c28d07e"
git log --oneline --all | grep -q "085d493" && echo "FOUND: 085d493" || echo "MISSING: 085d493"
```

### File Length Verification
```bash
wc -l /Users/greg/ai/assistant/workspace-fixed/QUICKSTART.md | grep -q "89" && echo "VERIFIED: QUICKSTART.md is 89 lines" || echo "FAILED: QUICKSTART.md line count incorrect"
```

## Self-Check: PASSED

All files and commits verified:
- ✅ FOUND: QUICKSTART.md
- ✅ FOUND: AGENTS.md
- ✅ FOUND: c28d07e (Task 1 commit)
- ✅ FOUND: 085d493 (Task 2 commit)
- ✅ VERIFIED: QUICKSTART.md is 89 lines
