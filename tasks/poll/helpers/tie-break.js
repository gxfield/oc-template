/**
 * Shared tie-break logic for polls.
 * Uses household context (meal history) to pick between tied options intelligently.
 */

const fs = require('fs');
const path = require('path');

/**
 * Picks a winner from tied options using heuristic logic.
 * For meal-related polls: avoids recent repetition.
 * For other polls: picks randomly.
 *
 * @param {string[]} tiedOptions - Array of option texts that are tied
 * @param {string} question - The poll question (used to detect meal context)
 * @returns {{ winner: string, reasoning: string }}
 */
function pickFromTiedOptions(tiedOptions, question) {
  const isMealRelated = /dinner|eat|food|meal|lunch/i.test(question);

  if (isMealRelated) {
    return pickWithMealContext(tiedOptions);
  } else {
    return pickRandomly(tiedOptions);
  }
}

/**
 * Picks from tied options considering recent meal history.
 * Prefers the option that appears LEAST in recent meals.
 *
 * @param {string[]} tiedOptions - Array of option texts
 * @returns {{ winner: string, reasoning: string }}
 */
function pickWithMealContext(tiedOptions) {
  try {
    const mealPlanPath = path.join(__dirname, '..', '..', '..', 'household', 'meals', 'this-week.md');
    const mealPlan = fs.readFileSync(mealPlanPath, 'utf8');

    // Count how many times each option appears in the meal plan (case-insensitive)
    const counts = {};
    for (const option of tiedOptions) {
      const regex = new RegExp(option, 'gi');
      const matches = mealPlan.match(regex);
      counts[option] = matches ? matches.length : 0;
    }

    // Find the minimum count
    const minCount = Math.min(...Object.values(counts));

    // Get all options with the minimum count
    const leastRepeated = tiedOptions.filter(opt => counts[opt] === minCount);

    // If multiple have the same minimum count, pick randomly from those
    const winner = leastRepeated[Math.floor(Math.random() * leastRepeated.length)];

    // Generate reasoning
    let reasoning;
    if (minCount === 0 && leastRepeated.length === tiedOptions.length) {
      reasoning = "random pick since both are new this week";
    } else if (minCount === 0) {
      reasoning = `${winner} hasn't been on the menu recently`;
    } else {
      // Find the most repeated options for comparison
      const maxCount = Math.max(...Object.values(counts));
      const mostRepeated = tiedOptions.filter(opt => counts[opt] === maxCount);
      if (mostRepeated.length > 0 && mostRepeated[0] !== winner) {
        const plural = maxCount > 1 ? 'times' : 'time';
        reasoning = `you had ${mostRepeated[0]} ${maxCount} ${plural} this week already!`;
      } else {
        reasoning = `${winner} appears less frequently in recent meals`;
      }
    }

    return { winner, reasoning };
  } catch (err) {
    // If we can't read meal plan, fall back to random
    return pickRandomly(tiedOptions);
  }
}

/**
 * Picks randomly from tied options.
 *
 * @param {string[]} tiedOptions - Array of option texts
 * @returns {{ winner: string, reasoning: string }}
 */
function pickRandomly(tiedOptions) {
  const winner = tiedOptions[Math.floor(Math.random() * tiedOptions.length)];
  return {
    winner,
    reasoning: "random pick"
  };
}

module.exports = {
  pickFromTiedOptions
};
