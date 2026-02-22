# Milestones: Home Assistant Workspace

## v1.0 — Bulletproof Instructions + Feature Expansion

**Completed:** 2026-02-10
**Phases:** 1-6 (Phase 4 Bill Reminders deferred)
**Last phase number:** 6

### What Shipped
- Hardened instruction files (TOOLS.md, AGENTS.md, QUICKSTART.md) with DO/DO NOT tables
- Quick Capture patterns (remember, todo, shopping, disambiguation rules)
- Meal Planning with shopping list integration
- Briefing system (on-demand + automated morning briefings, 7 sections)
- Recipe inspiration from RSS + Save Recipe to favourites.md
- calendar.js day-name output for meal plan lookups

### What Didn't Ship
- Phase 4: Bill Reminders — deferred, bills.md structure exists but no query/reminder commands

### Key Metrics
- Plans completed: 12
- Average plan duration: 1.2 minutes
- Total execution time: 0.27 hours

---
*Archived: 2026-02-10*

## v2.0 — Task Architecture

**Completed:** 2026-02-13
**Phases:** 7-10
**Last phase number:** 10

### What Shipped
- Config-driven task orchestrator with structured LLMPayload responses (types.js, read-msg.js, orchestrator.js)
- File-backed JSON cache with TTL expiry and Pacific timezone daily reset
- Calendar task module wrapping calendar.js with get/add/remove intents and helper chaining
- Weather task module with OpenWeatherMap API, tone-agnostic caching, and default parameter filling
- Consistent error handling (never throws, always returns error payloads)

### What Didn't Ship
- TOOLS.md updates for task script usage (deferred — agent can use tasks programmatically without doc updates)

### Key Metrics
- Plans completed: 7
- Commits: 16 feat commits
- Lines of code: 913 (13 files in tasks/)
- Average plan duration: 1.46 minutes
- Total execution time: 3 days (2026-02-11 → 2026-02-13)

---
*Archived: 2026-02-13*


## v3.0 — Features & Integrations

**Completed:** 2026-02-22
**Phases:** 1-3 (post-v2.0 numbering)
**Last phase number:** 3

### What Shipped
- Fixed Todoist integration by migrating from deprecated REST v2 to v1 API with credentials.json
- Media server (Plex/Overseerr/Sonarr on Umbrel) feasibility research document
- Telegram poll task with natural-language creation, Bot API helper, and state persistence
- Vote processing with household-context-aware tie-break AI and timeout handling
- Poll system documented across TOOLS.md, QUICKSTART.md, AGENTS.md, HEARTBEAT.md
- Centralized household config (city, timezone, temp units) in local_config.json with loader module

### What Didn't Ship
- Nothing deferred — all planned work completed

### Key Metrics
- Plans completed: 8 (across 3 phases)
- Files changed: 48
- Lines: +4,493 / -47
- Timeline: 3 days (2026-02-15 -> 2026-02-17)

---
*Archived: 2026-02-22*

