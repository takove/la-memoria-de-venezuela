# GitHub Copilot Instructions for La Memoria de Venezuela

> **For GitHub Copilot Workspace**: When assigned to an issue, you will automatically have access to this file. Follow ALL instructions here precisely. After every push, monitor GitHub Actions and fix failures before creating PRs.

## Project Overview

La Memoria de Venezuela is a comprehensive accountability database documenting Venezuelan regime officials, testaferros, businesses, and cultural propagandists under international sanctions and legal proceedings. This is **the moral opposite of La Lista Tascón** - we hold the powerful accountable, not persecute citizens.

## Tech Stack

- **Backend**: NestJS v10 + TypeORM + PostgreSQL (Supabase)
- **Frontend**: SvelteKit v2 + Tailwind CSS
- **Database**: Supabase (Session Pooler for IPv4/IPv6 compatibility)
- **Testing**: Jest (backend, coverage required) + Vitest (frontend, coverage with @vitest/coverage-v8)
- **Linting**: ESLint 9.x (flat config) + Prettier 3.x
  - **Backend**: ESLint 8.x with legacy .eslintrc.js
  - **Frontend**: ESLint 9.x with flat config (eslint.config.js), svelte-eslint-parser, typescript-eslint
- **CI/CD**: GitHub Actions (Node 20, pnpm v9, coverage artifact upload)

## Five-Tier Framework

1. **TIER 1**: Government officials (Ministers, military, judiciary)
2. **TIER 2**: Testaferros (200+ straw men holding stolen assets)
3. **TIER 3**: Business enablers (500+ corrupt companies)
4. **TIER 4**: Cultural figures (500+ regime propagandists)
5. **TIER 5**: International enablers (Foreign collaborators)

## Core Principles

### Data Integrity
- **Verified sources only**: OFAC, DOJ, IACHR, ICC, reputable journalism
- **Confidence levels**: Every entry rated 1-5 (1=rumor, 5=official document)
- **Right to correction**: Include dispute resolution process
- **Bilingual**: All content in Spanish and English

### Code Quality Standards

#### Backend (NestJS)
```typescript
// ✅ GOOD: Proper DTOs with validation
export class CreateOfficialDto {
  @IsString()
  @Length(2, 100)
  fullName: string;

  @IsOptional()
  @IsString()
  @Length(10, 5000)
  biography?: string;

  @IsInt()
  @Min(1)
  @Max(5)
  confidenceLevel: number; // 1=rumor, 5=official
}

// ✅ GOOD: Use repositories and service layer
@Injectable()
export class OfficialsService {
  constructor(
    @InjectRepository(Official)
    private officialsRepository: Repository<Official>,
  ) {}

  async findOne(id: string): Promise<Official> {
    const official = await this.officialsRepository.findOne({
      where: { id },
      relations: ['sanctions', 'caseInvolvements', 'positions'],
    });
    if (!official) {
      throw new NotFoundException(`Official with ID ${id} not found`);
    }
    return official;
  }
}

// ❌ BAD: Direct database queries in controllers
// ❌ BAD: Missing error handling
// ❌ BAD: No validation
```

#### Frontend (SvelteKit)
```typescript
// ✅ GOOD: Proper type safety and error handling
<script lang="ts">
  import { onMount } from 'svelte';
  import type { Official } from '$lib/types';
  
  let officials: Official[] = [];
  let loading = true;
  let error = '';

  async function loadOfficials() {
    try {
      loading = true;
      error = '';
      const response = await api.getOfficials({ page: 1, limit: 20 });
      officials = response.data;
    } catch (err) {
      error = 'Error al cargar funcionarios';
      console.error(err);
    } finally {
      loading = false;
    }
  }

  onMount(() => {
    loadOfficials();
  });
</script>

<!-- ✅ GOOD: Loading states, error handling, accessibility -->
{#if loading}
  <p>Cargando...</p>
{:else if error}
  <p class="text-red-600">{error}</p>
{:else if officials.length === 0}
  <p>No hay funcionarios disponibles</p>
{:else}
  {#each officials as official}
    <a href="/officials/{official.id}">
      {official.fullName}
    </a>
  {/each}
{/if}

// ❌ BAD: No loading states
// ❌ BAD: Missing error handling
// ❌ BAD: Poor accessibility
```

### Database Schema Conventions

```typescript
// ✅ Use snake_case for column names, camelCase for TypeScript properties
@Column({ name: 'full_name', length: 200 })
fullName: string;

// ✅ Always include timestamps
@CreateDateColumn({ name: 'created_at' })
createdAt: Date;

@UpdateDateColumn({ name: 'updated_at' })
updatedAt: Date;

// ✅ Use UUIDs for primary keys
@PrimaryGeneratedColumn('uuid')
id: string;

// ✅ Use enums for status fields
export enum ConfidenceLevel {
  RUMOR = 1,
  UNVERIFIED = 2,
  CREDIBLE = 3,
  VERIFIED = 4,
  OFFICIAL = 5,
}

// ✅ Add indexes for frequently queried fields
@Index(['fullName'])
@Index(['status', 'confidenceLevel'])
```

