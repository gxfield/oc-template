# Roadmap: Home Assistant Workspace

## Milestones

- ✅ **v1.0 Bulletproof Instructions + Feature Expansion** - Phases 1-6 (shipped 2026-02-10)
- 🚧 **v2.0 Task Architecture** - Phases 7-10 (in progress)

## Phases

<details>
<summary>✅ v1.0 Bulletproof Instructions + Feature Expansion (Phases 1-6) - SHIPPED 2026-02-10</summary>

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
- [x] 01-01-PLAN.md — Harden TOOLS.md with DO/DO NOT tables and Telegram parsing examples
- [x] 01-02-PLAN.md — Add format headers to household files and rewrite AGENTS.md startup checklist
- [x] 01-03-PLAN.md — Create QUICKSTART.md single-page reference

### Phase 2: Quick Capture
**Goal**: Users can capture notes, todos, and shopping items in natural language without opening files
**Depends on**: Phase 1
**Requirements**: CAPT-01, CAPT-02, CAPT-03, CAPT-04
**Success Criteria** (what must be TRUE):
  1. User can say "remember X" and it appears in notes.md with Pacific timestamp
  2. User can say "add X to shopping" or "we need X" and it appears in shopping.md
  3. User can say "todo X" and it appears in todos.md
  4. TOOLS.md documents all quick capture patterns with exact trigger phrase examples
**Plans:** 2 plans

Plans:
- [x] 02-01-PLAN.md — Add Quick Capture section to TOOLS.md with trigger phrases and parsing examples
- [x] 02-02-PLAN.md — Add Quick Capture to QUICKSTART.md and AGENTS.md startup checklist

### Phase 3: Meal Planning
**Goal**: Users can plan weekly dinners and generate shopping lists from meal plans
**Depends on**: Phase 2
**Requirements**: MEAL-01, MEAL-02, MEAL-03, MEAL-04
**Success Criteria** (what must be TRUE):
  1. User can set this week's meal plan by day (Mon-Sun dinners at minimum)
  2. User can ask "what's for dinner tonight" and get the correct meal from the plan
  3. User can generate shopping list items directly from the meal plan
  4. meals/this-week.md has a structured format that LLMs reliably parse
**Plans:** 3 plans

Plans:
- [x] 03-01-PLAN.md — Add Meal Planning command handlers to TOOLS.md with trigger phrases and parsing examples
- [x] 03-02-PLAN.md — Expand Meals in QUICKSTART.md and add meal planning to AGENTS.md startup checklist
- [x] 03-03-PLAN.md — Fix calendar.js 'now' command to output day name (gap closure)

### Phase 4: Bill Reminders
**Goal**: Users can track bills with due dates and query upcoming payments
**Depends on**: Phase 3
**Requirements**: BILL-01, BILL-02, BILL-03
**Success Criteria** (what must be TRUE):
  1. bills.md has structured format with bill name, amount, due date, and paid status
  2. User can ask "what bills are due" and get upcoming unpaid bills
  3. Briefing includes bills due in the next 7 days automatically
**Status:** Deferred (bills.md structure exists but no query/reminder commands)
**Plans**: TBD

### Phase 5: Briefing System
**Goal**: Users get a single command that shows everything relevant for today
**Depends on**: Phase 4
**Requirements**: BRIEF-01, BRIEF-02, BRIEF-03
**Success Criteria** (what must be TRUE):
  1. User can request a combined briefing showing today's calendar, pending todos, shopping list, and meal plan
  2. Briefing output is formatted for Telegram with no markdown tables and natural emoji usage
  3. TOOLS.md documents the briefing command with exact trigger phrases
**Plans:** 2 plans

Plans:
- [x] 05-01-PLAN.md — Expand Briefing command handler in TOOLS.md with trigger phrases, output template, and assembly steps
- [x] 05-02-PLAN.md — Add Briefing to QUICKSTART.md and AGENTS.md startup checklist

### Phase 6: Daily Morning Briefing
**Goal**: Agent automatically sends an enhanced morning briefing (with meat reminder and recipe inspiration) during heartbeat polls, plus save recipe quick capture
**Depends on**: Phase 5
**Requirements**: NOTF-02
**Success Criteria** (what must be TRUE):
  1. HEARTBEAT.md contains a morning briefing task that fires during 7-10 AM Pacific heartbeats
  2. Automated briefing uses dedup via heartbeat-state.json to prevent duplicate sends
  3. Briefing expanded from 5 to 7 sections (meat reminder + recipe inspiration)
  4. Meat reminder appears conditionally when tonight's dinner has meat keywords
  5. Recipe inspiration fetches 2-3 random recipes from peaceloveandlowcarb.com/feed/
  6. Users can say "save recipe [text]" to store recipes in favourites.md
  7. TOOLS.md documents all new features with DO/DO NOT tables
  8. QUICKSTART.md and AGENTS.md reference all new features for cheap LLM discoverability
