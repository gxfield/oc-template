/**
 * Stop poll helper.
 * Closes an active poll and clears state.
 */

const { loadTelegramCredentials, stopPoll } = require('./telegram-api');
const { loadPollState, clearActivePoll } = require('./poll-state');

/**
 * Stops the currently active poll.
 *
 * @param {object} parameters - Task parameters
 * @param {object} context - Task context
 * @returns {Promise<object>} Stop result
 */
async function stopPollHelper(parameters, context) {
  // Load credentials
  const { botToken } = loadTelegramCredentials();

  // Load poll state
  const state = loadPollState();

  // Check for active poll
  if (!state.activePoll || state.activePoll.status !== 'open') {
    throw new Error('No active poll to stop.');
  }

  // Stop the poll via Telegram API
  await stopPoll(botToken, state.activePoll.chatId, state.activePoll.messageId);

  // Save question before clearing state
  const question = state.activePoll.question;

  // Clear poll state
  clearActivePoll();

  // Return result
  return {
    stopped: true,
    question: question
  };
}

module.exports = stopPollHelper;
