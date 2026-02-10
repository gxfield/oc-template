# Architecture

**Analysis Date:** 2026-02-09

## Pattern Overview

**Overall:** Modular monorepo with distinct agent-driven subsystems. This is a personal household assistant platform consisting of a Google Calendar CLI integration and household state management system.

**Key Characteristics:**
- Decoupled command-line utilities with configuration-driven behavior
- File-based state management using markdown for readability
- Timezone-aware backend serving a Pacific Time user
- Agent instruction documentation for consistent behavior
- Minimal external dependencies (Google APIs only for calendar)

## Layers

**CLI Layer:**
- Purpose: User-facing command interface for calendar operations
- Location: `calendar/calendar.js`
- Contains: Command dispatcher, event formatting, timezone handling
- Depends on: Google Calendar API via googleapis library, local config files
- Used by: Direct shell commands, external agents via exec

**API Integration Layer:**
- Purpose: Abstract Google Calendar API interactions with auth/retry logic
- Location: `calendar/calendar.js` (embedded functions: getAuthClient, listEvents, createEvent, updateEvent, deleteEvent)
- Contains: OAuth2 authentication, event CRUD operations
- Depends on: googleapis library, credentials.json
- Used by: CLI layer command handlers

**Configuration Layer:**
- Purpose: Load and persist system settings
- Location: `calendar/config.json`, `household/state/config.json`
- Contains: Calendar ID, timezone, Telegram command mappings
- Depends on: File system
- Used by: Both calendar and household subsystems

**State Management Layer:**
- Purpose: Persistent storage of household data in human-readable format
- Location: `household/*.md` files (todos.md, shopping.md, notes.md, etc.)
- Contains: Task lists, grocery lists, bills, maintenance records
- Depends on: File system
- Used by: External agents, manual editing

**Timezone Utility Layer:**
- Purpose: Convert between UTC (system clock) and Pacific Time (user-facing)
- Location: `calendar/calendar.js` (functions: nowInPacific, formatPacific, pacificMidnightToUTC, todayBounds, thisWeekBounds, nextNDaysBounds)
- Contains: Intl-based date/time conversion, day boundary calculations
- Depends on: JavaScript Intl API
- Used by: All calendar operations

**Setup & Bootstrap Layer:**
- Purpose: Initial credential configuration and system initialization
- Location: `calendar/setup.js`, `BOOTSTRAP.md`
- Contains: Interactive credential validation, config creation
- Depends on: File system, readline for user input
- Used by: First-run setup, agent initialization

## Data Flow

**Calendar Event Query:**

1. User invokes: `node calendar.js today`
2. CLI dispatcher extracts command + args
3. Command handler calls `todayBounds()` to compute Pacific midnight boundaries as UTC timestamps
4. `listEvents()` called with timeMin/timeMax parameters
5. Google Calendar API queried with singleEvents=true, orderBy=startTime
6. Raw API response (events with UTC datetimes) received
7. Each event formatted via `formatPacific()` or `formatPacificDate()` for display
8. Results printed to stdout with emojis and readable times

**Calendar Event Creation:**

1. User invokes: `node calendar.js add "Title" "2026-02-15T10:30:00" "2026-02-15T11:30:00"`
2. CLI parses arguments as bare Pacific Time strings
3. Event object constructed with `start.dateTime`, `end.dateTime`, `timeZone: America/Los_Angeles`
4. Google Calendar API receives event with timezone context
5. Google Calendar stores event in system timezone, remembers Pacific context
6. Response echoed to user with confirmation + event ID + calendar link

**Household State Update:**

1. User (via Telegram or direct chat) requests action: "add milk to shopping"
2. Agent reads current `household/shopping.md`
3. Agent appends new line: `- [ ] milk`
4. Agent writes updated file back to disk
5. Next query automatically reflects new state (no sync needed)

**State Management:**

State is **immutable from code perspective** — no real-time sync. Each operation:
1. Read current state file
2. Modify in memory
3. Write complete file back
4. Assume writes are durable (filesystem guarantees)

No version control, no undo, no conflict resolution — treats markdown files as source of truth.

## Key Abstractions

**TimezoneConverter:**
- Purpose: Encapsulate timezone conversion logic to prevent UTC/Pacific confusion
- Examples: `calendar/calendar.js` functions: `nowInPacific()`, `formatPacific()`, `pacificMidnightToUTC()`
- Pattern: Stateless utility functions using JavaScript Intl API; converts wall-clock times to UTC offsets via comparison rather than lookup tables

