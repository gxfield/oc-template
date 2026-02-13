/**
 * Echo task configuration.
 * Proves the add-a-task pattern: only config.js, helpers/, and index.js entry needed.
 */

const { echo } = require('./helpers/echo');

module.exports = {
  task: 'echo',
  intents: {
    'get': {
      helpers: ['echo']
    }
  },
  helpers: {
    'echo': echo
  },
  cache: {
    ttl: 60000  // 1 minute TTL for echo (short, since it's a demo task)
  }
};
