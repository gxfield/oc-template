---
phase: 01-instruction-hardening
plan: 01
subsystem: documentation
tags: [instructions, llm-hardening, documentation]
dependency_graph:
  requires: []
  provides: [hardened-tools-documentation]
  affects: [telegram-bot, calendar-agent, household-agent]
tech_stack:
  added: []
  patterns: [do-dont-tables, parsing-examples, edge-case-documentation]
key_files:
  created: []
  modified: [TOOLS.md]
decisions:
  - "Added explicit DO/DO NOT tables for timezone, calendar, file operations, and behavior sections"
  - "Documented common cheap-LLM mistakes with before/after examples"
  - "Expanded Telegram handlers with exact input/output parsing examples"
  - "Created comprehensive edge cases section for ambiguous commands and time parsing"
metrics:
  duration_seconds: 128
  completed_date: 2026-02-09
  tasks_completed: 2
  files_modified: 1
  commits: 2
---

# Phase 01 Plan 01: Harden TOOLS.md Summary

**One-liner:** Hardened TOOLS.md with DO/DO NOT tables, before/after examples, and detailed Telegram parsing rules to prevent cheap LLM errors with timezones, commands, and formats.

## What Was Built

Significantly expanded TOOLS.md from 118 lines to 244 lines by adding explicit instruction hardening:

1. **DO/DO NOT Tables (4 sections):**
   - Timezone operations: Prevents `date` command usage, timezone suffix errors
   - Calendar command selection: Prevents `list` for "today" queries
   - Household file operations: Prevents blind appends, format corruption
   - Behavior guidelines: Prevents robotic responses, wrong time formats

2. **Common Mistakes Section:**
   - 3 before/after examples showing exact errors cheap LLMs make
   - Covers timezone crossover, command selection, and timezone suffix problems

3. **Expanded Telegram Command Handlers:**
   - 14 exact input/output parsing examples
   - Detailed parsing for Calendar, Todos, Shopping, and Notes commands
   - Shows how to handle multi-item additions ("eggs, bread, and butter")
   - Documents default behaviors (1-hour event duration, PM assumptions)

4. **Edge Cases Section:**
   - Ambiguous command handling ("add eggs" - todo vs shopping)
   - Multi-step request parsing
   - Missing information prompts
   - Time parsing rules (tomorrow, friday, this friday, 2pm)

## Tasks Completed

| Task | Description | Commit | Files |
|------|-------------|--------|-------|
| 1 | Add DO/DO NOT tables and before/after examples | bf5ef9c | TOOLS.md |
| 2 | Expand Telegram handlers with parsing examples and edge cases | 4de15fe | TOOLS.md |

## Deviations from Plan

None - plan executed exactly as written.

## Verification Results

All verification criteria passed:
- ✅ 4 DO/DO NOT tables added (timezone, calendar, files, behavior)
- ✅ 3 before/after "Common Mistakes" examples
- ✅ 14 exact parsing examples in Telegram handlers
- ✅ Edge cases section with 4+ distinct scenarios
- ✅ No information removed from original TOOLS.md (expanded from 118 to 244 lines)

## Success Criteria Validation

A cheap LLM reading the updated TOOLS.md would now:
- ✅ Never use `date` shell command for current time (DO/DO NOT table + example)
- ✅ Never use `list` when user says "today" (DO/DO NOT table + example)
- ✅ Never add `Z` suffix to event times (DO/DO NOT table + example)
- ✅ Correctly parse "add eggs, bread, and butter to shopping" as 3 items (parsing example)
- ✅ Know to ask for clarification when input is ambiguous (edge cases section)
- ✅ Add Pacific timestamps to notes (DO/DO NOT table + parsing example)

## Impact

**Immediate:**
- Agents reading TOOLS.md will have explicit guidance on what NOT to do
- Common timezone errors prevented by showing exact mistakes
- Multi-item shopping additions now clearly documented

**Long-term:**
- Reduced error rate for cheap LLM models (Haiku, GPT-3.5)
- Easier onboarding for new agent implementations
- Clear reference for troubleshooting agent behavior

## Next Steps

This plan completes Phase 1 Plan 1. Next plans in the instruction hardening phase will likely harden other instruction files (AGENTS.md, calendar/AGENT_INSTRUCTIONS.md, etc.) following the same pattern.

---

## Self-Check: PASSED

**Files verified:**
- ✅ FOUND: /Users/greg/ai/assistant/workspace-fixed/TOOLS.md (244 lines)

**Commits verified:**
- ✅ FOUND: bf5ef9c (Task 1: DO/DO NOT tables)
- ✅ FOUND: 4de15fe (Task 2: Telegram parsing examples)

**Content verified:**
- ✅ 4 DO/DO NOT sections exist
- ✅ 3 WRONG/RIGHT examples exist
- ✅ 14 Input: parsing examples exist
- ✅ Edge Cases section exists
- ✅ File size increased significantly (118 → 244 lines)
