# Agent Setup Guide for Parallel Development

**Goal**: Configure 3 AI agents to work simultaneously on 9 GitHub issues without conflicts.

---

## Part 1: Pre-Flight Setup (Do This First)

### 1.1 Pull Latest & Verify Clean State
```bash
cd /Users/luisrosal/Documents/expose-enchufados

# Ensure you're on main with latest code
git checkout main
git pull origin main

# Verify all 9 branches are tracking remote
git branch -a | grep "feat/ISS-"

# Expected output:
#   feat/ISS-14-color-system
#   feat/ISS-15-profile-hero
#   feat/ISS-16-source-confidence
#   feat/ISS-17-network-graph
#   feat/ISS-18-mobile-first
#   feat/ISS-19-social-sharing
#   feat/ISS-20-evidence-submission
#   feat/ISS-21-outreach-materials
#   feat/ISS-22-event-timeline
```

### 1.2 Verify Backend Environment
```bash
cd backend

# Check .env.local exists with Supabase connection
cat .env.local | head -5

# Expected:
# DATABASE_URL=postgresql://postgres.xxxxx:password@aws-1-us-east-1.pooler.supabase.com:5432/postgres
# PORT=3000

# Verify dependencies are installed
pnpm install
```

### 1.3 Verify Frontend Environment
```bash
cd ../frontend

# Check .env.local exists (should be empty or minimal for dev)
ls -la .env.local 2>/dev/null || echo "No .env.local needed for frontend dev"

# Verify dependencies are installed
pnpm install
```

### 1.4 Start Both Servers in Separate Terminals
**Terminal 1 - Backend (Port 3000)**:
```bash
cd /Users/luisrosal/Documents/expose-enchufados/backend
pnpm start:dev
# Expected: NestJS server running on http://localhost:3000
# Watch for: "Nest application successfully started"
```

**Terminal 2 - Frontend (Port 5173)**:
```bash
cd /Users/luisrosal/Documents/expose-enchufados/frontend
pnpm dev
# Expected: Vite dev server on http://localhost:5173
# Watch for: "ready in 123 ms"
```

### 1.5 Verify Connectivity
```bash
# Terminal 3 - Test API health
curl -s http://localhost:3000/api/v1/ingestion/health | jq .

# Expected response:
# {
#   "status": "ok",
#   "timestamp": "2026-01-05T..."
# }
```

**✅ If all above pass, you're ready for agents.**

---

## Part 2: Agent-Specific Setup

### Agent 1: GitHub Copilot Pro+
**Best for**: Backend entities, services, controllers, Svelte components

#### 2.1a Open in VS Code
- Open `/Users/luisrosal/Documents/expose-enchufados` as workspace
- Open **Command Palette** (`Cmd+Shift+P`)
- Type: "GitHub Copilot: Open Copilot Chat"
- Copilot Chat sidebar should appear (right side)

#### 2.1b Provide Context (Copy-Paste This)
```
I'm working on La Memoria de Venezuela, an accountability database for Venezuelan regime officials.

Context:
- Backend: NestJS 10 + TypeORM + PostgreSQL (Supabase)
- Frontend: SvelteKit 2 + Tailwind CSS + Svelte 4
- Architecture: /backend/src/entities, /backend/src/modules/[name], /frontend/src/routes, /frontend/src/lib
- Testing: Jest (backend) with >80% coverage, Vitest (frontend)
- Pre-commit: Must run `pnpm lint && pnpm test:cov --runInBand` before committing

Key Files:
- .github/copilot-instructions.md (patterns & standards)
- .github/PARALLEL_DEVELOPMENT_STRATEGY.md (execution plan)
- backend/src/entities/official.entity.ts (example entity structure)
- backend/src/modules/officials/officials.service.ts (example service)
- frontend/src/lib/types.ts (shared TypeScript types)

My branch: [Will tell you per task]
Current working task: [Will tell you per task]

Ask me before making major decisions. Test locally before committing.
```

#### 2.1c Tasks for Copilot
Create separate chat threads for each:

**Thread 1 - Event Entity** (ISS-22):
```
Branch: feat/ISS-22-event-timeline

Create the Event entity for timeline visualization with these fields:
- id: UUID (PrimaryGeneratedColumn)
- title: string (200 chars max)
- description: string (5000 chars max, optional)
- eventDate: Date
- eventType: enum (sanction | charge | conviction | position_change)
- relatedOfficialId: FK to Official (OneToMany relationship, cascadeDelete)
- relatedBusinessId: FK to Business (optional, OneToMany)
- sourceUrl: string (URL to source)
- importance: integer (1-10)
- createdAt: timestamp
- updatedAt: timestamp

Pattern to follow: backend/src/entities/official.entity.ts
Expected location: backend/src/entities/event.entity.ts

Then create EventsService and EventsController following officials.service.ts pattern.
Test with >80% coverage.

Ask if you need clarification on field types or relationships.
```