**Plans:** 2 plans

Plans:
- [x] 06-01-PLAN.md — Add enhanced briefing sections (meat reminder, recipe inspiration) and automated morning briefing to TOOLS.md + HEARTBEAT.md
- [x] 06-02-PLAN.md — Add save recipe to TOOLS.md, create favourites.md, update QUICKSTART.md and AGENTS.md

</details>

### 🚧 v2.0 Task Architecture (In Progress)

**Milestone Goal:** Build a task-based script architecture with caching and structured responses that powers calendar, weather, and future tasks behind the LLM assistant.

#### Phase 7: Task Infrastructure
**Goal**: Common task orchestrator handles all request normalization, validation, execution, and response formatting
**Depends on**: Phase 6 (v1.0)
**Requirements**: INFRA-01, INFRA-02, INFRA-03, INFRA-04
**Success Criteria** (what must be TRUE):
  1. Agent can send raw requests and receive normalized NormalizedTaskRequest objects with validated fields
  2. Orchestrator creates task runners from TaskConfig without requiring orchestrator code changes
  3. Adding a new task requires only creating helpers/, config.js, and index.js entry
  4. All task runners return consistent LLMPayload objects with task, intent, parameters, data, and meta fields
  5. Agent can consume LLMPayload responses without parsing custom formats
**Plans**: TBD

Plans:
- [ ] TBD (to be defined during planning)

#### Phase 8: Cache Layer
**Goal**: JSON file cache stores task results with TTL and daily reset to reduce redundant API calls and improve agent response time
**Depends on**: Phase 7
**Requirements**: CACHE-01, CACHE-02, CACHE-03, CACHE-04
**Success Criteria** (what must be TRUE):
  1. Cache stores LLMPayload entries at /memory/cache.json with task-driven keys
  2. Each task defines its own cache keying strategy via config
  3. Cache entries expire via configurable TTL or timezone-aware daily reset
  4. Task helpers can get, set, and clear expired cache entries without managing file I/O
  5. Repeated requests within TTL return cached responses instantly
**Plans**: TBD

Plans:
- [ ] TBD (to be defined during planning)

#### Phase 9: Calendar Task
**Goal**: Calendar operations execute through task orchestrator with structured responses instead of CLI text output
**Depends on**: Phase 8
**Requirements**: CAL-01, CAL-02, CAL-03, CAL-04, CAL-05
**Success Criteria** (what must be TRUE):
  1. calendar.js exports functions (listEvents, createEvent, deleteEvent, updateEvent) while preserving CLI mode for backward compatibility
  2. Agent can request calendar events for date ranges and receive structured event lists
  3. Agent can create calendar events and receive confirmation with event details
  4. Agent can delete calendar events and receive confirmation with updated event list
  5. Calendar config routes intents (get, add, remove) to correct helper chains automatically
**Plans**: TBD

Plans:
- [ ] TBD (to be defined during planning)

#### Phase 10: Weather Task
**Goal**: Weather data integrates via OpenWeatherMap API with caching and smart defaults
**Depends on**: Phase 8
**Requirements**: WTHR-01, WTHR-02, WTHR-03
**Success Criteria** (what must be TRUE):
  1. Agent can request weather and receive structured WeatherData from OpenWeatherMap API
  2. Weather config fills default location and units when parameters missing from request
  3. Cache ignores request tone variations so "weather today" and "how's the weather" share cached data
  4. Weather responses include temperature, conditions, forecast, and timestamp
**Plans**: TBD

Plans:
- [ ] TBD (to be defined during planning)

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9 → 10

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Instruction Hardening | v1.0 | 3/3 | Complete | 2026-02-09 |
| 2. Quick Capture | v1.0 | 2/2 | Complete | 2026-02-09 |
| 3. Meal Planning | v1.0 | 3/3 | Complete | 2026-02-09 |
| 4. Bill Reminders | v1.0 | 0/TBD | Deferred | - |
| 5. Briefing System | v1.0 | 2/2 | Complete | 2026-02-09 |
| 6. Daily Morning Briefing | v1.0 | 2/2 | Complete | 2026-02-10 |
| 7. Task Infrastructure | v2.0 | 0/TBD | Not started | - |
| 8. Cache Layer | v2.0 | 0/TBD | Not started | - |
| 9. Calendar Task | v2.0 | 0/TBD | Not started | - |
| 10. Weather Task | v2.0 | 0/TBD | Not started | - |
