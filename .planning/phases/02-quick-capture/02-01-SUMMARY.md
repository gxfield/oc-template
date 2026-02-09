---
phase: 02-quick-capture
plan: 01
subsystem: documentation
tags: [quick-capture, natural-language, triggers, instructions]
dependency_graph:
  requires: [01-instruction-hardening]
  provides: [quick-capture-documentation]
  affects: [TOOLS.md]
tech_stack:
  added: []
  patterns: [natural-language-triggers, disambiguation-rules]
key_files:
  created: []
  modified: [TOOLS.md]
decisions:
  - "Quick Capture section placed after Telegram Command Handlers and before Edge Cases for logical flow"
  - "Trigger phrase table format for quick LLM pattern matching"
  - "Verb vs noun parsing rule for 'we need' disambiguation"
  - "Event vs physical item rule for 'buy' disambiguation"
metrics:
  duration: 107s
  completed: 2026-02-09T16:17:43Z
---

# Phase 02 Plan 01: Quick Capture Documentation Summary

Natural language trigger documentation enabling cheap LLMs to recognize conversational capture patterns for notes/todos/shopping

## What Was Built

Added comprehensive Quick Capture documentation to TOOLS.md that defines natural language trigger phrases ("remember X", "we need X", "todo X") and their routing rules. Includes trigger table, parsing rules, 6+ input/output examples, disambiguation rules, and edge case handling for ambiguous patterns.

## Tasks Completed

| Task | Name | Commit | Key Changes |
|------|------|--------|-------------|
| 1 | Add Quick Capture section to TOOLS.md | 519ca6b | Added Quick Capture section with trigger table, parsing rules, 6+ examples, disambiguation rules, DO/DO NOT table; updated Todos handler with "todo X" trigger |
| 2 | Update Edge Cases section for Quick Capture conflicts | 47961b5 | Added "remind me" time detection edge cases, Quick Capture conflicts subsection, verb vs noun rule, buy event vs item rule |

## Deviations from Plan

None - plan executed exactly as written.

## Technical Implementation

**Quick Capture Section Structure:**
1. Trigger Phrase Table - maps patterns to target files
2. Parsing Rules - specific formatting for each target (notes with timestamps, shopping capitalized, todos with checkboxes)
3. Input/Output Examples - 6 concrete examples showing expected behavior
4. Disambiguation Rules - handles "remind me to X" (with/without time), "add X" (ambiguous target), "we need" (verb vs noun), "buy" (event vs item)
5. DO/DO NOT Table - behavioral guidelines for natural language handling

**Edge Cases Documentation:**
- Time-based: "remind me to X at 3pm" (calendar) vs "remind me to X" (todo)
- Pattern-based: "we need to fix" (todo) vs "we need milk" (shopping)
- Context-based: "buy tickets" (todo) vs "buy milk" (shopping)

## Verification Results

All success criteria met:
- [x] Quick Capture section exists with trigger phrase table
- [x] 6+ input/output examples present (20 total **Input:** lines across document)
- [x] Trigger phrases "remember", "we need", "todo" documented
- [x] DO/DO NOT table present
- [x] Edge Cases updated with Quick Capture conflicts
- [x] "todo X" appears in Todos handler section
- [x] Disambiguation rules cover "remind me" with/without time
- [x] All file operations reference correct household paths

## Self-Check: PASSED

**Files verified:**
```
FOUND: /Users/greg/ai/assistant/workspace-fixed/TOOLS.md
```

**Commits verified:**
```
FOUND: 519ca6b
FOUND: 47961b5
```

**Key sections verified:**
- Quick Capture section at line 205
- DO/DO NOT table at line 285
- Quick Capture conflicts at line 306
- Updated Todos handler includes "todo" trigger

## Impact

A cheap LLM reading TOOLS.md can now:
1. Recognize "remember X" and route to notes.md with Pacific timestamp
2. Recognize "we need X" and route to shopping.md (with proper noun vs verb disambiguation)
3. Recognize "todo X" and route to todos.md
4. Distinguish "remind me to X at 3pm" (calendar) from "remind me to X" (todo)
5. Handle "we need to fix the fence" as a todo, not a shopping item
6. Parse "eggs and milk" into two separate shopping items

This enables natural conversational capture without requiring exact command syntax, significantly improving user experience for quick household management tasks.
