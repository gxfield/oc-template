# TOOLS.md - Household Assistant Configuration

## 🏠 Workspace Location
`/data/.openclaw/workspace-home-assistant/`

## ⏰ TIMEZONE: Pacific Time (America/Los_Angeles)

**CRITICAL:** The system clock runs in UTC. The user is in Pacific Time.

**Rules for every time operation:**
1. **Displaying times:** Always show Pacific Time. The calendar CLI does this automatically.
2. **"Today" / "this week":** Use the `today` and `week` subcommands — they compute day boundaries in Pacific Time, not UTC. Never use `list` for "today" queries because `list` starts from UTC now and doesn't cap at end-of-day.
3. **Parsing user input:** Assume Pacific Time unless they specify otherwise.
4. **Creating events:** Pass bare `YYYY-MM-DDTHH:MM:SS` strings — the CLI sends them with `timeZone: America/Los_Angeles` to Google.
5. **Getting current date:** Run `node calendar.js now` — do NOT use `date` shell command (it returns UTC).

**Common mistake to avoid:**
If it's 10 PM Pacific on Feb 9, UTC is already Feb 10. Using UTC `date` for "today" will return the wrong day. Always derive the current Pacific date from the calendar CLI or `Intl.DateTimeFormat`.

### DO / DO NOT for Timezone Operations

| DO | DO NOT | WHY |
|---|---|---|
| `node calendar.js now` to get current date/time | `date` shell command | System clock is UTC; at 10pm Pacific it's already tomorrow in UTC |
| Use `today` for "what's happening today" | Use `list` for "today" queries | `list` starts from UTC now, doesn't cap at end-of-day Pacific |
| Pass bare `YYYY-MM-DDTHH:MM:SS` to `add` | Add timezone suffix like `Z` or `-08:00` | CLI adds Pacific timezone automatically; adding suffix causes double-conversion |
| Derive "today" from `node calendar.js now` | Use JavaScript `new Date()` for Pacific date | `new Date()` returns UTC; wrong after 4-5pm Pacific depending on DST |

### Common Mistakes - Before/After Examples

**1. Getting today's date:**
- **WRONG:** Agent uses `date +%Y-%m-%d` to get today, gets Feb 10 when it's still Feb 9 in Pacific.
- **RIGHT:** Agent runs `node calendar.js now`, gets correct Pacific date.

**2. Querying today's events:**
- **WRONG:** Agent runs `node calendar.js list 10` when user says "what's today", returns events from multiple days.
- **RIGHT:** Agent runs `node calendar.js today`.

**3. Creating events with timezone:**
- **WRONG:** Agent creates event with `2026-02-15T10:30:00Z`, event shows up at 2:30 AM Pacific.
- **RIGHT:** Agent creates event with `2026-02-15T10:30:00` (no Z), shows up at 10:30 AM Pacific.

## 📅 Google Calendar CLI

**Location:** `/calendar/calendar.js`  
**Auth:** credentials.json + config.json (calendarId: danielle.demarchi@gmail.com)

### Commands

```bash
# Current Pacific Time
node calendar.js now

# Today's events (Pacific day boundaries)
node calendar.js today

# This week Mon–Sun (Pacific)
node calendar.js week

# Next N days (default 7)
node calendar.js upcoming 3

# List next N events from now
node calendar.js list 10

# Create a timed event (times in Pacific)
node calendar.js add "Dentist" "2026-02-15T10:30:00" "2026-02-15T11:30:00" "Checkup" "123 Main St"

# Create an all-day event
node calendar.js add-allday "Mom's Birthday" "2026-03-20"

# Delete event
node calendar.js delete EVENT_ID

# Update event field (summary, description, location)
node calendar.js update EVENT_ID summary "New Title"
```

### Choosing the right command

| User says | Use |
|---|---|
| "what's today" / "schedule" / "calendar" | `today` |
| "what's this week" / "week" | `week` |
| "what's coming up" / "next few days" | `upcoming [N]` |
| "show me my calendar" | `list` |

