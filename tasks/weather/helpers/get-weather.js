/**
 * Weather task helper function.
 * Fetches weather data from OpenWeatherMap API and returns structured data.
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const DEFAULT_LOCATION = 'Seattle,WA,US';
const DEFAULT_UNITS = 'imperial';

/**
 * Helper function to make HTTPS GET requests and return JSON.
 *
 * @param {string} url - The URL to fetch
 * @returns {Promise<object>} Parsed JSON response
 */
function httpsGet(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve(parsed);
        } catch (error) {
          reject(new Error(`Failed to parse JSON response: ${error.message}`));
        }
      });
    }).on('error', (error) => {
      reject(new Error(`HTTPS request failed: ${error.message}`));
    });
  });
}

/**
 * Fetches weather data for a given location.
 *
 * @param {object} parameters - Request parameters (may contain location, units)
 * @param {object} context - Execution context (task, intent, previousResult)
 * @returns {Promise<object>} Structured weather data with temperature, conditions, forecast, and timestamp
 */
async function getWeather(parameters, context) {
  // Fill defaults when parameters are missing
  const location = parameters.location || DEFAULT_LOCATION;
  const units = parameters.units || DEFAULT_UNITS;

  // Check for API key: env var first, then credentials.json
  let apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey) {
    try {
      const creds = JSON.parse(fs.readFileSync(path.join(__dirname, '..', '..', '..', 'credentials.json'), 'utf8'));
      apiKey = creds.openweather_api_key;
    } catch (_) {}
  }
  if (!apiKey) {
    throw new Error('OPENWEATHER_API_KEY not found in environment or credentials.json');
  }

  // Build API URLs
  const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(location)}&units=${units}&appid=${apiKey}`;
  const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(location)}&units=${units}&cnt=8&appid=${apiKey}`;

  // Fetch current weather
  const currentData = await httpsGet(currentWeatherUrl);

  // Check for API errors
  if (currentData.cod && currentData.cod !== 200) {
    throw new Error(currentData.message || 'API request failed');
  }

  // Fetch forecast
  const forecastData = await httpsGet(forecastUrl);

  // Check for forecast API errors
  if (forecastData.cod && forecastData.cod !== '200') {
    throw new Error(forecastData.message || 'Forecast API request failed');
  }

  // Return structured WeatherData
  return {
    location: currentData.name,
    temperature: {
      current: currentData.main.temp,
      feelsLike: currentData.main.feels_like,
      min: currentData.main.temp_min,
      max: currentData.main.temp_max
    },
    conditions: currentData.weather[0].description,
    humidity: currentData.main.humidity,
    wind: {
      speed: currentData.wind.speed,
      units: units === 'imperial' ? 'mph' : 'm/s'
    },
    forecast: forecastData.list.map(item => ({
      time: item.dt_txt,
      temp: item.main.temp,
      conditions: item.weather[0].description
    })),
    units: units,
    timestamp: new Date().toISOString()
  };
}

module.exports = {
  getWeather
};
