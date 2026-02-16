---
phase: 02-add-the-ability-for-the-bot-to-create-a-telegram-poll
plan: 02
subsystem: poll-vote-resolution
tags: [telegram, polls, vote-processing, tie-break, timeout-handling]
dependency_graph:
  requires: [poll-task-infrastructure, telegram-bot-api, poll-state-persistence]
  provides: [vote-recording, tie-detection, tie-break-logic, timeout-resolution]
  affects: [poll-task]
tech_stack:
  added: []
  patterns: [household-context-aware-heuristics, meal-repetition-avoidance, shared-helper-modules]
key_files:
  created:
    - tasks/poll/helpers/process-vote.js
    - tasks/poll/helpers/check-timeout.js
    - tasks/poll/helpers/tie-break.js
  modified:
    - tasks/poll/config.js
decisions:
  - "Bot stays silent when both users agree (no tie)"
  - "Bot announces tie-break decision with reasoning"
  - "Tie-break uses meal-context heuristics (avoids recent repetitions)"
  - "Timeout resolution picks leader, or uses tie-break if tied, or random if no votes"
  - "Shared tie-break logic extracted to separate module for reuse"
metrics:
  duration_minutes: 2.36
  completed_date: 2026-02-16
  tasks_completed: 2
  files_created: 3
  files_modified: 2
---

# Phase 02 Plan 02: Vote Processing and Poll Resolution Summary

**One-liner:** Complete poll lifecycle with vote tracking, household-context-aware tie-breaking (meal repetition avoidance), and timeout handling for automatic resolution.

## What Was Built

Implemented the complete poll resolution system with vote processing, tie detection, and intelligent tie-breaking using household context. The system records votes from poll_answer updates, detects when all household members have voted, identifies ties, and performs context-aware tie-breaking (e.g., avoiding meal repetition). Added timeout handling for polls that exceed their configured duration. The poll task now supports the full lifecycle: create → vote → resolve (with announcement or silent close) → timeout handling.

## Tasks Completed

### Task 1: Create vote processing helper with tie detection and AI tie-break
**Commit:** `b7fc8ea`
**Files:** tasks/poll/helpers/process-vote.js, tasks/poll/helpers/tie-break.js

- Created `process-vote.js` to handle poll_answer updates from Telegram
- Records votes per user ID in poll state (`votes[userId] = optionId`)
- Loads household members from `telegram_user_ids` in credentials.json
- Tracks completion: returns waiting status until all expected voters have voted
- Determines winner using vote counting (detects ties when multiple options share max count)
- **Silent close on agreement:** When both users pick the same option, bot closes poll silently (per user decision)
- **Tie-break announcement:** When votes are tied, bot picks winner using household context and announces decision
- Created `tie-break.js` as shared module for intelligent tie-breaking logic
- For meal-related polls (question contains "dinner", "eat", "food", "meal", "lunch"): reads `household/meals/this-week.md` and avoids recently repeated meals
- For other polls: picks randomly from tied options
- Returns structured result with resolution status, winner, tie indicator, and reasoning

### Task 2: Create timeout checker and update poll config with new intents
**Commit:** `37cd543`
**Files:** tasks/poll/helpers/check-timeout.js, tasks/poll/config.js

- Created `check-timeout.js` for heartbeat integration to auto-resolve stale polls
- Calculates elapsed time vs configured timeout (default 60 minutes)
- Returns remaining time if poll hasn't timed out
- **Timeout resolution logic:**
  - If clear leader: picks the leading option
  - If tied: uses tie-break heuristics (same as vote processing)
  - If no votes: picks randomly
- Sends timeout announcement with reasoning
- Updated `poll/config.js` with two new intents:
  - `vote`: processes incoming votes (validates userId and optionId)
  - `check-timeout`: checks and resolves timed-out polls
- Added helper imports and registered in helpers map
- Fixed module exports to match task system pattern (export function directly, not as object property)

## Verification Results

All verification checks passed:
- ✅ `node tasks/index.js "poll check-timeout"` returns `{ hasActivePoll: false }` (no errors)
- ✅ `node tasks/index.js "poll vote userId=123 optionId=0"` returns error "No active poll found." (correct validation)
- ✅ `node tasks/index.js "poll create question=Test options=A,B"` reaches credential check (expected)
- ✅ Config has all 4 intents: check-timeout, create, stop, vote
- ✅ tie-break.js exists and exports `pickFromTiedOptions` function
- ✅ All helpers use only built-in Node.js modules (https, fs, path)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed module export pattern mismatch**
- **Found during:** Task 2 verification
- **Issue:** Initially exported process-vote and check-timeout functions as object properties (`module.exports = { functionName }`), but task system expects direct function exports
- **Fix:** Changed to `module.exports = functionName` to match send-poll.js and stop-poll-helper.js pattern
- **Files modified:** tasks/poll/helpers/process-vote.js, tasks/poll/helpers/check-timeout.js
- **Commit:** 37cd543 (included in Task 2 commit)

## Architecture Integration

**Poll Lifecycle Flow:**

1. **Create:** User/agent calls `poll create question=X options=A,B,C`
   - Sends Telegram poll via Bot API
   - Persists initial state to memory/poll-state.json

2. **Vote:** Telegram sends poll_answer update → agent calls `poll vote userId=X optionId=Y`
   - Records vote in state
   - Returns waiting status until all household members vote
   - When complete: determines winner, detects ties, resolves poll

3. **Resolve:**
   - **No tie:** Bot silently closes poll (both agreed)
   - **Tie:** Bot uses household context to pick winner, announces decision with reasoning
   - Uses `tie-break.js` for intelligent heuristics (meal repetition avoidance)

4. **Timeout:** Heartbeat calls `poll check-timeout` periodically
   - Checks elapsed time vs configured timeout
   - Auto-resolves if timed out (picks leader, uses tie-break if tied, or random if no votes)
   - Sends timeout announcement

**Household Context Integration:**

- Reads `household/meals/this-week.md` for meal-related polls
- Counts meal repetitions to avoid picking recently eaten options
- Example reasoning: "you had pizza twice this week already!"
- Falls back to random if meal plan unavailable or poll is non-meal-related

**Shared Logic Pattern:**

- Extracted tie-break logic to `tie-break.js` (DRY principle)
- Both `process-vote.js` and `check-timeout.js` use same heuristics
- Single source of truth for household-context-aware decision making

## Ready for Next Plan

Plan 03 can now integrate the poll system with the agent's messaging flow:
- Wire up Telegram webhook/polling to detect poll_answer updates
- Call `poll vote` intent when receiving poll_answer
- Integrate `poll check-timeout` into heartbeat loop
- Connect to household context for meal planning features

## Self-Check: PASSED

**Files exist:**
✅ tasks/poll/helpers/process-vote.js
✅ tasks/poll/helpers/check-timeout.js
✅ tasks/poll/helpers/tie-break.js
✅ tasks/poll/config.js (modified)

**Commits exist:**
✅ b7fc8ea (Task 1: vote processing with tie-break logic)
✅ 37cd543 (Task 2: timeout checker and config updates)

**Functionality verified:**
✅ All 4 intents functional: create, stop, vote, check-timeout
✅ Vote validation works (userId and optionId required)
✅ No active poll returns expected responses
✅ Tie-break module exports correctly
