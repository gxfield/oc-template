/**
 * Todoist task helper - fetches tasks from a project.
 */

const { loadCredentials, todoistRequest } = require('./todoist-api');

/**
 * Fetches tasks from a Todoist project.
 *
 * @param {object} parameters - { project: "todos"|"shopping" }
 * @param {object} context - Execution context
 * @returns {Promise<object>} { tasks, count, project }
 */
async function fetchTasks(parameters, context) {
  const { apiKey, projects } = loadCredentials();
  const project = parameters.project || 'todos';
  const projectId = projects[project];

  if (!projectId) {
    throw new Error(`Unknown project: ${project}. Available: ${Object.keys(projects).join(', ')}`);
  }

  const tasks = await todoistRequest('GET', `/rest/v2/tasks?project_id=${projectId}`, apiKey);

  return {
    tasks: tasks.map(t => ({
      id: t.id,
      content: t.content,
      description: t.description || null,
      priority: t.priority,
      due: t.due ? t.due.string : null,
      url: t.url
    })),
    count: tasks.length,
    project
  };
}

module.exports = {
  fetchTasks
};
