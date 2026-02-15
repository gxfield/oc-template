# Phase 1: Todoist Fix + Media Server Research - Research

**Researched:** 2026-02-15
**Domain:** Task management integration debugging + Media server API integration
**Confidence:** HIGH (Todoist), MEDIUM (Media Server APIs)

## Summary

This phase has two independent goals:

**PRIMARY: Fix Todoist Integration** - The Todoist task system is built and working correctly, but fails at runtime because `credentials.json` doesn't exist in the workspace. The code expects credentials at `/Users/greg/ai/assistant/workspace-fixed/credentials.json` but only `credentials.json.example` exists. This is a **configuration issue**, not a code bug. The setup script (`setup.sh`) copies the example to `credentials.json`, but this hasn't been run yet or the file was not tracked in git (correctly gitignored). Fix: Run setup script and populate with real Todoist API key.

**SECONDARY: Media Server Research** - Overseerr, Sonarr, and Plex all expose REST APIs that can be controlled remotely. When running as Umbrel apps, they're accessible via local network HTTP requests using their standard ports (Overseerr: 5055, Sonarr: 8989, Plex: 32400). Authentication uses API keys passed in request headers. Integration from the OpenClaw Telegram bot is technically feasible - the task system architecture already supports adding new tasks with helper functions that make HTTP requests (similar to existing Todoist and Weather tasks).

**Primary recommendation:** Fix credentials.json by running setup.sh and adding Todoist API token. For media server control, create new task modules following the existing pattern (config.js + helpers/ directory) that make authenticated HTTP requests to Overseerr/Sonarr APIs.

## Standard Stack

### Core (Todoist Fix)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Node.js https | built-in | HTTP requests to Todoist API | Zero dependencies, native SSL support |
| Todoist REST API v2 | v2 (current) | Task CRUD operations | Official API, simple Bearer auth |
| credentials.json | file-based | API key storage | Secure, gitignored, workspace-local |

### Core (Media Server Integration)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Node.js https | built-in | HTTP requests to media server APIs | Consistent with existing tasks |
| Overseerr API | v1 | Request movies/TV shows | Official API with full CRUD |
| Sonarr API | v3 | Monitor/search TV series | Stable v3 API, well-documented |
| Plex API | unofficial | Library queries (optional) | Community-supported, read-only for this use case |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Task orchestrator | workspace v2.0 | Unified task execution | Always - all tasks use this |
| Cache layer | workspace v2.0 | Response caching with TTL | Optional - reduces API calls |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Native https | axios/node-fetch | More dependencies for same result; current code uses https successfully |
| File-based credentials | Environment vars | Less portable across OpenClaw deployments; files work well here |
| Overseerr | Requestrr | Overseerr has better API, active development, modern UI |

**Installation:**
```bash
# No new dependencies needed - using built-in Node.js https
# Just need to populate credentials.json with API keys
./setup.sh
```

## Architecture Patterns

### Recommended Project Structure (Media Server Tasks)

```
tasks/
├── overseerr/
│   ├── config.js           # Task config (intents: search, request)
│   └── helpers/
│       ├── overseerr-api.js    # Shared API client
│       ├── search-media.js     # Search for movies/shows
│       └── request-media.js    # Submit media request
├── sonarr/
│   ├── config.js           # Task config (intents: search, monitor)
│   └── helpers/
│       ├── sonarr-api.js       # Shared API client
│       ├── search-series.js    # Search for TV series
│       └── add-series.js       # Add series to monitoring
└── index.js                # Registry (add new tasks here)
```

### Pattern 1: Task Module with API Helper

**What:** Separate API client from business logic; shared credentials loading
**When to use:** All external API integrations (Todoist, Weather, Overseerr, Sonarr)
**Example:**

```javascript
// Source: tasks/todoist/helpers/todoist-api.js (existing pattern)
const https = require('https');
const fs = require('fs');
const path = require('path');

function loadCredentials() {
  const creds = JSON.parse(
    fs.readFileSync(path.join(__dirname, '..', '..', '..', 'credentials.json'), 'utf8')
  );
  if (!creds.overseerr_api_key) {
    throw new Error('overseerr_api_key not found in credentials.json');
  }
  if (!creds.overseerr_url) {
    throw new Error('overseerr_url not found in credentials.json');
  }
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
        try {
          resolve(JSON.parse(data));
        } catch (err) {
          reject(new Error(`Failed to parse response: ${err.message}`));
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

module.exports = { loadCredentials, overseerrRequest };
```

### Pattern 2: Task Config Registration

**What:** Register tasks in tasks/index.js registry for orchestrator discovery
**When to use:** Every new task module
**Example:**

```javascript
// Source: tasks/index.js (existing pattern)
const registry = {
  echo: require('./echo/config'),
  calendar: require('./calendar/config'),
  weather: require('./weather/config'),
  todoist: require('./todoist/config'),
  // Add new tasks here:
  overseerr: require('./overseerr/config'),
  sonarr: require('./sonarr/config'),
};
```

### Pattern 3: Credentials.json Structure

