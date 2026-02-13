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

if [ -f household/state/google-calendar-key.json ]; then
  echo "  OK    Google Calendar service account key found"
else
  echo "  MISSING household/state/google-calendar-key.json"
  echo "          Copy your Google Cloud service account key here"
fi

if [ -n "$OPENWEATHER_API_KEY" ]; then
  echo "  OK    OPENWEATHER_API_KEY is set"
else
  echo "  MISSING OPENWEATHER_API_KEY environment variable"
  echo "          Export it in your shell profile or .env file"
fi

echo ""
echo "Setup complete!"
