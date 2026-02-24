# Weekly Meal Planning System

Automated meal planning workflow that runs every Thursday at 8 AM Pacific to plan next week's weeknight dinners (Monday-Friday) via Telegram polls.

## Features

- 🗳️ **Interactive polls** - One recipe at a time, wait for voting (1 hour timeout)
- 🎯 **Dinner recipes only** - Filters out breakfast, shakes, dressings, etc.
- ❤️ **Learns preferences** - Tracks heart reactions and prioritizes favorite recipes
- 🤝 **Tie-breaker** - Bot casts deciding vote in case of ties
- 📢 **Progress announcements** - Sends updates to Telegram throughout the process
- 🔄 **Alternative suggestions** - If "No" wins, suggests different recipe
- 📝 **Auto-updates meal plan** - Writes final plan to `household/meals/this-week.md`

## Components

### 1. Recipe Selector (`recipe-selector.js`)
- Parses recipe frontmatter and filters by "dinner" tag
- Tracks heart reactions in `memory/recipe-preferences.json`
- Weighted random selection (hearted recipes get 3x weight)

**CLI:**
```bash
node recipe-selector.js list                    # List all dinner recipes
node recipe-selector.js select [exclude...]     # Select random recipe
node recipe-selector.js heart <fileName>        # Add heart to recipe
node recipe-selector.js prefs                   # Show preferences
```

### 2. Poll Workflow (`poll-workflow.js`)
- Creates Yes/No polls for recipes
- Waits for voting (1 hour timeout)
- Handles Yes/No/Tie results
- Sends Telegram announcements
- Suggests alternatives on "No"

**CLI:**
```bash
node poll-workflow.js test-single [dayName]    # Test single day poll
node poll-workflow.js plan-week                # Run full week planning
```

### 3. Meal Plan Updater (`update-meal-plan.js`)
- Reads/writes `household/meals/this-week.md`
- Updates specific days while preserving format

**CLI:**
```bash
node update-meal-plan.js read                  # Display current plan
node update-meal-plan.js clear                 # Clear all days to "No plan"
node update-meal-plan.js update                # Test update
```

### 4. Weekly Planner (`weekly-planner.js`)
- Main orchestrator
- Runs poll workflow for Mon-Fri
- Updates meal plan file
- Reports final plan

**CLI:**
```bash
node weekly-planner.js                         # Run full workflow
```

## Cron Setup

**Cron entry for Thursday 8:00 AM Pacific:**

During Pacific Standard Time (PST - November to March):
```cron
0 16 * * 4 /data/.openclaw/workspace-home-assistant/tasks/meal-planning/run-weekly-planner.sh
```

During Pacific Daylight Time (PDT - March to November):
```cron
0 15 * * 4 /data/.openclaw/workspace-home-assistant/tasks/meal-planning/run-weekly-planner.sh
```

**To install:**
```bash
crontab -e
```

Add the appropriate line based on current time (PST or PDT).

**Note:** You may need to adjust the cron time twice a year when DST changes (spring forward, fall back).

## Workflow Steps

1. **Thursday 8:00 AM Pacific** - Cron triggers `run-weekly-planner.sh`
2. **Announcement** - Bot sends "Time to plan next week's dinners!"
3. **For each day (Mon-Fri):**
   - Select random dinner recipe (weighted by hearts)
   - Create Yes/No poll
   - Wait 1 hour for votes
   - If Yes: Confirm and move to next day
   - If Tie: Bot breaks tie in favor of Yes
   - If No: Suggest alternative recipe and poll again
4. **Update meal plan** - Write final plan to `household/meals/this-week.md`
5. **Final announcement** - "All done! Next week's dinners are set."

## Requirements

- Node.js
- Telegram bot credentials in `credentials.json`
- Poll task system configured
- Recipes in `household/meals/recipes/` with "dinner" tag

## Logs

Workflow logs are written to:
```
/data/.openclaw/workspace-home-assistant/logs/meal-planner.log
```

## Testing

**Test single day poll:**
```bash
node poll-workflow.js test-single Monday
```

**Test full week (dry run):**
```bash
node weekly-planner.js
```

**Test recipe selection:**
```bash
node recipe-selector.js select
```

## Troubleshooting

**Poll doesn't create:**
- Check active poll state: `cat memory/poll-state.json`
- Clear stuck poll: `echo '{"activePoll": null}' > memory/poll-state.json`

**Recipe selection issues:**
- Verify recipes have "dinner" tag: `node recipe-selector.js list`
- Check preferences: `node recipe-selector.js prefs`

**Cron not running:**
- Check cron logs: `grep CRON /var/log/syslog`
- Verify script permissions: `ls -l run-weekly-planner.sh` (should be executable)
- Check timezone conversion (PST vs PDT)

## Future Enhancements

- [ ] Add grocery list generation from selected recipes
- [ ] Support weekend dinners (Sat/Sun)
- [ ] Recipe rotation tracking (avoid same meal too often)
- [ ] Multi-day meal prep recipes
- [ ] Dietary filters (vegetarian, low-carb, etc.)
- [ ] Shopping list auto-population after plan finalized
