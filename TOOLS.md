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

## Household Configuration (local_config.json)

Central config file for household-specific defaults.

**Location:** `local_config.json` (workspace root)

| Field | Purpose | Default | Used By |
|-------|---------|---------|---------|
| `city` | Default weather location | `Seattle,WA,US` | Weather task |
| `timezone` | Timezone for cache daily reset | `America/Los_Angeles` | Cache module |
| `units` | Temperature units (imperial/metric) | `imperial` | Weather task |

- If file is missing, system uses built-in defaults (listed above)
- Note: Calendar timezone is separate — managed in `calendar/config.json`

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
| `meals/favourites.md` | Saved recipe titles and links |

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

### Todos (Todoist)

Todos are managed via the Todoist task system, not markdown files.

**Parsing Examples:**

**Input:** "add fix the fence" / "todo fix the fence"
**Action:** `node tasks/index.js "todoist add project=todos content=Fix the fence"`
**Response:** "Added! ✅ Fix the fence"

**Input:** "done fix the fence"
**Action:** First get tasks to find ID: `node tasks/index.js "todoist get project=todos"`, then complete: `node tasks/index.js "todoist done taskId=TASK_ID"`
**Response:** "Done! ✅ Fix the fence"
**Edge case:** If no match found, respond "I couldn't find that task. Here's what's on the list: ..."

**Input:** "show todos"
**Action:** `node tasks/index.js "todoist get project=todos"`
**Response:** List items with checkboxes rendered as emoji (unchecked: ◻️, checked: ✅)

### Shopping (Todoist)

Shopping lists are managed via the Todoist task system, not markdown files.

**Parsing Examples:**

**Input:** "add milk to shopping"
**Action:** `node tasks/index.js "todoist add project=shopping content=Milk"`
**Response:** "Added milk to the shopping list! 🛒"

**Input:** "we need eggs, bread, and butter"
**Action:** Run three separate add commands:
  `node tasks/index.js "todoist add project=shopping content=Eggs"`
  `node tasks/index.js "todoist add project=shopping content=Bread"`
  `node tasks/index.js "todoist add project=shopping content=Butter"`
**Response:** "Added 3 items to shopping! 🛒 Eggs, Bread, Butter"
**Edge case:** Parse comma-separated AND "and"-separated lists into individual items.

**Input:** "bought milk"
**Action:** First get tasks to find ID: `node tasks/index.js "todoist get project=shopping"`, then complete: `node tasks/index.js "todoist done taskId=TASK_ID"`
**Response:** "Crossed off milk! 🛒"
**Edge case:** If "milk" appears in multiple tasks (e.g., "Milk" and "Almond milk"), ask which one.

### DO / DO NOT for Shopping

| DO | DO NOT | WHY |
|---|---|---|
| Parse "eggs and milk" into 2 separate add commands | Add "eggs and milk" as a single item | User expects separate list items |
| Ask which task if multiple match "bought milk" | Complete the first match silently | Could mark the wrong item done |
| List sections before adding items to get current section IDs | Hardcode or guess section IDs | Section IDs can change; always get the live list |

#### Grocery Sections

Shopping items can be placed in specific Todoist sections (e.g., Produce, Dairy, Meat, Bakery).

**List sections:** `node tasks/index.js "todoist sections project=shopping"` — always run this first to get current section IDs

**Add item to section:** `node tasks/index.js "todoist add project=shopping content=Milk section_id=SECTION_ID"`

**Workflow:**
1. Run `node tasks/index.js "todoist sections project=shopping"` to get current section IDs
2. Match the item to the best section by name (Produce, Dairy, Meat, etc.)
3. Add the item with `section_id=SECTION_ID`

If no matching section exists, add without `section_id` — item goes to project root and is still valid.

| DO | DO NOT | WHY |
|---|---|---|
| Always list sections first to get current IDs | Hardcode section IDs | Section IDs can change |
| Match item to section by common sense | Guess section IDs | Wrong section is worse than no section |
| Add without section_id if no match | Create new sections | Sections are managed by the user, not the agent |

