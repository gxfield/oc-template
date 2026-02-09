---
phase: 02-quick-capture
plan: 02
subsystem: documentation
tags: [quick-capture, quickstart, agents, startup-checklist, instructions]
dependency_graph:
  requires: [02-01]
  provides: [quick-capture-reference-in-quickstart, quick-capture-startup-awareness]
  affects: [QUICKSTART.md, AGENTS.md]
tech_stack:
  added: []
  patterns: [condensed-reference, startup-checklist-integration]
key_files:
  created: []
  modified: [QUICKSTART.md, AGENTS.md]
decisions:
  - "Quick Capture section placed after Meals and before Response Style in QUICKSTART.md"
  - "Quick Capture mention added to Step 4 of AGENTS.md startup checklist"
  - "Condensed trigger table format for QUICKSTART.md (vs full documentation in TOOLS.md)"
  - "QUICKSTART.md maintained under 100 lines (84 total)"
metrics:
  duration: 180s
  completed: 2026-02-09T16:36:00Z
---

# Phase 02 Plan 02: Quick Capture Reference in QUICKSTART Summary

Condensed Quick Capture reference in QUICKSTART.md and startup checklist mention in AGENTS.md enabling cheap LLMs to know about natural language capture from initial document load

## What Was Built

Added condensed Quick Capture section to QUICKSTART.md with trigger table and disambiguation rules (14 lines added, 84 total lines). Added Quick Capture availability mention to AGENTS.md Step 4 startup checklist so LLMs are aware of the feature from session start.

## Tasks Completed

| Task | Name | Commit | Key Changes |
|------|------|--------|-------------|
| 1 | Add Quick Capture section to QUICKSTART.md | c40b14b | Added Quick Capture section with trigger table for notes/shopping/todos, disambiguation rules, placed after Meals section; 84 total lines (under 100 limit) |
| 2 | Update AGENTS.md startup checklist to mention Quick Capture | 00970d3 | Added Quick Capture mention to Step 4 with example triggers and TOOLS.md reference |

## Deviations from Plan

None - plan executed exactly as written.

## Technical Implementation

**QUICKSTART.md Quick Capture Section:**
- Trigger table with 3 targets (notes.md, shopping.md, todos.md)
- Condensed format: trigger patterns → target file → output format
- 3 disambiguation rules (remind with/without time, we need verb vs noun, multiple items parsing)
- Placed after Meals section, before Response Style section
- Total document: 84 lines (under 100 line limit maintained)

**AGENTS.md Startup Checklist Update:**
- Added Quick Capture mention to Step 4 (Load tools reference)
- Includes example triggers: "remember X", "we need X", "todo X"
- References TOOLS.md Quick Capture section for full details
- Ensures LLMs know about Quick Capture availability at session startup

**Content Alignment:**
- Trigger phrases match TOOLS.md Quick Capture section (from Plan 01)
- Consistent terminology across all three documentation files
- QUICKSTART.md provides quick reference, TOOLS.md provides full documentation

## Verification Results

All success criteria met:
- [x] QUICKSTART.md contains "## Quick Capture" heading
- [x] Trigger table has all three targets (notes, shopping, todos)
- [x] Disambiguation rules present (remind+time vs no-time, we-need+verb vs noun)
- [x] QUICKSTART.md is under 100 lines total (84 lines)
- [x] Trigger phrases match TOOLS.md Quick Capture section
- [x] AGENTS.md Step 4 contains "Quick Capture" mention
- [x] AGENTS.md mentions "remember X", "we need X", "todo X" as examples
- [x] AGENTS.md references TOOLS.md Quick Capture section
- [x] Rest of AGENTS.md unchanged

## Self-Check: PASSED

**Files verified:**
```
FOUND: /Users/greg/ai/assistant/workspace-fixed/QUICKSTART.md
FOUND: /Users/greg/ai/assistant/workspace-fixed/AGENTS.md
```

**Commits verified:**
```
FOUND: c40b14b
FOUND: 00970d3
```

**Content verified:**
- QUICKSTART.md Quick Capture section at line 65
- QUICKSTART.md line count: 84 lines (under 100 limit)
- AGENTS.md Quick Capture mention at line 32 in Step 4
- Trigger phrases match TOOLS.md Quick Capture table

## Impact

A cheap LLM with minimal context budget that loads only QUICKSTART.md and AGENTS.md at startup can now:

1. **From AGENTS.md Step 4:** Know that Quick Capture exists and users can say "remember X", "we need X", or "todo X"
2. **From QUICKSTART.md:** See the full trigger table with all patterns and disambiguation rules
3. **Pattern recognition:** Recognize "remember X" → notes.md with Pacific timestamp
4. **Pattern recognition:** Recognize "we need X" → shopping.md (with verb vs noun disambiguation)
5. **Pattern recognition:** Recognize "todo X" → todos.md
6. **Disambiguation:** Distinguish "remind me at 3pm" (calendar) from "remind me to X" (todo)
7. **Multi-item parsing:** Parse "eggs, bread, and butter" into 3 separate shopping items

This completes the Quick Capture documentation triad:
- **TOOLS.md:** Full documentation with examples and edge cases (Plan 01)
- **QUICKSTART.md:** Condensed single-page reference (Plan 02)
- **AGENTS.md:** Startup checklist awareness (Plan 02)

Cheap LLMs now have access to Quick Capture patterns in their initial document load, eliminating the need to load the full TOOLS.md when context budget is limited.
