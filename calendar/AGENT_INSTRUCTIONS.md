# Calendar Agent Instructions

## Setup (already done)
Dependencies installed, credentials.json and config.json in place.  
Calendar ID: `danielle.demarchi@gmail.com`  
Timezone: `America/Los_Angeles` (Pacific Time)

## ⏰ CRITICAL: Timezone

The system clock is UTC. The user is in Pacific Time. The calendar.js CLI handles all timezone conversion internally:
- `today` and `week` compute day boundaries in Pacific Time
- `add` interprets times as Pacific Time
- All output is formatted in Pacific Time

**Never use the shell `date` command for "what day is it" — it returns UTC which can be wrong after 4 PM Pacific.**

Use `node calendar.js now` to get the current Pacific Time.

## Using the CLI

```bash
CD=/data/.openclaw/workspace-home-assistant/calendar

# What time is it in Pacific?
node $CD/calendar.js now

# Today's events (Pacific day, midnight to midnight)
node $CD/calendar.js today

# This week (Mon–Sun, Pacific)
node $CD/calendar.js week

# Next N days
node $CD/calendar.js upcoming 3

# List next N events from now
node $CD/calendar.js list 10

# Add timed event (times are Pacific)
node $CD/calendar.js add "Dentist" "2026-02-15T10:30:00" "2026-02-15T11:30:00" "Checkup" "123 Main St"

# Add all-day event
node $CD/calendar.js add-allday "Mom's Birthday" "2026-03-20" "Don't forget flowers"

# Delete
node $CD/calendar.js delete EVENT_ID

# Update (fields: summary, description, location)
node $CD/calendar.js update EVENT_ID summary "New Title"
```

## Common Issues

| Problem | Fix |
|---|---|
| credentials.json not found | User needs to place service account JSON |
| config.json not found | Run `node setup.js` |
| 403 Forbidden | Calendar not shared with service account email |
| Events show wrong day | You used UTC date instead of `today` command |
| "No events" but user has events | Wrong Calendar ID in config.json |

## File Structure

```
calendar/
├── calendar.js          ← Main CLI (list/today/week/add/delete/update)
├── setup.js             ← One-time setup
├── credentials.json     ← Google service account key (secret)
├── config.json          ← Calendar ID + timezone
├── AGENT_INSTRUCTIONS.md ← This file
└── node_modules/        ← Dependencies
```
