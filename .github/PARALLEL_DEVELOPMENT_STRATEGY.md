# Parallel Development Strategy: Multi-Agent Workflow

**Status**: Execution Plan for 9 Concurrent GitHub Issues  
**Date**: January 5, 2026  
**Team**: GitHub Copilot Pro+, ChatGPT Plus (Codex), Multiple Agents via Perplexity

---

## Executive Summary

Deploy **3 parallel development streams** simultaneously using AI agents:

1. **Backend Stream**: Issues #16, #17, #20, #22 (Backend APIs, data structures)
2. **Frontend Stream**: Issues #14, #15, #18, #19 (UI, components, styling)
3. **Strategy Stream**: Issues #21 (Documentation, outreach)

**Goal**: Complete MVP of all features in 4-6 weeks instead of 3-4 months.

---

## STREAM 1: Backend API Development (Issues #16, #17, #20, #22)

### Team
- **Copilot Pro+**: Core implementation, NestJS patterns
- **ChatGPT Codex**: Service layer, business logic, migrations
- **Agent Orchestration**: Dependency resolution, conflict prevention

### Decomposed Tasks (Week 1-2)

#### Task 1.1: Add Source & Confidence Tracking (Issue #16)
**Dependencies**: None  
**Files to modify**:
- `src/entities/official.entity.ts` → Add `sources` JSONB, `confidenceLevel` int, `lastVerified` timestamp
- `src/entities/business.entity.ts` → Same fields
- `src/entities/testaferro.entity.ts` → Same fields
- `src/entities/sanction.entity.ts` → Same fields

**Agent Assignment**: ChatGPT Codex
**Branch**: `feat/ISS-16-source-confidence`
**Deliverable**: 
- Updated entity files with proper TypeORM decorators
- Migration file: `src/migrations/[timestamp]-AddSourceTracking.ts`
- Updated service tests

```bash
# Prompt for ChatGPT
"Add sources (JSONB with url, archiveUrl, type, publicationDate) and 
confidenceLevel (1-5) fields to Official, Business, Testaferro, Sanction 
entities. Create TypeORM migration. Follow existing patterns in codebase."
```

**PR Template**:
```markdown
## Issue #16: Source Citations & Confidence Levels

### Changes
- Added `sources` JSONB field to entities
- Added `confidenceLevel` (1-5) to entities
- Created migration

### Tests
- [ ] Updated entity tests
- [ ] Migration tests pass

### No Breaking Changes
- Old data migrates with default confidence=1
- Sources array defaults to empty
```

---

#### Task 1.2: Create Event Timeline Entity (Issue #22)
**Dependencies**: None (independent)  
**Files to create/modify**:
- `src/entities/event.entity.ts` (NEW)
- `src/modules/events/events.service.ts` (NEW)
- `src/modules/events/events.controller.ts` (NEW)
- `src/modules/events/events.module.ts` (NEW)
- `src/app.module.ts` → Import EventsModule

**Agent Assignment**: Copilot Pro+
**Branch**: `feat/ISS-22-event-timeline`
**Deliverable**: 
- Event entity with: title, description, eventDate, eventType (enum), relatedOfficialId, sourceUrl
- EventsService with: findByOfficial(), findGlobal(from, to), createEvent()
- EventsController with: GET /api/v1/timeline/official/:id, GET /api/v1/timeline/global
- Tests with >80% coverage

```bash
# Prompt for Copilot
"Create Event entity for timeline visualization. Fields: id (UUID), title, 
description, eventDate, eventType (enum: sanction|charge|conviction|position_change), 
relatedOfficialId (FK), relatedBusinessId (optional FK), sourceUrl, importance (1-10).
Create service + controller following existing patterns. Add tests."
```

---

#### Task 1.3: Create Network Graph API (Issue #17)
**Dependencies**: Partial on #16 (needs Official/Testaferro/Business with relationships)  
**Files to create/modify**:
- `src/modules/graph/graph.service.ts` (NEW)
- `src/modules/graph/graph.controller.ts` (NEW)
- `src/modules/graph/graph.module.ts` (NEW)
- `src/modules/graph/dto/graph-response.dto.ts` (NEW)

**Agent Assignment**: ChatGPT Codex
**Branch**: `feat/ISS-17-network-graph`
**Deliverable**: 
- GraphService with method: `getPersonNetwork(officialId, depth=1)` returning nodes + edges
- GraphController endpoint: `GET /api/v1/network/officials/:id/connections`
- DTO for graph response: `{ nodes: [{id, label, type, status, importance}], edges: [{source, target, type, strength}] }`
- Tests

