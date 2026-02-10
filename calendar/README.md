# Google Calendar Integration for OpenClaw

This directory contains scripts to interact with Google Calendar using a service account.

## Prerequisites

You need:
1. **Service account JSON credentials** from Google Cloud
2. **Calendar ID** from Google Calendar
3. The calendar must be **shared with the service account email**

If you haven't set these up yet, follow the complete walkthrough below.

---

## Complete Setup Walkthrough

### Step 1: Create Google Cloud Project

1. Go to https://console.cloud.google.com/
2. Sign in with your Google account
3. Click the project dropdown at the top (or "Select a project")
4. Click **NEW PROJECT**
5. Name it: `OpenClaw Household` (or whatever you want)
6. Click **Create**
7. Wait a few seconds, then select your new project from the dropdown

### Step 2: Enable Calendar API

1. In the left sidebar, go to **APIs & Services → Library**
   - Or use search bar: type "API Library"
2. Search for: `Google Calendar API`
3. Click on it
4. Click **ENABLE**
5. Wait for it to enable (~10 seconds)

### Step 3: Create Service Account

1. Go to **APIs & Services → Credentials**
2. Click **+ CREATE CREDENTIALS** at the top
3. Select **Service Account**
4. Fill in:
   - **Service account name:** `openclaw-calendar`
   - **Service account ID:** (auto-fills, leave it)
   - **Description:** `OpenClaw household calendar integration`
5. Click **CREATE AND CONTINUE**
6. Grant access (optional): **Skip this** - click **CONTINUE**
7. Grant users access (optional): **Skip this** - click **DONE**

### Step 4: Create Key (Credentials)

1. You should now see your service account in the list
2. Click on the service account name (e.g., `openclaw-calendar@...`)
3. Go to the **KEYS** tab at the top
4. Click **ADD KEY → Create new key**
5. Select **JSON** format
6. Click **CREATE**
7. A JSON file will download automatically - **keep this safe!**

### Step 5: Share Calendar with Service Account

1. **Copy the service account email** - it looks like:
   ```
   openclaw-calendar@your-project.iam.gserviceaccount.com
   ```
   (You can find it in the service account details page)

2. Open Google Calendar (calendar.google.com)
3. Find your calendar (create a new one called "Family" if you want)
4. Click the **three dots** next to the calendar name → **Settings and sharing**
5. Scroll down to **Share with specific people**
6. Click **+ Add people**
7. Paste the service account email
8. Set permissions: **Make changes to events** (so OpenClaw can add/edit)
9. Click **Send**

### Step 6: Get Calendar ID

1. Still in Calendar settings (same page)
2. Scroll down to **Integrate calendar**
3. Copy the **Calendar ID** - looks like:
   ```
   abc123def456@group.calendar.google.com
   ```
   (If it's your primary calendar, it'll be your email address)

---

## Installation

### 1. Install dependencies

```bash
cd workspace-home-assistant
npm install
```

### 2. Add your credentials

Place the downloaded JSON file from Step 4 above in this directory and rename it to `credentials.json`:

```bash
# Example: if your file is in ~/Downloads/openclaw-calendar-abc123.json
cp ~/Downloads/openclaw-calendar-*.json credentials.json
```

### 3. Run setup

```bash
node setup.js
```

This will:
- Verify your credentials file
- Prompt for your Calendar ID (from Step 6 above)
- Prompt for timezone (optional, defaults to UTC)
- Save the configuration to `config.json`

---

## Usage

### List upcoming events

```bash
node calendar.js list
```

List next 20 events:
```bash
node calendar.js list 20
```

### Create an event

```bash
node calendar.js add "Event Title" "2024-02-09T14:00:00" "2024-02-09T15:00:00" "Optional description"
```

Example:
```bash
node calendar.js add "Dentist Appointment" "2024-02-15T10:30:00" "2024-02-15T11:30:00" "Annual checkup"
```

### Delete an event

```bash
node calendar.js delete EVENT_ID
```

(You can get the EVENT_ID from the list command)

### Update an event

```bash
node calendar.js update EVENT_ID summary "New Title"
```

Example:
```bash
node calendar.js update abc123xyz summary "Rescheduled Dentist"
```

---

## Using from OpenClaw Agent

You can call these scripts from your agent using the `exec` tool:

```javascript
// List events
await exec({ 
  command: "cd workspace-home-assistant && node calendar.js list 10",
  workdir: "/data/.openclaw/workspace"
});

// Create event
await exec({
  command: 'cd workspace-home-assistant && node calendar.js add "Team Meeting" "2024-02-09T14:00:00" "2024-02-09T15:00:00" "Q1 planning"',
  workdir: "/data/.openclaw/workspace"
});
```

---

## Troubleshooting

### "credentials.json not found"
- Make sure you placed the downloaded JSON file in this directory
- Make sure it's named exactly `credentials.json`

### "config.json not found"
- Run `node setup.js` to create the config file

### "Invalid credentials"
- Re-download the JSON file from Google Cloud Console
- Make sure you're using a **service account** key, not OAuth credentials

### "Insufficient permissions" or "403 Forbidden"
- Make sure you shared the calendar with the service account email
- Make sure the permission is set to "Make changes to events"
- Wait a few minutes for permissions to propagate

### "Calendar not found"
- Double-check the Calendar ID in config.json
- Make sure you copied it correctly (no extra spaces)

---

## Files in this directory

- `calendar.js` - Main calendar interaction script
- `setup.js` - Interactive setup wizard
- `credentials.json` - Your service account credentials (YOU create this)
- `config.json` - Calendar ID and settings (created by setup.js)
- `package.json` - Node.js dependencies
- `README.md` - This file

---

## Security Notes

- **Never commit credentials.json to git** (it's in .gitignore)
- Keep your service account JSON file secure
- Only share the calendar with the specific service account, not publicly
- Review calendar permissions regularly

---

**Need help?** Ask your OpenClaw agent to troubleshoot!
