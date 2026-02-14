/**
 * Todoist task helper - creates a new task in a project.
 */

const { loadCredentials, todoistRequest } = require('./todoist-api');

/**
 * Creates a task in a Todoist project.
 *
 * @param {object} parameters - { project, content, description?, due_string?, priority? }
 * @param {object} context - Execution context
 * @returns {Promise<object>} { created: true, task: {...} }
 */
async function createTask(parameters, context) {
  const { apiKey, projects } = loadCredentials();
  const project = parameters.project || 'todos';
  const projectId = projects[project];

  if (!projectId) {
    throw new Error(`Unknown project: ${project}. Available: ${Object.keys(projects).join(', ')}`);
  }

  const body = {
    content: parameters.content,
    project_id: projectId
  };

  if (parameters.description) body.description = parameters.description;
  if (parameters.due_string) body.due_string = parameters.due_string;
  if (parameters.priority) body.priority = Number(parameters.priority);

  const task = await todoistRequest('POST', '/rest/v2/tasks', apiKey, body);

  return {
    created: true,
    task: {
      id: task.id,
      content: task.content,
      description: task.description || null,
      priority: task.priority,
      due: task.due ? task.due.string : null,
      url: task.url
    }
  };
}

module.exports = {
  createTask
};
