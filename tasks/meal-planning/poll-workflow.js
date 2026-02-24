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
      timeout: 60 // 1 hour
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
 * Polls every 5 seconds for 1 hour + 5 min grace period
 * @returns {Promise<object>} { winner: 'Yes'|'No'|'Tie', votes: {...} }
 */
async function waitForPollResult() {
  const fs = require('fs');
  const path = require('path');
  const pollStateFile = path.join(__dirname, '../../memory/poll-state.json');
  
  const maxWaitSeconds = (60 * 60) + (5 * 60); // 1 hour + 5 min grace
  const pollIntervalSeconds = 5;
  let elapsed = 0;

  while (elapsed < maxWaitSeconds) {
    await sleep(pollIntervalSeconds * 1000);
    elapsed += pollIntervalSeconds;

    // Check if poll has finished via check-timeout (handles auto-resolution)
    const checkRequest = {
      task: 'poll',
      intent: 'check-timeout',
      parameters: {}
    };

    const checkResult = await runTask(checkRequest);

    if (checkResult.data && checkResult.data.timedOut) {
      // Poll auto-resolved due to timeout
      return {
        winner: checkResult.data.winner,
        votes: {},
        timedOut: true
      };
    }

    // Also check poll state directly to see if all users voted
    try {
      const stateData = fs.readFileSync(pollStateFile, 'utf8');
      const state = JSON.parse(stateData);
      
      if (!state.activePoll || state.activePoll.status !== 'open') {
        // Poll was closed - determine winner from votes
        if (state.activePoll && state.activePoll.votes) {
          const votes = state.activePoll.votes;
          const voteCounts = {};
          
          for (const optionId of Object.values(votes)) {
            voteCounts[optionId] = (voteCounts[optionId] || 0) + 1;
          }
          
          // Find winner
          const maxCount = Math.max(...Object.values(voteCounts), 0);
          const leadingOptions = Object.keys(voteCounts)
            .filter(optionId => voteCounts[optionId] === maxCount)
            .map(id => parseInt(id));
          
          if (leadingOptions.length === 1) {
            const winnerOption = state.activePoll.options[leadingOptions[0]];
            return { winner: winnerOption, votes: voteCounts, timedOut: false };
          } else if (leadingOptions.length > 1) {
            // Tie
            return { winner: 'Tie', votes: voteCounts, timedOut: false };
          }
        }
        
        // Closed with no votes
        return { winner: 'No', votes: {}, timedOut: false };
      }
    } catch (err) {
      // State file issues - continue waiting
    }
  }

  throw new Error('Poll timeout exceeded maximum wait time');
}

/**
 * Run poll workflow for a single meal slot
 * @param {string} dayName - e.g., "Monday"
 * @param {Array} excludeRecipes - Recipe file names to exclude
 * @returns {Promise<object>} { recipe, result }
 */
async function pollForMeal(dayName, excludeRecipes = []) {
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
