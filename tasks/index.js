/**
 * Task system entry point.
 * Provides a task registry and unified interface for agents to execute tasks.
 */

const { normalizeRequest } = require('./read-msg');
const { createRunner } = require('./orchestrator');
const { createErrorPayload } = require('./types');
const cache = require('./cache');

// Clean stale entries on startup
cache.clearExpired();

/**
 * Task registry - map of task names to their TaskConfig objects.
 * To add a new task: require its config.js and add one line here.
 */
const registry = {
  echo: require('./echo/config'),
};

/**
 * Executes a task from raw input (string or object).
 *
 * Pipeline:
 * 1. Normalize input to NormalizedTaskRequest
 * 2. Look up task in registry
 * 3. Create runner from task config
 * 4. Execute runner and return LLMPayload
 *
 * @param {string|object} input - Raw request (string like "echo get hello" or object)
 * @returns {Promise<LLMPayload>} Task execution result
 */
async function runTask(input) {
  try {
    // Step 1: Normalize request
    const request = normalizeRequest(input);

    // Step 2: Look up task in registry
    const taskConfig = registry[request.task];
    if (!taskConfig) {
      const availableTasks = Object.keys(registry).join(', ');
      return createErrorPayload(
        request.task,
        request.intent,
        request.parameters,
        `Unknown task: ${request.task}. Available tasks: ${availableTasks}`
      );
    }

    // Step 3: Create runner
    const runner = createRunner(taskConfig);

    // Step 4: Execute and return
    return await runner(request);

  } catch (error) {
    // Handle normalization errors or unexpected failures
    return createErrorPayload('unknown', 'unknown', {}, error.message);
  }
}

module.exports = {
  runTask
};

// CLI mode: node tasks/index.js "echo get hello"
if (require.main === module) {
  const input = process.argv.slice(2).join(' ');
  runTask(input).then(payload => {
    console.log(JSON.stringify(payload, null, 2));
  });
}
