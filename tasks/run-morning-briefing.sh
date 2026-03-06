#!/bin/bash
# Morning briefing launcher for cron
# Runs every day at 8:00 AM Pacific Time

# Set working directory
cd /data/.openclaw/workspace-home-assistant

# Run the briefing
/usr/bin/node tasks/morning-briefing.js >> logs/morning-briefing.log 2>&1

# Exit with the script's exit code
exit $?
