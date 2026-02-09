# Roadmap: Home Assistant Workspace

## Overview

Transform the workspace from functional to bulletproof for cheap LLMs and both household users. Start by hardening instruction files so cheaper models stop making timezone and command errors. Then expand household features: quick capture patterns for fast input, meal planning with shopping integration, bill tracking with reminders, and a unified briefing command that surfaces everything relevant each day.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Instruction Hardening** - Make all instruction files foolproof for cheap LLMs
- [ ] **Phase 2: Quick Capture** - Fast input patterns for notes, todos, shopping
- [ ] **Phase 3: Meal Planning** - Weekly meal planning with shopping list integration
- [ ] **Phase 4: Bill Reminders** - Structured bill tracking with due date queries
- [ ] **Phase 5: Briefing System** - Unified daily briefing command combining all household data

## Phase Details

### Phase 1: Instruction Hardening
**Goal**: Cheaper LLMs execute household commands correctly without timezone, format, or command errors
**Depends on**: Nothing (first phase)
**Requirements**: INST-01, INST-02, INST-03, INST-04, INST-05
**Success Criteria** (what must be TRUE):
  1. TOOLS.md has explicit DO/DO NOT tables with before/after examples for every command
  2. Every household markdown file has a format header that tells LLMs exactly how to read and write it
  3. AGENTS.md startup checklist uses exact file paths and numbered steps
  4. QUICKSTART.md exists as a single-page "do exactly this" reference
  5. TOOLS.md Telegram command handlers include exact parsing examples with edge cases
**Plans:** 3 plans

Plans:
- [ ] 01-01-PLAN.md — Harden TOOLS.md with DO/DO NOT tables and Telegram parsing examples
- [ ] 01-02-PLAN.md — Add format headers to household files and rewrite AGENTS.md startup checklist
- [ ] 01-03-PLAN.md — Create QUICKSTART.md single-page reference

### Phase 2: Quick Capture
**Goal**: Users can capture notes, todos, and shopping items in natural language without opening files
**Depends on**: Phase 1
**Requirements**: CAPT-01, CAPT-02, CAPT-03, CAPT-04
**Success Criteria** (what must be TRUE):
  1. User can say "remember X" and it appears in notes.md with Pacific timestamp
  2. User can say "add X to shopping" or "we need X" and it appears in shopping.md
  3. User can say "todo X" and it appears in todos.md
  4. TOOLS.md documents all quick capture patterns with exact trigger phrase examples
**Plans**: TBD

Plans:
- [ ] TBD (to be defined during planning)

### Phase 3: Meal Planning
**Goal**: Users can plan weekly dinners and generate shopping lists from meal plans
**Depends on**: Phase 2
**Requirements**: MEAL-01, MEAL-02, MEAL-03, MEAL-04
**Success Criteria** (what must be TRUE):
  1. User can set this week's meal plan by day (Mon-Sun dinners at minimum)
  2. User can ask "what's for dinner tonight" and get the correct meal from the plan
  3. User can generate shopping list items directly from the meal plan
  4. meals/this-week.md has a structured format that LLMs reliably parse
**Plans**: TBD

Plans:
- [ ] TBD (to be defined during planning)

### Phase 4: Bill Reminders
**Goal**: Users can track bills with due dates and query upcoming payments
**Depends on**: Phase 3
**Requirements**: BILL-01, BILL-02, BILL-03
**Success Criteria** (what must be TRUE):
  1. bills.md has structured format with bill name, amount, due date, and paid status
  2. User can ask "what bills are due" and get upcoming unpaid bills
  3. Briefing includes bills due in the next 7 days automatically
**Plans**: TBD

Plans:
- [ ] TBD (to be defined during planning)

### Phase 5: Briefing System
**Goal**: Users get a single command that shows everything relevant for today
**Depends on**: Phase 4
**Requirements**: BRIEF-01, BRIEF-02, BRIEF-03
**Success Criteria** (what must be TRUE):
  1. User can request a combined briefing showing today's calendar, pending todos, shopping list, and meal plan
  2. Briefing output is formatted for Telegram with no markdown tables and natural emoji usage
  3. TOOLS.md documents the briefing command with exact trigger phrases
**Plans**: TBD

Plans:
- [ ] TBD (to be defined during planning)

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Instruction Hardening | 0/3 | Planned | - |
| 2. Quick Capture | 0/TBD | Not started | - |
| 3. Meal Planning | 0/TBD | Not started | - |
| 4. Bill Reminders | 0/TBD | Not started | - |
| 5. Briefing System | 0/TBD | Not started | - |