```bash
# Prompt for ChatGPT
"Create graph network API. Endpoint: GET /api/v1/network/officials/:id?depth=1
Returns: { nodes: [{id: uuid, label: name, type: official|testaferro|business, 
status: sanctioned|convicted|investigating, importance: 1-10}],
edges: [{source: uuid, target: uuid, type: family|business|finances|controls, strength: 0-1}] }
Query Official + related Testaferros + Businesses recursively up to depth param.
Add tests."
```

---

#### Task 1.4: Create Evidence Submission Backend (Issue #20)
**Dependencies**: None  
**Files to create/modify**:
- `src/entities/evidence.entity.ts` (NEW)
- `src/modules/evidence/evidence.service.ts` (NEW)
- `src/modules/evidence/evidence.controller.ts` (NEW)
- `src/modules/evidence/evidence.module.ts` (NEW)
- `src/modules/evidence/dto/submit-evidence.dto.ts` (NEW)

**Agent Assignment**: Copilot Pro+
**Branch**: `feat/ISS-20-evidence-submission`
**Deliverable**: 
- Evidence entity: personName, relationshipType, evidenceType, fileUrl, status (pending|approved|rejected), etc.
- POST `/api/v1/evidence/submit` endpoint with file upload to Supabase Storage
- Moderation service: methods for approve(id), reject(id)
- Admin endpoints: GET /api/v1/admin/evidence (protected)
- Tests

```bash
# Prompt for Copilot
"Create Evidence submission module. Entity fields: personName, relationshipType 
(enum), evidenceType (enum), description, fileUrl, status (pending|approved|rejected),
confidenceLevel, submitterEmail (encrypted optional). 
POST /api/v1/evidence/submit with multipart file upload.
Admin endpoints for approval. Rate limiting + CAPTCHA validation.
Tests included."
```

---

### Testing Strategy for Stream 1

**All tests must pass before merging:**
```bash
# In CI, run in parallel
pnpm --dir backend test:cov --runInBand --testPathPattern="(entity|service|controller)"
```

**Parallel test runs (no interference)**:
- Task 1.1 tests: `official|business|testaferro|sanction` entities
- Task 1.2 tests: `events` service/controller
- Task 1.3 tests: `graph` service/controller
- Task 1.4 tests: `evidence` service/controller

**No conflicts** because:
- Different test files
- No shared database mutations
- Each task has independent entities

---

## STREAM 2: Frontend UI Development (Issues #14, #15, #18, #19)

### Team
- **Copilot Pro+**: Component architecture, Svelte patterns
- **ChatGPT Codex**: Styling, responsive design, accessibility
- **Agent Orchestration**: Component composition, state management

### Decomposed Tasks (Week 1-2)

#### Task 2.1: Color System & Design Tokens (Issue #14)
**Dependencies**: None (foundational)  
**Files to create/modify**:
- `src/lib/constants/colors.ts` (NEW)
- `src/lib/components/Badge.svelte` (NEW) - Reusable badge component
- `src/lib/styles/colors.css` (NEW) - CSS custom properties
- `src/routes/+layout.svelte` → Import color system

**Agent Assignment**: ChatGPT Codex
**Branch**: `feat/ISS-14-color-system`
**Deliverable**: 
- Color constants (Danger Red, Institutional Blue, Justice Green, Warning Amber, Neutral Gray)
- Reusable Badge component with variants (danger, success, warning, neutral)
- CSS custom properties for theming
- Accessibility audit (WCAG AA contrast ratios)

```bash
# Prompt for ChatGPT
"Create color system for accountability platform. Define constants:
DANGER_RED: #C41F2F, INSTITUTIONAL_BLUE: #2D5F7F, JUSTICE_GREEN: #2D7F3F, 
WARNING_AMBER: #E8A008, NEUTRAL_GRAY: #999999.
Create reusable Badge.svelte component with color variants.
Create CSS custom properties (--color-danger, --color-success, etc.).
Ensure WCAG AA compliance (contrast ratios).
Export from colors.ts for use in components."
```

---

#### Task 2.2: Profile Hero Section (Issue #15)
**Dependencies**: On #14 (color system)  
**Files to create/modify**:
- `src/lib/components/ProfileHero.svelte` (NEW)
- `src/lib/components/ConfidenceMeter.svelte` (NEW)
- `src/routes/officials/[id]/+page.svelte` → Use ProfileHero
- `src/lib/styles/profile.css` (NEW)

