/**
 * Local config loader.
 * Reads household-specific settings from local_config.json at workspace root.
 * Falls back to hardcoded defaults if the file is missing or invalid.
 */

const fs = require('fs');
const path = require('path');

const DEFAULTS = {
  city: 'Seattle,WA,US',
  timezone: 'America/Los_Angeles',
  units: 'imperial'
};

/**
 * Load household config from local_config.json.
 * @returns {{ city: string, timezone: string, units: string }}
 */
function loadLocalConfig() {
  try {
    const filePath = path.join(__dirname, '..', 'local_config.json');
    const data = fs.readFileSync(filePath, 'utf8');
    return Object.assign({}, DEFAULTS, JSON.parse(data));
  } catch (_) {
    return Object.assign({}, DEFAULTS);
  }
}

module.exports = { loadLocalConfig };
