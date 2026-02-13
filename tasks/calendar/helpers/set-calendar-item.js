/**
 * Calendar task helper function.
 * Creates a new calendar event.
 */

const { loadConfig, createEvent } = require('../../../calendar/calendar');

/**
 * Creates a calendar event.
 *
 * @param {object} parameters - Request parameters (summary, start, end, description, location, allDay, date)
 * @param {object} context - Execution context (task, intent, previousResult)
 * @returns {Promise<object>} Structured confirmation with created event details
 */
async function setCalendarItem(parameters, context) {
  const config = loadConfig();
  const calendarId = config.calendarId;
  const tz = config.timeZone || 'America/Los_Angeles';

  // Extract parameters
  const { summary, start, end, description, location, allDay, date } = parameters;

  // Build event data based on event type
  let eventData = {
    summary,
    description: description || ''
  };

  // Determine if this is an all-day event or timed event
  if (allDay === true || date) {
    // All-day event
    const eventDate = date || start; // Use date parameter or fall back to start
    eventData.start = { date: eventDate };
    eventData.end = { date: eventDate };
  } else {
    // Timed event
    eventData.start = { dateTime: start, timeZone: tz };
    eventData.end = { dateTime: end, timeZone: tz };
  }

  // Add location if provided
  if (location) {
    eventData.location = location;
  }

  // Create the event via calendar.js
  const result = await createEvent(calendarId, eventData);

  // Return structured response
  return {
    created: true,
    event: {
      id: result.id,
      summary: result.summary,
      start: result.start.dateTime || result.start.date,
      end: result.end.dateTime || result.end.date,
      allDay: !!result.start.date,
      htmlLink: result.htmlLink || null
    }
  };
}

module.exports = {
  setCalendarItem
};
