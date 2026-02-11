/**
 * Echo task helper function.
 * Simple proof of the task pattern - echoes back the input.
 */

/**
 * Echoes the query parameter back to the caller.
 *
 * @param {object} parameters - Request parameters (may contain query)
 * @param {object} context - Execution context (task, intent, previousResult)
 * @returns {object} Echo response with message and echoed flag
 */
function echo(parameters, context) {
  return {
    message: parameters.query || 'echo',
    echoed: true
  };
}

module.exports = {
  echo
};
