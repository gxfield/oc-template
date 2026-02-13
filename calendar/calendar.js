#!/usr/bin/env node

const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

// ============================================================
// TIMEZONE CONFIG — Pacific Time (America/Los_Angeles)
// System clock is UTC. ALL user-facing times are Pacific.
// ALL day-boundary calculations use Pacific Time.
// ============================================================
const USER_TZ = 'America/Los_Angeles';

const CREDENTIALS_PATH = path.join(__dirname, '..', 'credentials.json');
const CONFIG_PATH = path.join(__dirname, 'config.json');

// ── Helpers ──────────────────────────────────────────────────

function loadConfig() {
  try {
    return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
  } catch (err) {
    console.error('❌ config.json not found. Run setup first.');
    process.exit(1);
  }
}

function getAuthClient() {
  try {
    const allCreds = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf8'));
    const credentials = allCreds.google_calendar;
    if (!credentials) {
      console.error('❌ "google_calendar" key not found in credentials.json.');
      process.exit(1);
    }
    return new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/calendar'],
    });
  } catch (err) {
    console.error('❌ credentials.json not found or invalid.');
    process.exit(1);
  }
}

/**
 * Get current date/time components in Pacific Time.
 */
function nowInPacific() {
  const now = new Date();
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: USER_TZ,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hour12: false,
  }).formatToParts(now);

  const get = (type) => parts.find(p => p.type === type)?.value;
  const year = get('year');
  const month = get('month');
  const day = get('day');
  const hour = get('hour');
  const minute = get('minute');
  const dateStr = `${year}-${month}-${day}`;

  const weekday = parseInt(
    new Intl.DateTimeFormat('en-US', {
      timeZone: USER_TZ,
      weekday: 'narrow',
    }).formatToParts(now).find(p => p.type === 'weekday')?.value || '0'
  );
  // Use a more reliable weekday calculation
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dayName = new Intl.DateTimeFormat('en-US', {
    timeZone: USER_TZ,
    weekday: 'short',
  }).format(now);
  const wd = dayNames.indexOf(dayName);

  const dayNameFull = new Intl.DateTimeFormat('en-US', {
    timeZone: USER_TZ,
    weekday: 'long',
  }).format(now);

  return { year, month, day, hour, minute, dateStr, weekday: wd, dayNameFull };
}

/**
 * Format a datetime string into a readable Pacific Time string.
 */
function formatPacific(dateTimeStr) {
  const date = new Date(dateTimeStr);
  if (isNaN(date)) return dateTimeStr;
  return new Intl.DateTimeFormat('en-US', {
    timeZone: USER_TZ,
    weekday: 'short', month: 'short', day: 'numeric',
    hour: 'numeric', minute: '2-digit', hour12: true,
  }).format(date);
}

/**
 * Format just the date portion in Pacific Time.
 */
function formatPacificDate(dateStr) {
  // dateStr is "YYYY-MM-DD" from all-day events
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d, 12, 0, 0); // noon to avoid TZ edge
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
  }).format(date);
}

/**
 * Build UTC ISO string for midnight of a given date in Pacific Time.
 * Uses Intl to determine the correct UTC offset (handles PST/PDT).
 */
function pacificMidnightToUTC(dateStr) {
  // dateStr = "YYYY-MM-DD"
  // Create a date object and use the timezone offset to find UTC equivalent
  const [y, m, d] = dateStr.split('-').map(Number);

  // Get offset by comparing UTC and Pacific interpretation of the same wall-clock
  const wallClock = new Date(y, m - 1, d, 0, 0, 0);
  const utcParts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'UTC',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
  }).formatToParts(wallClock);

  const pstParts = new Intl.DateTimeFormat('en-US', {
    timeZone: USER_TZ,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
  }).formatToParts(wallClock);

  const toDate = (parts) => {
    const g = (type) => parts.find(p => p.type === type)?.value;
    return new Date(`${g('year')}-${g('month')}-${g('day')}T${g('hour')}:${g('minute')}:${g('second')}Z`);
  };

  const utcTime = toDate(utcParts);
  const pstTime = toDate(pstParts);
  const offsetMs = utcTime - pstTime;

  return new Date(wallClock.getTime() + offsetMs).toISOString();
}

/**
 * Return { timeMin, timeMax } for "today" in Pacific Time.
 */
