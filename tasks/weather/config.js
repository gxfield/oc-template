/**
 * Weather task configuration.
 * Provides access to OpenWeatherMap weather data through the task orchestrator.
 */

const { getWeather } = require('./helpers/get-weather');

module.exports = {
  task: 'weather',
  intents: {
    'get': {
      helpers: ['getWeather']
    }
  },
  helpers: {
    'getWeather': getWeather
  },
  cache: {
    ttl: 1800000,  // 30 minutes - weather data doesn't change every minute
    keyStrategy: (task, intent, params) => {
      const location = (params.location || 'Seattle,WA,US').toLowerCase();
      const units = params.units || 'imperial';
      return `${task}:${intent}:${location}:${units}`;
    }
  }
};