**Agent Assignment**: Copilot Pro+
**Branch**: `feat/ISS-15-profile-hero`
**Deliverable**: 
- ProfileHero component: Name (36pt), Role (24pt), Badges (18pt), Confidence (visual), LastUpdated
- ConfidenceMeter component: Star rating or progress bar (1-5)
- Responsive design (mobile-first)
- Semantic HTML (h1, h2, etc.)

```bash
# Prompt for Copilot
"Create ProfileHero.svelte component. Props: official (name, title, photo, status badges, 
confidenceLevel, lastUpdated). Layout: Photo (200x200) + Name (36pt bold) + Role (24pt) + 
Badges (18pt) + ConfidenceMeter (visual stars or %) + LastUpdated (12pt gray).
Create ConfidenceMeter.svelte (reusable, 1-5 stars or progress).
Make mobile-first responsive. Use semantic HTML."
```

---

#### Task 2.3: Mobile-First Responsive Design (Issue #18)
**Dependencies**: Foundational (affects all components)  
**Files to modify**:
- `src/routes/+layout.svelte` → Add mobile navigation
- `src/lib/components/Navigation.svelte` (NEW) → Hamburger menu
- `src/lib/components/MobileNav.svelte` (NEW) → Drawer navigation
- `src/lib/styles/layout.css` → Mobile-first breakpoints
- `src/routes/+page.svelte` → Responsive hero section

**Agent Assignment**: ChatGPT Codex
**Branch**: `feat/ISS-18-mobile-first`
**Deliverable**: 
- Hamburger menu component (mobile <640px)
- Bottom nav bar for key actions
- Mobile-first CSS (320px base, scale up)
- Touch targets 44x44px minimum
- Responsive grid (single column mobile, multi column desktop)
- Lighthouse Mobile score validation

```bash
# Prompt for ChatGPT
"Implement mobile-first responsive design. Create Navigation component with:
- Hamburger menu for <640px
- Bottom nav bar (Home, Search, About, etc.)
- Drawer animation (slide in from left)
- Touch targets: 44x44px minimum
Breakpoints: mobile (<640px), tablet (640-1024px), desktop (>1024px).
Single column on mobile, multi-column on desktop.
Ensure Lighthouse Mobile >90 score."
```

---

#### Task 2.4: Social Sharing (Issue #19)
**Dependencies**: On #15 (profile pages exist)  
**Files to create/modify**:
- `src/lib/components/ShareButtons.svelte` (NEW)
- `src/routes/officials/[id]/+page.svelte` → Add share buttons
- `src/lib/utils/og-tags.ts` (NEW) → Dynamic OG tag generation
- `src/routes/+layout.svelte` → Add meta tags

**Agent Assignment**: Copilot Pro+
**Branch**: `feat/ISS-19-social-sharing`
**Deliverable**: 
- ShareButtons component: Twitter, WhatsApp, Facebook, Copy Link
- OG meta tags (title, description, image) for each profile
- Dynamic OG image generation (using @vercel/og or pre-generated)
- Native share API for mobile
- Analytics tracking (event listeners)

```bash
# Prompt for Copilot
"Create ShareButtons.svelte with: Twitter share, WhatsApp share, Facebook share, 
Copy Link button. Add OG meta tags (og:title, og:description, og:image, og:url).
Implement native Web Share API for mobile.
Track share button clicks for analytics.
Use @vercel/og for dynamic OG image generation if possible."
```

---

### Testing Strategy for Stream 2

**Component tests (Vitest)**:
```bash
# Run in parallel, no conflicts
pnpm --dir frontend test:ci
```

**Test coverage**:
- Task 2.1: Badge component snapshot tests, color contrast tests
- Task 2.2: ProfileHero rendering, ConfidenceMeter visual tests
- Task 2.3: Responsive layout tests, mobile breakpoint tests
- Task 2.4: ShareButtons functionality, OG tag generation

---

## STREAM 3: Strategy & Documentation (Issue #21)

### Team
- **ChatGPT Codex**: Outreach templates, grant materials
- **Perplexity**: Research + synthesis for grant writing

### Decomposed Tasks (Week 1)

#### Task 3.1: Create Pitch Deck
**Files to create**:
- `docs/pitch-deck.md`
- `docs/pitch-deck.pdf` (exported)

#### Task 3.2: Grant Application Templates
**Files to create**:
- `docs/grant-proposals/osf-template.md` (Open Society Foundations)
- `docs/grant-proposals/ti-template.md` (Transparency International)
- `docs/grant-proposals/generic-template.md` (Reusable)

