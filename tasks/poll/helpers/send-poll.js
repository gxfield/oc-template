/**
 * Send poll helper.
 * Creates a Telegram poll and persists initial state.
 */

const { loadTelegramCredentials, sendPoll } = require('./telegram-api');
const { hasActivePoll, savePollState } = require('./poll-state');

/**
 * Sends a poll to the configured Telegram chat.
 *
 * @param {object} parameters - Task parameters (question, options, timeout)
 * @param {object} context - Task context
 * @returns {Promise<object>} Poll creation result
 */
async function sendPollHelper(parameters, context) {
  // Load credentials
  const { botToken, chatId } = loadTelegramCredentials();

  // Check for existing active poll
  if (hasActivePoll()) {
    throw new Error('A poll is already active. Close it first or wait for it to finish.');
  }

  // Extract and validate parameters
  const question = parameters.question;
  if (!question) {
    throw new Error('question parameter is required');
  }

  const optionsString = parameters.options;
  if (!optionsString) {
    throw new Error('options parameter is required (comma-separated list)');
  }

  // Parse options
  const options = optionsString
    .split(',')
    .map(opt => opt.trim())
    .filter(opt => opt.length > 0);

  // Validate 2-4 options (per user decision in plan)
  if (options.length < 2) {
    throw new Error('Poll must have at least 2 options');
  }
  if (options.length > 4) {
    throw new Error('Poll cannot have more than 4 options');
  }

  // Send poll via Telegram API
  const response = await sendPoll(botToken, chatId, question, options);

  // Extract poll data from response
  const pollId = response.result.poll.id;
  const messageId = response.result.message_id;

  // Default timeout: 60 minutes
  const timeoutMinutes = parameters.timeout || 60;

  // Save poll state
  const pollState = {
    activePoll: {
      pollId: pollId,
      messageId: messageId,
      chatId: chatId,
      question: question,
      options: options,
      votes: {},
      createdAt: new Date().toISOString(),
      timeoutMinutes: timeoutMinutes,
      status: 'open'
    }
  };
  savePollState(pollState);

  // Return result
  return {
    pollId: pollId,
    messageId: messageId,
    question: question,
    options: options,
    timeoutMinutes: timeoutMinutes
  };
}

module.exports = sendPollHelper;