### API Design

```typescript
// ✅ RESTful endpoints with versioning
GET    /api/v1/officials
GET    /api/v1/officials/:id
POST   /api/v1/officials
PATCH  /api/v1/officials/:id
DELETE /api/v1/officials/:id

GET    /api/v1/sanctions
GET    /api/v1/sanctions/timeline
GET    /api/v1/sanctions/statistics

// ✅ Consistent response format
{
  "data": [...],
  "meta": {
    "total": 150,
    "page": 1,
    "limit": 20,
    "totalPages": 8
  }
}

// ✅ Proper error responses
{
  "statusCode": 404,
  "message": "Official with ID abc-123 not found",
  "error": "Not Found"
}
```

### Naming Conventions

- **Components**: PascalCase (`OfficialCard.svelte`, `SanctionsList.svelte`)
- **Files**: kebab-case (`case-involvement.entity.ts`, `officials.service.ts`)
- **Variables/Functions**: camelCase (`loadOfficials`, `sanctionTypes`)
- **Constants**: UPPER_SNAKE_CASE (`API_URL`, `DEFAULT_PAGE_SIZE`)
- **Types/Interfaces**: PascalCase (`Official`, `SanctionResponse`)
- **Database Tables**: snake_case (`officials`, `case_involvements`)

### Styling with Tailwind

```html
<!-- ✅ GOOD: Consistent spacing and responsive design -->
<div class="container mx-auto px-4 py-8">
  <h1 class="text-3xl font-bold mb-4">Funcionarios</h1>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    <!-- cards -->
  </div>
</div>

<!-- ✅ GOOD: Semantic color classes -->
<span class="bg-red-100 text-red-800">Activa</span>
<span class="bg-green-100 text-green-800">Levantada</span>

<!-- ❌ BAD: Inline styles, inconsistent spacing -->
```

### Testing Requirements

```typescript
// ✅ Unit tests for services
describe('OfficialsService', () => {
  it('should find official by id', async () => {
    const official = await service.findOne('uuid-123');
    expect(official).toBeDefined();
    expect(official.fullName).toBe('Nicolás Maduro');
  });

  it('should throw NotFoundException for invalid id', async () => {
    await expect(service.findOne('invalid')).rejects.toThrow(NotFoundException);
  });
});

// ✅ Integration tests for controllers
describe('OfficialsController', () => {
  it('GET /api/v1/officials should return paginated list', () => {
    return request(app.getHttpServer())
      .get('/api/v1/officials')
      .expect(200)
      .expect((res) => {
        expect(res.body.data).toBeInstanceOf(Array);
        expect(res.body.meta.total).toBeGreaterThan(0);
      });
  });
});
```

### Security & Privacy

- **No personal data collection**: Only public official records
- **HTTPS only** in production
- **Rate limiting** on all API endpoints
- **CORS** properly configured
- **Input validation** on all endpoints
- **SQL injection prevention** via TypeORM
- **XSS prevention** via Svelte's auto-escaping

### Documentation

- **Every function needs JSDoc comments**
- **Complex logic needs inline comments in Spanish or English**
- **API endpoints need Swagger/OpenAPI annotations**
- **README updates when adding major features**

### Git Commit Conventions

```bash
feat: add testaferros CRUD endpoints
fix: resolve sanction date formatting bug
docs: update API documentation for cases endpoint
refactor: extract common validation logic
test: add unit tests for sanctions service
chore: update dependencies
perf: optimize officials query with indexes
```

## When Writing Code, Always:

1. ✅ Add TypeScript types everywhere
2. ✅ Include error handling
3. ✅ Add loading states in UI
4. ✅ Validate all inputs
5. ✅ Use proper HTTP status codes
6. ✅ Include both Spanish and English text
7. ✅ Add confidence levels to new data
8. ✅ Follow the existing code patterns
9. ✅ Test with sample data before committing
10. ✅ Update documentation when needed
11. ✅ **NEVER start servers** — they run continuously in watch mode. NestJS (port 3000) and SvelteKit (port 5173) are always running. Do not attempt `pnpm start:dev` or similar.

### Test Script Commands

Use these commands for testing (do NOT use watch mode in CI):

**Local Development:**
- `pnpm --dir backend test` - Watch mode for backend tests
- `pnpm --dir frontend test` - Watch mode for frontend tests (requires pressing `q` to exit)

