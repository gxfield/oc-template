# Home Assistant Workspace

## What This Is

A personal household assistant workspace for Greg and his wife Danielle. An AI agent (running on OpenClaw) manages calendar, todos, shopping, meals, polls, and household notes through Telegram and direct chat. The workspace uses markdown files for human-readable state, a Node.js task system for structured operations (calendar, weather, polls, Todoist), a JSON file cache for performance, and a centralized local_config.json for household-specific settings.

## Core Value

The agent must reliably understand and execute household management tasks -- even when powered by cheaper LLMs -- without making mistakes with timezones, commands, or file formats.

## Requirements

### Validated

<!-- Shipped and confirmed valuable. -->

- ✓ Google Calendar CLI with full CRUD operations — v0
- ✓ Pacific timezone handling for all date/time operations — v0
- ✓ Markdown-based household state (todos, shopping, meals, bills, notes, maintenance) — v0
- ✓ Agent personality and behavior guidelines (SOUL.md, AGENTS.md) — v0
- ✓ Telegram command mapping reference (TOOLS.md) — v0
- ✓ Bulletproof instruction files (DO/DO NOT tables, QUICKSTART.md) — v1.0
- ✓ Quick Capture patterns (remember, todo, shopping) — v1.0
- ✓ Meal Planning with shopping list integration — v1.0
- ✓ Briefing system (on-demand + automated morning) — v1.0
- ✓ Recipe inspiration + Save Recipe — v1.0
- ✓ Task-based script architecture with common orchestrator — v2.0
- ✓ Structured LLMPayload responses for agent consumption — v2.0
- ✓ JSON file cache with TTL and daily reset — v2.0
- ✓ Calendar task module (wraps existing calendar.js) — v2.0
- ✓ Weather task module (real API integration) — v2.0
- ✓ Todoist integration (REST v1 API with credentials.json) — v3.0
- ✓ Telegram poll creation with natural-language detection — v3.0
- ✓ AI tie-break voting with household-context heuristics — v3.0
- ✓ Centralized household config (local_config.json) — v3.0
- ✓ Media server feasibility research (Overseerr/Sonarr/Plex) — v3.0

### Active

<!-- Current scope. Building toward these. -->

- [ ] Structured recipe library with markdown files (title, ingredients, instructions)
- [ ] Agent can browse/search local recipe library for dinner suggestions
- [ ] RSS recipe inspiration filtered to dinner recipes
- [ ] Todoist section support for grocery items (Produce, Dairy, etc.)
- [ ] Poll results update meal plan (this-week.md) for dinner decisions
- [ ] Recipe ingredients auto-added to Todoist grocery list after poll resolution
- [ ] End-to-end: poll → meal plan → recipe → grocery list pipeline

### Out of Scope

<!-- Explicit boundaries. Includes reasoning to prevent re-adding. -->

- Home automation / smart device control — separate domain, not ready yet
- Multi-user calendar support — single calendar sufficient for now
- Mobile app — agent is accessed via Telegram/chat, no app needed
- Real-time notifications — heartbeat polling is sufficient for now

## Context

- Agent platform: OpenClaw (runs LLM agents with tool access including exec, file read/write)
- Calendar: Google Calendar API v3 via service account (danielle.demarchi@gmail.com)
- Timezone: Pacific Time (America/Los_Angeles) — critical, source of most LLM errors
- State storage: Markdown files in /household/ directory
- Task system: JavaScript in tasks/ (orchestrator, cache, calendar, weather, poll, todoist, echo, local-config)
- Cache: /memory/cache.json (TTL + daily reset, gitignored)
- Weather: OpenWeatherMap API (requires OPENWEATHER_API_KEY env var)
- Polls: Telegram Bot API with state persistence in /memory/poll-state.json
- Todoist: REST v1 API via credentials.json
- Config: local_config.json at workspace root (city, timezone, temperature units)
- Wife (Danielle): Not yet using the system, wants it to work for both of them

## Constraints

- **Tech stack**: Node.js + vanilla JavaScript, no build tools — keep it simple
- **LLM compatibility**: Instructions must work with cheap models (Haiku-class), not just Opus
- **No database**: Markdown files are the state layer, keep it that way
- **Agent platform**: OpenClaw with exec tool — all CLI tools must be invocable via shell commands
- **No npm dependencies for tasks**: Task system uses only Node.js built-in modules

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Markdown for state | Human-readable, agent-editable, no DB needed | ✓ Good |
| Service account auth | No user login flow needed, agent can use directly | ✓ Good |
| Pacific timezone hardcoded | Single-timezone household, simplifies everything | ✓ Good |
| No test suite | CLI is simple enough to verify manually | ⚠️ Revisit |
| Task orchestrator architecture | Structured, cacheable task execution for agent reliability | ✓ Good — config-driven, 3 tasks running |
| Import calendar.js directly | Helpers require() exported functions instead of shell exec | ✓ Good — cleaner, no subprocess overhead |
| JSON file cache | Ephemeral cache in /memory/cache.json with daily cron cleanup | ✓ Good — simple, effective |
| Factory functions over classes | Simpler type construction, matches project style | ✓ Good |
| Error payloads over throwing | Consistent LLMPayload interface, agent always gets structured response | ✓ Good |
| Helper chaining via context | previousResult enables multi-step intents (remove → fetch) | ✓ Good |
| Built-in https for API calls | No npm dependencies for weather API, keeps tasks self-contained | ✓ Good |
| Todoist API v1 migration | REST v2 deprecated (410 Gone), v1 is stable | ✓ Good |
| Built-in https for poll task | Consistent with todoist-api.js and weather patterns | ✓ Good |
| 2-4 poll options, 60min timeout | Simple constraints, avoids overengineering | ✓ Good |
| Silent bot on agreement | Only announces tie-breaks with reasoning, less noise | ✓ Good |
| local_config.json at root | Single file for household defaults, Object.assign fallbacks | ✓ Good |

## Current Milestone: v4.0 Recipe, Grocery & Poll Improvements

**Goal:** Connect the poll → meal plan → grocery pipeline with a structured recipe library and Todoist section support.

**Target features:**
- Structured recipe library (markdown files, agent-browsable)
- Todoist grocery list with section placement
- Poll resolution triggers meal plan update + grocery population

---
*Last updated: 2026-02-22 after starting v4.0 milestone*
