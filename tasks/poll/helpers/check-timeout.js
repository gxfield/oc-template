/**
 * Timeout checker for poll task.
 * Called during heartbeat to auto-resolve polls that have exceeded their timeout.
 */

const { loadPollState, clearActivePoll } = require('./poll-state');
const { loadTelegramCredentials, stopPoll, sendMessage } = require('./telegram-api');
const { pickFromTiedOptions } = require('./tie-break');

/**
 * Checks if the active poll has timed out and resolves it if needed.
 *
 * @param {object} parameters - No parameters required
 * @param {object} context - Task context (unused)
 * @returns {Promise<object>} Status object with timeout info and resolution
 */
async function checkPollTimeout(parameters, context) {
  // Load current poll state
  const state = loadPollState();
  if (!state.activePoll || state.activePoll.status !== 'open') {
    return { hasActivePoll: false };
  }

  // Load credentials
  const { botToken, chatId } = loadTelegramCredentials();

  // Calculate elapsed time
  const createdAt = new Date(state.activePoll.createdAt).getTime();
  const now = Date.now();
  const elapsed = now - createdAt;

  // Calculate timeout in milliseconds
  const timeoutMs = state.activePoll.timeoutMinutes * 60 * 1000;

  if (elapsed < timeoutMs) {
    // Poll hasn't timed out yet
    const minutesRemaining = Math.ceil((timeoutMs - elapsed) / 60000);
    return {
      hasActivePoll: true,
      timedOut: false,
      minutesRemaining
    };
  }

  // Poll has timed out - resolve it
  const votes = state.activePoll.votes || {};
  const voteCount = Object.keys(votes).length;

  let winner;
  let reasoning;

  if (voteCount === 0) {
    // No votes at all - pick randomly
    const options = state.activePoll.options;
    const randomIndex = Math.floor(Math.random() * options.length);
    winner = options[randomIndex];
    reasoning = `Nobody voted, so I'm deciding — ${winner} it is!`;
  } else {
    // Count votes per option
    const voteCounts = {};
    for (const [userId, optionId] of Object.entries(votes)) {
      voteCounts[optionId] = (voteCounts[optionId] || 0) + 1;
    }

    // Find max vote count
    const maxCount = Math.max(...Object.values(voteCounts));

    // Get all options with max count
    const leadingOptionIds = Object.keys(voteCounts)
      .filter(optionId => voteCounts[optionId] === maxCount)
      .map(id => parseInt(id));

    if (leadingOptionIds.length === 1) {
      // Clear leader
      winner = state.activePoll.options[leadingOptionIds[0]];
      reasoning = `Poll timed out — going with ${winner} since it was in the lead!`;
    } else {
      // Tied for the lead - use tie-break logic
      const tiedOptions = leadingOptionIds.map(idx => state.activePoll.options[idx]);
      const tieBreakResult = pickFromTiedOptions(tiedOptions, state.activePoll.question);
      winner = tieBreakResult.winner;
      reasoning = `Poll timed out with a tie — I'm picking ${winner}!`;
    }
  }

  // Close the poll and send announcement
  await stopPoll(botToken, state.activePoll.chatId, state.activePoll.messageId);
  const announcement = `⏰ Poll timed out! ${reasoning}`;
  await sendMessage(botToken, state.activePoll.chatId, announcement);

  clearActivePoll();

  return {
    hasActivePoll: true,
    timedOut: true,
    winner,
    reasoning
  };
}

module.exports = checkPollTimeout;
