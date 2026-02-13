/**
 * Calendar task configuration.
 * Provides access to Google Calendar events through the task orchestrator.
 */

const { fetchCalendar } = require('./helpers/fetch-calendar');
const { setCalendarItem } = require('./helpers/set-calendar-item');
const { removeCalendarItem } = require('./helpers/remove-calendar-item');

module.exports = {
  task: 'calendar',
  intents: {
    'get': {
      helpers: ['fetchCalendar']
    },
    'add': {
      helpers: ['setCalendarItem'],
      validate: (params) => {
        if (!params.summary) return 'summary is required to create an event';
        const isAllDay = params.allDay || params.date;
        if (!isAllDay && (!params.start || !params.end)) {
          return 'start and end are required for timed events (or use allDay/date for all-day events)';
        }
        return null;
      }
    },
    'remove': {
      helpers: ['removeCalendarItem', 'fetchCalendar'],
      validate: (params) => {
        if (!params.eventId) return 'eventId is required to delete an event';
        return null;
      }
    }
  },
  helpers: {
    'fetchCalendar': fetchCalendar,
    'setCalendarItem': setCalendarItem,
    'removeCalendarItem': removeCalendarItem
  },
  cache: {
    dailyReset: true,
    keyStrategy: (task, intent, params) => {
      const range = params.range || params.query || 'today';
      const days = params.days || '';
      return `${task}:${intent}:${range}${days ? ':' + days : ''}`;
    }
  }
};