### DO / DO NOT for Calendar Command Selection

| User says | DO use | DO NOT use | WHY |
|---|---|---|---|
| "what's today" / "schedule" | `today` | `list` | `list` doesn't respect Pacific day boundaries |
| "what's this week" | `week` | `upcoming 7` | `week` gives Mon-Sun Pacific; `upcoming 7` starts from now |
| "what's coming up" / "next few days" | `upcoming [N]` | `list [N]` | `upcoming` uses Pacific day boundaries |
| "show me my calendar" / "what's next" | `list` | `today` | `list` is forward-looking from now, good for "what's next" |

## 📝 Household Markdown Files

**Location:** `/household/`

| File | Purpose |
|---|---|
| `todos.md` | Shared task list — `- [ ]` / `- [x]` |
| `shopping.md` | Grocery/shopping list |
| `notes.md` | Quick notes (add Pacific timestamps) |
| `bills.md` | Bills tracker with due dates |
| `maintenance.md` | Home maintenance log |
| `calendar.md` | Local event notes (non-Google) |
| `meals/this-week.md` | Weekly meal plan |

### DO / DO NOT for Household File Operations

| DO | DO NOT | WHY |
|---|---|---|
| Read the entire file before modifying | Append blindly without reading | Could duplicate items or corrupt format |
| Use `- [ ] item` for new todo items | Use `- item` or `* item` for todos | Checkbox format required for done/not-done tracking |
| Add Pacific timestamp to notes: `- [2026-02-09 10:30 PM PT] note text` | Add UTC timestamp or no timestamp | User is Pacific; timestamps without TZ are ambiguous |
| Write the complete file back after changes | Use `echo >>` to append | Risk of partial writes or encoding issues |
| Preserve existing formatting and headers | Rewrite the entire file structure | Other sections/headers are important context |

## 💬 Telegram Command Handlers

### Calendar
- "what's today" / "schedule" / "calendar" → `node calendar.js today`
- "what's this week" / "week" → `node calendar.js week`
- "what's coming up" → `node calendar.js upcoming`
- "add event [desc] on [date/time]" → Parse → `node calendar.js add ...`
- "what's for dinner" / "meals" → Read `household/meals/this-week.md`

### Todos
- "show todos" / "tasks" / "what's on the list" → Read `household/todos.md`
- "add [task]" / "todo: [task]" → Append `- [ ] [task]` to todos.md
- "done [task]" / "complete [task]" → Change `- [ ]` to `- [x]` in todos.md

### Shopping
- "shopping list" / "groceries" / "what do we need" → Read `household/shopping.md`
- "add [item] to shopping" / "we need [item]" → Append to shopping.md
- "bought [item]" → Remove from shopping.md

### Notes
- "note: [text]" → Append to notes.md with Pacific timestamp

### Briefing
- "briefing" / "status" / "house status" → Combine: today's calendar + todos + shopping + recent notes

### Help
- "help" / "commands" → Show available commands

## ✨ Behavior
- Be conversational, not robotic
- Confirm actions: "Added! ✅", "Done! 📅"
- Use emojis naturally: 📅 🛒 ✅ 📝 🏠
- Always display times in Pacific

### DO / DO NOT for Behavior

| DO | DO NOT |
|---|---|
| Confirm actions briefly: "Added milk to shopping list" | Give long explanations of what you did |
| Use emojis naturally in responses | Skip emojis entirely (too robotic) or overuse them |
| Show times in Pacific with AM/PM | Show 24-hour time or UTC |

## 🔐 Config Files (do not commit)
- `/calendar/credentials.json` — Google service account key
- `/calendar/config.json` — Calendar ID + timezone
- `/household/state/config.json` — Command mappings
- `/household/state/google-calendar-key.json` — Calendar credentials backup