**What:** Single root-level credentials file with all API keys
**When to use:** Always - all credential loading points to this file
**Example:**

```json
{
  "google_calendar": { ... },
  "openweather_api_key": "...",
  "todoist_api_key": "...",
  "todoist_projects": {
    "todos": "...",
    "shopping": "..."
  },
  "overseerr_api_key": "...",
  "overseerr_url": "http://umbrel.local:5055",
  "sonarr_api_key": "...",
  "sonarr_url": "http://umbrel.local:8989"
}
```

### Anti-Patterns to Avoid

- **Don't hardcode API URLs** - Umbrel local IP may change; use config
- **Don't skip error handling** - API calls fail; wrap in try-catch with descriptive errors
- **Don't bypass orchestrator** - Always register tasks in index.js, don't create standalone scripts
- **Don't commit credentials.json** - Already gitignored; never remove from .gitignore

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| HTTP request retry logic | Custom backoff/retry | Let caller handle retries | Task orchestrator can retry failed calls; keep helpers simple |
| API response caching | In-memory cache per task | Task orchestrator cache layer | Already implemented, handles TTL and daily resets |
| Credential validation | Per-task validators | Shared loadCredentials pattern | DRY principle; all tasks validate same way |
| API rate limiting | Custom throttle | Simple error messages | Todoist/Overseerr have generous limits; handle 429s if they occur |

**Key insight:** The v2.0 task architecture already provides orchestration, caching, error handling, and parameter validation. New tasks should be thin wrappers around API calls - let the framework handle the complexity.

## Common Pitfalls

### Pitfall 1: Missing credentials.json at Runtime

**What goes wrong:** Code runs `fs.readFileSync('credentials.json')` and crashes with ENOENT
**Why it happens:** File is gitignored (correctly); needs manual creation on each deployment
**How to avoid:**
1. Run `./setup.sh` after cloning repo
2. Verify credentials exist before first task execution
3. Document in DEPLOY.md that setup.sh must be run

**Warning signs:** Error message "todoist_api_key not found in environment or credentials.json"

### Pitfall 2: Wrong Credential Path in Multi-Level Helpers

**What goes wrong:** Helpers in `tasks/todoist/helpers/` try to load `../credentials.json` (wrong level)
**Why it happens:** Path traversal from helper is `helpers/` -> `todoist/` -> `tasks/` -> `workspace/`
**How to avoid:** Always use `path.join(__dirname, '..', '..', '..', 'credentials.json')` from helpers (3 levels up)

**Warning signs:** Works from tasks/index.js but fails from individual helpers

### Pitfall 3: Umbrel Local Network Assumptions

**What goes wrong:** Hardcoding `http://192.168.1.100:5055` breaks when IP changes
**Why it happens:** DHCP assigns dynamic IPs; Umbrel local IP not static
**How to avoid:**
1. Use `umbrel.local` hostname if available (mDNS)
2. Store base URL in credentials.json as configurable value
3. Document that user must update URL if Umbrel IP changes

**Warning signs:** API requests timeout after router reboot or Umbrel restart

### Pitfall 4: OpenClaw Workspace Path Differences

**What goes wrong:** Code works locally at `/Users/greg/ai/assistant/workspace-fixed/` but fails on OpenClaw server
**Why it happens:** OpenClaw deploys workspace to `/data/.openclaw/workspace-home-assistant/` (see TOOLS.md)
**How to avoid:**
1. Use relative paths from workspace root (already done correctly)
2. Never hardcode absolute paths
3. Test that `node tasks/index.js` works from any cwd within workspace

**Warning signs:** "File not found" errors only on OpenClaw server, not local dev

## Code Examples

Verified patterns from codebase:

### Todoist API Request (Existing Pattern)

```javascript
// Source: tasks/todoist/helpers/todoist-api.js
function todoistRequest(method, urlPath, apiKey, body) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.todoist.com',
      path: urlPath,
      method: method,
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      if (res.statusCode === 204) {
        return resolve(null);  // No content (success)
      }

      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode >= 400) {
          return reject(new Error(`Todoist API error ${res.statusCode}: ${data}`));
        }
        try {
          resolve(JSON.parse(data));
        } catch (err) {
          reject(new Error(`Failed to parse Todoist response: ${err.message}`));
        }
      });
    });

    req.on('error', (err) => {
      reject(new Error(`Todoist request failed: ${err.message}`));
    });

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}
```

### Task Config with Validation (Existing Pattern)

```javascript
// Source: tasks/todoist/config.js
module.exports = {
  task: 'todoist',
  intents: {
    'get': {
      helpers: ['fetchTasks']
    },
    'add': {
      helpers: ['createTask', 'fetchTasks'],
      validate: (params) => {
        if (!params.content) return 'content is required to create a task';
        return null;
      }
    },
    'done': {
      helpers: ['completeTask'],
      validate: (params) => {
        if (!params.taskId) return 'taskId is required to complete a task';
        return null;
      }
    }
  },
  helpers: {
    'fetchTasks': fetchTasks,
    'createTask': createTask,
    'completeTask': completeTask
  },
  cache: {
    ttl: 300000,  // 5 minutes
    keyStrategy: (task, intent, params) => {
      const project = params.project || 'todos';
      return `${task}:${intent}:${project}`;
    }
  }
};
```

