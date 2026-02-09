# Requirements: Home Assistant Workspace

**Defined:** 2026-02-09
**Core Value:** The agent must reliably understand and execute household management tasks -- even when powered by cheaper LLMs.

## v1.0 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Instruction Hardening

- [ ] **INST-01**: TOOLS.md has explicit DO/DO NOT tables for every command with before/after examples of common mistakes
- [ ] **INST-02**: Each household markdown file has a format header that tells LLMs exactly how to read and write it
- [ ] **INST-03**: AGENTS.md startup checklist uses exact file paths and numbered steps with no ambiguity
- [ ] **INST-04**: QUICKSTART.md provides a single-page "do exactly this" reference for cheap LLMs
- [ ] **INST-05**: TOOLS.md Telegram command handlers include exact parsing examples and edge cases

### Briefing

- [ ] **BRIEF-01**: User can request a combined briefing that shows today's calendar, pending todos, shopping list, and meal plan
- [ ] **BRIEF-02**: Briefing output is formatted for Telegram (no markdown tables, uses emoji naturally)
- [ ] **BRIEF-03**: TOOLS.md documents the briefing command with exact trigger phrases

### Meal Planning

- [ ] **MEAL-01**: User can set this week's meal plan by day (Mon-Sun dinner at minimum)
- [ ] **MEAL-02**: User can ask "what's for dinner tonight" and get the answer from the meal plan
- [ ] **MEAL-03**: User can generate shopping list items from a meal plan
- [ ] **MEAL-04**: meals/this-week.md has a structured format that LLMs can reliably parse

### Bill Reminders

- [ ] **BILL-01**: bills.md has a structured format with bill name, amount, due date, and paid status
- [ ] **BILL-02**: User can ask "what bills are due" and get upcoming unpaid bills
- [ ] **BILL-03**: Briefing includes bills due in the next 7 days

### Quick Capture

- [ ] **CAPT-01**: User can say "remember X" and it gets added to notes.md with Pacific timestamp
- [ ] **CAPT-02**: User can say "add X to shopping" / "we need X" and it appends to shopping.md
- [ ] **CAPT-03**: User can say "todo X" and it appends to todos.md
- [ ] **CAPT-04**: TOOLS.md documents all quick capture patterns with exact examples

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Notifications

- **NOTF-01**: Agent proactively reminds about bills due within 48 hours via heartbeat
- **NOTF-02**: Agent sends morning briefing automatically at configured time

### Recipes

- **RCPE-01**: User can save recipes to household/meals/recipes/
- **RCPE-02**: User can reference saved recipes when setting meal plan

## Out of Scope

| Feature | Reason |
|---------|--------|
| Home automation / smart devices | Separate domain, not ready yet |
| Multi-calendar support | Single calendar sufficient for household |
| Mobile app | Agent accessed via Telegram, no app needed |
| Real-time push notifications | Heartbeat polling is sufficient |
| Expense tracking / budgeting | Scope creep -- bills tracker is enough for v1 |
| Recipe database with nutrition | Over-engineered for household use |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| INST-01 | Phase 1 | Pending |
| INST-02 | Phase 1 | Pending |
| INST-03 | Phase 1 | Pending |
| INST-04 | Phase 1 | Pending |
| INST-05 | Phase 1 | Pending |
| CAPT-01 | Phase 2 | Pending |
| CAPT-02 | Phase 2 | Pending |
| CAPT-03 | Phase 2 | Pending |
| CAPT-04 | Phase 2 | Pending |
| MEAL-01 | Phase 3 | Pending |
| MEAL-02 | Phase 3 | Pending |
| MEAL-03 | Phase 3 | Pending |
| MEAL-04 | Phase 3 | Pending |
| BILL-01 | Phase 4 | Pending |
| BILL-02 | Phase 4 | Pending |
| BILL-03 | Phase 4 | Pending |
| BRIEF-01 | Phase 5 | Pending |
| BRIEF-02 | Phase 5 | Pending |
| BRIEF-03 | Phase 5 | Pending |

**Coverage:**
- v1.0 requirements: 19 total
- Mapped to phases: 19
- Unmapped: 0

---
*Requirements defined: 2026-02-09*
*Last updated: 2026-02-09 after roadmap creation*
