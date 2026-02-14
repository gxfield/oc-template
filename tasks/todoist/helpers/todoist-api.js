/**
 * Shared Todoist API utilities.
 * Provides credential loading and HTTP request helper for all todoist helpers.
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

/**
 * Loads Todoist credentials from environment or credentials.json.
 *
 * @returns {{ apiKey: string, projects: { todos: string, shopping: string } }}
 */
function loadCredentials() {
  let apiKey = process.env.TODOIST_API_KEY;
  let projects = null;

  // Try credentials.json
  try {
    const creds = JSON.parse(
      fs.readFileSync(path.join(__dirname, '..', '..', '..', 'credentials.json'), 'utf8')
    );
    if (!apiKey) apiKey = creds.todoist_api_key;
    if (creds.todoist_projects) projects = creds.todoist_projects;
  } catch (_) {}

  if (!apiKey) {
    throw new Error('todoist_api_key not found in environment or credentials.json');
  }
  if (!projects || (!projects.todos && !projects.shopping)) {
    throw new Error('todoist_projects not found in credentials.json (need project IDs for todos and/or shopping)');
  }

  return { apiKey, projects };
}

/**
 * Makes an HTTPS request to the Todoist REST API.
 *
 * @param {string} method - HTTP method (GET, POST, DELETE)
 * @param {string} urlPath - API path (e.g., '/rest/v2/tasks')
 * @param {string} apiKey - Todoist API key
 * @param {object} [body] - Request body for POST requests
 * @returns {Promise<object|null>} Parsed JSON response, or null for 204 No Content
 */
function todoistRequest(method, urlPath, apiKey, body) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.todoist.com',
      path: urlPath,
      method: method,
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      // 204 No Content (e.g., close task)
      if (res.statusCode === 204) {
        return resolve(null);
      }

      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode >= 400) {
          return reject(new Error(`Todoist API error ${res.statusCode}: ${data}`));
        }
        try {
          resolve(JSON.parse(data));
        } catch (err) {
          reject(new Error(`Failed to parse Todoist response: ${err.message}`));
        }
      });
    });

    req.on('error', (err) => {
      reject(new Error(`Todoist request failed: ${err.message}`));
    });

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

module.exports = {
  loadCredentials,
  todoistRequest
};
