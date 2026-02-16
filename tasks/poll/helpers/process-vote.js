/**
 * Vote processing helper for poll task.
 * Handles incoming poll_answer updates, tracks votes, detects ties, and resolves polls.
 */

const { loadPollState, savePollState, clearActivePoll } = require('./poll-state');
const { loadTelegramCredentials, stopPoll, sendMessage } = require('./telegram-api');
const { pickFromTiedOptions } = require('./tie-break');

/**
 * Processes a vote from a poll_answer update.
 *
 * @param {object} parameters - { userId: string, optionId: number|string }
 * @param {object} context - Task context (unused)
 * @returns {Promise<object>} Result object with vote status and resolution info
 */
async function processVote(parameters, context) {
  const { userId, optionId } = parameters;

  // Load current poll state
  const state = loadPollState();
  if (!state.activePoll || state.activePoll.status !== 'open') {
    throw new Error('No active poll found.');
  }

  // Load credentials to get expected voter IDs
  const { botToken, chatId, userIds } = loadTelegramCredentials();

  // Record the vote
  if (!state.activePoll.votes) {
    state.activePoll.votes = {};
  }
  state.activePoll.votes[userId] = parseInt(optionId);
  savePollState(state);

  // Get expected voter IDs (convert to strings for comparison)
  const expectedVoterIds = Object.values(userIds).map(id => String(id));
  const votedIds = Object.keys(state.activePoll.votes);

  // Check if all expected voters have voted
  const allVoted = expectedVoterIds.every(id => votedIds.includes(id));

  if (!allVoted) {
    // Not all votes are in yet - return waiting status
    const remainingIds = expectedVoterIds.filter(id => !votedIds.includes(id));
    const remainingNames = remainingIds.map(id => {
      // Map ID back to name
      const entry = Object.entries(userIds).find(([name, uid]) => String(uid) === id);
      return entry ? entry[0] : `User ${id}`;
    });

    return {
      recorded: true,
      waitingFor: remainingNames
    };
  }

  // All votes are in - determine the result
  const { winner, isTie } = determineWinner(state.activePoll);

  if (!isTie) {
    // Both users agreed - close poll silently (per user decision)
    await stopPoll(botToken, state.activePoll.chatId, state.activePoll.messageId);
    clearActivePoll();

    return {
      resolved: true,
      winner: state.activePoll.options[winner],
      tie: false,
      silent: true
    };
  } else {
    // Tie - bot must cast deciding vote
    const tiedOptionIndices = Object.keys(winner.tied).map(idx => parseInt(idx));
    const tiedOptionTexts = tiedOptionIndices.map(idx => state.activePoll.options[idx]);

    const { winner: winnerText, reasoning } = pickFromTiedOptions(
      tiedOptionTexts,
      state.activePoll.question
    );

    // Close the poll
    await stopPoll(botToken, state.activePoll.chatId, state.activePoll.messageId);

    // Send tie-break announcement
    const announcement = `Tie! 🤖 I'm going with ${winnerText} — ${reasoning}`;
    await sendMessage(botToken, state.activePoll.chatId, announcement);

    clearActivePoll();

    return {
      resolved: true,
      winner: winnerText,
      tie: true,
      reasoning,
      announcement
    };
  }
}

/**
 * Determines the winner from poll votes.
 * Returns the winning option index or tie information.
 *
 * @param {object} activePoll - The active poll state object
 * @returns {{ winner: number|object, isTie: boolean }}
 */
function determineWinner(activePoll) {
  const votes = activePoll.votes || {};
  const voteCounts = {};

  // Count votes per option
  for (const [userId, optionId] of Object.entries(votes)) {
    voteCounts[optionId] = (voteCounts[optionId] || 0) + 1;
  }

  // Find max vote count
  const maxCount = Math.max(...Object.values(voteCounts));

  // Get all options with max count
  const winners = Object.keys(voteCounts)
    .filter(optionId => voteCounts[optionId] === maxCount)
    .map(id => parseInt(id));

  if (winners.length === 1) {
    // Clear winner
    return { winner: winners[0], isTie: false };
  } else {
    // Tie - multiple options have the same max count
    const tied = {};
    winners.forEach(optionId => {
      tied[optionId] = voteCounts[optionId];
    });
    return { winner: { tied }, isTie: true };
  }
}

module.exports = processVote;
