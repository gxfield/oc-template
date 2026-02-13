/**
 * Core type constructors for task architecture.
 * Defines NormalizedTaskRequest (input) and LLMPayload (output) shapes.
 */

/**
 * Creates a normalized task request object.
 *
 * @param {string} task - Task module name (required)
 * @param {string} intent - What to do (required)
 * @param {object} parameters - Intent-specific params (default {})
 * @param {string} raw - Original input for debugging (default '')
 * @returns {NormalizedTaskRequest}
 * @throws {Error} If task or intent is missing
 */
function createTaskRequest(task, intent, parameters = {}, raw = '') {
  if (!task || typeof task !== 'string') {
    throw new Error('task is required and must be a non-empty string');
  }
  if (!intent || typeof intent !== 'string') {
    throw new Error('intent is required and must be a non-empty string');
  }
  if (typeof parameters !== 'object' || Array.isArray(parameters) || parameters === null) {
    throw new Error('parameters must be an object (not array or null)');
  }

  return {
    task,
    intent,
    parameters,
    raw
  };
}

/**
 * Creates an LLM payload object (successful task result).
 *
 * @param {string} task - Task module name
 * @param {string} intent - What was done
 * @param {object} parameters - What was requested
 * @param {*} data - The actual result (object or array)
 * @param {object} meta - Metadata (optional, merged with defaults)
 * @returns {LLMPayload}
 */
function createLLMPayload(task, intent, parameters, data, meta = {}) {
  return {
    task,
    intent,
    parameters,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      cached: false,
      error: null,
      ...meta
    }
  };
}

/**
 * Creates an error payload (failed task result).
 *
 * @param {string} task - Task module name
 * @param {string} intent - What was attempted
 * @param {object} parameters - What was requested
 * @param {string} errorMessage - Error description
 * @returns {LLMPayload}
 */
function createErrorPayload(task, intent, parameters, errorMessage) {
  return createLLMPayload(task, intent, parameters, null, {
    error: errorMessage
  });
}

module.exports = {
  createTaskRequest,
  createLLMPayload,
  createErrorPayload
};
