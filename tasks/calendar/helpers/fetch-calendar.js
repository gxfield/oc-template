/**
 * Calendar task helper function.
 * Fetches calendar events and returns structured data.
 */

const { loadConfig, listEvents, todayBounds, thisWeekBounds, nextNDaysBounds } = require('../../../calendar/calendar');

/**
 * Fetches calendar events for a given date range.
 *
 * @param {object} parameters - Request parameters (may contain range, days, maxResults)
 * @param {object} context - Execution context (task, intent, previousResult)
 * @returns {Promise<object>} Structured event data with events array, count, and range
 */
async function fetchCalendar(parameters, context) {
  const config = loadConfig();
  const calendarId = config.calendarId;

  // Determine range (default: 'today')
  const range = parameters.range || 'today';

  // Build options based on range
  let options = {};

  switch (range) {
    case 'today':
      options = { ...todayBounds(), maxResults: 50 };
      break;

    case 'week':
      options = { ...thisWeekBounds(), maxResults: 50 };
      break;

    case 'upcoming':
      const days = parameters.days || 7;
      options = { ...nextNDaysBounds(days), maxResults: 50 };
      break;

    case 'list':
      options = { maxResults: parameters.maxResults || 10 };
      break;

    default:
      options = { ...todayBounds(), maxResults: 50 };
  }

  // Fetch events from Google Calendar
  const events = await listEvents(calendarId, options);

  // Map to structured format
  const mappedEvents = events.map(event => ({
    id: event.id,
    summary: event.summary || '(no title)',
    start: event.start.dateTime || event.start.date,
    end: event.end.dateTime || event.end.date,
    allDay: !!event.start.date,
    description: event.description || null,
    location: event.location || null
  }));

  return {
    events: mappedEvents,
    count: mappedEvents.length,
    range: parameters.range || 'today'
  };
}

module.exports = {
  fetchCalendar
};
