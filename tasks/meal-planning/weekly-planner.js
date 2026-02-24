#!/usr/bin/env node
/**
 * Weekly meal planner orchestrator.
 * Runs every Thursday at 8 AM to plan next week's weeknight dinners.
 */

const { planWeekMeals } = require('./poll-workflow');
const { updateMealPlan } = require('./update-meal-plan');

/**
 * Main workflow
 */
async function main() {
  console.log('🍽️  Starting weekly meal planning workflow...');
  console.log('Planning weeknight dinners (Monday-Friday) for next week\n');

  try {
    // Run poll workflow for all 5 days
    const plan = await planWeekMeals();

    // Update meal plan file
    console.log('\n📝 Updating meal plan file...');
    updateMealPlan(plan);

    // Final summary
    console.log('\n✅ Weekly meal plan complete!');
    console.log('\n=== Next Week\'s Dinners ===');
    for (const [day, recipe] of Object.entries(plan)) {
      console.log(`${day}: ${recipe.title}`);
    }

    // Return success
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Meal planning workflow failed:');
    console.error(error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { main };
