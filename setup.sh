#!/bin/bash
# First-time setup for household assistant workspace
# Run this after cloning the repo to initialize household data files

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

echo "Setting up household assistant workspace..."

# Copy .example templates to actual files (skip if already exists)
copy_template() {
  local example="$1"
  local target="${example%.example}"
  if [ -f "$target" ]; then
    echo "  SKIP  $target (already exists)"
  else
    cp "$example" "$target"
    echo "  CREATE $target"
  fi
}

# Credentials
echo ""
echo "Initializing credentials..."
copy_template credentials.json.example

echo ""
echo "Initializing household data files..."
copy_template household/todos.md.example
copy_template household/shopping.md.example
copy_template household/notes.md.example
copy_template household/bills.md.example
copy_template household/calendar.md.example
copy_template household/maintenance.md.example
copy_template household/meals/this-week.md.example
copy_template household/meals/favourites.md.example

# Create memory directory if missing
if [ ! -d memory ]; then
  mkdir -p memory
  echo '{}' > memory/cache.json
  echo "  CREATE memory/cache.json"
else
  echo "  SKIP  memory/ (already exists)"
fi

# Install calendar dependencies
echo ""
echo "Installing calendar dependencies..."
cd calendar && npm install --silent && cd ..
echo "  DONE"

# Check for required credentials
echo ""
echo "Checking credentials..."

if [ -f credentials.json ]; then
  # Check for google_calendar key
  if grep -q '"google_calendar"' credentials.json; then
    echo "  OK    google_calendar found in credentials.json"
  else
    echo "  MISSING google_calendar key in credentials.json"
    echo "          Paste your Google service account JSON under the google_calendar key"
  fi
  # Check for openweather key
  if grep -q '"openweather_api_key": ""' credentials.json; then
    echo "  MISSING openweather_api_key is empty in credentials.json"
    echo "          Add your OpenWeatherMap API key"
  else
    echo "  OK    openweather_api_key found in credentials.json"
  fi
  # Check for todoist key
  if grep -q '"todoist_api_key": ""' credentials.json; then
    echo "  MISSING todoist_api_key is empty in credentials.json"
    echo "          Add your Todoist API key (Settings > Integrations > Developer)"
  else
    echo "  OK    todoist_api_key found in credentials.json"
  fi
else
  echo "  MISSING credentials.json (run setup again after creating it)"
fi

echo ""
echo "Setup complete!"