---

### Agent 2: ChatGPT Plus with Codex
**Best for**: Complex business logic, styling, accessibility, migrations

#### 2.2a Access ChatGPT
- Go to https://chat.openai.com (Pro+ account)
- Click "+ New chat"
- Enable "Web browsing" (optional, for research)

#### 2.2b Provide Context (Copy-Paste This)
```
# Project: La Memoria de Venezuela - Accountability Database

You are helping implement features for a Venezuelan regime accountability platform.

## Tech Stack
- Backend: NestJS 10 + TypeORM 0.3 + PostgreSQL (Supabase)
- Frontend: SvelteKit 2 + Tailwind CSS 3.4
- Testing: Jest (backend), Vitest (frontend), both require >80% coverage
- Linting: ESLint 9 + Prettier 3

## Key Constraints
1. TypeORM migrations must use `typeorm migration:generate` workflow
2. All entities use UUID primary keys and timestamps (createdAt, updatedAt)
3. Database column names: snake_case, TypeScript properties: camelCase
4. All inputs validated with class-validator (IsString, Length, etc.)
5. All API responses use pagination: { data: [...], meta: { total, page, limit } }
6. Enums stored as integers in DB (CONFIDENCE_LEVEL = 1-5)
7. WCAG AA accessibility (contrast ratios ≥4.5:1)
8. Bilingual content (Spanish/English)

## Repository Structure
- backend/src/entities/ → TypeORM entities
- backend/src/modules/[module]/ → Services, controllers, DTOs
- frontend/src/lib/types.ts → Shared TypeScript types
- frontend/src/routes/ → SvelteKit pages
- test files: *.spec.ts or *.test.ts in same directory

## Pre-Commit Requirements
Before submitting code:
1. Run: pnpm --dir backend lint && pnpm --dir backend test:cov --runInBand
2. Run: pnpm --dir frontend lint && pnpm --dir frontend test:ci
3. Fix any failures before creating PR

## Your Role
Implement features following existing patterns. Always provide:
- TypeScript code (no JavaScript)
- Complete test suites
- Error handling
- Validation

Ask clarifying questions if needed.
```

#### 2.2c Tasks for ChatGPT
Create separate threads for:

**Thread 1 - Source + Confidence Migration** (ISS-16):
```
Task: Add source tracking and confidence levels to existing entities.

Branch: feat/ISS-16-source-confidence

Entities to update:
1. Official.entity.ts
2. Business.entity.ts
3. Testaferro.entity.ts
4. Sanction.entity.ts

Add these fields to each:
- sources: JSONB (array of { url, archiveUrl, type, publicationDate })
- confidenceLevel: enum (1=rumor, 2=unverified, 3=credible, 4=verified, 5=official)

Then:
1. Create TypeORM migration using: typeorm migration:generate
2. Update all services to handle new fields
3. Update DTOs (CreateOfficialDto, UpdateOfficialDto, etc.) to include sources + confidence
4. Add tests >80% coverage

Constraint: Don't break existing API endpoints. New fields should be optional in requests (default to empty sources, confidence=3).

Provide: Entity files, migration file, DTOs, test stubs.
```

**Thread 2 - Color System** (ISS-14):
```
Task: Create color system and Badge component for frontend.

Branch: feat/ISS-14-color-system

Deliverables:

1. src/lib/constants/colors.ts (design system):
   - DANGER_RED: #C41F2F
   - INSTITUTIONAL_BLUE: #2D5F7F
   - JUSTICE_GREEN: #2D7F3F
   - WARNING_AMBER: #E8A008
   - NEUTRAL_GRAY: #999999
   
   Export as:
   - CSS custom properties
   - JavaScript constants
   - Tailwind config extension

2. src/lib/components/Badge.svelte:
   - Props: variant ('danger' | 'success' | 'warning' | 'neutral'), text
   - WCAG AA compliant (contrast ratios ≥4.5:1)
   - Responsive (works on mobile)
   - Example variants:
     - danger: red background, white text (sanctions active)
     - success: green background, white text (charges filed)
     - warning: amber background, black text (under investigation)
     - neutral: gray background, black text (no action)

3. Tests (Badge.test.ts):
   - Test all 4 variants render correctly
   - Test contrast ratios meet WCAG AA
   - Test responsive sizing

Provide: colors.ts, Badge.svelte, Badge.test.ts, update tailwind.config.ts
```

---

### Agent 3: Perplexity
**Best for**: Research, documentation, grant writing, strategy

