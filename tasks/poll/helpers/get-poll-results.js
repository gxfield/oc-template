/**
 * Get poll results directly from Telegram API.
 * Uses stopPoll to fetch final vote counts without relying on poll_answer updates.
 */

const { loadTelegramCredentials, stopPoll } = require('./telegram-api');

/**
 * Fetches poll results by stopping the poll and reading Telegram's response.
 * 
 * Telegram's stopPoll returns a Poll object with:
 * - poll.options[i].voter_count: number of votes for option i
 * - poll.total_voter_count: total number of voters
 * 
 * @param {string} chatId - Chat ID where poll was sent
 * @param {number} messageId - Message ID of the poll
 * @returns {Promise<object>} { winner: string, votes: { optionText: count }, totalVoters: number }
 */
async function getPollResults(chatId, messageId) {
  const { botToken } = loadTelegramCredentials();
  
  // Stop the poll to get final results
  const response = await stopPoll(botToken, chatId, messageId);
  
  if (!response.result || !response.result.options) {
    throw new Error('Invalid stopPoll response - missing poll data');
  }
  
  const poll = response.result;
  const options = poll.options;
  const totalVoters = poll.total_voter_count || 0;
  
  // Build vote counts object: { "Option Text": voterCount }
  const votes = {};
  options.forEach(option => {
    votes[option.text] = option.voter_count || 0;
  });
  
  // Determine winner
  const maxVotes = Math.max(...options.map(opt => opt.voter_count || 0), 0);
  
  if (maxVotes === 0) {
    // No votes at all - default to "No"
    return {
      winner: 'No',
      votes,
      totalVoters,
      tie: false
    };
  }
  
  // Find all options with max votes
  const winningOptions = options.filter(opt => (opt.voter_count || 0) === maxVotes);
  
  if (winningOptions.length === 1) {
    // Clear winner
    return {
      winner: winningOptions[0].text,
      votes,
      totalVoters,
      tie: false
    };
  } else {
    // Tie - multiple options have same vote count
    return {
      winner: 'Tie',
      votes,
      totalVoters,
      tie: true,
      tiedOptions: winningOptions.map(opt => opt.text)
    };
  }
}

module.exports = { getPollResults };
