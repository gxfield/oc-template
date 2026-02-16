# Environment Variables Setup

This project uses environment variables to securely store sensitive credentials like API keys and tokens.

## Quick Setup

1. **Copy the example file:**
   ```bash
   cp .env.example .env
   ```

2. **Edit `.env` and add your credentials:**
   ```bash
   nano .env
   ```

3. **Never commit `.env` to version control** (it's already in `.gitignore`)

## Required Environment Variables

### Telegram Bot
- `TELEGRAM_BOT_TOKEN` - Your Telegram bot token from @BotFather
- `TELEGRAM_CHAT_ID` - The chat/group ID where the bot operates
- `TELEGRAM_USER_ID_GREG` - Telegram user ID for Greg
- `TELEGRAM_USER_ID_DANIELLE` - Telegram user ID for Danielle

### Weather API
- `OPENWEATHER_API_KEY` - API key from OpenWeatherMap

### Todoist API
- `TODOIST_API_KEY` - Your Todoist API token
- `TODOIST_PROJECT_TODOS` - Project ID for todos
- `TODOIST_PROJECT_SHOPPING` - Project ID for shopping list

### Google Calendar Service Account
- `GOOGLE_CALENDAR_TYPE` - Always "service_account"
- `GOOGLE_CALENDAR_PROJECT_ID` - Your GCP project ID
- `GOOGLE_CALENDAR_PRIVATE_KEY_ID` - Service account private key ID
- `GOOGLE_CALENDAR_PRIVATE_KEY` - Service account private key (multi-line, in quotes)
- `GOOGLE_CALENDAR_CLIENT_EMAIL` - Service account email
- `GOOGLE_CALENDAR_CLIENT_ID` - Service account client ID
- `GOOGLE_CALENDAR_AUTH_URI` - OAuth2 auth URI
- `GOOGLE_CALENDAR_TOKEN_URI` - OAuth2 token URI
- `GOOGLE_CALENDAR_AUTH_PROVIDER_CERT_URL` - Provider cert URL
- `GOOGLE_CALENDAR_CLIENT_CERT_URL` - Client cert URL
- `GOOGLE_CALENDAR_UNIVERSE_DOMAIN` - Usually "googleapis.com"

## Fallback to credentials.json

The system will fallback to reading from `credentials.json` if environment variables are not set. However, using `.env` is recommended for better security and easier deployment.

## Security Best Practices

1. ✅ **DO:** Keep `.env` in `.gitignore`
2. ✅ **DO:** Use `.env.example` as a template (without real values)
3. ✅ **DO:** Share `.env` securely (encrypted, not in plain text)
4. ❌ **DON'T:** Commit `.env` to version control
5. ❌ **DON'T:** Share `.env` in public channels or screenshots

## Troubleshooting

If you get errors about missing credentials:
1. Check that `.env` exists in the workspace root
2. Verify all required variables are set
3. Check for typos in variable names
4. Make sure multi-line values (like private keys) are properly quoted
5. Restart the application after changing `.env`
