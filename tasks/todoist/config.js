/**
 * Todoist task configuration.
 * Provides access to Todoist todos and shopping lists through the task orchestrator.
 */

const { fetchTasks } = require('./helpers/fetch-tasks');
const { createTask } = require('./helpers/create-task');
const { completeTask } = require('./helpers/complete-task');

module.exports = {
  task: 'todoist',
  intents: {
    'get': {
      helpers: ['fetchTasks']
    },
    'add': {
      helpers: ['createTask', 'fetchTasks'],
      validate: (params) => {
        if (!params.content) return 'content is required to create a task';
        return null;
      }
    },
    'done': {
      helpers: ['completeTask'],
      validate: (params) => {
        if (!params.taskId) return 'taskId is required to complete a task';
        return null;
      }
    }
  },
  helpers: {
    'fetchTasks': fetchTasks,
    'createTask': createTask,
    'completeTask': completeTask
  },
  cache: {
    ttl: 300000,  // 5 minutes
    keyStrategy: (task, intent, params) => {
      const project = params.project || 'todos';
      return `${task}:${intent}:${project}`;
    }
  }
};
