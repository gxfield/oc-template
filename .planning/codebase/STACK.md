# Technology Stack

**Analysis Date:** 2026-02-09

## Languages

**Primary:**
- JavaScript (Node.js) - All application logic and CLI tools

## Runtime

**Environment:**
- Node.js - Minimum version 14 (per agent-base dependency constraints)

**Package Manager:**
- npm - Version 3 lockfile format (lockfileVersion: 3)
- Lockfile: Present (`package-lock.json`)

## Frameworks

**Core:**
- googleapis (v134.0.0) - Google APIs client library for Node.js
  - Purpose: Interact with Google Calendar API v3
  - Provides: Authentication, calendar event CRUD operations

**Build/Dev:**
- No build tool (runs directly with Node.js)

## Key Dependencies

**Critical:**
- googleapis (v134.0.0) - Why it matters:
  - Enables all Google Calendar integration functionality
  - Handles OAuth2/service account authentication
  - Provides Calendar API client methods (list, insert, update, delete events)
  - Transitively depends on: agent-base, google-auth-library, gaxios, google-gax

**Infrastructure/Support:**
- google-auth-library - Service account authentication
- gaxios - HTTP client for API calls
- google-gax - Google API extensions library
- agent-base (v7.1.4) - HTTP/HTTPS agent infrastructure
- Various utility libraries: base64-js, bignumber.js, buffer-equal-constant-time

## Configuration

**Environment:**
- Service account credentials via `credentials.json` (Google Cloud service account JSON)
- Configuration file: `config.json` contains:
  - `calendarId` - Target Google Calendar ID
  - `timeZone` - User's timezone (default: America/Los_Angeles or as configured)

**Build:**
- No build process - scripts run directly with `node` command
- Entry points:
  - `calendar.js` - Main calendar interaction CLI
  - `setup.js` - Interactive setup wizard for initial configuration

## Platform Requirements

**Development:**
- Node.js >= 14
- npm (or compatible package manager)
- Access to Google Calendar and Google Cloud Console
- Service account credentials (JSON file)

**Production:**
- Node.js >= 14 runtime
- Read access to `credentials.json` and `config.json`
- Network access to Google Calendar API endpoints
- Valid service account with Calendar API access

## API Integration

**Google Calendar API:**
- Version: v3
- Authentication: Service account (via GoogleAuth with private key)
- Scope: `https://www.googleapis.com/auth/calendar`
- Operations: list events, insert event, update event, delete event

## Execution

**Commands:**
- `npm run list` - Node.js script to list calendar events
- `npm run add` - Node.js script to add calendar event
- Direct execution: `node calendar.js [command]`
- Setup: `node setup.js`

---

*Stack analysis: 2026-02-09*
