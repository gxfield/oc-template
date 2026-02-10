# Testing Patterns

**Analysis Date:** 2026-02-09

## Test Framework

**Status:** Not implemented

**Current State:**
- No test framework configured (jest, vitest, mocha, etc.)
- No test files present in codebase (no `*.test.js`, `*.spec.js`)
- No test configuration files found (`jest.config.js`, `vitest.config.js`)
- No testing dependencies in `package.json`
- Package.json contains only `googleapis` as dependency - see `/Users/greg/ai/assistant/workspace-fixed/calendar/package.json`

**Implication:**
All testing is manual. Code in `/Users/greg/ai/assistant/workspace-fixed/calendar/calendar.js` and `/Users/greg/ai/assistant/workspace-fixed/calendar/setup.js` operates without automated test coverage.

## Testing Approach

**Manual CLI Testing:**
The codebase is structured as a command-line tool with multiple entry points that would require manual testing:

```bash
# calendar.js commands that need manual verification:
node calendar.js list              # Fetch and display events
node calendar.js today             # Show today's events
node calendar.js week              # Show weekly events
node calendar.js upcoming [days]   # Show upcoming events
node calendar.js add ...           # Create event
node calendar.js add-allday ...    # Create all-day event
node calendar.js delete EVENT_ID   # Delete event
node calendar.js update EVENT_ID   # Update event fields
node calendar.js now               # Display current Pacific time

# setup.js - one-time configuration:
node setup.js                      # Interactive credential setup
```

## Error Conditions That Need Testing

**File I/O Errors:**
- Missing `config.json` - triggers `console.error()` and `process.exit(1)` in `loadConfig()` (line 19-26)
- Missing `credentials.json` - triggers error in `getAuthClient()` (line 28-39)
- Invalid JSON in credential files - caught and logged with `process.exit(1)`

**API Errors:**
- Calendar not found or inaccessible
- Invalid event parameters
- Network failures during API calls
- Authentication failures

**Timezone Edge Cases:**
- Pacific Time transitions (PDT/PST)
- All-day event date calculations: `formatPacificDate()` (line 93-100)
- Midnight boundary calculations: `pacificMidnightToUTC()` (line 106-135)
- Week boundary calculation: `thisWeekBounds()` (line 158-177)

**Input Validation Gaps:**
- No validation of date/time format in `add` command
- No validation of calendar ID format
- Command-line argument parsing is minimal (line 295-296)

## Code Areas Requiring Test Coverage

**Critical Timezone Functions:**
- `nowInPacific()` (line 44-75) - extracts current date/time components
- `formatPacific()` (line 80-88) - formats DateTime to readable string
- `formatPacificDate()` (line 93-100) - formats all-day event dates
- `pacificMidnightToUTC()` (line 106-135) - converts Pacific midnight to UTC ISO string
- `todayBounds()` (line 140-153) - calculates today's time boundaries
- `thisWeekBounds()` (line 158-177) - calculates Monday-Sunday boundaries
- `nextNDaysBounds()` (line 182-195) - calculates N-day forward boundaries

**Core Operations:**
- `listEvents()` (line 199-244) - fetches and displays calendar events
- `createEvent()` (line 246-263) - creates new calendar event
- `deleteEvent()` (line 265-275) - deletes calendar event
- `updateEvent()` (line 277-291) - updates event fields

**Configuration Handling:**
- `loadConfig()` (line 19-26) - loads config.json
- `getAuthClient()` (line 28-39) - initializes Google Auth client

## Suggested Test Structure (If Implemented)

**Test File Organization:**
- `calendar.test.js` - Tests for main calendar operations
- `timezone.test.js` - Tests for Pacific timezone functions
- `setup.test.js` - Tests for configuration setup
- `fixtures/` - Mock Google Calendar API responses, sample credentials, test config files

**Mock Data Needed:**
- Sample Google Calendar API responses (events list, single event)
- Mock credentials structure
- Mock config.json
- Test event data for create/update/delete operations

**Test Categories:**

1. **Timezone Tests** - Verify Pacific Time calculations handle:
   - DST transitions
   - Date boundaries at midnight
   - Week boundaries (Monday start)
   - All-day event dates
   - UTC conversion accuracy

2. **API Operation Tests** - Verify:
   - Event listing returns correct format
   - Event creation succeeds with valid data
   - Event deletion removes event
   - Event updates merge data correctly
   - Error handling on API failures

3. **Configuration Tests** - Verify:
   - Config loads from file correctly
   - Missing config triggers error
   - Invalid JSON handled gracefully
   - Credentials validated on load

4. **CLI Integration Tests** - Verify:
   - Command parsing routes to correct handler
   - Arguments passed correctly to operations
   - Output formatting matches specification
   - Help text displays for invalid commands

## Current Gaps and Risks

**High Risk - Untested:**
- Timezone calculations (most complex code, most likely to break)
- Week boundary logic with DST transitions
- Date parsing and formatting edge cases
- All-day event handling

**Medium Risk - No Error Recovery:**
- API failures cause immediate exit
- No retry logic
- No graceful degradation

**Low Risk - Straightforward Operations:**
- Event CRUD operations follow Google Calendar API closely
- Configuration loading is simple file I/O

## Recommendations for Implementation

**Priority 1 - Timezone Functions:**
Test `nowInPacific()`, `formatPacific()`, `pacificMidnightToUTC()` with:
- Dates near DST transitions
- Edge cases (leap year, month boundaries)
- Verify UTC conversion accuracy

**Priority 2 - Date Boundary Functions:**
Test `todayBounds()`, `thisWeekBounds()`, `nextNDaysBounds()` with:
- Various days of week
- Month/year transitions
- DST transition dates

**Priority 3 - Core Operations:**
Test with mocked Google Calendar API to verify:
- Correct parameters sent to API
- Response parsing and formatting
- Error handling on API failures

---

*Testing analysis: 2026-02-09*
