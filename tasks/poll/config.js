/**
 * Poll task configuration.
 * Provides ability to create and stop Telegram polls through the task orchestrator.
 */

const sendPollHelper = require('./helpers/send-poll');
const stopPollHelper = require('./helpers/stop-poll-helper');
const processVoteHelper = require('./helpers/process-vote');
const checkTimeoutHelper = require('./helpers/check-timeout');

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
    },
    'vote': {
      helpers: ['processVote'],
      validate: (params) => {
        if (!params.userId) return 'userId is required';
        if (params.optionId === undefined || params.optionId === null) return 'optionId is required';
        return null;
      }
    },
    'check-timeout': {
      helpers: ['checkTimeout']
    }
  },
  helpers: {
    'sendPoll': sendPollHelper,
    'stopPoll': stopPollHelper,
    'processVote': processVoteHelper,
    'checkTimeout': checkTimeoutHelper
  }
  // No cache config - polls are mutations, not cacheable queries
};
