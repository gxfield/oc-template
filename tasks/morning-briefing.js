#!/usr/bin/env node
/**
 * Morning briefing script for cron
 * Sends daily household briefing to Telegram topic 1
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const WORKSPACE_ROOT = path.resolve(__dirname, '..');
const HEARTBEAT_STATE_FILE = path.join(WORKSPACE_ROOT, 'memory', 'heartbeat-state.json');

function log(message) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${message}`);
}

function exec(command, cwd = WORKSPACE_ROOT) {
  return execSync(command, { cwd, encoding: 'utf8' }).trim();
}

function getCurrentPacificDate() {
  const now = exec('node calendar/calendar.js now');
  // Extract date from format: "Wednesday, 2026-02-25 07:59"
  const match = now.match(/\d{4}-\d{2}-\d{2}/);
  return match ? match[0] : null;
}

function readHeartbeatState() {
  try {
    return JSON.parse(fs.readFileSync(HEARTBEAT_STATE_FILE, 'utf8'));
  } catch (err) {
    return { lastChecks: {}, lastMorningBriefing: null };
  }
}

function writeHeartbeatState(state) {
  const dir = path.dirname(HEARTBEAT_STATE_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(HEARTBEAT_STATE_FILE, JSON.stringify(state));
}

function gatherBriefingData() {
  log('Gathering briefing data...');
  
  const data = {};
  
  // Calendar
  try {
    data.calendar = exec('node calendar/calendar.js today');
  } catch (err) {
    log(`Calendar error: ${err.message}`);
    data.calendar = 'Error loading calendar';
  }
  
  // Todos
  try {
    const result = exec('node tasks/index.js "todoist get project=todos"');
    data.todos = JSON.parse(result);
  } catch (err) {
    log(`Todos error: ${err.message}`);
    data.todos = null;
  }
  
  // Shopping
  try {
    const result = exec('node tasks/index.js "todoist get project=shopping"');
    data.shopping = JSON.parse(result);
  } catch (err) {
    log(`Shopping error: ${err.message}`);
    data.shopping = null;
  }
  
  // Meals
  try {
    const mealsFile = path.join(WORKSPACE_ROOT, 'household/meals/this-week.md');
    const meals = fs.readFileSync(mealsFile, 'utf8');
    const now = exec('node calendar/calendar.js now');
    const dayMatch = now.match(/(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)/);
    const today = dayMatch ? dayMatch[1] : null;
    
    if (today) {
      const mealMatch = meals.match(new RegExp(`- ${today}: (.+)`, 'i'));
      data.meal = mealMatch ? mealMatch[1] : 'No plan';
    } else {
      data.meal = 'Unknown';
    }
  } catch (err) {
    log(`Meals error: ${err.message}`);
    data.meal = 'Error loading meals';
  }
  
  // Bills
  try {
    const billsFile = path.join(WORKSPACE_ROOT, 'household/bills.md');
    const bills = fs.readFileSync(billsFile, 'utf8');
    const today = new Date();
    const sevenDaysOut = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    const unpaidBills = bills.split('\n')
      .filter(line => line.startsWith('- [ ]'))
      .filter(line => {
        const match = line.match(/Due: (\d{4}-\d{2}-\d{2})/);
        if (match) {
          const dueDate = new Date(match[1]);
          return dueDate >= today && dueDate <= sevenDaysOut;
        }
        return false;
      });
    
    data.bills = unpaidBills;
  } catch (err) {
    log(`Bills error: ${err.message}`);
    data.bills = [];
  }
  
  // Notes
  try {
    const notesFile = path.join(WORKSPACE_ROOT, 'household/notes.md');
    const notes = fs.readFileSync(notesFile, 'utf8');
    const noteLines = notes.split('\n')
      .filter(line => line.startsWith('- ['))
      .slice(-3); // Last 3 notes
    data.notes = noteLines;
  } catch (err) {
    log(`Notes error: ${err.message}`);
    data.notes = [];
  }
  
  // Weather
  try {
    const config = JSON.parse(fs.readFileSync(path.join(WORKSPACE_ROOT, 'local_config.json'), 'utf8'));
    data.weather = exec(`curl -s 'wttr.in/${config.city}?format=%C+%t+%w'`);
  } catch (err) {
    log(`Weather error: ${err.message}`);
    data.weather = 'unavailable';
  }
  
  return data;
}

function formatBriefing(data) {
  const now = exec('node calendar/calendar.js now');
  const dateMatch = now.match(/(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday), (\w+ \d+)/);
  const dateStr = dateMatch ? `${dateMatch[1]}, ${dateMatch[2]}` : 'Today';
  
  let message = `📋 **Morning Briefing** — ${dateStr}\n\n`;
  
  // Calendar
  message += `📅 **Calendar**\n`;
  if (data.calendar && data.calendar.includes('event(s)')) {
    const events = data.calendar.split('\n').slice(2).filter(line => line.trim());
    if (events.length > 0) {
      events.forEach(event => {
        const match = event.match(/\d+\.\s+(.+)/);
        if (match) {
          message += `• ${match[1].split('\n')[0]}\n`;
        }
      });
    } else {
      message += `Nothing scheduled today\n`;
    }
  } else {
    message += `Nothing scheduled today\n`;
  }
  
  // Todos
  message += `\n✅ **Todos**`;
  if (data.todos && data.todos.data && data.todos.data.tasks.length > 0) {
    message += ` (${data.todos.data.tasks.length} items)\n`;
    data.todos.data.tasks.slice(0, 5).forEach(task => {
      const due = task.due ? ` (due ${task.due})` : '';
      message += `◻️ ${task.content}${due}\n`;
    });
  } else {
    message += `\nAll clear! 🎉\n`;
  }
  
  // Shopping
  message += `\n🛒 **Shopping**`;
  if (data.shopping && data.shopping.data && data.shopping.data.tasks.length > 0) {
    message += ` (${data.shopping.data.tasks.length} items)\n`;
    data.shopping.data.tasks.slice(0, 5).forEach(task => {
      message += `• ${task.content}\n`;
    });
  } else {
    message += `\nNothing on the list\n`;
  }
  
  // Meals
  message += `\n🍽️ **Meals**\n`;
  message += `• Tonight: ${data.meal}\n`;
  
  // Bills
  message += `\n💵 **Bills**\n`;
  if (data.bills && data.bills.length > 0) {
    data.bills.forEach(bill => {
      const match = bill.match(/- \[ \] (.+?) \| (.+?) \| Due: (.+)/);
      if (match) {
        message += `• ${match[1]} - ${match[2]} (due ${match[3]})\n`;
      }
    });
  } else {
    message += `No bills due in the next 7 days\n`;
  }
  
  // Notes
  message += `\n📝 **Notes**\n`;
  if (data.notes && data.notes.length > 0) {
    data.notes.forEach(note => {
      message += `${note}\n`;
    });
  } else {
    message += `No recent notes\n`;
  }
  
  // Weather
  message += `\n☁️ **Weather**\n`;
  message += data.weather || 'unavailable';
  
  return message;
}

function sendToTelegram(message) {
  log('Sending briefing to Telegram...');
  
  // Escape the message for JSON
  const escapedMessage = message.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n');
  
  // Use openclaw CLI to send message
  const command = `openclaw message send --channel telegram --target -1003842059812 --thread-id 1 --message "${escapedMessage}"`;
  
  try {
    exec(command, WORKSPACE_ROOT);
    log('Briefing sent successfully');
    return true;
  } catch (err) {
    log(`Failed to send briefing: ${err.message}`);
    return false;
  }
}

function main() {
  log('Starting morning briefing...');
  
  const today = getCurrentPacificDate();
  if (!today) {
    log('ERROR: Could not determine current Pacific date');
    process.exit(1);
  }
  
  log(`Current Pacific date: ${today}`);
  
  // Check if briefing already sent today
  const state = readHeartbeatState();
  if (state.lastMorningBriefing === today) {
    log(`Briefing already sent today (${today}), skipping`);
    process.exit(0);
  }
  
  // Gather data
  const data = gatherBriefingData();
  
  // Format message
  const message = formatBriefing(data);
  
  // Send to Telegram
  const success = sendToTelegram(message);
  
  if (success) {
    // Update state
    state.lastMorningBriefing = today;
    writeHeartbeatState(state);
    log('Morning briefing complete');
    process.exit(0);
  } else {
    log('ERROR: Failed to send briefing');
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}
