# Requirements: Home Assistant Workspace

**Defined:** 2026-02-09
**Core Value:** The agent must reliably understand and execute household management tasks -- even when powered by cheaper LLMs.

## v1.0 Requirements (Completed)

### Instruction Hardening

- [x] **INST-01**: TOOLS.md has explicit DO/DO NOT tables for every command with before/after examples of common mistakes
- [x] **INST-02**: Each household markdown file has a format header that tells LLMs exactly how to read and write it
- [x] **INST-03**: AGENTS.md startup checklist uses exact file paths and numbered steps with no ambiguity
- [x] **INST-04**: QUICKSTART.md provides a single-page "do exactly this" reference for cheap LLMs
- [x] **INST-05**: TOOLS.md Telegram command handlers include exact parsing examples and edge cases

### Quick Capture

- [x] **CAPT-01**: User can say "remember X" and it gets added to notes.md with Pacific timestamp
- [x] **CAPT-02**: User can say "add X to shopping" / "we need X" and it appends to shopping.md
- [x] **CAPT-03**: User can say "todo X" and it appends to todos.md
- [x] **CAPT-04**: TOOLS.md documents all quick capture patterns with exact examples

### Meal Planning

- [x] **MEAL-01**: User can set this week's meal plan by day (Mon-Sun dinner at minimum)
- [x] **MEAL-02**: User can ask "what's for dinner tonight" and get the answer from the meal plan
- [x] **MEAL-03**: User can generate shopping list items from a meal plan
- [x] **MEAL-04**: meals/this-week.md has a structured format that LLMs can reliably parse

### Briefing

- [x] **BRIEF-01**: User can request a combined briefing that shows today's calendar, pending todos, shopping list, and meal plan
- [x] **BRIEF-02**: Briefing output is formatted for Telegram (no markdown tables, uses emoji naturally)
- [x] **BRIEF-03**: TOOLS.md documents the briefing command with exact trigger phrases

### Bill Reminders (Deferred)

- [ ] **BILL-01**: bills.md has a structured format with bill name, amount, due date, and paid status
- [ ] **BILL-02**: User can ask "what bills are due" and get upcoming unpaid bills
- [ ] **BILL-03**: Briefing includes bills due in the next 7 days

## v2.0 Requirements

Requirements for task architecture milestone. Each maps to roadmap phases.

### Infrastructure (INFRA)

- [ ] **INFRA-01**: read-msg.js normalizes upstream requests into NormalizedTaskRequest with field validation
- [ ] **INFRA-02**: orchestrator.js creates task runners from TaskConfig (validate → cache → execute → cache store → return)
- [ ] **INFRA-03**: Adding a new task requires only helpers/, config.js, and index.js — no orchestrator changes
- [ ] **INFRA-04**: All task runners return consistent LLMPayload objects (task, intent, parameters, data, meta)

### Cache (CACHE)

- [ ] **CACHE-01**: JSON file cache at /memory/cache.json stores LLMPayload entries with TTL
- [ ] **CACHE-02**: Cache keys are task-config-driven (each task defines its own keying strategy)
- [ ] **CACHE-03**: Cache entries expire via configurable TTL or daily reset (timezone-aware)
- [ ] **CACHE-04**: Cache exposes get/set/clearExpired operations

### Calendar (CAL)

- [ ] **CAL-01**: calendar.js refactored to export functions (listEvents, createEvent, deleteEvent, updateEvent) while preserving CLI mode
- [ ] **CAL-02**: fetch-calendar helper returns structured event list for date ranges
- [ ] **CAL-03**: set-calendar-item helper creates events and returns structured result
- [ ] **CAL-04**: remove-calendar-item helper deletes events and returns structured result
- [ ] **CAL-05**: Calendar config routes intents to helper chains (get → fetch, add → set+fetch, remove → remove+fetch)

### Weather (WTHR)

- [ ] **WTHR-01**: get-weather helper calls OpenWeatherMap API and returns structured WeatherData
- [ ] **WTHR-02**: Weather config fills defaults (location, units) when parameters missing
- [ ] **WTHR-03**: Weather cache keys ignore tone so same data is reusable across request variations

## Out of Scope

| Feature | Reason |
|---------|--------|
| Home automation / smart devices | Separate domain, not ready yet |
| Multi-calendar support | Single calendar sufficient for household |
| Mobile app | Agent accessed via Telegram, no app needed |
| Real-time push notifications | Heartbeat polling is sufficient |
| Expense tracking / budgeting | Scope creep -- bills tracker is enough |
| Recipe database with nutrition | Over-engineered for household use |
| Transport/messaging layer | Handled upstream (Telegram, webhooks, etc.) |
| Natural language response generation | LLM handles this from structured LLMPayload |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| INST-01 | Phase 1 | Complete |
| INST-02 | Phase 1 | Complete |
| INST-03 | Phase 1 | Complete |
| INST-04 | Phase 1 | Complete |
| INST-05 | Phase 1 | Complete |
| CAPT-01 | Phase 2 | Complete |
| CAPT-02 | Phase 2 | Complete |
| CAPT-03 | Phase 2 | Complete |
| CAPT-04 | Phase 2 | Complete |
| MEAL-01 | Phase 3 | Complete |
| MEAL-02 | Phase 3 | Complete |
| MEAL-03 | Phase 3 | Complete |
| MEAL-04 | Phase 3 | Complete |
| BRIEF-01 | Phase 5 | Complete |
| BRIEF-02 | Phase 5 | Complete |
| BRIEF-03 | Phase 5 | Complete |
| INFRA-01 | TBD | Pending |
| INFRA-02 | TBD | Pending |
| INFRA-03 | TBD | Pending |
| INFRA-04 | TBD | Pending |
| CACHE-01 | TBD | Pending |
| CACHE-02 | TBD | Pending |
| CACHE-03 | TBD | Pending |
| CACHE-04 | TBD | Pending |
| CAL-01 | TBD | Pending |
| CAL-02 | TBD | Pending |
| CAL-03 | TBD | Pending |
| CAL-04 | TBD | Pending |
| CAL-05 | TBD | Pending |
| WTHR-01 | TBD | Pending |
| WTHR-02 | TBD | Pending |
| WTHR-03 | TBD | Pending |

**Coverage:**
- v2.0 requirements: 15 total
- Mapped to phases: 0
- Unmapped: 15 (awaiting roadmap)

---
*Requirements defined: 2026-02-09*
*Last updated: 2026-02-10 after v2.0 requirements definition*
