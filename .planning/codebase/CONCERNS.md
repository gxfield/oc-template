# Codebase Concerns

**Analysis Date:** 2026-02-09

## Security Considerations

**Credential File Management:**
- Risk: `credentials.json` contains Google Cloud service account private key
- Files: `calendar/credentials.json`, `calendar/setup.js`, `calendar/calendar.js`
- Current mitigation: `.gitignore` excludes credentials.json (not verified in repo); setup.js validates file existence before use
- Recommendations:
  - Verify `.gitignore` explicitly lists `credentials.json` and `config.json` in git
  - Add environment variable support as alternative to file-based credentials
  - Document that credentials.json must never be committed or shared
  - Consider using Google Cloud Application Default Credentials for future deployments

**Service Account Email Exposure:**
- Risk: Service account email printed to console in setup.js line 40 and README
- Files: `calendar/setup.js` (line 40), `calendar/README.md` (lines 62-66)
- Current mitigation: None
- Recommendations:
  - Avoid printing sensitive identifiers to console logs (could appear in logs)
  - Store service account email securely in config.json instead of requiring manual copying

## Error Handling

**Process.exit() on Errors:**
- Problem: All async functions call `process.exit(1)` on error, terminating entire process
- Files: `calendar/calendar.js` (lines 24, 37, 242, 261, 273, 289), `calendar/setup.js` (lines 29, 37, 43, 50)
- Impact: When called from agent/automation context, any API error kills the entire Node process. Prevents graceful recovery or partial success. Agent integration patterns will fail silently.
- Fix approach:
  - Return error objects instead of exiting
  - Let calling context handle exit behavior
  - Wrap async functions to catch errors and return structured results

**Generic Error Messages:**
- Problem: Catch blocks print only `err.message`, losing stack traces and error context
- Files: `calendar/calendar.js` (lines 241, 260, 272, 288)
- Impact: Hard to debug API errors; insufficient information for agent to take corrective action
- Fix approach:
  - Log full error object including stack trace in debug mode
  - Provide specific error codes (e.g., "CALENDAR_NOT_FOUND", "AUTH_FAILED")
  - Return structured error object with code, message, and suggestion

**Missing Input Validation:**
- Problem: CLI commands accept arguments without type validation or bounds checking
- Files: `calendar/calendar.js` (lines 306, 327, 335-340, 352-357, 374-381)
- Impact: Integer overflow (maxResults), format errors with malformed dates silently fail, update command accepts any field name
- Fix approach:
  - Validate integer inputs: `maxResults` should be 1-2500
  - Validate date formats before sending to Google API
  - Whitelist allowed update fields (summary, description, location, start, end)

## Performance Bottlenecks

**Timezone Conversion Complexity:**
- Problem: Every date/time operation uses Intl.DateTimeFormat repeated formatting to calculate UTC offset
- Files: `calendar/calendar.js` (lines 44-75, 106-135)
- Cause: Dynamic offset calculation handles DST transitions correctly but is computationally expensive; called for every command execution
- Current performance: Acceptable for CLI but wasteful for frequent agent calls
- Improvement path:
  - Cache timezone offset at startup (only recalculate if needed for DST transitions)
  - Use a proper timezone library (date-fns-tz, moment-timezone) for cleaner code
  - Current code works but is brittle

**No Result Caching:**
- Problem: listEvents() fetches from Google API every time, even for repeated calls in short time windows
- Files: `calendar/calendar.js` (lines 199-244)
- Impact: Inefficient when agent checks calendar multiple times in succession; wastes API quota
- Improvement path:
  - Add in-process cache with TTL (e.g., 5 minute validity)
  - Store last result with timestamp
  - Invalidate after write operations (add/update/delete)

## Fragile Areas

**Timezone Handling - High Fragility:**
- Files: `calendar/calendar.js` (lines 8-12, 44-75, 106-135, 140-176)
- Why fragile:
  - Complex manual offset calculations instead of standard library
  - Intl.DateTimeFormat behavior differs across platforms (node versions, OS)
  - Daylight Saving Time transitions are manually handled via offset comparison
  - Edge cases at midnight and DST boundaries not explicitly tested
  - Code comments (lines 9-11) indicate previous bugs with timezone logic
- Safe modification: Don't modify timezone functions without comprehensive test coverage for DST transitions
- Test coverage: No test files present; edge cases untested
- Recommendation: Replace with `date-fns-tz` or `dayjs-with-timezone` library for robustness

