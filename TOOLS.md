# TOOLS.md - Household Assistant Configuration

> **Quick reference:** See `QUICKSTART.md` for a condensed single-page command reference.

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

**Parsing Examples:**

**Input:** "what's today"
**Action:** `node calendar.js today`
**Response format:** List events with time, title. If none: "Nothing on the calendar today!"

**Input:** "add event dentist tomorrow at 2pm"
**Parse:** event="dentist", date=tomorrow's date, time=14:00
**Action:** `node calendar.js add "dentist" "YYYY-MM-DDT14:00:00" "YYYY-MM-DDT15:00:00"`
**Note:** Default duration 1 hour if no end time given. Get tomorrow's date from `node calendar.js now`, NOT from `date`.

**Input:** "add event dinner with mom friday 6-8pm"
**Parse:** event="dinner with mom", date=next Friday, start=18:00, end=20:00
**Action:** `node calendar.js add "dinner with mom" "YYYY-MM-DDT18:00:00" "YYYY-MM-DDT20:00:00"`

**Input:** "what's for dinner" / "meals"
**Action:** Read `household/meals/this-week.md`
**Response format:** Show today's meal plan entry

### Todos

**Parsing Examples:**

**Input:** "add fix the fence" / "todo fix the fence"
**Action:** Read household/todos.md, append "- [ ] Fix the fence", write file back
**Response:** "Added! ✅ Fix the fence"

**Input:** "done fix the fence"
**Action:** Read household/todos.md, find line matching "fix the fence" (case-insensitive), change "- [ ]" to "- [x]", write file back
**Response:** "Done! ✅ Fix the fence"
**Edge case:** If no match found, respond "I couldn't find that task. Here's what's on the list: ..."

**Input:** "show todos"
**Action:** Read household/todos.md, format incomplete items for Telegram (no markdown tables)
**Response:** List items with checkboxes rendered as emoji (unchecked: ◻️, checked: ✅)

### Shopping

**Parsing Examples:**

**Input:** "add milk to shopping"
**Action:** Read household/shopping.md, append "- Milk", write file back
**Response:** "Added milk to the shopping list! 🛒"

**Input:** "we need eggs, bread, and butter"
**Action:** Read household/shopping.md, append three separate lines: "- Eggs", "- Bread", "- Butter"
**Response:** "Added 3 items to shopping! 🛒 Eggs, Bread, Butter"
**Edge case:** Parse comma-separated AND "and"-separated lists into individual items.

**Input:** "bought milk"
**Action:** Read household/shopping.md, find line matching "milk" (case-insensitive), remove that line, write file back
**Response:** "Crossed off milk! 🛒"
**Edge case:** If "milk" appears in multiple lines (e.g., "Milk" and "Almond milk"), ask which one.

### Notes

**Parsing Examples:**

**Input:** "note: plumber's number is 555-1234"
**Action:** Read household/notes.md, append "- [2026-02-09 10:30 PM PT] Plumber's number is 555-1234", write file back
**Note:** Get current Pacific time from `node calendar.js now` for the timestamp. Format: YYYY-MM-DD h:mm AM/PM PT

**Input:** "remember that the wifi password is fish1234"
**Action:** Same as "note:" -- treat "remember" as a note trigger

### Briefing

Briefing provides a comprehensive household summary combining calendar, todos, shopping, meals, and bills. The output is formatted for Telegram (emoji headers, bullet lists, no markdown tables).

#### Trigger Phrase Table

| Trigger Pattern | Action |
|---|---|
| "briefing", "morning briefing", "evening briefing" | Full household briefing |
| "status", "house status", "household status" | Full household briefing |
| "what's going on", "catch me up", "what did I miss" | Full household briefing |

#### Data Assembly Steps

The agent must gather data from these 5 sources in order:

