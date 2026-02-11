/**
 * Task orchestrator - config-driven task runner factory.
 * Takes a TaskConfig object and returns a runner function that executes the task pipeline.
 */

const { createLLMPayload, createErrorPayload } = require('./types');

/**
 * Creates a task runner from a TaskConfig object.
 *
 * TaskConfig shape:
 * {
 *   task: 'echo',                      // task name (string)
 *   intents: {                         // map of intent name -> intent config
 *     'get': {
 *       helpers: ['echo'],             // ordered list of helper function names to call
 *       validate: (params) => null,    // optional param validator, returns error string or null
 *     }
 *   },
 *   helpers: {                         // map of helper name -> helper function
 *     'echo': helperFunction
 *   }
 * }
 *
 * @param {object} taskConfig - Task configuration object
 * @returns {function} Async runner function: (normalizedRequest) => LLMPayload
 */
function createRunner(taskConfig) {
  return async function runner(normalizedRequest) {
    const { task, intent, parameters } = normalizedRequest;

    try {
      // Step 1: Look up intent
      const intentConfig = taskConfig.intents[intent];
      if (!intentConfig) {
        return createErrorPayload(
          task,
          intent,
          parameters,
          `Unknown intent: ${intent} for task: ${task}`
        );
      }

      // Step 2: Validate parameters if validator exists
      if (intentConfig.validate) {
        const validationError = intentConfig.validate(parameters);
        if (validationError) {
          return createErrorPayload(task, intent, parameters, validationError);
        }
      }

      // Step 3: Execute helpers sequentially
      let previousResult = null;
      const context = {
        task: taskConfig.task,
        intent: intent,
        previousResult: null
      };

      for (const helperName of intentConfig.helpers) {
        const helper = taskConfig.helpers[helperName];
        if (!helper) {
          return createErrorPayload(
            task,
            intent,
            parameters,
            `Helper not found: ${helperName}`
          );
        }

        context.previousResult = previousResult;
        previousResult = await helper(parameters, context);
      }

      // Step 4: Wrap in LLMPayload
      return createLLMPayload(task, intent, parameters, previousResult);

    } catch (error) {
      // Step 5: Catch any errors and return error payload
      return createErrorPayload(task, intent, parameters, error.message);
    }
  };
}

module.exports = {
  createRunner
};
