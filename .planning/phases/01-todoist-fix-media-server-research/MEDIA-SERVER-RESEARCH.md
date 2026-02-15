# Media Server Management from Telegram Bot - Feasibility Analysis

**Researched:** 2026-02-15
**Status:** FEASIBLE - All services expose REST APIs
**Recommendation:** Start with Overseerr, then Sonarr, defer Plex

## Executive Summary

Yes, managing Plex, Overseerr, and Sonarr on Umbrel from the OpenClaw Telegram bot is technically feasible. All three services expose REST APIs accessible via local network HTTP. The existing v2.0 task architecture supports this pattern - we already use it for Todoist and Weather integrations.

**Recommended implementation order:**
1. **Overseerr** (highest value) - Request movies/TV shows, search media catalog
2. **Sonarr** (monitoring) - Check download queue, search series, monitor shows
3. **Plex** (lowest priority) - Read-only library queries; Overseerr handles most use cases

The main unknown is network topology: OpenClaw server must be on the same network as Umbrel OR use VPN/tunnel for remote access.

## Service-by-Service Analysis

### Overseerr (Port 5055)

**What it does:** Media request management system. Users search for movies/shows and submit requests. Integrates with Sonarr/Radarr to automatically download approved content.

**Why control from Telegram:** Most useful integration - "request Inception" from chat instead of opening Overseerr web UI. Natural language to media request.

**API Base URL:** `http://umbrel.local:5055/api/v1/` (or `http://192.168.x.x:5055/api/v1/`)

**Authentication:** `X-Api-Key` header with API token from Overseerr settings

**Key Endpoints:**

| Endpoint | Method | Purpose | Bot Command Example |
|----------|--------|---------|---------------------|
| `/api/v1/search?query=Inception` | GET | Search TMDB for movies/shows | "search for Inception" |
| `/api/v1/request` | POST | Submit media request | "request Inception" |
| `/api/v1/request?take=20` | GET | List recent requests | "what have I requested" |
| `/api/v1/request/{id}/approve` | POST | Approve pending request (admin) | "approve request 123" |

**Example CLI invocation:**
```bash
# Future task module usage
node tasks/index.js "overseerr search query=Inception"
node tasks/index.js "overseerr request mediaId=550 mediaType=movie"
node tasks/index.js "overseerr requests limit=10"
```

**Request body example (POST /api/v1/request):**
```json
{
  "mediaType": "movie",
  "mediaId": 550,
  "is4k": false
}
```

### Sonarr (Port 8989)

**What it does:** TV series monitoring and automation. Tracks show release schedules, searches indexers, sends to download clients.

**Why control from Telegram:** Check what's downloading, search for new series, monitor show status without opening web UI.

**API Base URL:** `http://umbrel.local:8989/api/v3/` (or `http://192.168.x.x:8989/api/v3/`)

**Authentication:** `X-Api-Key` header with API token from Sonarr Settings > General

**Key Endpoints:**

| Endpoint | Method | Purpose | Bot Command Example |
|----------|--------|---------|---------------------|
| `/api/v3/series/lookup?term=Breaking+Bad` | GET | Search for TV series | "search for Breaking Bad" |
| `/api/v3/series` | POST | Add series to monitoring | "add Breaking Bad to Sonarr" |
| `/api/v3/queue` | GET | Get download queue status | "what's downloading" |
| `/api/v3/calendar?start=...&end=...` | GET | Upcoming episode releases | "what episodes are coming" |

**Example CLI invocation:**
```bash
# Future task module usage
node tasks/index.js "sonarr search term=Breaking Bad"
node tasks/index.js "sonarr queue"
node tasks/index.js "sonarr calendar days=7"
```

**Add series body example (POST /api/v3/series):**
```json
{
  "title": "Breaking Bad",
  "tvdbId": 81189,
  "qualityProfileId": 1,
  "rootFolderPath": "/data/media/tv",
  "monitored": true
}
```

### Plex (Port 32400)

**What it does:** Media server for streaming movies/TV shows. Organizes libraries, transcodes content, serves to clients.

**Why control from Telegram:** Query library contents, search for specific media, check server status. Less useful than Overseerr/Sonarr since it's read-only.