**Date String Parsing - Fragile:**
- Files: `calendar/calendar.js` (lines 93-100, 106-135, 141-153, 158-176)
- Why fragile:
  - Manual string parsing: `dateStr.split('-').map(Number)` (line 95)
  - No validation that parts are valid date components
  - "2026-02-30" would parse without error and create invalid date
  - All-day event dates (string format) mixed with datetime events (ISO format) handled ad-hoc
- Safe modification: Add format validation and use Date library functions instead of manual parsing
- Risk: Unvalidated input from agent commands could create calendar events on wrong dates

**Update Command - Dangerous:**
- Files: `calendar/calendar.js` (lines 374-382)
- Why fragile:
  - Accepts ANY field name: `{ [field]: value }`
  - No whitelist of safe fields
  - Could overwrite critical fields (e.g., "id", "etag") corrupting event
  - No type coercion; all values stored as strings
  - Agent could inadvertently set invalid field combinations
- Safe modification: Whitelist allowed fields (summary, description, location, start, end)

**Intl.DateTimeFormat Weekday Calculation:**
- Files: `calendar/calendar.js` (lines 60-72)
- Why fragile:
  - Primary weekday extraction (lines 60-65) returns narrow format then parses as integer (unreliable)
  - Fallback weekday calculation (lines 68-72) is more robust but both paths exist
  - Comment on line 66 indicates awareness of unreliability
  - Weekday calculation is only used in `thisWeekBounds()` which depends on it for week boundary logic
- Impact: Wrong week boundaries could be calculated during DST transitions or on specific node versions
- Test coverage: No tests; behavior not verified cross-platform

## Missing Critical Features

**No Logging/Audit Trail:**
- Problem: No record of what operations were performed, when, or by whom
- Blocks: Cannot debug failed operations; no history for agent troubleshooting
- Impact: When calendar changes unexpectedly, impossible to trace what happened
- Fix approach: Add JSON event log file or logging library with timestamps

**No Dry-Run Mode:**
- Problem: No way to preview changes before applying them
- Blocks: Dangerous for agent operations (typos apply immediately)
- Fix approach: Add `--dry-run` flag to create/update/delete commands

**No Recursive Calendar Search:**
- Problem: Only searches single calendar; no way to search across multiple calendars
- Blocks: Multi-person households cannot search family member calendars
- Impact: Limited usefulness for household assistant scenario
- Fix approach: Add parameter to accept array of calendar IDs

**No Recurring Event Support:**
- Problem: CLI creates one-off events only; cannot create recurring events (daily standup, weekly meeting)
- Blocks: Common household use case (chores, family events) cannot be automated
- Impact: Agent must create separate events for each occurrence
- Fix approach: Add `--recurrence` parameter with RFC 5545 format support

## Test Coverage Gaps

**No Automated Tests Exist:**
- What's not tested: All functions (timezone conversion, API integration, CLI parsing)
- Files: No test directory or test files found
- Risk: Any refactoring could silently break timezone logic; API errors not caught; edge cases unknown
- Priority: High — timezone logic is fragile and untested; should have DST test cases
- Recommended test cases:
  - DST transitions (spring forward, fall back in Pacific time)
  - Midnight boundary cases (today vs tomorrow calculation)
  - Week boundary edge cases (Sunday, Monday transitions)
  - All-day vs timed event formatting
  - Invalid date inputs

**No Integration Tests:**
- Risk: Cannot verify actual Google Calendar API interactions work end-to-end
- Cannot catch auth failures or permission issues before agent uses code
- Blocks verification of setup process

## Dependencies at Risk

**googleapis Library Version:**
- Risk: googleapis@^134.0.0 is pinned broadly; major version updates could have breaking changes
- Impact: If Google deprecates v3 API or changes auth patterns, code breaks without warning
- Migration plan: Monitor googleapis releases; test v135+ before auto-update

**No Other Dependencies:**
- Minimal dependency footprint is good but leaves timezone handling fragile (see Fragile Areas)

## Known Limitations

**Time Zone Limitations:**
- System assumes single Pacific timezone (`America/Los_Angeles`)
- Hardcoded in AGENT_INSTRUCTIONS.md line 6; config.json timezone field not used by calendar.js
- Cannot support multi-timezone households (e.g., family in different zones)
- Workaround: Agent must convert times or use UTC

**Configuration Limitations:**
- No support for environment variables
- Config stored in plaintext JSON in working directory
- Cannot reload config without restarting process
- Cannot support multiple calendars without creating separate directories

**API Rate Limits Not Handled:**
- No backoff or retry logic for rate-limited requests
- Agent calling this repeatedly will hit quotas hard
- No indication to agent that limits were hit

---

*Concerns audit: 2026-02-09*
