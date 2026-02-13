/**
 * Calendar task helper function.
 * Deletes a calendar event.
 */

const { loadConfig, deleteEvent } = require('../../../calendar/calendar');

/**
 * Deletes a calendar event.
 *
 * @param {object} parameters - Request parameters (eventId required)
 * @param {object} context - Execution context (task, intent, previousResult)
 * @returns {Promise<object>} Structured confirmation with deleted event ID
 */
async function removeCalendarItem(parameters, context) {
  const config = loadConfig();
  const calendarId = config.calendarId;

  // Extract required parameter
  const { eventId } = parameters;

  // Delete the event via calendar.js
  await deleteEvent(calendarId, eventId);

  // Return structured confirmation
  return {
    deleted: true,
    eventId: eventId
  };
}

module.exports = {
  removeCalendarItem
};
