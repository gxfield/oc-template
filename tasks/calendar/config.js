/**
 * Calendar task configuration.
 * Provides access to Google Calendar events through the task orchestrator.
 */

const { fetchCalendar } = require('./helpers/fetch-calendar');

module.exports = {
  task: 'calendar',
  intents: {
    'get': {
      helpers: ['fetchCalendar']
    }
  },
  helpers: {
    'fetchCalendar': fetchCalendar
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
