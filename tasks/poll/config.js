/**
 * Poll task configuration.
 * Provides ability to create and stop Telegram polls through the task orchestrator.
 */

const sendPollHelper = require('./helpers/send-poll');
const stopPollHelper = require('./helpers/stop-poll-helper');

module.exports = {
  task: 'poll',
  intents: {
    'create': {
      helpers: ['sendPoll'],
      validate: (params) => {
        if (!params.question) return 'question is required to create a poll';
        if (!params.options) return 'options is required (comma-separated, 2-4 choices)';
        return null;
      }
    },
    'stop': {
      helpers: ['stopPoll']
    }
  },
  helpers: {
    'sendPoll': sendPollHelper,
    'stopPoll': stopPollHelper
  }
  // No cache config - polls are mutations, not cacheable queries
};