1. **Calendar:** Run `node calendar/calendar.js today` to get today's events
2. **Todos:** Read `household/todos.md`, extract incomplete items (lines with `- [ ]`)
3. **Shopping:** Read `household/shopping.md`, extract all items
4. **Meals:** Get today's day name from `node calendar/calendar.js now`, read `household/meals/this-week.md`, find matching day line
5. **Bills:** Read `household/bills.md`, extract unpaid bills (`- [ ]` lines), filter to those with due date within next 7 days (compare to today's Pacific date from `node calendar/calendar.js now`)

#### Output Format Template (Telegram-friendly)

The output must use emoji headers and bullet lists -- NO markdown tables. Template:

```
Here's your briefing for {Day, Month Date}:

📅 Calendar
{If events: bullet list of events with times}
{If no events: "Nothing on the calendar today!"}

✅ Todos ({count} pending)
{Bullet list of incomplete items}
{If none: "All clear!"}

🛒 Shopping List ({count} items)
{Bullet list of items}
{If none: "Shopping list is empty!"}

🍽️ Tonight's Dinner
{Meal from this-week.md}
{If "No plan": "No dinner planned. Want me to set something?"}

💰 Bills Due Soon
{Bullet list of unpaid bills due within 7 days with amount and due date}
{If none: "No bills due this week!"}
```

#### Input/Output Examples

**Example 1 - Full briefing with data:**

**Input:** "morning briefing"
**Action:** Run `node calendar/calendar.js today`, read todos.md/shopping.md/this-week.md/bills.md, assemble output
**Response:**
```
Here's your briefing for Sunday, February 9:

📅 Calendar
• 10:00 AM - Brunch with Sarah
• 3:00 PM - Grocery shopping

✅ Todos (3 pending)
• Fix the kitchen faucet
• Replace air filter in HVAC
• Organize garage shelves

🛒 Shopping List (5 items)
• Whole milk
• Bananas
• Chicken breast
• Pasta
• Olive oil

🍽️ Tonight's Dinner
Leftover buffet

💰 Bills Due Soon
• Electric Bill: $145.00 due Feb 15
• Water Bill: $62.50 due Feb 20
```

**Example 2 - Briefing with empty sections:**

**Input:** "status"
**Action:** Same data gathering steps
**Response:**
```
Here's your briefing for Monday, February 10:

📅 Calendar
Nothing on the calendar today!

✅ Todos (0 pending)
All clear!

🛒 Shopping List (0 items)
Shopping list is empty!

🍽️ Tonight's Dinner
No dinner planned. Want me to set something?

💰 Bills Due Soon
No bills due this week!
```

#### DO / DO NOT for Briefing

| DO | DO NOT | WHY |
|---|---|---|
| Use `node calendar/calendar.js today` for calendar events | Use `list` or `upcoming` | `today` gives correct Pacific day boundaries |
| Get today's date from `node calendar/calendar.js now` for bill date comparison | Use `date` command | System clock is UTC |
| Use bullet lists with emoji headers | Use markdown tables | Telegram doesn't render markdown tables |
| Show all 5 sections even if empty | Skip empty sections | User expects consistent format |
| Show bill amounts and due dates | Show only bill names | User needs to know how much and when |

#### Edge Cases

- **"morning briefing" vs "evening briefing":** Same content (no time-based variation for v1)
- **Bills due today:** Include in "Bills Due Soon" (today counts as within 7 days)
- **No data in any source:** Still show all 5 section headers with empty-state messages

### Help

**Input:** "help" / "commands"
**Action:** Show available commands

---

## Quick Capture

Quick Capture enables natural language triggers for fast note/todo/shopping capture. Instead of requiring exact command syntax, cheap LLMs can recognize conversational patterns and route to the correct file operation.

### Trigger Phrase Table

| Trigger Pattern | Target File | Action |
|---|---|---|
| "remember X", "note: X", "note X", "don't forget X" | `household/notes.md` | Append with Pacific timestamp |
| "add X to shopping", "we need X", "pick up X", "buy X", "X to the shopping list" | `household/shopping.md` | Append as list item (capitalize first letter) |
| "todo X", "todo: X", "I need to X", "remind me to X" (no time) | `household/todos.md` | Append as unchecked task |

### Parsing Rules

**Notes:**
1. Get current Pacific time: `node calendar.js now`
2. Format: `- [YYYY-MM-DD h:mm AM/PM PT] {note text}`
3. Append to `household/notes.md`

**Shopping:**
1. Capitalize first letter of each item
2. Parse commas and "and" into separate items
3. Format: `- {Item name}` (one per line)
4. Append to `household/shopping.md`

**Todos:**
1. Format: `- [ ] {task description}`
2. Append to `household/todos.md`

### Input/Output Examples

**Notes:**

**Input:** "remember the wifi password is fish1234"
**Action:** Read `household/notes.md`, get Pacific time from `node calendar.js now`, append `- [2026-02-09 8:15 PM PT] The wifi password is fish1234`
**Response:** "Noted! 📝"

**Input:** "don't forget to tell mom about the party"
**Action:** Append `- [2026-02-09 8:16 PM PT] Don't forget to tell mom about the party` to notes.md
**Response:** "Got it, I'll remember! 📝"

**Shopping:**

**Input:** "we need eggs and milk"
**Action:** Read `household/shopping.md`, append two lines: `- Eggs` and `- Milk`
**Response:** "Added 2 items to shopping! 🛒 Eggs, Milk"

**Input:** "pick up dog food"
**Action:** Append `- Dog food` to shopping.md
**Response:** "Added dog food to the shopping list! 🛒"

**Todos:**

**Input:** "todo fix the gate"
**Action:** Append `- [ ] Fix the gate` to todos.md
**Response:** "Added! ✅ Fix the gate"

**Input:** "I need to call the dentist"
**Action:** Append `- [ ] Call the dentist` to todos.md
**Response:** "Added! ✅ Call the dentist"

### Disambiguation Rules

When user intent is unclear, apply these rules:

**Time-based disambiguation:**
- **"remind me to X at 3pm"** → Calendar event (has specific time)
- **"remind me to X"** (no time) → Todo item

**Target-based disambiguation:**
- **"add X"** (no target specified) → Default to todo. If X is clearly a food/grocery item (e.g., "add eggs"), ask: "Did you want to add eggs to the shopping list or as a todo?"

**Verb vs noun after "we need":**
- **"we need to fix the fence"** → Todo (verb phrase)
- **"we need milk"** → Shopping (noun/item)

**"buy" context:**
- **"buy concert tickets"** → Todo (event/service)
- **"buy milk"** → Shopping (physical grocery item)

### DO / DO NOT for Quick Capture

| DO | DO NOT | WHY |
|---|---|---|
| Recognize natural language triggers | Ask "which file?" when intent is clear | Users expect natural conversation, not rigid syntax |
| Confirm briefly: "Noted! 📝" or "Added!" | Give detailed explanations | Quick capture should be fast |
| Parse "eggs and milk" into 2 shopping items | Add "eggs and milk" as a single item | User expects separate list items |
| Use `node calendar.js now` for timestamps | Use `date` command or skip timestamps | System clock is UTC; notes need Pacific time |

---

## Meal Planning

Meal Planning handlers enable setting weekly dinner plans, querying tonight's meal, and generating shopping lists from planned meals. The workflow follows the same pattern as Quick Capture: recognize natural language, execute file operations, confirm briefly.

### Trigger Phrase Table

| Trigger Pattern | Action |
|---|---|
| "set Monday to lasagna", "Monday dinner: lasagna" | Update this-week.md for that day |
| "set this week's meals", "meal plan for the week" | Update multiple days in this-week.md |
| "what's for dinner", "what's for dinner tonight", "dinner tonight" | Look up today's meal |
| "what's for dinner tomorrow", "dinner tomorrow" | Look up tomorrow's meal |
| "what are the meals this week", "show meal plan" | Show full week's plan |
| "shopping list from meals", "what do I need for this week's meals" | Generate ingredient list from meal plan |

### Parsing Rules for Setting Meals

1. Get the target day name (must be full: Monday, Tuesday, etc.)
2. Read `household/meals/this-week.md`
3. Find the line starting with `- {Day}:` and replace the meal description
4. Write the complete file back (preserve all 7 days)
5. If user sets multiple days at once, update all specified lines

### Parsing Rules for Querying Meals

- **"tonight" / "today":** Get current day name from `node calendar/calendar.js now`, find matching line in this-week.md
- **"tomorrow":** Get current day name from `node calendar/calendar.js now`, compute next day, find matching line
- **"this week" / "show meals":** Read and display all 7 lines

### Parsing Rules for Shopping List Generation

1. Read all non-"No plan" entries from this-week.md
2. For each meal, the agent should identify likely ingredients based on the meal name
3. Present the ingredient list to the user for confirmation/editing before adding to shopping.md
4. **DO NOT auto-add to shopping.md without confirmation** (meals are vague descriptions, not recipes)
5. Format: show a proposed list, ask "Want me to add these to the shopping list?"

### Input/Output Examples

**Example 1 - Set single day:**

**Input:** "set Thursday dinner to chicken parmesan"
**Action:** Read this-week.md, replace Thursday line with `- Thursday: Chicken parmesan`, write back
**Response:** "Updated! Thursday dinner is now chicken parmesan"

**Example 2 - Query tonight:**

**Input:** "what's for dinner tonight"
**Action:** Run `node calendar/calendar.js now` to get day name (e.g., "Sunday"), read this-week.md, find `- Sunday: Leftover buffet`
**Response:** "Tonight's dinner: Leftover buffet"

**Example 3 - No plan for today:**

**Input:** "what's for dinner"
**Action:** Get day name, find `- Wednesday: No plan`
**Response:** "No dinner planned for tonight. Want me to set something?"

**Example 4 - Set multiple days:**

**Input:** "set meals for the week: Monday tacos, Tuesday pasta, Wednesday salmon"
**Action:** Update three lines in this-week.md, leave other days unchanged
**Response:** "Updated 3 meals! Monday: Tacos, Tuesday: Pasta, Wednesday: Salmon"

**Example 5 - Shopping from meals:**

**Input:** "make a shopping list from this week's meals"
**Action:** Read this-week.md, identify ingredients for each planned meal, present list
**Response:** "Based on this week's meals, here's what you might need: [ingredient list]. Want me to add these to the shopping list?"

**Example 6 - Show full week:**

**Input:** "show the meal plan"
**Action:** Read this-week.md, format all 7 days
**Response:** List all days with meals

### DO / DO NOT for Meal Planning

| DO | DO NOT | WHY |
|---|---|---|
| Get today's day name from `node calendar/calendar.js now` | Use `date` command or guess the day | System clock is UTC; wrong day after 4 PM Pacific |
| Keep all 7 days in the file when updating | Delete unmentioned days | File must always have Mon-Sun entries |
| Ask for confirmation before adding meal ingredients to shopping | Auto-add ingredients to shopping.md | Meal names are vague; "tacos" could mean many different ingredients |
| Use full day names (Monday, Tuesday) | Use abbreviations (Mon, Tue) | Format header requires full day names |
| Capitalize meal description | Leave lowercase | Consistency with file format |

### Edge Cases

- **"what's for dinner" when day is "No plan"** → Suggest setting a meal
- **"set dinner to pizza" with no day specified** → Assume tonight (get from `node calendar/calendar.js now`)
- **"clear Thursday" or "no dinner Thursday"** → Set to "No plan"

---

## Edge Cases for Telegram Command Parsing

### Ambiguous commands

- **"add eggs"** — Is this a todo or shopping item? Default to TODO. If user says "add eggs to shopping" or "we need eggs", then shopping.
- **"milk"** (just a word) — Don't assume intent. Ask: "Did you want to add milk to the shopping list?"
- **"remind me to call mom"** (no time) → Add to todos: `- [ ] Call mom`
- **"remind me to call mom at 3pm"** (has time) → Calendar event, not todo
- **"remember the plumber's number is 555-1234"** → Note (factual info to remember), not todo

### Quick Capture conflicts

These edge cases help distinguish between Quick Capture targets when the trigger phrase is ambiguous:

- **"add eggs"** → Currently defaults to todo. But if user has been adding shopping items in same session, consider asking.
- **"we need to fix the fence"** → Starts with "we need" but is a task, not shopping. **Rule:** If "we need" is followed by a verb (fix, call, clean, etc.), treat as todo. If followed by a noun (eggs, milk, bread), treat as shopping.
- **"buy concert tickets"** → Starts with "buy" but is a task, not shopping. **Rule:** "buy" + event/service = todo. "buy" + physical item = shopping.

### Multi-step requests

- **"add dentist appointment tomorrow at 2pm and remind me to call insurance"** — Handle as TWO actions: calendar add + todo add. Confirm both.

### Missing information

- **"add event tomorrow"** — Missing event name. Ask: "What's the event called?"
- **"add event dentist"** — Missing date/time. Ask: "When is the dentist appointment?"

### Time parsing

- **"2pm"** = 14:00, **"2:30"** = 14:30 (assume PM for 1-6, AM for 7-12 if ambiguous)
- **"tomorrow"** = get today from `node calendar.js now`, add 1 day
- **"friday"** = next upcoming Friday (if today is Friday, means NEXT Friday)
- **"this friday"** = this week's Friday (could be today if today is Friday)

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