**GoogleAuthClient:**
- Purpose: Provide authenticated Google Calendar API instance
- Examples: `calendar/calendar.js` `getAuthClient()` function
- Pattern: Singleton-style auth creation; loads credentials.json once per process, creates GoogleAuth instance, reused across API calls

**EventFormatter:**
- Purpose: Convert raw API event objects to human-readable display strings
- Examples: `calendar/calendar.js` `formatPacific()`, `formatPacificDate()` functions
- Pattern: Pure functions that take ISO/date strings, return localized display format using Intl.DateTimeFormat

**ConfigLoader:**
- Purpose: Centralize config file loading with error handling
- Examples: `calendar/calendar.js` `loadConfig()` function
- Pattern: Synchronous file read with early exit on missing/invalid config; treats missing files as fatal

**StateFile (implicit):**
- Purpose: Treat markdown files as append-only event log or snapshot state
- Examples: `household/todos.md`, `household/shopping.md`
- Pattern: No schema validation; agents read, modify in memory, write complete file; markdown checkbox syntax `- [ ]` / `- [x]` for task state

## Entry Points

**Calendar CLI:**
- Location: `calendar/calendar.js`
- Triggers: `node calendar.js [command] [args]`
- Responsibilities: Parse command-line args, dispatch to command handler (list/today/week/upcoming/add/add-allday/delete/update/now), format output, exit with status code

**Setup Wizard:**
- Location: `calendar/setup.js`
- Triggers: `node setup.js` (one-time setup)
- Responsibilities: Validate credentials.json exists and has required fields, prompt for calendar ID and timezone, write config.json, guide user through completion

**Agent Initialization:**
- Location: `AGENTS.md`, `BOOTSTRAP.md`
- Triggers: Fresh session startup or manual agent invocation
- Responsibilities: Load SOUL.md, USER.md, memory files; understand workspace structure; become familiar with available tools (calendar CLI, household markdown files)

**Household State Access:**
- Location: `household/` directory
- Triggers: Direct file read/write by agents or human users
- Responsibilities: Read/update markdown files; maintain task lists, shopping lists, notes; no special endpoint — file system is the API

## Error Handling

**Strategy:** Fail fast with user-readable error messages. No retry logic. Process exits with code 1 on error.

**Patterns:**

- **Missing credentials:** `getAuthClient()` catches missing credentials.json, prints emoji-prefixed error, exits process
  - File: `calendar/calendar.js` lines 28-39

- **Invalid config:** `loadConfig()` catches JSON parse errors, prints error, exits process
  - File: `calendar/calendar.js` lines 19-26

- **API errors:** All async functions wrap Google Calendar API calls in try-catch, print error message, exit process
  - File: `calendar/calendar.js` lines 240-243 (listEvents), 259-262 (createEvent), 270-274 (deleteEvent), 287-290 (updateEvent)

- **Bad user input:** CLI validates required arguments before calling API; prints usage instructions
  - File: `calendar/calendar.js` lines 336-340 (add command), 369-370 (delete command)

No graceful degradation — errors are terminal. This is acceptable for CLI tools used by agents (who can retry) and household state files (which don't fail for reads, only writes if disk full).

## Cross-Cutting Concerns

**Logging:**
- No structured logging framework. All output via `console.log()` and `console.error()`
- Emoji prefixes indicate result type: ✅ success, ❌ error, 📅 data, 🆔 identifiers
- Logged to stdout/stderr; external tools can capture
- File: `calendar/calendar.js` throughout

**Validation:**
- Input validation happens at CLI argument parsing level only
- Calendar ID format not validated — Google API returns error if invalid
- Event times validated as ISO strings by passing to Date() constructor (implicit, line 81)
- Config file must contain `calendarId` and `timeZone` properties or not loaded at all
- File: `calendar/calendar.js` lines 336-340, 369-370, 401-402

**Authentication:**
- Service account credentials (JSON key file) loaded once at runtime
- GoogleAuth object maintains credentials in memory
- All subsequent API calls automatically include Authorization header
- Credentials never logged or displayed
- File: `calendar/calendar.js` lines 28-39

**Timezone Handling:**
- ALL user-facing times must be Pacific Time (America/Los_Angeles)
- ALL storage in Google Calendar is timezone-aware (dates stored with tzinfo)
- ALL system clock interactions convert UTC ↔ Pacific via Intl API
- Day boundary calculations use Pacific midnight, not UTC midnight
- File: `calendar/calendar.js` lines 8-12, 44-177

---

*Architecture analysis: 2026-02-09*
