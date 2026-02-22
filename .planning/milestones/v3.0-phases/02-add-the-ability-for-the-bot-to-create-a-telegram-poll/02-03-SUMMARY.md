---
phase: 02-add-the-ability-for-the-bot-to-create-a-telegram-poll
plan: 03
subsystem: poll-agent-documentation
tags: [documentation, agent-instructions, polls, tools-reference]
dependency_graph:
  requires: [poll-task-infrastructure, poll-vote-resolution]
  provides: [agent-poll-awareness, poll-trigger-detection, poll-command-reference]
  affects: [agent-instructions, heartbeat-workflow]
tech_stack:
  added: []
  patterns: [natural-language-triggers, DO-DO-NOT-tables, agent-reliability-documentation]
key_files:
  created: []
  modified:
    - TOOLS.md
    - QUICKSTART.md
    - AGENTS.md
    - HEARTBEAT.md
decisions:
  - "Natural language poll detection documented with trigger phrase table"
  - "Poll section placed after Telegram Command Handlers in TOOLS.md"
  - "QUICKSTART.md stays concise (141 lines, up from 125)"
  - "Poll timeout check added to HEARTBEAT.md workflow"
metrics:
  duration_minutes: 1.83
  completed_date: 2026-02-16
  tasks_completed: 2
  files_modified: 4
---

# Phase 02 Plan 03: Poll Agent Documentation Summary

**One-liner:** Complete poll feature documentation across all agent instruction files with natural language trigger patterns, command references, and workflow integration.

## What Was Built

Documented the complete poll feature across all agent instruction files (TOOLS.md, QUICKSTART.md, AGENTS.md, HEARTBEAT.md). The documentation enables LLM agents to detect poll intent from natural language, parse question and options, invoke task system commands, handle poll_answer updates, check timeouts during heartbeat, and trigger downstream actions (meal plan updates). All documentation follows existing patterns (trigger phrase tables, DO/DO NOT tables, input/output examples) for cheap LLM reliability.

## Tasks Completed

### Task 1: Add poll section to TOOLS.md with full documentation
**Commit:** `05b126b`
**Files:** TOOLS.md

- Added new `## 📊 Telegram Polls` section after Telegram Command Handlers section
- **Trigger Phrase Table:** Documents 5 natural language patterns for poll creation (no /poll command)
- **Parsing Rules:** 5-step workflow for poll creation (intent detection → extraction → validation → task call → confirmation)
- **Handling Poll Answers:** 6-step workflow for processing poll_answer updates from Telegram
- **Handling Poll Timeouts:** Integration with heartbeat workflow for automatic timeout resolution
- **Input/Output Examples:** 4 complete examples (create poll, simple either/or, parse failure, active poll collision)
- **Downstream Actions:** Table documenting meal poll → meal plan update workflow
- **DO/DO NOT Table:** 6 rules for agent reliability (natural language vs commands, immediate send vs preview, etc.)
- **Edge Cases:** 5 edge case scenarios (1 option, >4 options, active poll, non-bot polls, ambiguous requests)
- All task commands use correct syntax: `node tasks/index.js "poll ..."`
- Section totals 100 new lines of comprehensive documentation

### Task 2: Update QUICKSTART.md, AGENTS.md, and HEARTBEAT.md with poll references
**Commit:** `2b1fd74`
**Files:** QUICKSTART.md, AGENTS.md, HEARTBEAT.md

**QUICKSTART.md:**
- Added `## Polls` section after Save Recipe section
- Command reference table with 4 task commands (create, vote, check-timeout, stop)
- Concise workflow notes (5 bullet points): natural language detection, immediate send, tie-break with household context, auto-close behavior, meal plan updates
- File remains concise at 141 lines (up from 125, within acceptable range)

**AGENTS.md:**
- Added Polls bullet to Step 4 (Load tools reference) feature awareness list
- Placed after Save Recipe bullet following existing pattern
- Documents: natural language triggers, native Telegram poll sending, tie-breaker role, poll_answer handling, heartbeat timeout checking
- References TOOLS.md Telegram Polls section for full details

**HEARTBEAT.md:**
- Added Poll timeout check section at top of file (before Morning Briefing)
- Documents command: `node tasks/index.js "poll check-timeout"`
- Includes workflow: auto-resolve on timeout, announce result, log in daily memory