#### Task 3.3: Outreach Email Templates
**Files to create**:
- `docs/templates/email-inrav.txt`
- `docs/templates/email-ngo.txt`
- `docs/templates/email-journalist.txt`

---

## Parallel Execution Plan

### Week 1: Foundation (Tasks 1.1, 1.2, 2.1)

| Task | Agent | Duration | Branch | Status |
|------|-------|----------|--------|--------|
| 1.1: Source tracking | ChatGPT | 6 hours | `feat/ISS-16-source-confidence` | → PR |
| 1.2: Event timeline | Copilot | 8 hours | `feat/ISS-22-event-timeline` | → PR |
| 2.1: Color system | ChatGPT | 4 hours | `feat/ISS-14-color-system` | → PR |

**Merge sequence**: 2.1 (no deps) → 1.1 (no deps) → 1.2 (no deps) → 2.2 (depends on 2.1)

### Week 2: Features (Tasks 1.3, 1.4, 2.2, 2.3, 2.4)

| Task | Agent | Duration | Branch | Dependencies |
|------|-------|----------|--------|--------------|
| 1.3: Network graph | ChatGPT | 8 hours | `feat/ISS-17-network-graph` | 1.1 merged |
| 1.4: Evidence submit | Copilot | 8 hours | `feat/ISS-20-evidence-submission` | None |
| 2.2: Hero section | Copilot | 6 hours | `feat/ISS-15-profile-hero` | 2.1 merged |
| 2.3: Mobile design | ChatGPT | 10 hours | `feat/ISS-18-mobile-first` | Foundational |
| 2.4: Social sharing | Copilot | 6 hours | `feat/ISS-19-social-sharing` | 2.2 merged |

**Merge sequence** (no conflicts):
1. 1.4 (evidence) → PR
2. 2.2 (hero) → PR
3. 2.3 (mobile) → PR
4. 1.3 (graph) → PR (after 1.1 merged)
5. 2.4 (sharing) → PR (after 2.2 merged)

---

## Using AI Agents Effectively

### GitHub Copilot Pro+ Role
- **Strength**: NestJS/TypeScript patterns, architectural decisions
- **Tasks**: Backend entity/service creation, Svelte component structure
- **Workflow**:
  1. Copilot writes skeleton code with full types
  2. ChatGPT refines business logic
  3. Copilot generates tests
  4. Human reviews for style/patterns

### ChatGPT Plus (Codex) Role
- **Strength**: Complex business logic, styling, accessibility
- **Tasks**: Service implementation, CSS responsiveness, accessibility
- **Workflow**:
  1. ChatGPT writes detailed implementations
  2. Copilot translates to TypeScript/Svelte
  3. Both generate tests
  4. Human merges best approach

### Perplexity Role
- **Strength**: Research, synthesis, documentation
- **Tasks**: Grant writing, outreach copy, strategic documentation
- **Workflow**:
  1. Provide grant requirements
  2. Perplexity synthesizes from current documents
  3. ChatGPT tailors to specific funders
  4. Human reviews + submits

### Workflow Template for Each Task

```markdown
## Issue #X: [Name]

### Step 1: Decompose (Human)
- Break into atomic tasks
- Identify dependencies
- Assign branch names

### Step 2: Implement (Copilot + ChatGPT)
- Copilot: "Create skeleton for [feature]"
- ChatGPT: "Refine with [business logic]"
- Copilot: "Generate tests with >80% coverage"

### Step 3: Integrate (Human)
- Review code quality
- Check patterns match codebase
- Verify tests pass
- Merge to develop

### Step 4: Sync (Human)
- Rebase all parallel branches on develop
- Test integration
- Deploy to staging
```

---

## Preventing Merge Conflicts

### Rule 1: Minimize Shared Files
- **Backend**: Different services/controllers (no conflicts)
- **Frontend**: Different components (no conflicts)
- **Shared**: Only `src/app.module.ts` (backend), `src/routes/+layout.svelte` (frontend)

**Mitigation**:
- Copilot handles `app.module.ts` additions (consistent pattern)
- ChatGPT handles `+layout.svelte` styling/nav (additive only)

### Rule 2: Rebase Before Push
```bash
git fetch origin develop
git rebase origin/develop
# If conflicts: resolve, test, push --force-with-lease
```

### Rule 3: Cherry-pick Merged PRs
After each PR merges to develop:
```bash
# All other branches rebase immediately
git checkout feat/ISS-22-event-timeline
git rebase develop
```

