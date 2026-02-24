#!/usr/bin/env node
/**
 * Recipe selector for meal planning.
 * Filters dinner recipes and applies weighted random selection based on preferences.
 */

const fs = require('fs');
const path = require('path');

const RECIPES_DIR = path.join(__dirname, '../../household/meals/recipes');
const PREFS_FILE = path.join(__dirname, '../../memory/recipe-preferences.json');

/**
 * Load recipe preferences (heart reactions tracking)
 * @returns {object} { recipeName: heartCount, ... }
 */
function loadPreferences() {
  try {
    const data = fs.readFileSync(PREFS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    return {};
  }
}

/**
 * Save recipe preferences
 * @param {object} prefs - Preferences object
 */
function savePreferences(prefs) {
  const dir = path.dirname(PREFS_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(PREFS_FILE, JSON.stringify(prefs, null, 2), 'utf8');
}

/**
 * Parse recipe frontmatter to extract tags
 * @param {string} filePath - Path to recipe file
 * @returns {object|null} { title, tags: [...] } or null if invalid
 */
function parseRecipe(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
    if (!frontmatterMatch) return null;

    const frontmatter = frontmatterMatch[1];
    const titleMatch = frontmatter.match(/^title:\s*(.+)$/m);
    const tagsMatch = frontmatter.match(/^tags:\s*\n((?:\s+-\s+.+\n?)+)/m);

    if (!titleMatch) return null;

    const title = titleMatch[1].trim();
    const tags = tagsMatch
      ? tagsMatch[1].split('\n').map(line => line.trim().replace(/^-\s*/, '')).filter(Boolean)
      : [];

    return { title, tags, fileName: path.basename(filePath, '.md') };
  } catch (err) {
    return null;
  }
}

/**
 * Get all dinner recipes
 * @returns {Array} [{ title, tags, fileName }, ...]
 */
function getDinnerRecipes() {
  const files = fs.readdirSync(RECIPES_DIR).filter(f => f.endsWith('.md'));
  const recipes = [];

  for (const file of files) {
    const recipe = parseRecipe(path.join(RECIPES_DIR, file));
    if (recipe && recipe.tags.includes('dinner')) {
      recipes.push(recipe);
    }
  }

  return recipes;
}

/**
 * Weighted random selection
 * Recipes with heart reactions get 3x weight
 * @param {Array} recipes - Array of recipe objects
 * @param {Array} excludeFileNames - Recipe file names to exclude
 * @returns {object|null} Selected recipe or null if none available
 */
function selectRecipe(recipes, excludeFileNames = []) {
  const prefs = loadPreferences();
  const available = recipes.filter(r => !excludeFileNames.includes(r.fileName));

  if (available.length === 0) return null;

  // Build weighted array
  const weighted = [];
  for (const recipe of available) {
    const heartCount = prefs[recipe.fileName] || 0;
    const weight = heartCount > 0 ? 3 : 1; // 3x weight for hearted recipes
    for (let i = 0; i < weight; i++) {
      weighted.push(recipe);
    }
  }

  // Random selection
  const selected = weighted[Math.floor(Math.random() * weighted.length)];
  return selected;
}

/**
 * Increment heart count for a recipe
 * @param {string} fileName - Recipe file name (without .md)
 */
function addHeart(fileName) {
  const prefs = loadPreferences();
  prefs[fileName] = (prefs[fileName] || 0) + 1;
  savePreferences(prefs);
}

module.exports = {
  getDinnerRecipes,
  selectRecipe,
  addHeart,
  loadPreferences
};

// CLI mode
if (require.main === module) {
  const action = process.argv[2];

  if (action === 'list') {
    const recipes = getDinnerRecipes();
    console.log(JSON.stringify(recipes, null, 2));
  } else if (action === 'select') {
    const exclude = process.argv.slice(3);
    const recipes = getDinnerRecipes();
    const selected = selectRecipe(recipes, exclude);
    console.log(JSON.stringify(selected, null, 2));
  } else if (action === 'heart') {
    const fileName = process.argv[3];
    addHeart(fileName);
    console.log(`Added heart to ${fileName}`);
  } else if (action === 'prefs') {
    const prefs = loadPreferences();
    console.log(JSON.stringify(prefs, null, 2));
  } else {
    console.log('Usage:');
    console.log('  node recipe-selector.js list');
    console.log('  node recipe-selector.js select [exclude1] [exclude2]...');
    console.log('  node recipe-selector.js heart <fileName>');
    console.log('  node recipe-selector.js prefs');
  }
}