**API Base URL:** `http://umbrel.local:32400/` (or `http://192.168.x.x:32400/`)

**Authentication:** `X-Plex-Token` header or `X-Plex-Token` query param with Plex token

**Note:** Unofficial API - community-documented, less stable than Overseerr/Sonarr official APIs

**Key Endpoints:**

| Endpoint | Method | Purpose | Bot Command Example |
|----------|--------|---------|---------------------|
| `/library/sections` | GET | List all libraries | "list Plex libraries" |
| `/library/sections/{id}/all` | GET | Get all items in library | "show movies" |
| `/library/sections/{id}/search?query=Inception` | GET | Search library | "find Inception in Plex" |
| `/status/sessions` | GET | Current streaming sessions | "who's watching Plex" |

**Example CLI invocation:**
```bash
# Future task module usage (lower priority)
node tasks/index.js "plex search library=1 query=Inception"
node tasks/index.js "plex sessions"
```

**Token note:** Plex token obtained from account.plexapp.com or by inspecting Plex Web requests (not user-friendly).

## Implementation Approach

Each service follows the existing v2.0 task module pattern:

**Filesystem structure:**
```
tasks/
├── overseerr/
│   ├── config.js              # Task registration, intent validation
│   └── helpers/
│       ├── overseerr-api.js   # Shared API client (loadCredentials, makeRequest)
│       ├── search-media.js    # Search TMDB via Overseerr
│       └── request-media.js   # Submit media request
├── sonarr/
│   ├── config.js
│   └── helpers/
│       ├── sonarr-api.js
│       ├── search-series.js
│       └── get-queue.js
└── index.js                   # Registry - add new tasks here
```

**Credentials in credentials.json:**
```json
{
  "overseerr_api_key": "abc123...",
  "overseerr_url": "http://umbrel.local:5055",
  "sonarr_api_key": "xyz789...",
  "sonarr_url": "http://umbrel.local:8989",
  "plex_token": "...",
  "plex_url": "http://umbrel.local:32400"
}
```

**API client pattern (follows todoist-api.js):**
```javascript
// tasks/overseerr/helpers/overseerr-api.js
const https = require('https');
const fs = require('fs');
const path = require('path');

function loadCredentials() {
  const creds = JSON.parse(
    fs.readFileSync(path.join(__dirname, '..', '..', '..', 'credentials.json'), 'utf8')
  );
  if (!creds.overseerr_api_key) throw new Error('overseerr_api_key not found');
  if (!creds.overseerr_url) throw new Error('overseerr_url not found');
  return { apiKey: creds.overseerr_api_key, url: creds.overseerr_url };
}

function overseerrRequest(method, urlPath, apiKey, baseUrl, body) {
  return new Promise((resolve, reject) => {
    const url = new URL(urlPath, baseUrl);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'X-Api-Key': apiKey,
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode >= 400) {
          return reject(new Error(`Overseerr API error ${res.statusCode}: ${data}`));
        }
        resolve(JSON.parse(data));
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

module.exports = { loadCredentials, overseerrRequest };
```

**Task config registration:**
```javascript
// tasks/index.js
const registry = {
  echo: require('./echo/config'),
  calendar: require('./calendar/config'),
  weather: require('./weather/config'),
  todoist: require('./todoist/config'),
  overseerr: require('./overseerr/config'),  // Add new task
  sonarr: require('./sonarr/config'),        // Add new task
};
```

**Bot command examples from Telegram:**
- "request Inception" → Overseerr search + request flow
- "search for Breaking Bad" → Overseerr or Sonarr lookup
- "what's downloading" → Sonarr queue status
- "what episodes are coming this week" → Sonarr calendar

## Network Considerations

**Key constraint:** Umbrel apps are accessible via HTTP on local network only (no built-in external access).

**Access patterns:**

| OpenClaw Location | Umbrel Access Method | Configuration |
|-------------------|---------------------|---------------|
| Same local network | Direct HTTP to `umbrel.local` or IP | No additional setup |
| Remote server | VPN/Tailscale to local network | VPN client on OpenClaw server |
| Remote server | Cloudflare Tunnel / ngrok to Umbrel | Tunnel from Umbrel to internet |

