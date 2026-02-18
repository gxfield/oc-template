/**
 * Weather task configuration.
 * Provides access to OpenWeatherMap weather data through the task orchestrator.
 */

const { getWeather } = require('./helpers/get-weather');
const { loadLocalConfig } = require('../local-config');

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
      const location = (params.location || loadLocalConfig().city).toLowerCase();
      const units = params.units || loadLocalConfig().units;
      return `${task}:${intent}:${location}:${units}`;
    }
  }
};
