# Phase 2: Telegram Poll Creation - Context

**Gathered:** 2026-02-16
**Status:** Ready for planning

<domain>
## Phase Boundary

Add the ability for the Telegram bot to create polls in a group chat, act as a tie-breaking voter using AI reasoning, and optionally take downstream actions based on results. Scoped to household decision-making (dinner, movie night, weekend plans) between two users in a group chat.

</domain>

<decisions>
## Implementation Decisions

### Poll trigger & flow
- Natural language intent detection (no /poll command)
- One-shot: user provides question and options in a single message
- Bot sends the poll immediately, no preview/confirmation step
- If bot can't parse a clear question + options, it asks for clarification

### Poll content & options
- Single choice only (no multi-select)
- Public votes (voters visible, needed for tie-break detection)
- 2-4 options per poll
- Household decision focus: dinner, movie night, weekend plans, etc.

### Bot as tie-breaker voter
- Bot waits until both users have voted
- Only votes if there's a tie
- Uses AI reasoning with context (e.g. recent meals, preferences) to decide
- Announces tie-breaking vote with explanation (e.g. "Tie! I'm going with tacos because you had pizza yesterday")

### Poll audience & delivery
- Group chat only (not DMs)
- Poll posted in the same chat where it was requested
- Permissions: user, wife, and the bot can create polls
- Uses Telegram poll answer updates to detect when both have voted (public polls enable this)

### Results & follow-up
- Auto-close poll after tie-break vote (or after both vote if no tie)
- Bot only announces result on tie-break; stays silent if both agreed
- Context-dependent downstream actions (e.g. meal poll winner added to meal plan)
- Timeout: poll expires after a set time if someone doesn't vote; bot picks leading option or decides

### Architecture
- Must follow the existing task architecture pattern defined in `/tasks` directory
- Build as a task within the established framework

### Claude's Discretion
- Timeout duration
- Exact intent detection phrasing/patterns
- How to determine which downstream action to take based on poll context
- Tone of tie-breaking announcement messages

</decisions>

<specifics>
## Specific Ideas

- Bot acts as the household "tie-breaker" -- just two humans voting, bot only steps in on ties
- AI reasoning should reference real context (what you ate recently, what you did last weekend) not just random picks
- Should feel like a fun household decision helper, not a formal voting system

</specifics>

<deferred>
## Deferred Ideas

None -- discussion stayed within phase scope

</deferred>

---

*Phase: 02-add-the-ability-for-the-bot-to-create-a-telegram-poll*
*Context gathered: 2026-02-16*