#### Recipe to Grocery List

**Trigger phrases:** "add ingredients from [recipe]", "grocery list from [recipe]", "shop for [recipe]"

**Workflow:**
1. Find recipe file in `household/meals/recipes/` (match by name, case-insensitive, partial match OK)
2. Read the `## Ingredients` section of the recipe file
3. Extract item names only — strip quantities, units, and preparation notes
4. List Todoist sections: `node tasks/index.js "todoist sections project=shopping"`
5. For each ingredient, match to the best section (Produce, Dairy, Meat, etc.) using common sense. If unsure, add without section.
6. Add each item: `node tasks/index.js "todoist add project=shopping content=ITEM section_id=SECTION_ID"`

**Quantity stripping rules:** Remove leading numbers, fractions, and units from each ingredient line:
- Units to strip: cup, cups, tablespoon, tablespoons, tbsp, tsp, teaspoon, teaspoons, oz, ounce, ounces, lb, pound, pounds, clove, cloves
- Remove trailing preparation phrases after comma: ", beaten", ", diced", ", chopped", ", minced", etc.
- Examples:
  - "4 boneless skinless chicken breasts" → "chicken breasts"
  - "1 cup marinara sauce" → "marinara sauce"
  - "2 eggs, beaten" → "eggs"
  - "2 tablespoons olive oil" → "olive oil"
  - "1/2 cup grated Parmesan cheese" → "Parmesan cheese"

**Example:** Given `chicken-parmesan.md`, extract: chicken breasts, breadcrumbs, Parmesan cheese, eggs, marinara sauce, mozzarella cheese, olive oil, salt, pepper

**Response format:** "Added X ingredients from [recipe name] to the shopping list: [item1, item2, ...]"

| DO | DO NOT | WHY |
|---|---|---|
| Strip quantities and units; keep descriptive item names | Include quantities (user said "just item names") | User wants shopping items, not recipe amounts |
| Skip salt/pepper/oil if user requests "skip pantry staples" | Always add every ingredient without asking | Common pantry items are usually already stocked |
| List sections before adding each item | Hardcode or assume section IDs | IDs may change; always get current list |

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

The agent must gather data from these 7 sources in order:

