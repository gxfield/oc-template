/**
 * Shared Telegram Bot API utilities.
 * Provides credential loading and HTTP request helper for Telegram poll operations.
 */

require('dotenv').config({ quiet: true });
const https = require('https');
const fs = require('fs');
const path = require('path');

/**
 * Loads Telegram credentials from environment or credentials.json.
 *
 * @returns {{ botToken: string, chatId: string, userIds: object }}
 */
function loadTelegramCredentials() {
  let botToken = process.env.TELEGRAM_BOT_TOKEN;
  let chatId = process.env.TELEGRAM_CHAT_ID;
  let userIds = {};

  // Load user IDs from environment variables
  if (process.env.TELEGRAM_USER_ID_GREG) {
    userIds.Greg = process.env.TELEGRAM_USER_ID_GREG;
  }
  if (process.env.TELEGRAM_USER_ID_DANIELLE) {
    userIds.Danielle = process.env.TELEGRAM_USER_ID_DANIELLE;
  }

  // Fallback to credentials.json if not in environment
  if (!botToken || !chatId || Object.keys(userIds).length === 0) {
    try {
      const creds = JSON.parse(
        fs.readFileSync(path.join(__dirname, '..', '..', '..', 'credentials.json'), 'utf8')
      );
      if (!botToken) botToken = creds.telegram_bot_token;
      if (!chatId) chatId = creds.telegram_chat_id;
      if (creds.telegram_user_ids && Object.keys(userIds).length === 0) {
        userIds = creds.telegram_user_ids;
      }
    } catch (_) {}
  }

  if (!botToken) {
    throw new Error('TELEGRAM_BOT_TOKEN not found in environment or credentials.json');
  }
  if (!chatId) {
    throw new Error('TELEGRAM_CHAT_ID not found in environment or credentials.json');
  }
  if (!userIds || Object.keys(userIds).length === 0) {
    throw new Error('TELEGRAM_USER_ID_* variables not found in environment or telegram_user_ids not found in credentials.json');
  }

  return { botToken, chatId, userIds };
}

/**
 * Makes an HTTPS request to the Telegram Bot API.
 *
 * @param {string} method - API method (e.g., 'sendPoll', 'stopPoll', 'sendMessage')
 * @param {string} botToken - Telegram Bot API token
 * @param {object} body - Request body object
 * @returns {Promise<object>} Parsed JSON response
 */
function telegramRequest(method, botToken, body) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.telegram.org',
      path: `/bot${botToken}/${method}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode >= 400) {
          return reject(new Error(`Telegram API error ${res.statusCode}: ${data}`));
        }
        try {
          const parsed = JSON.parse(data);
          if (!parsed.ok) {
            return reject(new Error(`Telegram API returned ok: false - ${parsed.description || 'unknown error'}`));
          }
          resolve(parsed);
        } catch (err) {
          reject(new Error(`Failed to parse Telegram response: ${err.message}`));
        }
      });
    });

    req.on('error', (err) => {
      reject(new Error(`Telegram request failed: ${err.message}`));
    });

    req.write(JSON.stringify(body));
    req.end();
  });
}

/**
 * Sends a poll to a Telegram chat.
 *
 * @param {string} botToken - Telegram Bot API token
 * @param {string} chatId - Chat ID to send poll to
 * @param {string} question - Poll question
 * @param {string[]} options - Array of poll options (2-10 items)
 * @returns {Promise<object>} API response with result.poll.id and result.message_id
 */
function sendPoll(botToken, chatId, question, options) {
  return telegramRequest('sendPoll', botToken, {
    chat_id: chatId,
    question: question,
    options: options,
    is_anonymous: false,
    type: 'regular',
    allows_multiple_answers: false
  });
}

/**
 * Stops an active poll.
 *
 * @param {string} botToken - Telegram Bot API token
 * @param {string} chatId - Chat ID where poll was sent
 * @param {number} messageId - Message ID of the poll
 * @returns {Promise<object>} API response with stopped poll result
 */
function stopPoll(botToken, chatId, messageId) {
  return telegramRequest('stopPoll', botToken, {
    chat_id: chatId,
    message_id: messageId
  });
}

/**
 * Sends a text message to a Telegram chat.
 *
 * @param {string} botToken - Telegram Bot API token
 * @param {string} chatId - Chat ID to send message to
 * @param {string} text - Message text
 * @returns {Promise<object>} API response with message result
 */
function sendMessage(botToken, chatId, text) {
  return telegramRequest('sendMessage', botToken, {
    chat_id: chatId,
    text: text
  });
}

module.exports = {
  loadTelegramCredentials,
  telegramRequest,
  sendPoll,
  stopPoll,
  sendMessage
};
