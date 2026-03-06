#!/usr/bin/env node
/**
 * Poll workflow for meal planning.
 * Creates recipe polls, waits for voting, handles results.
 */

const { runTask } = require('../index');
const { getDinnerRecipes, selectRecipe } = require('./recipe-selector');
const { loadTelegramCredentials, sendMessage } = require('../poll/helpers/telegram-api');

/**
 * Sleep helper
 * @param {number} ms - Milliseconds to sleep
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Send announcement to Telegram
 * @param {string} message - Message to send
 */
async function announce(message) {
  try {
    const { botToken, chatId } = loadTelegramCredentials();
    await sendMessage(botToken, chatId, message);
  } catch (err) {
    console.error(`Failed to send announcement: ${err.message}`);
  }
}

/**
 * Create a poll for a recipe
 * @param {object} recipe - Recipe object from selector
 * @returns {Promise<object>} Poll creation result
 */
async function createRecipePoll(recipe) {
  const request = {
    task: 'poll',
    intent: 'create',
    parameters: {
      question: `Should we have ${recipe.title} for dinner?`,
      options: 'Yes,No',
      timeout: 15 // 15 minutes
    }
  };

  const result = await runTask(request);
  
  if (result.meta.error) {
    throw new Error(result.meta.error);
  }

  return result.data;
}

/**
 * Wait for poll to finish and get result
 * Sleeps for the configured timeout, then fetches results directly from Telegram API
 * @returns {Promise<object>} { winner: 'Yes'|'No'|'Tie', votes: {...} }
 */
async function waitForPollResult() {
  const fs = require('fs');
  const path = require('path');
  const { getPollResults } = require('../poll/helpers/get-poll-results');
  const pollStateFile = path.join(__dirname, '../../memory/poll-state.json');
  
  // Read the active poll state to get timeout duration and poll details
  let pollState;
  try {
    const stateData = fs.readFileSync(pollStateFile, 'utf8');
    pollState = JSON.parse(stateData);
  } catch (err) {
    throw new Error(`Failed to read poll state: ${err.message}`);
  }
  
  if (!pollState.activePoll) {
    throw new Error('No active poll found in state');
  }
  
  const { chatId, messageId, timeoutMinutes, options } = pollState.activePoll;
  
  // Wait for the configured timeout period
  const timeoutMs = timeoutMinutes * 60 * 1000;
  console.log(`Waiting ${timeoutMinutes} minutes for poll to complete...`);
  await sleep(timeoutMs);
  
  // Fetch actual results from Telegram by stopping the poll
  console.log('Timeout reached, fetching results from Telegram...');
  const telegramResult = await getPollResults(chatId, messageId);
  
  console.log(`Telegram results: ${JSON.stringify(telegramResult)}`);
  
  // Map Telegram option texts back to our Yes/No format
  // (assuming the poll was created with options[0] = "Yes", options[1] = "No")
  const yesVotes = telegramResult.votes[options[0]] || 0;
  const noVotes = telegramResult.votes[options[1]] || 0;
  
  if (telegramResult.tie) {
    return {
      winner: 'Tie',
      votes: { Yes: yesVotes, No: noVotes },
      timedOut: true
    };
  } else if (telegramResult.winner === options[0]) {
    return {
      winner: 'Yes',
      votes: { Yes: yesVotes, No: noVotes },
      timedOut: true
    };
  } else {
    return {
      winner: 'No',
      votes: { Yes: yesVotes, No: noVotes },
      timedOut: true
    };
  }
}

/**
 * Run poll workflow for a single meal slot
 * @param {string} dayName - e.g., "Monday"
 * @param {Array} excludeRecipes - Recipe file names to exclude
 * @returns {Promise<object>} { recipe, result }
 */
async function pollForMeal(dayName, excludeRecipes = []) {
  const fs = require('fs');
  const path = require('path');
  const { clearActivePoll } = require('../poll/helpers/poll-state');
  
  const recipes = getDinnerRecipes();
  let attempts = 0;
  const maxAttempts = 5; // Prevent infinite loops

  while (attempts < maxAttempts) {
    attempts++;

    // Select a recipe
    const recipe = selectRecipe(recipes, excludeRecipes);
    if (!recipe) {
      throw new Error('No recipes available after exclusions');
    }

    console.log(`[${dayName}] Attempt ${attempts}: Suggesting ${recipe.title}`);

    // Create poll
    const pollData = await createRecipePoll(recipe);
    console.log(`[${dayName}] Poll created (ID: ${pollData.pollId}), waiting for votes...`);

    // Wait for result
    const result = await waitForPollResult();
    console.log(`[${dayName}] Poll finished: ${result.winner} (Yes: ${result.votes.Yes || 0}, No: ${result.votes.No || 0})`);

    // Clear poll state after getting result
    clearActivePoll();

    if (result.winner === 'Yes') {
      // Winner! Return this recipe
      await announce(`✅ ${dayName} dinner confirmed: ${recipe.title}`);
      return { recipe, result };
    } else if (result.winner === 'Tie') {
      // Tie - bot breaks tie in favor of Yes (because we suggested it)
      console.log(`[${dayName}] Tie detected - I'm voting Yes! ${recipe.title} it is.`);
      await announce(`🤝 Tie on ${dayName}! I'm breaking the tie - let's do ${recipe.title}!`);
      return { recipe, result: { ...result, winner: 'Yes (Tie-breaker)' } };
    } else {
      // No won - try another recipe
      console.log(`[${dayName}] "No" won, suggesting alternative...`);
      await announce(`❌ Looks like no one wants ${recipe.title}. Suggesting something else for ${dayName}...`);
      excludeRecipes.push(recipe.fileName);
      // Loop continues
    }
  }

  throw new Error(`[${dayName}] Max attempts (${maxAttempts}) reached without finding accepted recipe`);
}

/**
 * Run full week meal planning workflow
 * @returns {Promise<object>} { Monday: recipe, Tuesday: recipe, ... }
 */
async function planWeekMeals() {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const plan = {};
  const usedRecipes = []; // Track used recipes to avoid duplicates in same week

  await announce('🍽️ Good morning! Time to plan next week\'s dinners. Let\'s vote on Monday through Friday! 🗳️');

  for (const day of days) {
    console.log(`\n=== Planning ${day} ===`);
    const { recipe } = await pollForMeal(day, usedRecipes);
    plan[day] = recipe;
    usedRecipes.push(recipe.fileName);
    console.log(`✅ ${day} confirmed: ${recipe.title}`);
  }

  await announce('🎉 All done! Next week\'s dinners are set. Check /household/meals/this-week.md for the full plan!');

  return plan;
}

module.exports = {
  createRecipePoll,
  waitForPollResult,
  pollForMeal,
  planWeekMeals
};

// CLI mode
if (require.main === module) {
  const action = process.argv[2];

  if (action === 'test-single') {
    const day = process.argv[3] || 'Monday';
    pollForMeal(day).then(result => {
      console.log('\n=== Final Result ===');
      console.log(JSON.stringify(result, null, 2));
    }).catch(console.error);
  } else if (action === 'plan-week') {
    planWeekMeals().then(plan => {
      console.log('\n=== Week Plan ===');
      console.log(JSON.stringify(plan, null, 2));
    }).catch(console.error);
  } else {
    console.log('Usage:');
    console.log('  node poll-workflow.js test-single [dayName]');
    console.log('  node poll-workflow.js plan-week');
  }
}