**CI/Automation (Non-watch mode):**
- `pnpm --dir backend test:cov --runInBand` - Backend tests with coverage, single-threaded (for CI reliability)
- `pnpm --dir frontend test:ci` - Frontend tests with coverage, exits cleanly (no manual input needed)

**Coverage & Coverage Reports:**
- `pnpm --dir backend test:cov` - Backend coverage report
- `pnpm --dir frontend test:cov` - Frontend coverage report (watch mode)

### Pre-Commit Testing Requirements

**CRITICAL: Always run linting and full test suite before committing changes.** This prevents broken builds in CI/CD and maintains code quality.

```bash
# Run lint and all tests before committing (backend + frontend)
pnpm --dir backend lint && pnpm --dir frontend lint && pnpm --dir backend test:cov --runInBand && pnpm --dir frontend test:ci
```

If linting or test suite fails:
1. Fix the linting errors, failing tests, or code
2. Re-run the full lint and test suite
3. Do NOT commit until all checks pass

### Post-Push CI/CD Monitoring & Auto-Fix

**CRITICAL: After every `git push`, monitor GitHub Actions and fix any failures immediately.**

#### Step 1: Monitor GitHub Actions After Push
```bash
# After pushing, wait 30 seconds then check CI status
git push origin <branch-name>
sleep 30

# Check latest workflow run status
gh run list --limit 1 --branch <branch-name>

# If failed, view the logs
gh run view --log-failed
```

#### Step 2: Common CI Failures & Fixes

**Failure: Linting errors**
```bash
# CI error: "ESLint found problems"
# Fix: Run lint with auto-fix locally
pnpm --dir backend lint --fix
pnpm --dir frontend lint --fix

# Commit the fixes
git add .
git commit -m "fix: resolve linting errors from CI"
git push origin <branch-name>
```

**Failure: Test failures**
```bash
# CI error: "Tests failed" or "Coverage below threshold"
# Fix: Run tests locally to reproduce
pnpm --dir backend test:cov --runInBand
pnpm --dir frontend test:ci

# Fix the failing tests, then commit
git add .
git commit -m "test: fix failing tests from CI"
git push origin <branch-name>
```

**Failure: TypeScript compilation errors**
```bash
# CI error: "Build failed" or "tsc errors"
# Fix: Run build locally
pnpm --dir backend build
pnpm --dir frontend build

# Fix type errors, then commit
git add .
git commit -m "fix: resolve TypeScript compilation errors"
git push origin <branch-name>
```

**Failure: Dependency Review (new dependencies)**
```bash
# CI error: "Dependency Review failed"
# This happens when adding new packages
# Fix: Ensure dependencies are justified and secure

# Check what dependencies were added
git diff main -- package.json pnpm-lock.yaml

# If legitimate (e.g., adding dotenv for config):
# - Update PR description to explain why the dependency is needed
# - Verify no known vulnerabilities: npm audit or pnpm audit
# - If safe, the Dependency Review can be overridden by maintainers

# If accidental dependency:
pnpm remove <unwanted-package>
git add .
git commit -m "chore: remove unnecessary dependency"
git push origin <branch-name>
```

**Failure: Missing files or imports**
```bash
# CI error: "Cannot find module" or "File not found"
# Fix: Ensure all files are committed
git status  # Check for untracked files
git add <missing-files>
git commit -m "fix: add missing files from CI"
git push origin <branch-name>
```

#### Step 3: Verify CI Passes Before Creating PR

**Before creating a Pull Request:**
```bash
# 1. Ensure all local tests pass
pnpm --dir backend lint && pnpm --dir backend test:cov --runInBand
pnpm --dir frontend lint && pnpm --dir frontend test:ci

# 2. Push final changes
git push origin <branch-name>

# 3. Wait for CI to complete (check GitHub Actions)
gh run watch

# 4. Only create PR when all checks are green ✅
gh pr create --title "feat: description" --body "Details..."
```

#### Step 4: Auto-Fix Workflow (Full Checklist)

When GitHub Actions fails, follow this exact sequence:

1. **View failure logs**:
   ```bash
   gh run view --log-failed
   ```

2. **Identify the failure type**:
   - Linting → Run `pnpm lint --fix`
   - Tests → Run `pnpm test:cov --runInBand` or `pnpm test:ci`
   - Build → Run `pnpm build`
   - Dependency → Check `package.json` changes

3. **Fix locally** (reproduce the error):
   ```bash
   # Always reproduce CI error locally before fixing
   cd backend && pnpm lint && pnpm test:cov --runInBand && pnpm build
   cd ../frontend && pnpm lint && pnpm test:ci && pnpm build
   ```

4. **Commit the fix**:
   ```bash
   git add .
   git commit -m "fix: resolve CI failure - <specific issue>"
   git push origin <branch-name>
   ```

