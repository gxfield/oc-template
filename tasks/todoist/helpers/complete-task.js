/**
 * Todoist task helper - marks a task as complete.
 */

const { loadCredentials, todoistRequest } = require('./todoist-api');

/**
 * Completes (closes) a Todoist task.
 *
 * @param {object} parameters - { taskId }
 * @param {object} context - Execution context
 * @returns {Promise<object>} { completed: true, taskId }
 */
async function completeTask(parameters, context) {
  const { apiKey } = loadCredentials();
  const { taskId } = parameters;

  if (!taskId) {
    throw new Error('taskId is required to complete a task');
  }

  await todoistRequest('POST', `/rest/v2/tasks/${taskId}/close`, apiKey);

  return {
    completed: true,
    taskId
  };
}

module.exports = {
  completeTask
};
