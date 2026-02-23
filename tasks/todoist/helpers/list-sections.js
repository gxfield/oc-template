/**
 * Todoist sections helper - fetches sections from a project.
 */

const { loadCredentials, todoistRequest } = require('./todoist-api');

/**
 * Fetches sections from a Todoist project.
 *
 * @param {object} parameters - { project: "todos"|"shopping" }
 * @param {object} context - Execution context
 * @returns {Promise<object>} { sections, count, project }
 */
async function listSections(parameters, context) {
  const { apiKey, projects } = loadCredentials();
  const project = parameters.project || 'shopping';
  const projectId = projects[project];

  if (!projectId) {
    throw new Error(`Unknown project: ${project}. Available: ${Object.keys(projects).join(', ')}`);
  }

  const response = await todoistRequest('GET', `/api/v1/sections?project_id=${projectId}`, apiKey);
  const sections = response.results || response;

  return {
    sections: sections.map(s => ({
      id: s.id,
      name: s.name,
      order: s.section_order
    })),
    count: sections.length,
    project
  };
}

module.exports = {
  listSections
};