## Verification Results

All verification checks passed:
- ✅ TOOLS.md contains `## 📊 Telegram Polls` section (line 614)
- ✅ Section includes all required subsections (8 total: Trigger Table, Parsing Rules, Poll Answers, Timeouts, Examples, Downstream Actions, DO/DO NOT, Edge Cases)
- ✅ Section placed after Telegram Command Handlers and before Edge Cases section
- ✅ All task commands use correct syntax (5 instances of `node tasks/index.js "poll ...`)
- ✅ QUICKSTART.md contains `## Polls` section (line 119)
- ✅ QUICKSTART.md includes command reference table with 4 commands
- ✅ QUICKSTART.md line count: 141 lines (reasonable, up 16 from original)
- ✅ AGENTS.md Step 4 includes Polls bullet with tie-breaker mention
- ✅ HEARTBEAT.md includes Poll timeout check section with correct command
- ✅ No existing content was removed or altered — only additions made

## Deviations from Plan

None - plan executed exactly as written.

## Architecture Integration

**Agent Workflow Integration:**

The documentation enables agents (running on cheap LLMs via OpenClaw) to execute the full poll lifecycle:

1. **Intent Detection:** Agent reads user message, matches against trigger phrase table patterns
2. **Parsing:** Extracts question and 2-4 options from natural language
3. **Validation:** Checks constraints (2-4 options, no active poll, clear question)
4. **Invocation:** Calls `node tasks/index.js "poll create question=X options=Y,Z"`
5. **Vote Handling:** When poll_answer update arrives, calls vote intent with userId and optionId
6. **Timeout Monitoring:** During heartbeat, checks for stale polls via check-timeout command
7. **Downstream Actions:** For meal polls, updates tonight's dinner in this-week.md after resolution

**Documentation Pattern Consistency:**

All poll documentation follows established patterns from existing features:
- **Trigger Phrase Tables:** Same format as Briefing, Quick Capture sections
- **Parsing Rules:** Numbered step-by-step workflow (matches Calendar, Todos patterns)
- **DO/DO NOT Tables:** 3-column format with WHY column for LLM reasoning
- **Input/Output Examples:** Complete scenarios with input, action, response
- **Edge Cases:** Bulleted list of corner cases with handling instructions

**Cross-File Reference Network:**

- QUICKSTART.md → concise command reference (fast lookup for token-constrained agents)
- AGENTS.md Step 4 → feature awareness pointer to TOOLS.md full docs
- HEARTBEAT.md → heartbeat workflow integration with timeout check
- TOOLS.md → comprehensive documentation (trigger patterns, examples, DO/DO NOT, edge cases)

## Ready for Production

The poll feature is now fully documented and integrated:
- ✅ Agent can detect poll intent from natural language
- ✅ Agent knows how to parse question and options (2-4 constraint)
- ✅ Agent knows which task commands to call for each scenario
- ✅ Agent knows how to handle poll_answer updates (vote recording)
- ✅ Agent knows how to check timeouts during heartbeat
- ✅ Agent knows when to trigger downstream actions (meal plan updates)
- ✅ Documentation provides DO/DO NOT guidance for reliability
- ✅ Edge cases documented to prevent agent confusion

Agents powered by cheap LLMs now have complete instructions to interact with the poll system without improvising or making mistakes.

## Self-Check: PASSED

**Files modified:**
✅ TOOLS.md (added Telegram Polls section, 100 lines)
✅ QUICKSTART.md (added Polls section, 16 lines)
✅ AGENTS.md (added Polls bullet to Step 4, 1 line)
✅ HEARTBEAT.md (added Poll timeout check section, 5 lines)

**Commits exist:**
✅ 05b126b (Task 1: TOOLS.md comprehensive poll documentation)
✅ 2b1fd74 (Task 2: QUICKSTART, AGENTS, HEARTBEAT poll references)

**Content verification:**
✅ TOOLS.md poll section has 8 subsections
✅ QUICKSTART.md has command reference table
✅ AGENTS.md Step 4 mentions polls with TOOLS.md reference
✅ HEARTBEAT.md includes poll timeout check command
✅ All files follow existing formatting conventions
✅ No existing content removed (additions only)
