#!/usr/bin/env node
/**
 * Helper script to add shopping items with spaces in names.
 * Usage: node add-items.js "Green beans" "Carbonaut bread"
 */

const { runTask } = require('./index');

async function main() {
  const items = process.argv.slice(2);
  
  for (const item of items) {
    const request = {
      task: 'todoist',
      intent: 'add',
      parameters: {
        project: 'shopping',
        content: item
      }
    };
    
    console.error('DEBUG: request =', JSON.stringify(request, null, 2));
    const result = await runTask(request);
    console.log(JSON.stringify(result, null, 2));
  }
}

main().catch(console.error);
