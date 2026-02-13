#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const CREDENTIALS_PATH = path.join(__dirname, '..', 'credentials.json');
const CONFIG_PATH = path.join(__dirname, 'config.json');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function setup() {
  console.log('🛠️  Google Calendar Setup\n');

  // Check if credentials exist
  if (!fs.existsSync(CREDENTIALS_PATH)) {
    console.log('❌ credentials.json not found at project root.');
    console.log('\nCopy credentials.json.example to credentials.json and fill in your keys.');
    console.log('Google service account key goes under the "google_calendar" key.\n');
    process.exit(1);
  }

  // Validate credentials
  try {
    const allCreds = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf8'));
    const creds = allCreds.google_calendar;
    if (!creds || !creds.client_email || !creds.private_key) {
      console.log('❌ "google_calendar" key missing or invalid in credentials.json.');
      process.exit(1);
    }
    console.log('✅ Credentials file found');
    console.log(`   Service account: ${creds.client_email}\n`);
  } catch (err) {
    console.log('❌ Error reading credentials.json:', err.message);
    process.exit(1);
  }

  // Get calendar ID
  const calendarId = await question('Enter your Calendar ID (e.g., abc123@group.calendar.google.com): ');
  if (!calendarId.trim()) {
    console.log('❌ Calendar ID is required.');
    process.exit(1);
  }

  // Get timezone (optional)
  const timeZone = await question('Enter timezone (default: UTC): ') || 'UTC';

  // Save config
  const config = {
    calendarId: calendarId.trim(),
    timeZone: timeZone.trim()
  };

  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
  console.log('\n✅ Configuration saved to config.json');
  console.log('\n🎉 Setup complete! You can now use the calendar scripts.');
  console.log('\nTry: node calendar.js list\n');

  rl.close();
}

setup();
