# External Integrations

**Analysis Date:** 2026-02-09

## APIs & External Services

**Google Calendar:**
- Google Calendar API v3 - Full calendar event management (CRUD operations)
  - SDK/Client: googleapis package (v134.0.0)
  - Auth: Service account with private key from Google Cloud
  - Endpoints used:
    - `calendar.events.list()` - List events in specified time range
    - `calendar.events.insert()` - Create new event
    - `calendar.events.update()` - Modify existing event
    - `calendar.events.delete()` - Remove event
    - `calendar.events.get()` - Fetch single event details

## Data Storage

**Databases:**
- Not used - No persistent database

**File Storage:**
- Local filesystem only
  - `credentials.json` - Service account credentials (required)
  - `config.json` - Configuration file with calendar ID and timezone settings
  - Event data stored only in Google Calendar, not locally

**Caching:**
- None - Real-time queries to Google Calendar

## Authentication & Identity

**Auth Provider:**
- Google Cloud - Service Account authentication
  - Implementation:
    - Service account JSON file (`credentials.json`)
    - Private key-based authentication via google-auth-library
    - OAuth2 flow handled by googleapis library
    - Scope: `https://www.googleapis.com/auth/calendar`
    - No user login required - application authentication only
  - Location: `getAuthClient()` function in `calendar.js` (lines 28-39)

## Monitoring & Observability

**Error Tracking:**
- Not configured - Built-in error messages logged to console

**Logs:**
- Console output only (stdout/stderr)
- Error messages prefixed with emoji indicators (❌ for errors, ✅ for success)
- No persistent logging or log aggregation

## CI/CD & Deployment

**Hosting:**
- Self-hosted - Runs on any Node.js environment
- Not containerized - Direct Node.js execution
- Integration point: Designed to be called from OpenClaw agent via exec tool

**CI Pipeline:**
- None detected - No automated build or deployment pipeline

## Environment Configuration

**Required env vars:**
- None - Configuration via files instead:
  - `credentials.json` - Service account credentials (REQUIRED)
  - `config.json` - Calendar ID and timezone (REQUIRED, created by setup.js)

**Secrets location:**
- `credentials.json` - Contains Google service account private key and credentials
  - Must be in project root directory
  - NOT committed to git (security-sensitive)
  - Generated via Google Cloud Console → Service Accounts → Keys
  - In JSON format with fields:
    - `client_email` - Service account email
    - `private_key` - RSA private key for signing

**File structure:**
```
calendar/
├── credentials.json    # SECRET - Service account credentials (created manually)
├── config.json        # Configuration file with calendarId and timeZone
├── calendar.js        # Main application
├── setup.js          # Setup wizard
├── package.json      # Dependencies
└── README.md         # Documentation
```

## Webhooks & Callbacks

**Incoming:**
- None - Pull-based only (queries Google Calendar on demand)

**Outgoing:**
- None - No event callbacks or webhooks implemented

## Integration Points

**From OpenClaw Agent:**
- Scripts can be executed via exec tool using command line invocation
  - List events: `cd workspace-home-assistant && node calendar.js list 10`
  - Create event: `cd workspace-home-assistant && node calendar.js add "Event" "2024-02-09T14:00:00" "2024-02-09T15:00:00" "Desc"`
  - Detailed examples in `README.md` (lines 168-182)

## Authentication Flow

1. **Initial Setup:**
   - User creates service account in Google Cloud Console
   - Downloads JSON credentials file → placed as `credentials.json`
   - Shares target calendar with service account email
   - Runs `node setup.js` to configure calendar ID and timezone
   - Configuration saved to `config.json`

2. **Runtime Authentication:**
   - `getAuthClient()` reads `credentials.json`
   - Creates GoogleAuth instance with service account credentials
   - Uses private key to obtain access tokens
   - Authenticates all subsequent API calls

3. **Authorization:**
   - Service account must have "Make changes to events" permission on target calendar
   - Permission granted by calendar owner sharing the calendar

## Rate Limiting & Quotas

**Google Calendar API:**
- Subject to Google Cloud API quotas
- Default quotas:
  - 1 million requests per day per project
  - 100 requests per 100 seconds per user
- No client-side rate limiting implemented in codebase

---

*Integration audit: 2026-02-09*