5. **Verify CI passes**:
   ```bash
   gh run watch  # Wait for checks to complete
   # Expected: All checks passed ✅
   ```

6. **If still failing**: Repeat steps 1-5 until all checks pass

**DO NOT create Pull Requests with failing CI checks.** Always fix CI failures before requesting review

**Why this matters:**
- Broken tests in main branch block all CI/CD pipelines
- TypeScript/compilation errors prevent deployment
- Relationship errors between entities (like Official ↔ Testaferro) break multiple test suites
- Frontend and backend are tightly integrated; both must pass

**Common issues to watch for:**
- Adding new entity relationships without updating reciprocal entities
- Missing imports in service files (use `src/entities` barrel, not relative imports like `../entities`)
- TypeScript compilation errors in test files
- Breaking changes to existing DTOs or API contracts

## Common Patterns

### Adding a New Entity

1. Create entity in `backend/src/entities/[name].entity.ts`
2. Create DTOs in `backend/src/modules/[name]/dto/`
3. Create service in `backend/src/modules/[name]/[name].service.ts`
4. Create controller in `backend/src/modules/[name]/[name].controller.ts`
5. Create module in `backend/src/modules/[name]/[name].module.ts`
6. Add to `app.module.ts`
7. Create TypeScript interface in `frontend/src/lib/types.ts`
8. Add API methods in `frontend/src/lib/api.ts`
9. Create Svelte components/pages

### Adding a New Page

1. Create route in `frontend/src/routes/[route]/+page.svelte`
2. Add navigation link in `frontend/src/routes/+layout.svelte`
3. Add TypeScript types
4. Implement data fetching with loading/error states
5. Style with Tailwind CSS
6. Test responsive design

## Project-Specific Notes

- **Database**: Always use Supabase Session Pooler, not direct connection
- **Connection String**: `postgresql://postgres.gxepalgxlyohcgxzxcur:PASSWORD@aws-1-us-east-1.pooler.supabase.com:5432/postgres`
- **API Base URL**: `http://localhost:3000/api/v1` (dev)
- **Frontend URL**: `http://localhost:5173` (dev)

## Maintaining This Document

This file evolves continuously with the codebase. Follow these practices to keep it accurate and valuable:

### When to Update This File
- After merging significant architectural decisions or pattern changes
- When introducing new tech stack components or dependencies
- After discovering issues with current patterns (document the fix)
- When test/CI/CD workflows change
- When project structure or naming conventions are standardized

### How to Update (Low-Friction Workflow)
1. **During PR development**: Note any instruction updates needed in your PR description under "Copilot Instructions Updates"
2. **Post-merge**: Add a follow-up commit to update this file based on your notes (can be same day)
3. **Keep it concise**: Focus on **project-specific knowledge** that Copilot cannot infer from code alone
4. **Avoid redundancy**: Don't document language syntax or framework basics—focus on your project's patterns

### Sections Worth Updating
- **Tech Stack**: When upgrading frameworks (e.g., ESLint 8→9, NestJS versions)
- **Code Quality Standards**: When establishing new patterns (e.g., testing thresholds, validation libraries)
- **Build/Test Scripts**: When adding new npm scripts or CI jobs
- **Project-Specific Notes**: New environment variables, deployment changes, database migration patterns
- **Git Commit Conventions**: Add new commit types as needed

### Example: Recent Updates
- ✅ Added ESLint 9 flat config setup with Svelte parser requirements
- ✅ Documented `test:ci` vs `test` (watch mode) distinction for scripts
- ✅ Updated CI/CD to use `test:cov --runInBand` for reliable backend tests and `test:ci` for frontend

### Testing Updates Work
After updating this file, run a test with Copilot to ensure instructions are accurate:
- Ask Copilot to implement a new feature following the patterns documented
- If it deviates, refine the instructions to be clearer
- This iterative validation keeps the file in sync with reality

## Resources

- **GitHub Repo**: https://github.com/takove/la-memoria-de-venezuela
- **Issues**: https://github.com/takove/la-memoria-de-venezuela/issues
- **NestJS Docs**: https://docs.nestjs.com
- **SvelteKit Docs**: https://kit.svelte.dev
- **TypeORM Docs**: https://typeorm.io
- **Tailwind CSS**: https://tailwindcss.com

## Mission Statement

Remember: We're building a tool for accountability and transparency, not persecution. Every line of code should serve justice, truth, and the Venezuelan people's right to know who has stolen from them.

**La Lista Tascón** persecuted 3.4 million citizens for signing a recall referendum. **La Memoria de Venezuela** documents the powerful few who stole from 30 million Venezuelans. We are the exact opposite, morally and technically.
