# Roadmap: Home Assistant Workspace

## Milestones

- ✅ **v1.0 Bulletproof Instructions + Feature Expansion** — Phases 1-6 (shipped 2026-02-10)
- ✅ **v2.0 Task Architecture** — Phases 7-10 (shipped 2026-02-13)
- ✅ **v3.0 Features & Integrations** — Phases 1-3 (shipped 2026-02-22)
- **v4.0 Recipe, Grocery & Poll Improvements** — Phases 4-6 (in progress)

## Phases

<details>
<summary>✅ v1.0 Bulletproof Instructions + Feature Expansion (Phases 1-6) — SHIPPED 2026-02-10</summary>

- [x] Phase 1: Instruction Hardening (3/3 plans) — completed 2026-02-09
- [x] Phase 2: Quick Capture (2/2 plans) — completed 2026-02-09
- [x] Phase 3: Meal Planning (3/3 plans) — completed 2026-02-09
- [x] Phase 4: Bill Reminders — deferred (completed 2026-02-22)
- [x] Phase 5: Briefing System (2/2 plans) — completed 2026-02-09
- [x] Phase 6: Daily Morning Briefing (2/2 plans) — completed 2026-02-10

</details>

<details>
<summary>✅ v2.0 Task Architecture (Phases 7-10) — SHIPPED 2026-02-13</summary>

- [x] Phase 7: Task Infrastructure (2/2 plans) — completed 2026-02-11
- [x] Phase 8: Cache Layer (2/2 plans) — completed 2026-02-11
- [x] Phase 9: Calendar Task (2/2 plans) — completed 2026-02-12
- [x] Phase 10: Weather Task (1/1 plan) — completed 2026-02-13

</details>

<details>
<summary>✅ v3.0 Features & Integrations (Phases 1-3) — SHIPPED 2026-02-22</summary>

- [x] Phase 1: Todoist Fix + Media Server Research (2/2 plans) — completed 2026-02-15
- [x] Phase 2: Telegram Poll Feature (3/3 plans) — completed 2026-02-16
- [x] Phase 3: Local Config JSON (2/2 plans) — completed 2026-02-17

</details>

### v4.0 Recipe, Grocery & Poll Improvements

- [x] **Phase 4: Recipe Library** (2/2 plans) — completed 2026-02-22
- [ ] **Phase 5: Grocery Section Support** - Todoist grocery list with section placement
- [ ] **Phase 6: Poll-to-Grocery Pipeline** - End-to-end poll resolution through to grocery list

## Phase Details

### Phase 4: Recipe Library
**Goal**: The agent can browse and suggest from a local recipe library of structured markdown files
**Depends on**: Nothing (standalone capability)
**Requirements**: RCPE-01, RCPE-02, RCPE-03, RCPE-04
**Success Criteria** (what must be TRUE):
  1. A recipes/ directory exists with at least one markdown file using the standard format (title, servings, ingredients, instructions)
  2. Agent can list all available recipes and return their names
  3. Agent can read a specific recipe and return its ingredients and instructions
  4. RSS recipe inspiration in briefings shows only dinner recipes, not all categories
**Plans**: 2 plans
Plans:
- [x] 04-01-PLAN.md — Recipe format, directory, sample file, and agent instructions (browse, read, suggest, create)
- [x] 04-02-PLAN.md — RSS briefing dinner-only filter

### Phase 5: Grocery Section Support
**Goal**: Agent can add grocery items to specific Todoist sections (Produce, Dairy, etc.)
**Depends on**: Phase 4 (recipe format needed to know ingredient types)
**Requirements**: GROC-01, GROC-02, GROC-03
**Success Criteria** (what must be TRUE):
  1. Agent can call `task todoist` with a `section` parameter and the item lands in the correct Todoist section
  2. Agent can list all available sections in the shopping Todoist project
  3. Recipe ingredients (item names only, no quantities) can be added to the grocery list in one operation
**Plans**: 2 plans
Plans:
- [ ] 05-01-PLAN.md — Todoist section API support (list-sections helper, create-task section_id, config intent)
- [ ] 05-02-PLAN.md — Agent instructions for grocery sections and recipe-to-grocery workflow

### Phase 6: Poll-to-Grocery Pipeline
**Goal**: A dinner poll resolving automatically updates the meal plan and populates the grocery list
**Depends on**: Phase 4, Phase 5
**Requirements**: PIPE-01, PIPE-02, PIPE-03, PIPE-04
**Success Criteria** (what must be TRUE):
  1. When a dinner poll resolves, this-week.md is updated with the winning meal on the correct day
  2. After the meal plan updates, the agent finds the matching recipe in the library and extracts its ingredients
  3. Extracted ingredients appear in the Todoist shopping project under the correct sections
  4. TOOLS.md and QUICKSTART.md document the new recipe browsing and grocery section commands
**Plans**: TBD

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Instruction Hardening | v1.0 | 3/3 | Complete | 2026-02-09 |
| 2. Quick Capture | v1.0 | 2/2 | Complete | 2026-02-09 |
| 3. Meal Planning | v1.0 | 3/3 | Complete | 2026-02-09 |
| 4. Bill Reminders | 2/2 | Complete   | 2026-02-22 | - |
| 5. Briefing System | v1.0 | 2/2 | Complete | 2026-02-09 |
| 6. Daily Morning Briefing | v1.0 | 2/2 | Complete | 2026-02-10 |
| 7. Task Infrastructure | v2.0 | 2/2 | Complete | 2026-02-11 |
| 8. Cache Layer | v2.0 | 2/2 | Complete | 2026-02-11 |
| 9. Calendar Task | v2.0 | 2/2 | Complete | 2026-02-12 |
| 10. Weather Task | v2.0 | 1/1 | Complete | 2026-02-13 |
| 1. Todoist Fix + Research | v3.0 | 2/2 | Complete | 2026-02-15 |
| 2. Telegram Poll | v3.0 | 3/3 | Complete | 2026-02-16 |
| 3. Local Config | v3.0 | 2/2 | Complete | 2026-02-17 |
| 4. Recipe Library | v4.0 | 2/2 | Complete | 2026-02-22 |
| 5. Grocery Section Support | v4.0 | 0/2 | Planning | - |
| 6. Poll-to-Grocery Pipeline | v4.0 | 0/TBD | Not started | - |
