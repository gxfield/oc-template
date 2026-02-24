# Weekly Meal Planning Implementation Summary

## What Was Built

A complete automated meal planning system that runs every Thursday at 8:00 AM Pacific to plan next week's weeknight dinners through interactive Telegram polls.

## Requirements (from conversation)

✅ **Runs weekly** - Every Thursday at 8:00 AM Pacific  
✅ **Weeknights only** - Plans Monday through Friday (5 dinners)  
✅ **Random selection** - From dinner-tagged recipes only  
✅ **Alternative suggestions** - On "No" votes  
✅ **1-hour polls** - With auto-resolution on timeout  
✅ **Progress announcements** - To Telegram group chat  
✅ **Tie-breaker** - Bot casts deciding vote  
✅ **Learns preferences** - Tracks ❤️ reactions, gives 3x weight  

## System Architecture

### 1. Recipe Selector (`recipe-selector.js`)
- **Input:** Recipe markdown files with frontmatter tags
- **Filter:** Only recipes tagged with `dinner` (23 recipes currently)
- **Weighting:** Hearted recipes get 3x selection probability
- **Output:** Selected recipe object with title, tags, fileName

### 2. Poll Workflow (`poll-workflow.js`)
- **Creates:** Yes/No Telegram polls
- **Waits:** 1 hour for voting (checks every 5 seconds)
- **Handles:**
  - **Yes wins** → Confirm and return recipe
  - **Tie** → Bot votes Yes (tie-breaker)
  - **No wins** → Exclude recipe, select alternative, poll again
- **Announces:** Progress to Telegram after each poll resolution

### 3. Meal Plan Updater (`update-meal-plan.js`)
- **Reads:** `household/meals/this-week.md`
- **Updates:** Specific day lines while preserving format
- **Writes:** Final plan back to file

### 4. Weekly Planner (`weekly-planner.js`)
- **Orchestrates:** Full workflow for 5 days
- **Tracks:** Used recipes to avoid duplicates in same week
- **Logs:** Full execution to `/logs/meal-planner.log`

### 5. Cron Launcher (`run-weekly-planner.sh`)
- **Triggers:** `weekly-planner.js` via cron
- **Logs:** Output to meal-planner.log
- **Returns:** Exit code for cron status

## Data Files

| File | Purpose | Format |
|---|---|---|
| `memory/recipe-preferences.json` | Heart tracking | `{ "recipe-name": heartCount }` |
| `memory/poll-state.json` | Active poll state | Poll object with votes, status |
| `household/meals/this-week.md` | Meal plan output | Markdown with day lines |
| `logs/meal-planner.log` | Execution logs | Append-only log file |

## Workflow Example

```
Thursday 8:00 AM PT → Cron triggers

Bot: 🍽️ Good morning! Time to plan next week's dinners...

[Creates poll for Monday]
Bot: Should we have Chicken Parmesan for dinner?
Options: Yes | No

[1 hour passes, votes counted]
Bot: ✅ Monday dinner confirmed: Chicken Parmesan

[Creates poll for Tuesday]
Bot: Should we have Tacos for dinner?
Options: Yes | No

[1 hour passes, "No" wins]
Bot: ❌ Looks like no one wants Tacos. Suggesting something else...

[Creates alternative poll for Tuesday]
Bot: Should we have Stir Fry for dinner?
Options: Yes | No

[Continues through Friday]

Bot: 🎉 All done! Next week's dinners are set.

[household/meals/this-week.md updated]
```

## Installation Steps

### 1. System is ready (built)
All scripts are in place:
- ✅ `/tasks/meal-planning/*.js` scripts created
- ✅ `/tasks/meal-planning/run-weekly-planner.sh` created (executable)
- ✅ `/logs/` directory created
- ✅ Documentation added to TOOLS.md

### 2. Install cron job
```bash
crontab -e
```

Add this line (adjust for PST vs PDT):
```
# PST (Nov-Mar): Thursday 8 AM PST = 16:00 UTC
0 16 * * 4 /data/.openclaw/workspace-home-assistant/tasks/meal-planning/run-weekly-planner.sh

# OR

# PDT (Mar-Nov): Thursday 8 AM PDT = 15:00 UTC
0 15 * * 4 /data/.openclaw/workspace-home-assistant/tasks/meal-planning/run-weekly-planner.sh
```

### 3. Test the system
```bash
# Test recipe selection
cd /data/.openclaw/workspace-home-assistant
node tasks/meal-planning/recipe-selector.js select

# Test single poll (WARNING: creates real poll!)
node tasks/meal-planning/poll-workflow.js test-single Monday
```

## Manual Operation

If you want to trigger the workflow manually (not waiting for Thursday):

```bash
cd /data/.openclaw/workspace-home-assistant/tasks/meal-planning
./run-weekly-planner.sh
```

Or call the Node script directly:
```bash
cd /data/.openclaw/workspace-home-assistant
node tasks/meal-planning/weekly-planner.js
```

## Future Enhancements

Possible additions discussed but not yet implemented:

1. **Auto-grocery from meal plan** - Add ingredients to shopping list automatically
2. **Recipe rotation tracking** - Don't suggest same recipe within N weeks
3. **Weekend dinners** - Extend to Saturday/Sunday
4. **Dietary filters** - Tag-based filtering (vegetarian, low-carb, etc.)
5. **Multi-day meal prep** - Recipes that make multiple days worth
6. **Quick polls** - "What should we have tonight?" for ad-hoc decisions

## Monitoring

**Check logs:**
```bash
tail -f /data/.openclaw/workspace-home-assistant/logs/meal-planner.log
```

**Check cron execution:**
```bash
grep meal-planner /var/log/syslog
```

**Check next scheduled run:**
```bash
crontab -l
```

## Built by
OpenClaw Home Assistant  
February 23, 2026

## Status
✅ **System complete and ready for cron installation**