#### 2.3a Access Perplexity
- Go to https://www.perplexity.ai (Pro account recommended)
- Click "+ New"

#### 2.3b Provide Context
```
# La Memoria de Venezuela - NGO Outreach Strategy

Background: We're documenting Venezuelan regime officials under international sanctions for accountability purposes. We need to create outreach materials for NGOs, human rights organizations, and media.

Context:
- Project: La Memoria de Venezuela (opposite of "La Lista Tascón" which persecuted citizens)
- Scope: Document 200+ government officials, 500+ businesses, 500+ cultural figures
- Data Sources: OFAC, DOJ, IACHR, ICC, reputable journalism
- Platform: Web-based accountability database

Your task: Research best practices for:
1. NGO partnership strategies
2. Human rights grant writing
3. Media outreach to journalists
4. Social movement building around accountability initiatives

Focus on:
- Organizations active in Venezuelan human rights (COFAVIC, PROVEA, Capítulo Venezuela)
- Grant opportunities (Open Society, Ford Foundation, UNDEF)
- Media partnerships (Reuters, AP, Bloomberg)
- Academic institutions researching Venezuelan governance

Provide practical, actionable recommendations with sources.
```

#### 2.3c Task for Perplexity
```
Branch: feat/ISS-21-outreach-materials

Create comprehensive outreach strategy document covering:

1. NGO Partnership Approach
   - Target organizations (with contact info)
   - Value proposition for each
   - Integration pathway

2. Grant Opportunities
   - Specific funds (amounts, deadlines)
   - Grant writing best practices
   - Success stories from similar projects

3. Media Outreach
   - Journalists to contact
   - Data story angles
   - Press release templates

4. Social Movement Strategy
   - Coalition building
   - Accountability campaigns
   - Community engagement

Output: Markdown document with 1000+ words, proper citations, actionable next steps.
```

---

## Part 3: Workflow for Each Agent

### 3.1 Before Starting a Task

**Agent does this**:
```bash
# Switch to correct branch
git checkout feat/ISS-XX-task-name
git pull origin feat/ISS-XX-task-name

# Create local feature branch from latest
git pull origin main
git merge origin/main  # Ensure no conflicts
```

### 3.2 During Development

**Agent does this**:
```bash
# Keep servers running in separate terminals
# Terminal 1: cd backend && pnpm start:dev
# Terminal 2: cd frontend && pnpm dev
# Terminal 3: Use for git/test commands
```

**After making changes**:
```bash
# Test immediately (don't wait to end of day)
cd backend && pnpm test:cov --runInBand  # Backend
cd frontend && pnpm test:ci              # Frontend

# Lint before committing
cd backend && pnpm lint --fix
cd frontend && pnpm lint --fix

# Commit frequently (every 1-2 hours of work)
git add .
git commit -m "feat: describe what was added"
# (See Git Commit Conventions in copilot-instructions.md)

# Push regularly
git push origin feat/ISS-XX-task-name
```

### 3.3 Creating Pull Requests

**Agent does this after completing task**:

1. **Ensure tests pass**:
   ```bash
   # Run full test suite before PR
   pnpm --dir backend test:cov --runInBand
   pnpm --dir frontend test:ci
   ```

2. **Create PR on GitHub**:
   - Go to https://github.com/takove/la-memoria-de-venezuela
   - Click "New Pull Request"
   - **Base**: `main`
   - **Compare**: `feat/ISS-XX-task-name`
   - **Title**: `feat: [ISS-XX] Description`
   - **Description**:
     ```markdown
     ## Related Issue
     Closes #XX
     
     ## Changes Made
     - List of changes
     
     ## Testing
     - Backend tests: 114 tests passing
     - Frontend tests: 17 tests passing
     - Coverage: >80%
     
     ## Checklist
     - [x] Linting passes
     - [x] Tests pass
     - [x] No breaking changes
     - [x] Updated related docs
     ```

3. **Wait for CI checks to pass**
4. **Request review** (or auto-merge if CI passes)

---

## Part 4: Managing Merge Order (Critical!)

### 4.1 Week 1 Merge Sequence (After all 3 tasks complete)

**Exact order** (prevents conflicts):

1. **Merge ISS-14** (Color System) first
   ```bash
   git checkout main
   git merge feat/ISS-14-color-system
   git push origin main
   ```

2. **Rebase all other branches** after merge
   ```bash
   # For each remaining branch:
   git checkout feat/ISS-16-source-confidence
   git rebase origin/main
   git push origin feat/ISS-16-source-confidence --force-with-lease
   ```

3. **Merge ISS-16** (Source Confidence)
   ```bash
   git checkout main
   git merge feat/ISS-16-source-confidence
   git push origin main
   # Rebase others again
   ```

