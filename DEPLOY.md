# Deploy Guide

## Push to GitHub (first time)

1. Create a **private** repo on GitHub (e.g. `assistant-workspace`)

2. Add the remote and push:
   ```bash
   git remote add origin git@github.com:YOUR_USER/assistant-workspace.git
   git push -u origin main
   ```

## Set up on OpenClaw server (first time)

1. Clone the repo:
   ```bash
   git clone git@github.com:YOUR_USER/assistant-workspace.git
   cd assistant-workspace
   ```

2. Run setup:
   ```bash
   chmod +x setup.sh
   ./setup.sh
   ```

3. Add your Google Calendar service account key:
   ```bash
   # Copy the key file from a secure location
   cp /path/to/your/service-account-key.json household/state/google-calendar-key.json
   ```

4. Set the OpenWeatherMap API key:
   ```bash
   export OPENWEATHER_API_KEY="your-key-here"
   ```
   Add this to your shell profile (`~/.bashrc`, `~/.zshrc`, etc.) to persist it.

5. Verify calendar works:
   ```bash
   node calendar/calendar.js now
   node calendar/calendar.js today
   ```

## Pull updates on OpenClaw server

```bash
git pull
```

That's it. Code updates pull in. Your local household data, credentials, and memory are untouched because they're gitignored.

If new `.example` templates were added, re-run setup to pick them up:
```bash
./setup.sh
```

## What's gitignored (stays local)

| File | Contains |
|------|----------|
| `household/state/google-calendar-key.json` | Google service account private key |
| `calendar/credentials.json` | Google credentials (if used) |
| `household/*.md` | Personal household data (todos, shopping, notes, etc.) |
| `household/meals/*.md` | Meal plans and saved recipes |
| `memory/` | Runtime cache and session memory |
| `.DS_Store` | macOS metadata |
| `node_modules/` | npm dependencies (reinstalled by setup.sh) |

## What's tracked in git (syncs on pull)

- All source code (`tasks/`, `calendar/`)
- Agent instructions (`TOOLS.md`, `QUICKSTART.md`, `AGENTS.md`, etc.)
- Household `.example` templates (format instructions for the agent)
- Calendar config (`calendar/config.json` -- calendar ID + timezone)
- Planning docs (`.planning/`)

## Environment variables

| Variable | Required for | Get it from |
|----------|-------------|-------------|
| `OPENWEATHER_API_KEY` | Weather task | https://openweathermap.org/api |
