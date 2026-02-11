/**
 * Cache module for task results with TTL and daily reset support.
 * Backed by /memory/cache.json file.
 */

const fs = require('fs');
const path = require('path');

const CACHE_FILE = path.resolve(__dirname, '../memory/cache.json');

/**
 * Get today's date in Pacific timezone as YYYY-MM-DD
 * @returns {string}
 */
function todayPacific() {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Los_Angeles',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });

  const parts = formatter.formatToParts(new Date());
  const year = parts.find(p => p.type === 'year').value;
  const month = parts.find(p => p.type === 'month').value;
  const day = parts.find(p => p.type === 'day').value;

  return `${year}-${month}-${day}`;
}

/**
 * Read cache from file
 * @returns {object}
 */
function readCache() {
  try {
    const data = fs.readFileSync(CACHE_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    // File doesn't exist or is invalid - start fresh
    return {};
  }
}

/**
 * Write cache to file
 * @param {object} cache
 */
function writeCache(cache) {
  // Ensure directory exists
  const dir = path.dirname(CACHE_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2), 'utf8');
}

/**
 * Build a cache key from task, intent, parameters, and optional key strategy
 * @param {string} task - Task name
 * @param {string} intent - Intent name
 * @param {object} parameters - Parameters object
 * @param {function} keyStrategy - Optional key strategy function
 * @returns {string}
 */
function buildKey(task, intent, parameters, keyStrategy) {
  if (typeof keyStrategy === 'function') {
    return keyStrategy(task, intent, parameters);
  }

  // Default: simple task:intent key (ignores parameters)
  return `${task}:${intent}`;
}

/**
 * Get cached entry by key
 * @param {string} key
 * @returns {*|null} - Returns payload if valid, null if missing/expired
 */
function get(key) {
  const cache = readCache();
  const entry = cache[key];

  if (!entry) {
    return null;
  }

  // Check TTL expiry
  if (entry.ttl !== null && entry.ttl !== undefined) {
    const age = Date.now() - entry.storedAt;
    if (age > entry.ttl) {
      return null; // Expired
    }
  }

  // Check daily reset expiry
  if (entry.dailyReset === true) {
    const today = todayPacific();
    if (entry.storedDate !== today) {
      return null; // Different day
    }
  }

  return entry.payload;
}

/**
 * Set cached entry with optional TTL or daily reset
 * @param {string} key
 * @param {*} payload - The data to cache
 * @param {object} options - { ttl?: number (ms), dailyReset?: boolean }
 */
function set(key, payload, options = {}) {
  const cache = readCache();

  cache[key] = {
    payload,
    storedAt: Date.now(),
    storedDate: todayPacific(),
    ttl: options.ttl || null,
    dailyReset: options.dailyReset || false
  };

  writeCache(cache);
}

/**
 * Remove all expired entries from cache
 * @returns {number} - Count of entries removed
 */
function clearExpired() {
  const cache = readCache();
  const keys = Object.keys(cache);
  let removed = 0;

  for (const key of keys) {
    const entry = cache[key];
    let shouldRemove = false;

    // Check TTL expiry
    if (entry.ttl !== null && entry.ttl !== undefined) {
      const age = Date.now() - entry.storedAt;
      if (age > entry.ttl) {
        shouldRemove = true;
      }
    }

    // Check daily reset expiry
    if (entry.dailyReset === true) {
      const today = todayPacific();
      if (entry.storedDate !== today) {
        shouldRemove = true;
      }
    }

    if (shouldRemove) {
      delete cache[key];
      removed++;
    }
  }

  if (removed > 0) {
    writeCache(cache);
  }

  return removed;
}

module.exports = {
  get,
  set,
  clearExpired,
  buildKey
};