### CLI Invocation (How OpenClaw Calls Tasks)

```bash
# Source: QUICKSTART.md
# Command line usage from OpenClaw agent
node tasks/index.js "todoist get project=todos"
node tasks/index.js "todoist add project=shopping content=Milk"
node tasks/index.js "todoist done taskId=7891011"

# Future media server commands would follow same pattern
node tasks/index.js "overseerr search query=Inception"
node tasks/index.js "overseerr request mediaId=550 mediaType=movie"
node tasks/index.js "sonarr search query=Breaking Bad"
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Todoist Sync API | Todoist REST API v2 | 2022 (v1 deprecated) | Simpler auth, clearer endpoints |
| Per-task credential files | Single credentials.json | Phase 7 (v2.0) | Consolidated security, easier setup |
| Direct API calls in agents | Task orchestrator pattern | Phase 7 (v2.0) | Caching, validation, error handling built-in |
| Manual request tracking | Overseerr integration layer | Current (2025+) | UI-driven requests with approval workflow |

**Deprecated/outdated:**
- Todoist Sync API v1: Removed Nov 30, 2022 - use REST API v2
- Overseerr v0.x: v1.x is current stable (2025), API paths changed from /api/v0 to /api/v1
- Plex API documentation note: "This is deprecated REST API v2" refers to Todoist, not Plex (Plex has unofficial API)

## Open Questions

1. **Umbrel Network Access from External Server**
   - What we know: Overseerr/Sonarr run on Umbrel, accessible via local network HTTP
   - What's unclear: Is OpenClaw server on same local network as Umbrel, or remote?
   - Recommendation: If remote, need VPN/tunnel to Umbrel network; if local, direct HTTP works

2. **Overseerr Request Approval Workflow**
   - What we know: Overseerr has user quotas and admin approval features
   - What's unclear: Should bot auto-approve requests or require manual approval?
   - Recommendation: Start with manual approval (safer); API supports both modes

3. **Plex API Necessity**
   - What we know: Overseerr handles requests, Sonarr handles monitoring
   - What's unclear: Is direct Plex API access needed, or is Overseerr sufficient?
   - Recommendation: Start with Overseerr only; Plex API only if read-only library queries needed

4. **Current OpenClaw Deployment Location**
   - What we know: Workspace deployed to `/data/.openclaw/workspace-home-assistant/` (from TOOLS.md)
   - What's unclear: Is this path on the Umbrel server or separate machine?
   - Recommendation: Verify deployment location before planning media server integration

## Sources

### Primary (HIGH confidence)

- Todoist REST API v2: https://developer.todoist.com/rest/v2/
- Overseerr API Docs: https://api-docs.overseerr.dev/
- Sonarr API Docs: https://sonarr.tv/docs/api/
- Existing codebase: tasks/todoist/, tasks/weather/, tasks/orchestrator.js (v2.0 Task Architecture)
- Workspace structure: .planning/codebase/ARCHITECTURE.md, STRUCTURE.md

### Secondary (MEDIUM confidence)

- [REST API Reference | Todoist Developer](https://developer.todoist.com/rest/v2/)
- [Swagger UI - Overseerr](https://api-docs.overseerr.dev/)
- [Sonarr API Docs](https://sonarr.tv/docs/api/)
- [Python-PlexAPI Documentation](https://python-plexapi.readthedocs.io/en/latest/introduction.html)
- [Remote control API · plexinc/plex-media-player Wiki](https://github.com/plexinc/plex-media-player/wiki/Remote-control-API)
- [Telegram - OpenClaw](https://docs.openclaw.ai/channels/telegram)
- [OpenClaw (Clawd Bot) Telegram integration guide](https://www.eesel.ai/blog/clawd-bot-telegram-integration)
- [How To Setup Overseerr in Docker](https://smarthomepursuits.com/setup-overseerr)
- [Docker Compose Plex + Sonarr + Radarr + Overseerr setup](https://gist.github.com/rickklaasboer/b5c159833ff2971fccd32296d8ba2260)

### Tertiary (LOW confidence - needs validation)

- Umbrel app networking: Community forums suggest umbrel.local mDNS access works, but needs testing
- Plex API unofficial status: Community-maintained, not officially supported by Plex Inc.

## Metadata

**Confidence breakdown:**
- Todoist fix: HIGH - Root cause identified (missing credentials.json), fix is straightforward (run setup.sh)
- Media server APIs: MEDIUM - APIs exist and are documented, but deployment context (network access, OpenClaw location) needs verification
- Integration pattern: HIGH - v2.0 task architecture is proven (4 tasks already implemented), pattern is clear

**Research date:** 2026-02-15
**Valid until:** 60 days for Todoist (stable API), 30 days for media server APIs (active development)