**Recommended approach:**
1. **Use mDNS hostname:** `umbrel.local` instead of IP address (survives DHCP changes)
2. **Store base URL in credentials.json:** Configurable per deployment
3. **Test connectivity first:** `curl http://umbrel.local:5055/api/v1/status` before implementing tasks

**Network topology verification needed:**
```bash
# From OpenClaw server, test Umbrel reachability
curl http://umbrel.local:5055/api/v1/status
curl http://192.168.x.x:8989/api/v3/system/status
```

If curl fails → OpenClaw is NOT on same network → need VPN/tunnel.

## Open Questions for User

Before implementing media server control, need answers to:

1. **Network Access:** Is the OpenClaw server on the same local network as Umbrel?
   - If yes: Direct HTTP works
   - If no: Need VPN (Tailscale/Wireguard) or tunnel (Cloudflare/ngrok)

2. **Priority Service:** Which service to implement first?
   - Recommendation: Overseerr (highest value for media requests)
   - Alternative: Sonarr (if monitoring is more important than requesting)

3. **Request Approval Workflow:** Should media requests auto-approve or require manual approval?
   - Auto-approve: Bot submits and auto-approves (faster, less control)
   - Manual approval: Bot submits, admin approves via Overseerr UI (safer)
   - Recommendation: Manual approval initially (matches Overseerr default behavior)

4. **Plex API Necessity:** Do you need direct Plex library queries, or is Overseerr search sufficient?
   - Overseerr searches TMDB (all movies/shows, even not in library)
   - Plex searches local library only (what's already downloaded)
   - Recommendation: Start with Overseerr only; add Plex later if needed

5. **Umbrel App Status:** Confirm Overseerr and Sonarr are already installed and configured on Umbrel
   - Need API keys from each service's settings page
   - Need to verify network ports are accessible

## Recommended Next Steps

**Phase N (Future): Implement Overseerr Task Module**
- Create `tasks/overseerr/` directory with config.js and helpers
- Implement search-media and request-media helpers
- Add Overseerr credentials to credentials.json
- Register in tasks/index.js
- Test CLI: `node tasks/index.js "overseerr search query=Inception"`
- Integration: OpenClaw agent calls task orchestrator with natural language → intent mapping

**Phase N+1 (Future): Implement Sonarr Task Module**
- Create `tasks/sonarr/` directory
- Implement search-series, get-queue, get-calendar helpers
- Add Sonarr credentials to credentials.json
- Test CLI: `node tasks/index.js "sonarr queue"`

**Deferred: Plex Direct API**
- Overseerr handles search and request (most common use cases)
- Plex API is unofficial and less stable
- Only implement if read-only library queries are critical
- Can revisit after Overseerr/Sonarr are working

**Immediate prerequisite:** Verify network access from OpenClaw server to Umbrel apps (see Network Considerations section).

## Technical Feasibility Summary

| Service | API Stability | Auth Complexity | Integration Effort | Value |
|---------|---------------|-----------------|-------------------|-------|
| Overseerr | Official v1 API | Simple (API key) | Low (follows existing pattern) | High |
| Sonarr | Official v3 API | Simple (API key) | Low (follows existing pattern) | Medium |
| Plex | Unofficial community | Medium (token from web) | Medium (no official docs) | Low |

**Confidence: HIGH** - This integration is straightforward given the existing v2.0 task architecture. The pattern is proven (Todoist, Weather), APIs are well-documented (except Plex), and no new dependencies are needed (Node.js built-in https).

**Biggest risk:** Network topology mismatch. If OpenClaw server is remote and cannot reach Umbrel local network, integration will not work without VPN/tunnel infrastructure.

**Estimated effort per service:**
- Overseerr: 2-3 hours (API client + 3-4 helper functions + config + testing)
- Sonarr: 2-3 hours (similar complexity)
- Plex: 3-4 hours (unofficial API requires more trial-and-error)

**Total implementation effort:** 6-10 hours for Overseerr + Sonarr (recommended scope). Add 3-4 hours if Plex is required.
