#!/usr/bin/env node
/**
 * Meal plan updater.
 * Updates household/meals/this-week.md with the weekly plan.
 */

const fs = require('fs');
const path = require('path');

const MEAL_PLAN_FILE = path.join(__dirname, '../../household/meals/this-week.md');

/**
 * Read current meal plan file
 * @returns {string} File content
 */
function readMealPlan() {
  return fs.readFileSync(MEAL_PLAN_FILE, 'utf8');
}

/**
 * Update meal plan for specific days
 * @param {object} plan - { Monday: recipe, Tuesday: recipe, ... }
 */
function updateMealPlan(plan) {
  let content = readMealPlan();

  // Update each day in the plan
  for (const [day, recipe] of Object.entries(plan)) {
    const currentLine = new RegExp(`^- ${day}: .+$`, 'm');
    const newLine = `- ${day}: ${recipe.title}`;
    
    if (content.match(currentLine)) {
      content = content.replace(currentLine, newLine);
    } else {
      // Day not found - this shouldn't happen with proper format
      console.warn(`Warning: ${day} not found in meal plan file`);
    }
  }

  // Write back
  fs.writeFileSync(MEAL_PLAN_FILE, content, 'utf8');
  console.log('Meal plan updated successfully');
}

/**
 * Clear meal plan (set all days to "No plan")
 */
function clearMealPlan() {
  let content = readMealPlan();
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  for (const day of days) {
    const currentLine = new RegExp(`^- ${day}: .+$`, 'm');
    const newLine = `- ${day}: No plan`;
    
    if (content.match(currentLine)) {
      content = content.replace(currentLine, newLine);
    }
  }

  fs.writeFileSync(MEAL_PLAN_FILE, content, 'utf8');
  console.log('Meal plan cleared');
}

module.exports = {
  readMealPlan,
  updateMealPlan,
  clearMealPlan
};

// CLI mode
if (require.main === module) {
  const action = process.argv[2];

  if (action === 'read') {
    console.log(readMealPlan());
  } else if (action === 'clear') {
    clearMealPlan();
  } else if (action === 'update') {
    // Test update
    const testPlan = {
      Monday: { title: 'Test Chicken Parmesan' },
      Tuesday: { title: 'Test Tacos' }
    };
    updateMealPlan(testPlan);
  } else {
    console.log('Usage:');
    console.log('  node update-meal-plan.js read');
    console.log('  node update-meal-plan.js clear');
    console.log('  node update-meal-plan.js update');
  }
}