function todayBounds() {
  const { dateStr, year, month, day } = nowInPacific();
  const tomorrow = new Date(Number(year), Number(month) - 1, Number(day) + 1);
  const tomorrowStr = [
    tomorrow.getFullYear(),
    String(tomorrow.getMonth() + 1).padStart(2, '0'),
    String(tomorrow.getDate()).padStart(2, '0'),
  ].join('-');

  return {
    timeMin: pacificMidnightToUTC(dateStr),
    timeMax: pacificMidnightToUTC(tomorrowStr),
  };
}

/**
 * Return { timeMin, timeMax } for "this week" (Mon–Sun) in Pacific Time.
 */
function thisWeekBounds() {
  const { year, month, day, weekday } = nowInPacific();
  const d = new Date(Number(year), Number(month) - 1, Number(day));
  const mondayOffset = weekday === 0 ? -6 : 1 - weekday;
  const monday = new Date(d);
  monday.setDate(d.getDate() + mondayOffset);
  const nextMonday = new Date(monday);
  nextMonday.setDate(monday.getDate() + 7);

  const fmt = (dt) => [
    dt.getFullYear(),
    String(dt.getMonth() + 1).padStart(2, '0'),
    String(dt.getDate()).padStart(2, '0'),
  ].join('-');

  return {
    timeMin: pacificMidnightToUTC(fmt(monday)),
    timeMax: pacificMidnightToUTC(fmt(nextMonday)),
  };
}

/**
 * Return bounds for the next N days from today in Pacific Time.
 */
function nextNDaysBounds(n) {
  const { year, month, day } = nowInPacific();
  const end = new Date(Number(year), Number(month) - 1, Number(day) + n + 1);
  const endStr = [
    end.getFullYear(),
    String(end.getMonth() + 1).padStart(2, '0'),
    String(end.getDate()).padStart(2, '0'),
  ].join('-');

  return {
    timeMin: new Date().toISOString(),
    timeMax: pacificMidnightToUTC(endStr),
  };
}

// ── Core operations ──────────────────────────────────────────

async function listEvents(calendarId, options = {}) {
  const auth = getAuthClient();
  const calendar = google.calendar({ version: 'v3', auth });

  const params = {
    calendarId,
    singleEvents: true,
    orderBy: 'startTime',
    timeZone: USER_TZ,
  };

  if (options.timeMin) params.timeMin = options.timeMin;
  else params.timeMin = new Date().toISOString();
  if (options.timeMax) params.timeMax = options.timeMax;
  if (options.maxResults) params.maxResults = options.maxResults;

  try {
    const res = await calendar.events.list(params);
    const events = res.data.items || [];

    if (events.length === 0) {
      console.log('📅 No events found.');
      return [];
    }

    console.log(`📅 ${events.length} event(s):\n`);
    events.forEach((event, i) => {
      const isAllDay = !!event.start.date;
      let displayTime;
      if (isAllDay) {
        displayTime = `${formatPacificDate(event.start.date)} (all day)`;
      } else {
        displayTime = formatPacific(event.start.dateTime);
      }

      console.log(`  ${i + 1}. ${displayTime} — ${event.summary || '(no title)'}`);
      if (event.description) console.log(`     📝 ${event.description}`);
      if (event.location) console.log(`     📍 ${event.location}`);
      console.log(`     🆔 ${event.id}`);
    });
    return events;
  } catch (err) {
    console.error('❌ Error fetching events:', err.message);
    process.exit(1);
  }
}

async function createEvent(calendarId, eventData) {
  const auth = getAuthClient();
  const calendar = google.calendar({ version: 'v3', auth });

  try {
    const res = await calendar.events.insert({ calendarId, requestBody: eventData });
    const ev = res.data;
    const start = ev.start.dateTime || ev.start.date;
    const displayTime = ev.start.dateTime ? formatPacific(start) : formatPacificDate(start);
    console.log(`✅ Event created: "${ev.summary}" on ${displayTime}`);
    console.log(`   🆔 ${ev.id}`);
    console.log(`   🔗 ${ev.htmlLink}`);
    return ev;
  } catch (err) {
    console.error('❌ Error creating event:', err.message);
    process.exit(1);
  }
}

async function deleteEvent(calendarId, eventId) {
  const auth = getAuthClient();
  const calendar = google.calendar({ version: 'v3', auth });
  try {
    await calendar.events.delete({ calendarId, eventId });
    console.log(`✅ Event ${eventId} deleted.`);
  } catch (err) {
    console.error('❌ Error deleting event:', err.message);
    process.exit(1);
  }
}

