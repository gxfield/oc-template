# HEARTBEAT.md

## Poll Timeout Check

- **Poll timeout:** Run `node tasks/index.js "poll check-timeout"`. If a poll has timed out, it auto-resolves and announces the result. Log the outcome in daily memory if a poll was resolved.

## Morning Briefing (7-10 AM Pacific)

Check if it's between 7:00 AM and 10:00 AM Pacific time using `node calendar/calendar.js now`.

If YES and `memory/heartbeat-state.json` field `lastMorningBriefing` is NOT today's date:
1. Run the full briefing (all 7 sections from TOOLS.md Briefing section)
2. Send the briefing to the user
3. Update `memory/heartbeat-state.json`: set `lastMorningBriefing` to today's Pacific date (YYYY-MM-DD format)

If already sent today (lastMorningBriefing = today's date): Skip, reply HEARTBEAT_OK.
If outside 7-10 AM Pacific window: Skip this task, continue with other heartbeat checks.

### DO / DO NOT

| DO | DO NOT | WHY |
|---|---|---|
| Check time from `node calendar/calendar.js now` | Use `date` command for time check | System clock is UTC |
| Read `memory/heartbeat-state.json` for dedup | Send briefing every heartbeat | Would spam user multiple times per morning |
| Create `memory/heartbeat-state.json` if it doesn't exist | Crash if file is missing | First run won't have the file yet |
| Send the full 7-section briefing | Send a shortened version | Morning briefing should be comprehensive |
