# Phase 4: Recipe Library - Context

**Gathered:** 2026-02-22
**Status:** Ready for planning

<domain>
## Phase Boundary

Structured recipe files the agent can browse, search, and suggest from. Agent can create recipe files from user dictation. RSS briefing inspiration filtered to dinner-only recipes. Recipe creation from URLs, weekly voting automation, and grocery extraction are separate phases.

</domain>

<decisions>
## Implementation Decisions

### Recipe file format
- YAML frontmatter for metadata: title, servings, prep_time, cook_time, tags
- Tags are freeform strings (e.g., "low-carb", "quick", "chicken", "beef")
- Ingredients section with full detail: quantities + units + item name (e.g., "2 cups flour")
- Instructions section with numbered steps
- Downstream grocery extraction (Phase 5) will strip to item names only

### Authoring
- Agent can create recipe files from dictation in chat (user describes recipe, agent writes .md file)
- Files also created externally (user bulk-adding from PDFs and other sources)
- Format must be clean and consistent for both human and automated creation

### Browsing & suggestion
- List view shows recipe names + tags (e.g., "Chicken Parm -- quick, chicken")
- Full recipe view is pretty-formatted for Telegram (title, servings, ingredient list, numbered instructions)
- Suggestions are tag-based: "suggest a chicken dinner" filters by "chicken" tag
- Agent searches/matches by tags when user specifies criteria

### RSS briefing filter
- Filter RSS feed entries to dinner-appropriate recipes only
- Exclude breakfast, snack, dessert, etc.
- Claude's discretion on filtering approach (keyword vs category based on what RSS provides)

### Claude's Discretion
- Exact YAML frontmatter field names and format
- Recipe file naming convention
- Library directory structure (flat vs nested)
- RSS filtering implementation approach
- How to handle recipes with missing/incomplete metadata

</decisions>

<specifics>
## Specific Ideas

- User plans to bulk-add recipes from PDFs and other sources after format is established -- format consistency is critical
- Thursday weekly dinner vote: suggest 7 recipes from the library for voting each Thursday (Phase 6 builds this flow)
- Daily briefing should show tonight's voted dinner from the week's plan (already works via this-week.md, Phase 6 populates it from vote results)
- Existing `favourites.md` stores saved recipe titles/URLs -- library is the structured version of this

</specifics>

<deferred>
## Deferred Ideas

- Recipe creation from URL (agent scrapes/parses URL into recipe file) -- future phase, requirements currently mark web scraping as out of scope
- Thursday weekly dinner vote automation (suggest 7 recipes, create poll) -- Phase 6: Poll-to-Grocery Pipeline
- Library recipe suggestions in daily briefing (replacing/supplementing RSS) -- Phase 6 handles via voted meal plan
- Recipe tagging/categorization enhancements (RCPE-05) -- already in deferred requirements

</deferred>

---

*Phase: 04-recipe-library*
*Context gathered: 2026-02-22*
