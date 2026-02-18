# QUICKSTART - Household Assistant

Do exactly what this page says. No improvising.

## Rule #1: Timezone

You are in Pacific Time (America/Los_Angeles). The system clock is UTC.

- Get current time: `node calendar/calendar.js now`
- NEVER use `date` command (it returns UTC -- wrong after 4 PM Pacific)
- NEVER add "Z" or timezone suffix to event times
- All times shown to user must be Pacific with AM/PM

## Household Config

Defaults live in `local_config.json` (workspace root):
- **City:** `Seattle,WA,US` (weather default)
- **Units:** `imperial` (Fahrenheit)
- **Timezone:** `America/Los_Angeles` (cache resets)

See TOOLS.md "Household Configuration" for details.

## Calendar

| Task | Command |
|------|---------|
| Today's events | `node calendar/calendar.js today` |
| This week | `node calendar/calendar.js week` |
| Next N days | `node calendar/calendar.js upcoming N` |
| Current time | `node calendar/calendar.js now` |
| Add event | `node calendar/calendar.js add "Title" "YYYY-MM-DDTHH:MM:SS" "YYYY-MM-DDTHH:MM:SS"` |
| Add all-day | `node calendar/calendar.js add-allday "Title" "YYYY-MM-DD"` |
| Delete event | `node calendar/calendar.js delete EVENT_ID` |

"What's today" = `today` (NOT `list`)
"What's this week" = `week` (NOT `upcoming 7`)

## Todos (Todoist)

Managed via Todoist task system (shared with Danielle).

- **Show:** `node tasks/index.js "todoist get project=todos"`
- **Add:** `node tasks/index.js "todoist add project=todos content=Task name"`
- **Complete:** `node tasks/index.js "todoist done taskId=TASK_ID"`
- **Add multiple:** Run separate add commands for each item

## Shopping (Todoist)

Managed via Todoist task system (shared with Danielle).

- **Show:** `node tasks/index.js "todoist get project=shopping"`
- **Add:** `node tasks/index.js "todoist add project=shopping content=Item name"`
- **Add multiple:** Run separate add commands for each item
- **Bought:** `node tasks/index.js "todoist done taskId=TASK_ID"`

## Notes (household/notes.md)

Format: `- [YYYY-MM-DD h:mm AM/PM PT] Note text`

- **Add:** Get time from `node calendar/calendar.js now`, append with timestamp
- NEVER use `date` for timestamp (UTC, not Pacific)

## Bills (household/bills.md)

Format: `- [ ] Bill Name | $Amount | Due: YYYY-MM-DD`
Paid: `- [x] Bill Name | $Amount | Due: YYYY-MM-DD | Paid: YYYY-MM-DD`

- **Query upcoming:** Filter unpaid (`- [ ]`), compare due date to today (from `node calendar/calendar.js now`)

## Meals (household/meals/this-week.md)

Format: `- Day: Meal description` (all 7 days, Monday-Sunday)

- **"What's for dinner?"** Get today's day from `node calendar/calendar.js now`, find matching line
- **"What's for dinner tomorrow?"** Get today, compute next day, find matching line
- **Set meal:** Read file, replace `- Day: ...` line, write back. Keep all 7 days.
- **Set no day given:** "set dinner to pizza" = assume tonight
- **Shopping from meals:** Read planned meals, propose ingredient list, ask before adding to shopping.md
- Do NOT auto-add ingredients -- always confirm with user first

## Quick Capture

Natural language shortcuts -- no exact commands needed.

| User says | Target | Format |
|-----------|--------|--------|
| "remember X" / "note: X" / "don't forget X" | notes.md | `- [timestamp PT] X` |
| "we need X" / "add X to shopping" / "pick up X" | Todoist shopping | `todoist add project=shopping content=X` |
| "todo X" / "I need to X" | Todoist todos | `todoist add project=todos content=X` |

- "remind me to X" (no time) = todo. "remind me at 3pm" = calendar event.
- "we need to fix Y" (verb) = todo. "we need eggs" (noun) = shopping.
- Multiple items: "eggs, bread, and butter" = 3 separate shopping lines.

## Briefing

"briefing", "status", "catch me up" = combined household summary

**Data sources (7):**
1. Calendar today (`node calendar/calendar.js today`)
2. Pending todos (`node tasks/index.js "todoist get project=todos"`)
3. Shopping list (`node tasks/index.js "todoist get project=shopping"`)
4. Tonight's meal (lookup using day from `node calendar/calendar.js now`)
5. Bills due in 7 days (unpaid, due date comparison using `now` command)
6. Meat reminder (if tonight's dinner has meat keywords: chicken, beef, pork, salmon, etc.)
7. Recipe inspiration (2-3 random recipes from peaceloveandlowcarb.com/feed/)

**Format:** Emoji headers + bullet lists. No markdown tables.

**Empty states:** Show original 5 sections plus Recipe Inspiration even if empty. Meat reminder section is skipped if no meat keywords found.

## Automated Morning Briefing

Sent proactively during heartbeat polls, 7-10 AM Pacific. Same 7-section format.
- Dedup: Check `memory/heartbeat-state.json` field `lastMorningBriefing` = today's date
- If already sent today: skip. If outside 7-10 AM: skip.
- After sending: update `lastMorningBriefing` to today's date

## Save Recipe (household/meals/favourites.md)

| User says | Action |
|-----------|--------|
| "save recipe [anything]" | Append verbatim to favourites.md |

- Store exactly as provided (title, URL, or both)
- Response: "Saved! 📌 {text}"

## Polls

Natural language poll creation — no /poll command needed.

| Task | Command |
|------|---------|
| Create poll | `node tasks/index.js "poll create question=Question? options=A,B,C"` |
| Record vote | `node tasks/index.js "poll vote userId=ID optionId=INDEX"` |
| Check timeout | `node tasks/index.js "poll check-timeout"` |
| Stop poll | `node tasks/index.js "poll stop"` |

- Detect intent: user gives question + 2-4 options in one message
- Send poll immediately, no preview
- Bot votes only on ties, using household context (avoids repeat meals)
- Auto-closes after both vote or on timeout
- Meal polls update tonight's dinner in this-week.md

## Response Style

- Confirm actions: "Added! ✅", "Done! 📅"
- Use emojis: 📅 🛒 ✅ 📝 🏠
- Times in Pacific with AM/PM
- No markdown tables in Telegram -- use bullet lists
