# Requirements: Home Assistant Workspace

**Defined:** 2026-02-22
**Core Value:** The agent must reliably understand and execute household management tasks -- even when powered by cheaper LLMs -- without making mistakes with timezones, commands, or file formats.

## v4.0 Requirements

Requirements for v4.0 milestone. Each maps to roadmap phases.

### Recipes

- [x] **RCPE-01**: Agent can read and parse structured markdown recipe files from a recipes directory
- [x] **RCPE-02**: Agent can search/browse the recipe library to suggest dinner options
- [x] **RCPE-03**: Recipe markdown format includes title, servings, ingredients list, and instructions
- [x] **RCPE-04**: RSS recipe inspiration in briefings filtered to dinner recipes only

### Grocery

- [x] **GROC-01**: Todoist task `add` intent supports `section` parameter to place items in the correct store section
- [x] **GROC-02**: Agent can list available sections in the Todoist shopping project
- [ ] **GROC-03**: Recipe ingredients are extracted as item names (no quantities) and added to Todoist grocery list

### Pipeline

- [ ] **PIPE-01**: Poll resolution for dinner/meal questions updates this-week.md with the winning option
- [ ] **PIPE-02**: After meal plan update, agent identifies matching recipe in library and extracts ingredients
- [ ] **PIPE-03**: Extracted ingredients are added to Todoist shopping with correct section placement
- [ ] **PIPE-04**: Agent documentation updated (TOOLS.md, QUICKSTART.md) for new recipe and grocery workflows

## Future Requirements

### Deferred

- **RCPE-05**: Recipe tagging/categorization (cuisine type, prep time, dietary restrictions)
- **GROC-04**: Smart deduplication when adding recipe ingredients (skip items already on list)
- **PIPE-05**: Weekly meal plan generates consolidated grocery list for all planned meals

## Out of Scope

| Feature | Reason |
|---------|--------|
| Recipe web scraping | User creates markdown files locally, agent reads them |
| Grocery quantity tracking | User said "just item names" — keep it simple |
| Multi-store support | Single grocery store/project sufficient for now |
| Recipe image support | Markdown text is sufficient, no image processing |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| RCPE-01 | Phase 4 | Complete |
| RCPE-02 | Phase 4 | Complete |
| RCPE-03 | Phase 4 | Complete |
| RCPE-04 | Phase 4 | Complete |
| GROC-01 | Phase 5 | Complete |
| GROC-02 | Phase 5 | Complete |
| GROC-03 | Phase 5 | Pending |
| PIPE-01 | Phase 6 | Pending |
| PIPE-02 | Phase 6 | Pending |
| PIPE-03 | Phase 6 | Pending |
| PIPE-04 | Phase 6 | Pending |

**Coverage:**
- v4.0 requirements: 11 total
- Mapped to phases: 11
- Unmapped: 0

---
*Requirements defined: 2026-02-22*
*Last updated: 2026-02-22 after roadmap creation*
