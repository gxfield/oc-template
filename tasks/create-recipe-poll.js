#!/usr/bin/env node
const { runTask } = require('./index');

async function main() {
  const request = {
    task: 'poll',
    intent: 'create',
    parameters: {
      question: 'Should we have Chicken Parmesan for dinner?',
      options: 'Yes,No'
    }
  };
  
  const result = await runTask(request);
  console.log(JSON.stringify(result, null, 2));
}

main().catch(console.error);
