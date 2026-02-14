/**
 * Request normalization layer for task architecture.
 * Converts raw upstream requests (string or object) into NormalizedTaskRequest objects.
 */

const { createTaskRequest } = require('./types');

/**
 * Normalizes a raw request into a NormalizedTaskRequest.
 *
 * Accepts two input formats:
 * 1. String: "calendar get today" -> {task: 'calendar', intent: 'get', parameters: {query: 'today'}}
 * 2. Object: {task: 'calendar', intent: 'get', parameters: {date: 'today'}}
 *
 * @param {string|object} input - Raw request from upstream (OpenClaw agent platform)
 * @returns {NormalizedTaskRequest}
 * @throws {Error} If input is invalid or missing required fields
 */
function normalizeRequest(input) {
  // Handle object input
  if (typeof input === 'object' && input !== null && !Array.isArray(input)) {
    const { task, intent, parameters = {} } = input;

    if (!task || typeof task !== 'string') {
      throw new Error('task is required and must be a non-empty string');
    }
    if (!intent || typeof intent !== 'string') {
      throw new Error('intent is required and must be a non-empty string');
    }
    if (typeof parameters !== 'object' || Array.isArray(parameters) || parameters === null) {
      throw new Error('parameters must be an object (not array or null)');
    }

    return createTaskRequest(task, intent, parameters, JSON.stringify(input));
  }

  // Handle string input
  if (typeof input === 'string') {
    const trimmed = input.trim();

    if (trimmed === '') {
      throw new Error('input string cannot be empty');
    }

    const tokens = trimmed.split(/\s+/);
    const task = tokens[0];
    const intent = tokens.length > 1 ? tokens[1] : 'get';
    const queryTokens = tokens.slice(2);

    // Parse key=value pairs into parameters object, remainder goes to query
    const parameters = {};
    const freeTokens = [];
    for (const token of queryTokens) {
      const eqIdx = token.indexOf('=');
      if (eqIdx > 0) {
        parameters[token.slice(0, eqIdx)] = token.slice(eqIdx + 1);
      } else {
        freeTokens.push(token);
      }
    }
    if (freeTokens.length > 0) {
      parameters.query = freeTokens.join(' ');
    }

    return createTaskRequest(task, intent, parameters, input);
  }

  // Invalid input type
  throw new Error('input must be a string or object');
}

module.exports = {
  normalizeRequest
};