---

## Testing in Parallel

### Backend Tests (Run in Parallel)
```bash
cd backend
pnpm test:cov --runInBand \
  --testPathPattern="(official|business|testaferro|event|graph|evidence)"
```

**Result**: No file locks, each test suite runs independently.

### Frontend Tests (Run in Parallel)
```bash
cd frontend
pnpm test:ci --ui
```

**Result**: Vitest handles parallelization internally.

### Integration Test (After All Merges)
```bash
# Full test suite
pnpm --dir backend test:cov --runInBand && pnpm --dir frontend test:ci
```

---

## Success Metrics

### Velocity
- **Week 1**: 3 PRs merged (foundation tasks)
- **Week 2**: 5 PRs merged (feature tasks)
- **Week 3-4**: Integration, polish, launch

### Quality
- **Test coverage**: >80% backend, >60% frontend
- **Lighthouse score**: Mobile >90, Desktop >95
- **Type safety**: 0 TypeScript errors

### Engagement
- **Users on MVP**: Target 1,000+ by end of month
- **Time on site**: Target 5+ minutes
- **Mobile experience**: 95+ Lighthouse score

---

## Contingency: If Conflicts Occur

### Scenario 1: Merge Conflict in app.module.ts
- Copilot generated consistent patterns
- Human resolves by combining import/provider statements (20 seconds)

### Scenario 2: Merge Conflict in +layout.svelte
- ChatGPT added nav/styling (non-overlapping)
- Human resolves by combining sections (2 minutes)

### Scenario 3: Dependency Ordering Issue
- Example: 2.2 (hero) needs 2.1 (colors) merged first
- **Solution**: Rebase 2.2 on develop after 2.1 merges

---

## Tools & Configuration

### GitHub Setup
- **Branch protection**: Require 1 review before merge
- **Status checks**: All tests must pass
- **Auto-delete head branches**: Clean up after merge

### CI/CD
- **GitHub Actions**: Run tests on every push
- **Matrix strategy**: Test backend/frontend in parallel
- **Coverage reports**: Artifacts stored per PR

### Code Review
- **Copilot Review**: Request on all PRs
- **Human Review**: 1 human per PR (can be automated with trusted agents)
- **Merge**: Squash-and-commit for clean history

---

## Timeline Summary

| Phase | Duration | Output |
|-------|----------|--------|
| **Foundation (Week 1)** | 18 hours | 3 PRs, core APIs ready |
| **Features (Week 2)** | 38 hours | 5 PRs, all features implemented |
| **Integration (Week 3)** | 20 hours | Testing, bug fixes, polish |
| **Launch (Week 4)** | 10 hours | Deploy to production |
| **Total** | 86 hours (~2.5 weeks) | Full feature set live |

**Compare to sequential**: 12-16 weeks → **2.5 weeks** (6-7x faster)

---

## Next Steps (Immediate)

1. ✅ Create feature branches (use names from above)
2. ✅ Assign agents to tasks (Copilot, ChatGPT, Perplexity)
3. ✅ Prompt agents with task descriptions (provided above)
4. ✅ Set up automated testing
5. ✅ Daily: Rebase, test, review
6. ✅ Merge: Sequential to develop (prevent conflicts)
7. ✅ Monitor: Lighthouse, test coverage, time-on-site metrics

---

## Agent Prompts (Ready to Use)

Copy-paste these into Copilot, ChatGPT, or Perplexity:

### Prompt for Issue #16 (ChatGPT)
```
Add sources (JSONB with url, archiveUrl, type, publicationDate) and 
confidenceLevel (1-5) fields to Official, Business, Testaferro, Sanction 
entities. Create TypeORM migration for Supabase. Follow existing patterns 
in codebase (look at official.entity.ts). Return: entity files, migration 
file, test stubs.
```

### Prompt for Issue #14 (ChatGPT)
```
Create color system for accountability platform. Define constants in 
src/lib/constants/colors.ts: DANGER_RED (#C41F2F), INSTITUTIONAL_BLUE 
(#2D5F7F), JUSTICE_GREEN (#2D7F3F), WARNING_AMBER (#E8A008), NEUTRAL_GRAY 
(#999999). Create reusable Badge.svelte component with variants. Create 
CSS custom properties. Ensure WCAG AA contrast compliance.
```

[More prompts in subsequent sections...]

---

**End of Strategy Document**

This plan enables you to execute 9 issues in parallel with minimal conflict and maximum velocity.
