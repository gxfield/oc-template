# Coding Conventions

**Analysis Date:** 2026-02-09

## Naming Patterns

**Files:**
- Module files use lowercase with hyphens: `calendar.js`, `setup.js`
- Configuration files: `config.json`, `credentials.json`
- Constant path variables use UPPER_SNAKE_CASE: `CREDENTIALS_PATH`, `CONFIG_PATH`, `USER_TZ`

**Functions:**
- Declared with `function` keyword for named functions: `function loadConfig()`, `function getAuthClient()`
- Arrow functions used for callbacks: `const get = (type) => parts.find(...)`
- Async functions declared explicitly: `async function listEvents()`, `async function createEvent()`
- Camel case naming: `loadConfig`, `getAuthClient`, `nowInPacific`, `pacificMidnightToUTC`
- Helper/utility functions prefixed with descriptive names: `todayBounds()`, `thisWeekBounds()`, `nextNDaysBounds()`

**Variables:**
- Local variables use camelCase: `const now = new Date()`, `const calendarId = config.calendarId`
- Constants use UPPER_SNAKE_CASE: `const USER_TZ = 'America/Los_Angeles'`
- Destructuring preferred for object properties: `const { google } = require('googleapis')`
- Query parameters extracted to local const: `const calendarId = config.calendarId`

**Types:**
- No TypeScript - vanilla JavaScript with JSDoc comments
- Objects passed as parameters with shape documented in comments
- Event data objects follow Google Calendar API structure

## Code Style

**Formatting:**
- No linter/formatter configured
- Consistent 2-space indentation observed throughout
- Lines kept under 100 characters for readability
- Blank lines used to separate logical sections

**Comments:**
- Block comments using `// ` for section dividers: `// ── Helpers ──────────────────────────────────────────────`
- Inline comments explain complex logic: `// noon to avoid TZ edge case`
- Heavy use of visual dividers for code organization
- Configuration explanations at file top: timezone handling documented at module start

**JSDoc/Documentation:**
- Selective JSDoc blocks for public functions
- Format: `/** * Description of function. */`
- Used for main operations: `listEvents()`, `createEvent()`, `formatPacific()`, `pacificMidnightToUTC()`
- Parameter documentation in JSDoc: `@param` not used, descriptions in comment only
- Not consistently applied to all functions

## Import Organization

**Order:**
1. Core Node.js modules: `const fs = require('fs')`, `const path = require('path')`
2. Third-party packages: `const { google } = require('googleapis')`
3. Module-level constants: `const CREDENTIALS_PATH = ...`, `const CONFIG_PATH = ...`
4. Function definitions (no imports after setup)

**Pattern:**
- CommonJS `require()` syntax exclusively (no ES6 imports)
- Destructuring on import: `const { google } = require('googleapis')`
- Path resolution using `path.join()` and `__dirname`

## Error Handling

**Pattern:**
- Try-catch blocks around file I/O and API calls
- Errors logged to console with descriptive emoji prefix: `console.error('❌ Error fetching events:', err.message)`
- Process exits on critical failures: `process.exit(1)`
- No custom error classes or error recovery

**Error Messages:**
- User-facing errors prefixed with emoji: `❌`, `✅`, `📝`
- Include action needed: `'❌ config.json not found. Run setup first.'`
- API errors logged with context: `console.error('❌ Error fetching events:', err.message)`

## Logging

**Framework:**
- Console logging only (`console.log`, `console.error`)
- No logging framework or structured logging

**Patterns:**
- Success messages prefixed with `✅`: `console.log('✅ Event created: ...')`
- Errors prefixed with `❌`: `console.error('❌ Error creating event: ...')`
- Info/calendar output prefixed with `📅`, `📆`: `console.log('📅 No events found.')`
- Metadata output prefixed with `🆔`, `📍`, `📝`: event IDs, locations, descriptions
- Each major operation logs its result explicitly

## Function Design

**Size:**
- Most functions 10-30 lines
- Complex timezone calculations isolated in separate functions: `pacificMidnightToUTC()` (29 lines)
- Single-responsibility: `loadConfig()`, `getAuthClient()`, `formatPacific()`

**Parameters:**
- Functions accept 1-3 parameters
- Complex operations use options object: `listEvents(calendarId, options = {})`
- Google Calendar API parameters passed as objects

**Return Values:**
- Async functions return event data or arrays
- Helper functions return computed values (strings, objects, bounds)
- Functions either return data or exit process on failure (no null/undefined handling)

## Module Design

**Exports:**
- No explicit exports - CLI entry point runs IIFE: `(async () => { ... })()`
- Functions defined at module scope, called from main CLI section
- Two entry files: `calendar.js` (main operations), `setup.js` (initialization)

**Organization:**
- `setup.js`: Configuration setup, credential validation
- `calendar.js`:
  - Timezone configuration (lines 7-15)
  - Helper functions (lines 19-195)
  - Core operations (lines 199-291)
  - CLI handler (lines 298-409)

**Code Organization:**
- Constants defined at top with comments explaining purpose
- Helper functions grouped and separated with section comments
- Core async operations grouped together
- CLI handler as main IIFE at bottom

## API Parameter Patterns

**Google Calendar API:**
- Options object built incrementally: `const params = { calendarId, ... }; if (options.timeMin) params.timeMin = ...`
- Event data structures follow Google Calendar format: `{ summary, description, start: { dateTime }, end: { dateTime } }`
- All-day events use `{ date: 'YYYY-MM-DD' }` format

## Async/Await

**Pattern:**
- Async functions defined explicitly: `async function listEvents()`
- Await used for all async operations: `const res = await calendar.events.list(params)`
- Try-catch blocks wrap async operations
- IIFE wrapping main execution: `(async () => { ... })()`

---

*Convention analysis: 2026-02-09*
