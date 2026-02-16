/**
 * Poll state management.
 * Manages active poll state in memory/poll-state.json.
 */

const fs = require('fs');
const path = require('path');

const STATE_FILE = path.join(__dirname, '..', '..', '..', 'memory', 'poll-state.json');

/**
 * Loads poll state from disk.
 * Returns { activePoll: null } if file doesn't exist or is empty.
 *
 * @returns {object} Poll state object
 */
function loadPollState() {
  try {
    const data = fs.readFileSync(STATE_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    // File doesn't exist or is invalid - return empty state
    return { activePoll: null };
  }
}

/**
 * Saves poll state to disk.
 *
 * @param {object} state - State object to save
 */
function savePollState(state) {
  const dir = path.dirname(STATE_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), 'utf8');
}

/**
 * Checks if there's an active poll.
 *
 * @returns {boolean} True if active poll exists with status 'open'
 */
function hasActivePoll() {
  const state = loadPollState();
  return state.activePoll !== null && state.activePoll.status === 'open';
}

/**
 * Clears the active poll from state.
 */
function clearActivePoll() {
  savePollState({ activePoll: null });
}

module.exports = {
  loadPollState,
  savePollState,
  hasActivePoll,
  clearActivePoll
};
