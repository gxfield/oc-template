#!/usr/bin/env node
const { runTask } = require('./index');

async function main() {
  const request = {
    task: 'poll',
    intent: 'create',
    parameters: {
      question: 'What should we have for dinner tonight?',
      options: 'Tacos,Chicken Parmesan,Stir Fry,Pasta'
    }
  };
  
  const result = await runTask(request);
  console.log(JSON.stringify(result, null, 2));
}

main().catch(console.error);