1. **Calendar:** Run `node calendar/calendar.js today` to get today's events
2. **Todos:** `node tasks/index.js "todoist get project=todos"` to get pending tasks
3. **Shopping:** `node tasks/index.js "todoist get project=shopping"` to get shopping list
4. **Meals:** Get today's day name from `node calendar/calendar.js now`, read `household/meals/this-week.md`, find matching day line
5. **Bills:** Read `household/bills.md`, extract unpaid bills (`- [ ]` lines), filter to those with due date within next 7 days (compare to today's Pacific date from `node calendar/calendar.js now`)
6. **Meat Reminder:** After getting tonight's dinner (step 4), check if the meal description contains any meat keyword: chicken, beef, pork, salmon, steak, turkey, lamb, fish, shrimp. Case-insensitive match. If match found, include meat reminder section. If no match or no dinner planned ("No plan"), skip entirely.
7. **Recipe Inspiration:** Fetch RSS feed from `https://peaceloveandlowcarb.com/feed/`, filter to dinner-appropriate recipes only, then pick 2-3 random entries (title + link). **Dinner filter:** Exclude entries whose title contains breakfast, snack, dessert, cookie, cake, muffin, smoothie, pancake, waffle, brownie, bar, treat, candy, fudge, dip, appetizer, drink, cocktail, latte (case-insensitive). Include everything else — the feed is primarily low-carb dinner recipes, so filtering out non-dinner keywords is sufficient. If fewer than 2 entries remain after filtering, show what's available.

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

🥩 Dinner Prep
Tonight's dinner is {meal} — don't forget to take meat out of the freezer!
{This section ONLY appears if meat keyword found in tonight's dinner. Skip entirely otherwise.}

🍳 Recipe Inspiration
• {Recipe Title} — {URL}
• {Recipe Title} — {URL}
{Always show this section. Pick 2-3 random dinner recipes from the RSS feed (exclude breakfast, snack, dessert items).}
```

#### Input/Output Examples

**Example 1 - Full briefing with data:**

**Input:** "morning briefing"
**Action:** Run `node calendar/calendar.js today`, read todos.md/shopping.md/this-week.md/bills.md, fetch RSS feed, assemble output
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
Grilled salmon with asparagus

💰 Bills Due Soon
• Electric Bill: $145.00 due Feb 15
• Water Bill: $62.50 due Feb 20

🥩 Dinner Prep
Tonight's dinner is Grilled salmon with asparagus — don't forget to take meat out of the freezer!

🍳 Recipe Inspiration
• Keto Garlic Butter Chicken — https://peaceloveandlowcarb.com/garlic-butter-chicken/
• Low Carb Beef Stroganoff — https://peaceloveandlowcarb.com/beef-stroganoff/
• Crispy Pork Chops — https://peaceloveandlowcarb.com/pork-chops/
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

🍳 Recipe Inspiration
• Keto Chicken Parmesan — https://peaceloveandlowcarb.com/chicken-parmesan/
• Cauliflower Mac and Cheese — https://peaceloveandlowcarb.com/cauliflower-mac/
```

#### DO / DO NOT for Briefing

| DO | DO NOT | WHY |
|---|---|---|
| Use `node calendar/calendar.js today` for calendar events | Use `list` or `upcoming` | `today` gives correct Pacific day boundaries |
| Get today's date from `node calendar/calendar.js now` for bill date comparison | Use `date` command | System clock is UTC |
| Use bullet lists with emoji headers | Use markdown tables | Telegram doesn't render markdown tables |
| Show the original 5 sections plus Recipe Inspiration even if empty | Skip empty sections | User expects consistent format |
| Show bill amounts and due dates | Show only bill names | User needs to know how much and when |
| Check meat keywords case-insensitively against tonight's dinner description | Try to infer meat from meal names like "leftover" or "stir fry" without explicit keywords | Simple keyword match is reliable for cheap LLMs; inference is error-prone |
| Fetch RSS feed, filter out non-dinner items (breakfast, snack, dessert, cookies, etc.), then pick 2-3 random entries | Show unfiltered recipes or cache/repeat the same ones | User wants dinner inspiration only; variety keeps it interesting |

#### Edge Cases

- **"morning briefing" vs "evening briefing":** Same content (no time-based variation for v1)
- **Bills due today:** Include in "Bills Due Soon" (today counts as within 7 days)
- **No data in any source:** Still show the original 5 sections plus Recipe Inspiration with empty-state messages
- **"No dinner planned" or "No plan" for tonight:** Skip Meat Reminder entirely (do not show section header)
- **Dinner has no meat keywords (e.g., "Pasta with marinara"):** Skip Meat Reminder entirely
- **RSS feed unavailable:** Show "Could not fetch recipes" instead of crashing

#### Automated Morning Briefing

The agent sends the briefing proactively during heartbeat polls without the user asking.

**Timing:** Between 7:00 AM and 10:00 AM Pacific (checked via `node calendar/calendar.js now`)

**Dedup:** The agent tracks whether today's briefing has already been sent using `memory/heartbeat-state.json`:

```json
{
  "lastMorningBriefing": "2026-02-10"
}
```

**Workflow during heartbeat:**
1. Get current Pacific time from `node calendar/calendar.js now`
2. Check if hour is between 7 and 9 (inclusive, so 7:00-9:59 AM)
3. Read `memory/heartbeat-state.json` (create with empty object `{}` if missing)
4. If `lastMorningBriefing` equals today's date → skip (already sent)
5. If not yet sent → assemble full 7-section briefing (same as on-demand) and send to user
6. After sending → update `lastMorningBriefing` to today's date in heartbeat-state.json

**DO / DO NOT:**

| DO | DO NOT | WHY |
|---|---|---|
| Check time with `node calendar/calendar.js now` | Use `date` command or JavaScript `new Date()` | UTC system clock gives wrong hour |
| Write `lastMorningBriefing` after sending | Write before sending | If send fails, dedup would prevent retry |
| Create heartbeat-state.json if missing | Assume file exists | First heartbeat won't have it |
| Use the same 7-section format as on-demand briefing | Create a different/shorter format | Consistency for user |

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
| "add X to shopping", "we need X", "pick up X", "buy X", "X to the shopping list" | Todoist (shopping project) | Add via todoist task system |
| "todo X", "todo: X", "I need to X", "remind me to X" (no time) | Todoist (todos project) | Add via todoist task system |

### Parsing Rules

**Notes:**
1. Get current Pacific time: `node calendar.js now`
2. Format: `- [YYYY-MM-DD h:mm AM/PM PT] {note text}`
3. Append to `household/notes.md`

**Shopping:**
1. Capitalize first letter of each item
2. Parse commas and "and" into separate items
3. Add each item via: `node tasks/index.js "todoist add project=shopping content=Item name"`

**Todos:**
1. Add via: `node tasks/index.js "todoist add project=todos content=Task description"`

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
**Action:** Add two tasks to Todoist shopping project: "Eggs" and "Milk"
**Response:** "Added 2 items to shopping! 🛒 Eggs, Milk"

**Input:** "pick up dog food"
**Action:** `node tasks/index.js "todoist add project=shopping content=Dog food"`
**Response:** "Added dog food to the shopping list! 🛒"

**Todos:**

**Input:** "todo fix the gate"
**Action:** `node tasks/index.js "todoist add project=todos content=Fix the gate"`
**Response:** "Added! ✅ Fix the gate"

**Input:** "I need to call the dentist"
**Action:** `node tasks/index.js "todoist add project=todos content=Call the dentist"`
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

## Save Recipe

Save Recipe enables quick storage of recipe titles, URLs, or both to a favourites file. The saved text is stored verbatim -- no validation or reformatting.

### Trigger Phrase Table

| Trigger Pattern | Target File | Action |
|---|---|---|
| "save recipe X" | `household/meals/favourites.md` | Append X verbatim as list item |

### Parsing Rules

1. Extract everything after "save recipe " (case-insensitive trigger)
2. Capitalize first letter if the text starts lowercase
3. Format: `- {saved text}` (one line)
4. Read `household/meals/favourites.md`, append the new line, write file back

### Input/Output Examples

**Input:** "save recipe Ham and Cheese Egg Muffins https://peaceloveandlowcarb.com/ham-and-cheese-egg-muffins/"
**Action:** Read favourites.md, append `- Ham and Cheese Egg Muffins https://peaceloveandlowcarb.com/ham-and-cheese-egg-muffins/`
**Response:** "Saved! 📌 Ham and Cheese Egg Muffins"

**Input:** "save recipe grandma's pot roast"
**Action:** Read favourites.md, append `- Grandma's pot roast`
**Response:** "Saved! 📌 Grandma's pot roast"

**Input:** "save recipe https://somesite.com/recipe/123"
**Action:** Read favourites.md, append `- https://somesite.com/recipe/123`
**Response:** "Saved! 📌 https://somesite.com/recipe/123"

### DO / DO NOT for Save Recipe

| DO | DO NOT | WHY |
|---|---|---|
| Store the text exactly as provided after "save recipe" | Parse or validate URLs | User may save just a title, just a URL, or both |
| Capitalize first letter | Reformat the entire string | Minimal normalization for consistency |
| Confirm with recipe name/text in response | Give detailed explanation | Quick capture pattern -- keep it fast |
| Read file before appending | Use `echo >>` to append | Must preserve existing content and format header |

---

## Recipe Library

Structured recipe files the agent can browse, read, suggest, and create. All recipes live in `household/meals/recipes/` as markdown files with YAML frontmatter.

### Recipe File Format

**Location:** `household/meals/recipes/`

**YAML frontmatter fields:**

| Field | Type | Example |
|---|---|---|
| `title` | string | `Chicken Parmesan` |
| `servings` | number | `4` |
| `prep_time` | string | `15 min` |
| `cook_time` | string | `30 min` |
| `tags` | array of strings | `[chicken, italian, quick]` |

**Section structure:**
- `## Ingredients` — bullet list with quantity + unit + item (e.g., `- 2 cups flour`)
- `## Instructions` — numbered steps

**File naming:** kebab-case of the title (e.g., `Beef Tacos` → `beef-tacos.md`)

### Trigger Phrase Table

| Trigger Pattern | Action |
|---|---|
| "show recipes", "list recipes", "what recipes do we have" | List all recipe names + tags |
| "show recipe [name]", "get recipe for [name]" | Display full recipe (Telegram-formatted) |
| "suggest a [tag] dinner", "what [tag] recipes do we have" | Filter recipes by tag match |
| "create recipe [dictation]" | Create new recipe file from dictation |

Note: "save recipe [text]" still goes to `household/meals/favourites.md` (existing Save Recipe behavior). "Create recipe" triggers the structured file creation.

### Browsing (List View)

- Read all `.md` files in `household/meals/recipes/`
- For each file, parse YAML frontmatter to get title and tags
- Display as: `- {title} — {tag1}, {tag2}, ...`
- If no recipes found: "No recipes in the library yet!"

### Reading (Full View)

- Find recipe file by matching title (case-insensitive, partial match OK)
- Display Telegram-formatted output:

```
🍽️ {title}
Servings: {servings} | Prep: {prep_time} | Cook: {cook_time}

📝 Ingredients:
• {ingredient1}
• {ingredient2}
...

👨‍🍳 Instructions:
1. {step1}
2. {step2}
...
```

### Suggesting (Tag-Based)

- When user asks "suggest a chicken dinner" or "what quick recipes do we have"
- Read all recipe frontmatter, filter by matching tag (case-insensitive)
- Show matching recipes in list view format
- If no matches: "No recipes with that tag. Here's everything: [list all]"

### Creating (From Dictation)

- User describes a recipe in chat, agent writes it as a `.md` file
- Agent must format into the standard template (YAML frontmatter + sections)
- File name: kebab-case of the title (e.g., "Beef Tacos" → `beef-tacos.md`)
- Agent should ask for missing fields if not provided (especially tags)
- If user just says "save recipe [text]", that still goes to favourites.md (existing behavior)

### DO / DO NOT for Recipe Library

| DO | DO NOT | WHY |
|---|---|---|
| Read all .md files in recipes/ for listing | Hardcode recipe names | New recipes added frequently |
| Match tags case-insensitively | Require exact tag match | Users say "chicken" not "Chicken" |
| Format output for Telegram (emoji headers, bullet lists) | Use markdown tables in output | Telegram doesn't render tables |
| Create file name from title in kebab-case | Use random or numbered file names | Human-readable file names for external editing |
| Ask for tags if user doesn't provide them during dictation | Skip tags silently | Tags enable search/suggestions |

---

## 📊 Telegram Polls

Telegram Poll handlers enable natural language poll creation, vote tracking, and automatic resolution with household-context-aware tie-breaking. The agent uses intent detection — there is NO /poll command.

**⚠️ CRITICAL: ALL poll requests must use `node -e` with `runTask()` object format to avoid shell quoting issues. This ensures proper parsing through the `read-msg.js` normalization layer.**

### Trigger Phrase Table

The user provides the question AND options in a single message.

| Trigger Pattern | Action |
|---|---|
| "let's vote on X: option1, option2" | Create poll with question X and given options |
| "poll: X? option1 or option2" | Create poll |
| "should we do X or Y" | Create poll with question "Should we do X or Y?" and options X, Y |
| "what should we have for dinner: tacos, pizza, or sushi" | Create poll |
| "vote: X or Y or Z" | Create poll |

### Parsing Rules for Poll Creation

**ALL poll requests must use the `read-msg.js` normalization layer via `tasks/index.js`.**

1. **Detect poll intent:** message contains a question with 2-4 distinct options, often separated by "or", commas, or listed after a colon
2. **Extract question and options:** Parse the message to identify:
   - The question (the part that asks something)
   - The options (2-4 distinct choices)
3. **If unclear or ambiguous, ASK FOR CLARIFICATION instead of guessing:**
   - Missing clear question: "I'd love to set up a poll! What's the question?"
   - Unclear options: "What are the options? (Give me 2-4 choices)"
   - Only 1 option: "That's just one option! What else should I put on the poll?"
   - More than 4 options: "I can do up to 4 options. Which ones should I include?"
4. **Format and call the task system:**
   - Use the object format via Node.js to avoid shell quoting issues
   - Question parameter: full question text as a string
   - Options parameter: comma-separated options (OPTION1,OPTION2,OPTION3)
   - **Command format:** `node -e "const {runTask} = require('./tasks/index.js'); runTask({task: 'poll', intent: 'create', parameters: {question: 'QUESTION TEXT', options: 'OPTION1,OPTION2,OPTION3'}}).then(r => console.log(JSON.stringify(r, null, 2)));"`
5. **Confirm to user:** "Poll created! 📊 Vote in the group chat."

**Command Format Examples:**

| User Input | Clear? | Agent Action | Command |
|---|---|---|---|
| "should we do tacos or pizza" | ✅ Yes | Create poll | `node -e "const {runTask} = require('./tasks/index.js'); runTask({task: 'poll', intent: 'create', parameters: {question: 'Should we do tacos or pizza?', options: 'Tacos,Pizza'}}).then(r => console.log(JSON.stringify(r, null, 2)));"` |
| "what's for dinner: chicken, beef, fish" | ✅ Yes | Create poll | `node -e "const {runTask} = require('./tasks/index.js'); runTask({task: 'poll', intent: 'create', parameters: {question: 'What\\'s for dinner?', options: 'Chicken,Beef,Fish'}}).then(r => console.log(JSON.stringify(r, null, 2)));"` |
| "pizza tacos burgers" | ✅ Yes (implied) | Create poll with inferred question | `node -e "const {runTask} = require('./tasks/index.js'); runTask({task: 'poll', intent: 'create', parameters: {question: 'What should we have?', options: 'Pizza,Tacos,Burgers'}}).then(r => console.log(JSON.stringify(r, null, 2)));"` |
| "let's vote on something" | ❌ No | Ask clarification | "I'd love to set up a poll! What's the question and what are the options?" |
| "tacos" (only 1 option) | ❌ No | Ask clarification | "That's just one option! What else should I put on the poll?" |

**Critical Rules:**
- Use the Node.js object format to avoid shell quoting issues
- Escape single quotes in question/options with `\\'`
- Do NOT guess if the message is unclear — ask for clarification
- Comma-separate options with NO spaces after commas

### Handling Poll Answers (poll_answer updates)

When the platform delivers a `poll_answer` update (a user voted on a poll):
1. Extract the user ID and selected option index from the update
2. Call: `node -e "const {runTask} = require('./tasks/index.js'); runTask({task: 'poll', intent: 'vote', parameters: {userId: 'USER_ID', optionId: OPTION_INDEX}}).then(r => console.log(JSON.stringify(r, null, 2)));"`
3. The task system handles everything: recording the vote, detecting ties, tie-breaking, closing the poll, and sending announcements
4. If the result says `resolved: true` with `tie: true`, the bot already sent the announcement via Telegram API — no additional message needed from the agent
5. If the result says `resolved: true` with `silent: true` (both agreed), the poll is already closed — no message needed
6. If the result says `recorded: true` (still waiting), no action needed — just wait for the other vote

### Handling Poll Timeouts (heartbeat integration)

During heartbeat, run: `node -e "const {runTask} = require('./tasks/index.js'); runTask({task: 'poll', intent: 'check-timeout', parameters: {}}).then(r => console.log(JSON.stringify(r, null, 2)));"`
- If result has `timedOut: true`: the bot already resolved and announced it. Log it in daily memory.
- If result has `hasActivePoll: false`: nothing to do.
- If result has `timedOut: false`: poll still active, no action needed.

### Input/Output Examples

**Example 1 — Create poll:**

**Input:** "what should we have for dinner tonight: tacos, pizza, or sushi?"
**Parse:** question="What should we have for dinner tonight?", options=["Tacos", "Pizza", "Sushi"]
**Action:** `node -e "const {runTask} = require('./tasks/index.js'); runTask({task: 'poll', intent: 'create', parameters: {question: 'What should we have for dinner tonight?', options: 'Tacos,Pizza,Sushi'}}).then(r => console.log(JSON.stringify(r, null, 2)));"`
**Response:** "Poll's up! 📊 Vote away!"

**Example 2 — Simple either/or:**

**Input:** "should we do movie night or game night"
**Parse:** question="Movie night or game night?", options=["Movie night", "Game night"]
**Action:** `node -e "const {runTask} = require('./tasks/index.js'); runTask({task: 'poll', intent: 'create', parameters: {question: 'Movie night or game night?', options: 'Movie night,Game night'}}).then(r => console.log(JSON.stringify(r, null, 2)));"`
**Response:** "Poll created! 📊"

**Example 3 — Bot can't parse:**

**Input:** "let's vote on something"
**Response:** "I'd love to set up a poll! What's the question and what are the options? (Give me 2-4 choices)"

**Example 4 — Poll already active:**

**Input:** "let's vote: pizza or burgers"
**Action:** Task returns error about existing active poll
**Response:** "There's already a poll running! Let that one finish first, or I can close it for you."

### Downstream Actions

After a poll resolves (by votes or timeout), the winning option may trigger a follow-up action based on context:

| Poll Context | Downstream Action |
|---|---|
| Dinner/meal poll (question contains dinner, meal, eat, food, lunch) | Update tonight's entry in `household/meals/this-week.md` with the winning option |
| Other polls | No automatic action — just announce the result |

**Implementation:** After receiving a resolved poll result with a winner, check if the question is meal-related. If so, get today's day name from `node calendar/calendar.js now`, read `household/meals/this-week.md`, update the matching day line with the winner, write file back.

### DO / DO NOT for Polls

| DO | DO NOT | WHY |
|---|---|---|
| Use `node -e` with `runTask()` object format | Use shell string format with quoted parameters | Object format avoids shell quoting issues and ensures proper parsing |
| Ask for clarification if message is unclear or ambiguous | Guess what the user meant or create a poll without clear intent | Bad polls waste everyone's time; clarity is required |
| Detect poll intent from natural language | Require a /poll command | Per user decision: natural language, no commands |
| Send poll immediately when intent is clear | Ask for confirmation/preview before sending | Per user decision: no preview step |
| Let the task system handle tie-breaking and announcements | Try to handle tie-break logic in agent instructions | Task system has the logic; agent just calls intents |
| Check poll timeout during heartbeat | Skip timeout checks | Stale polls should auto-resolve |
| Update meal plan after dinner poll resolves | Update meal plan for non-food polls | Only meal-related polls trigger downstream meal updates |

### Edge Cases

When unclear, ALWAYS ask for clarification. Never guess.

| Scenario | Agent Action | Example Response |
|---|---|---|
| Only 1 option detected | Ask for more options | "That's just one option! What else should I put on the poll?" |
| More than 4 options detected | Ask which to include | "I can do up to 4 options. Which ones should I include?" |
| No clear question | Ask for the question | "I'd love to set up a poll! What's the question?" |
| Options unclear | Ask for clarification | "What are the options? (Give me 2-4 choices)" |
| Ambiguous message | Don't create poll, ask | "Did you want to create a poll? If so, what's the question and what are the options?" |
| Poll already active | Inform user | "There's already a poll running! Let that one finish first, or I can close it for you." |
| User votes on non-bot poll | Ignore silently | (Task returns "No active poll" error — no action needed) |

**Golden Rule:** When in doubt, don't create a poll. Only create when there's a clear question + 2-4 distinct options.

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
