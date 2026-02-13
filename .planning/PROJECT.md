# Home Assistant Workspace

## What This Is

A personal household assistant workspace for Greg and his wife Danielle. An AI agent (running on OpenClaw) manages calendar, todos, shopping, meals, and household notes through Telegram and direct chat. The workspace uses markdown files for human-readable state, a Node.js task system for structured operations (calendar, weather), and a JSON file cache for performance.

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

### Active

<!-- Current scope. Building toward these. -->

(None — planning next milestone)

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
- Task system: 913 LOC JavaScript in tasks/ (orchestrator, cache, calendar, weather, echo)
- Cache: /memory/cache.json (TTL + daily reset, gitignored)
- Weather: OpenWeatherMap API (requires OPENWEATHER_API_KEY env var)
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

---
*Last updated: 2026-02-13 after v2.0 milestone*