4. **Merge ISS-22** (Event Timeline) last
   ```bash
   git checkout main
   git merge feat/ISS-22-event-timeline
   git push origin main
   ```

**Why this order?**
- ISS-14 (color system) has no dependencies
- ISS-16 (sources) modifies backend entities but not events
- ISS-22 (events) depends on main being updated

---

## Part 5: Communication Between Agents

### 5.1 If Conflicts Occur

**Example**: Copilot's event entity and ChatGPT's source changes both modify Official.entity.ts

**Resolution**:
1. **Stop merging** (don't force anything)
2. **Create manual merge PR**:
   ```bash
   git checkout -b feat/ISS-merge-16-22
   git merge feat/ISS-16-source-confidence  # First merge
   git merge feat/ISS-22-event-timeline     # Then merge
   # Resolve conflicts in files
   git add .
   git commit -m "merge: combine ISS-16 and ISS-22 changes"
   git push origin feat/ISS-merge-16-22
   ```
3. **Create PR** with conflict resolution
4. **Request review** before merging

### 5.2 Real-Time Coordination (Daily Standup)

**Each agent reports**:
- ✅ Completed tasks
- 🔄 In-progress work
- 🚧 Blocked issues
- 📊 Test coverage

**Example daily check-in**:
```
Copilot: Event entity 95% done, tests passing, will finish tomorrow morning
ChatGPT: Source migration complete, 82% coverage, Badge component started
Perplexity: Outreach research 60% done, grant section finishing tonight
```

---

## Part 6: Success Criteria Per Agent

### Copilot (Backend)
```
✅ All files compile (tsc --noEmit)
✅ All tests pass (114 tests)
✅ Coverage >80%
✅ Linting passes
✅ Imports use correct paths (src/entities, not relative)
✅ Entities have timestamps (createdAt, updatedAt)
✅ Relationships are bidirectional (OneToMany ↔ ManyToOne)
```

### ChatGPT (Frontend + Migrations)
```
✅ All files compile (TypeScript)
✅ All tests pass (17+ tests)
✅ Coverage >80%
✅ Linting passes
✅ Migrations generate without errors
✅ Components are responsive (mobile-first)
✅ WCAG AA contrast ratios met
✅ No unused imports
```

### Perplexity (Documentation)
```
✅ Research well-sourced (citations included)
✅ Actionable recommendations
✅ Proper markdown formatting
✅ Bilingual where appropriate
✅ 1000+ words of content
✅ Specific organization/grant names with links
```

---

## Part 7: Emergency Contacts

**If anything breaks**:

1. **Tests failing in CI?**
   - Check `.github/workflows/` for latest action
   - Run tests locally: `pnpm test:cov --runInBand`
   - Search error message in codebase

2. **Build error?**
   - Delete `node_modules` and lockfiles
   - Reinstall: `pnpm install`
   - Rebuild: `pnpm build`

3. **Database issue?**
   - Check `.env.local` DATABASE_URL
   - Verify Supabase connection: `curl https://aws-1-us-east-1.pooler.supabase.com`
   - Check migration status in Supabase dashboard

4. **Git conflict?**
   - Never force-push to main
   - Create merge PR (see 5.1 above)
   - Request manual merge

5. **Port conflict (3000 or 5173 in use)?**
   - `lsof -i :3000` to find process
   - `kill -9 <PID>` to terminate
   - Restart server

---

## Part 8: Checklist Before Starting

**Print this out and check each box**:

- [ ] All 9 branches created and pushed to GitHub
- [ ] Backend servers running (`pnpm start:dev`)
- [ ] Frontend server running (`pnpm dev`)
- [ ] API health check passes (`curl http://localhost:3000/api/v1/ingestion/health`)
- [ ] Each agent has context (copy-pasted above)
- [ ] Each agent knows their task and branch
- [ ] Each agent can see PARALLEL_DEVELOPMENT_STRATEGY.md
- [ ] Copilot has VS Code open with workspace
- [ ] ChatGPT has project context loaded
- [ ] Perplexity has research setup
- [ ] You're ready to trigger agents with go-ahead signal

---

## Summary: Your Role as Coordinator

**You will**:
1. ✅ Provide initial context to each agent
2. ✅ Trigger agents with specific task prompts (use prompts above)
3. ✅ Monitor progress daily (standup)
4. ✅ Handle merges in prescribed order (Section 4.1)
5. ✅ Resolve any conflicts (Section 5.1)
6. ✅ Verify final PRs before merging

**Agents will**:
- Write code on their branch
- Test locally before pushing
- Push to GitHub
- Create PRs when done
- Request review

**Expected outcome**: 9 issues completed in 2.5 weeks = **6-7x faster than sequential** 🚀

