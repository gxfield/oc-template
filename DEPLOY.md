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

3. Edit `credentials.json` with your actual keys:
   ```bash
   # Paste your Google service account JSON under "google_calendar"
   # Add your OpenWeatherMap API key under "openweather_api_key"
   vi credentials.json
   ```

4. Verify calendar works:
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
| `credentials.json` | All API keys and service account credentials |
| `household/*.md` | Personal household data (todos, shopping, notes, etc.) |
| `household/meals/*.md` | Meal plans and saved recipes |
| `memory/` | Runtime cache and session memory |
| `.DS_Store` | macOS metadata |
| `node_modules/` | npm dependencies (reinstalled by setup.sh) |

## What's tracked in git (syncs on pull)

- All source code (`tasks/`, `calendar/`)
- Agent instructions (`TOOLS.md`, `QUICKSTART.md`, `AGENTS.md`, etc.)
- `credentials.json.example` (template showing required keys)
- Household `.example` templates (format instructions for the agent)
- Calendar config (`calendar/config.json` -- calendar ID + timezone)
- Planning docs (`.planning/`)
