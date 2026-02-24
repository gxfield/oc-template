#!/bin/bash
# Weekly meal planner launcher for cron
# Runs every Thursday at 8:00 AM Pacific Time

# Set working directory
cd /data/.openclaw/workspace-home-assistant/tasks/meal-planning

# Run the planner
/usr/bin/node weekly-planner.js >> /data/.openclaw/workspace-home-assistant/logs/meal-planner.log 2>&1

# Exit with the planner's exit code
exit $?