async function updateEvent(calendarId, eventId, updates) {
  const auth = getAuthClient();
  const calendar = google.calendar({ version: 'v3', auth });
  try {
    const existing = await calendar.events.get({ calendarId, eventId });
    const merged = { ...existing.data, ...updates };
    const res = await calendar.events.update({ calendarId, eventId, requestBody: merged });
    console.log(`✅ Event updated: "${res.data.summary}"`);
    console.log(`   🆔 ${res.data.id}`);
    return res.data;
  } catch (err) {
    console.error('❌ Error updating event:', err.message);
    process.exit(1);
  }
}

// ── Module exports ───────────────────────────────────────────

module.exports = {
  loadConfig,
  getAuthClient,
  nowInPacific,
  formatPacific,
  formatPacificDate,
  pacificMidnightToUTC,
  todayBounds,
  thisWeekBounds,
  nextNDaysBounds,
  listEvents,
  createEvent,
  deleteEvent,
  updateEvent
};

// ── CLI ──────────────────────────────────────────────────────
// CLI mode - only runs when executed directly

if (require.main === module) {
  const command = process.argv[2];
  const args = process.argv.slice(3);

  (async () => {
  const config = loadConfig();
  const calendarId = config.calendarId;
  const tz = config.timeZone || USER_TZ;

  switch (command) {

    case 'list': {
      const maxResults = args[0] ? parseInt(args[0]) : 10;
      await listEvents(calendarId, { maxResults });
      break;
    }

    case 'today': {
      const bounds = todayBounds();
      const { dateStr } = nowInPacific();
      console.log(`📆 Events for today (${dateStr} Pacific):\n`);
      await listEvents(calendarId, { ...bounds, maxResults: 50 });
      break;
    }

    case 'week': {
      const bounds = thisWeekBounds();
      console.log(`📆 Events this week (Pacific Time):\n`);
      await listEvents(calendarId, { ...bounds, maxResults: 50 });
      break;
    }

    case 'upcoming': {
      const days = args[0] ? parseInt(args[0]) : 7;
      const bounds = nextNDaysBounds(days);
      console.log(`📆 Events in the next ${days} day(s):\n`);
      await listEvents(calendarId, { ...bounds, maxResults: 50 });
      break;
    }

    case 'add': {
      const [summary, startTime, endTime, description, location] = args;
      if (!summary || !startTime || !endTime) {
        console.error('Usage: node calendar.js add "Title" "YYYY-MM-DDTHH:MM:SS" "YYYY-MM-DDTHH:MM:SS" ["Desc"] ["Location"]');
        console.error('  Times are interpreted as Pacific Time.');
        process.exit(1);
      }
      const eventData = {
        summary,
        description: description || '',
        start: { dateTime: startTime, timeZone: tz },
        end:   { dateTime: endTime,   timeZone: tz },
      };
      if (location) eventData.location = location;
      await createEvent(calendarId, eventData);
      break;
    }

    case 'add-allday': {
      const [summary, date, description] = args;
      if (!summary || !date) {
        console.error('Usage: node calendar.js add-allday "Title" "YYYY-MM-DD" ["Description"]');
        process.exit(1);
      }
      await createEvent(calendarId, {
        summary,
        description: description || '',
        start: { date },
        end:   { date },
      });
      break;
    }

    case 'delete': {
      const eventId = args[0];
      if (!eventId) { console.error('Usage: node calendar.js delete EVENT_ID'); process.exit(1); }
      await deleteEvent(calendarId, eventId);
      break;
    }

    case 'update': {
      const [updateEventId, field, ...rest] = args;
      const value = rest.join(' ');
      if (!updateEventId || !field || !value) {
        console.error('Usage: node calendar.js update EVENT_ID FIELD VALUE');
        process.exit(1);
      }
      await updateEvent(calendarId, updateEventId, { [field]: value });
      break;
    }

    case 'now': {
      const n = nowInPacific();
      console.log(`🕐 Current Pacific Time: ${n.dayNameFull}, ${n.dateStr} ${n.hour}:${n.minute}`);
      break;
    }

    default:
      console.log(`
📅 Google Calendar CLI (Pacific Time)

Commands:
  now                                               — Current Pacific Time
  today                                             — Today's events
  week                                              — This week (Mon–Sun)
  upcoming [days]                                   — Next N days (default 7)
  list [max]                                        — List upcoming events
  add "Title" "Start" "End" ["Desc"] ["Location"]  — Create timed event
  add-allday "Title" "YYYY-MM-DD" ["Desc"]         — Create all-day event
  delete EVENT_ID                                   — Delete event
  update EVENT_ID FIELD VALUE                       — Update event field

Times for 'add' are YYYY-MM-DDTHH:MM:SS in Pacific Time.
      `);
    }
  })();
}
