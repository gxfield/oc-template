#!/usr/bin/env node
const { loadCredentials, todoistRequest } = require('./todoist/helpers/todoist-api');

async function addItem(content) {
  const { apiKey, projects } = loadCredentials();
  const projectId = projects.shopping;
  
  const body = {
    content: content,
    project_id: projectId
  };
  
  const task = await todoistRequest('POST', '/api/v1/tasks', apiKey, body);
  console.log(`Added: ${task.content} (${task.id})`);
  return task;
}

async function main() {
  const items = process.argv.slice(2);
  for (const item of items) {
    await addItem(item);
  }
}

main().catch(console.error);
