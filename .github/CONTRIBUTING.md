# Contributing to La Memoria de Venezuela

Thank you for your interest in contributing to La Memoria de Venezuela! This project documents accountability information about Venezuelan regime officials, testaferros, businesses, and cultural propagandists under international sanctions and legal proceedings.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Making Contributions](#making-contributions)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Submitting Changes](#submitting-changes)
- [Data Contribution Guidelines](#data-contribution-guidelines)

## Code of Conduct

### Our Commitment

This project is dedicated to peaceful accountability and transparency. We are **the moral opposite of La Lista Tascón** - we document the powerful who stole from Venezuelans, we do NOT persecute citizens.

### Principles

- **ACCURACY**: Only document information from verified, credible sources
- **FAIRNESS**: Include dispute resolution processes and right to correction
- **TRANSPARENCY**: All sources must be public and verifiable
- **RESPECT**: Treat all contributors with respect, regardless of background

## Getting Started

### Prerequisites

- Node.js 18+ and pnpm
- PostgreSQL knowledge (we use Supabase)
- Familiarity with NestJS and SvelteKit
- Understanding of TypeScript

### Initial Setup

```bash
# Clone the repository
git clone https://github.com/takove/la-memoria-de-venezuela.git
cd la-memoria-de-venezuela

# Install backend dependencies
cd backend
pnpm install

# Install frontend dependencies
cd ../frontend
pnpm install

# Set up environment variables
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

## Development Setup

### Backend (NestJS)

```bash
cd backend
pnpm start:dev
# Server runs on http://localhost:3000
```

### Frontend (SvelteKit)

```bash
cd frontend
pnpm dev
# App runs on http://localhost:5173
```

### Database

We use Supabase Session Pooler for PostgreSQL:
- **Never** use direct connection strings
- Always use the Session Pooler URL for IPv4/IPv6 compatibility
- Connection string format: `postgresql://postgres.PROJECT_REF:PASSWORD@aws-1-us-east-1.pooler.supabase.com:5432/postgres`

## Making Contributions

### Types of Contributions

1. **Bug Fixes**: Fix issues in existing functionality
2. **New Features**: Add new capabilities (see GitHub Issues)
3. **Data Additions**: Add verified officials, sanctions, or cases
4. **Documentation**: Improve README, API docs, or guides
5. **Tests**: Add unit or integration tests
6. **Performance**: Optimize queries or frontend performance

### Workflow

1. **Find or Create an Issue**: Check [GitHub Issues](https://github.com/takove/la-memoria-de-venezuela/issues)
2. **Fork the Repository**: Create your own fork
3. **Create a Branch**: `git checkout -b feat/your-feature-name`
4. **Make Changes**: Follow coding standards below
5. **Test Thoroughly**: Ensure everything works
6. **Commit**: Use conventional commit messages
7. **Push**: Push to your fork
8. **Pull Request**: Submit PR to `main` branch

## Coding Standards

### TypeScript

- **Always use TypeScript**: No plain JavaScript
- **Strict types**: Enable `strict: true` in `tsconfig.json`
- **No `any`**: Use proper types or `unknown`
- **Interfaces over types**: Prefer `interface` for object shapes

### Backend (NestJS)

```typescript
// ✅ GOOD: Service with proper error handling
@Injectable()
export class OfficialsService {
  constructor(
    @InjectRepository(Official)
    private officialsRepository: Repository<Official>,
  ) {}

  async findOne(id: string): Promise<Official> {
    const official = await this.officialsRepository.findOne({
      where: { id },
      relations: ['sanctions', 'caseInvolvements'],
    });
    
    if (!official) {
      throw new NotFoundException(`Official with ID ${id} not found`);
    }
    
    return official;
  }
}

// ✅ GOOD: DTO with validation
export class CreateOfficialDto {
  @IsString()
  @Length(2, 100)
  fullName: string;

  @IsInt()
  @Min(1)
  @Max(5)
  confidenceLevel: number; // 1=rumor, 5=official
}
```

### Frontend (SvelteKit)

```typescript
// ✅ GOOD: Component with loading states
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
      const response = await api.getOfficials();
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

{#if loading}
  <p>Cargando...</p>
{:else if error}
  <p class="text-red-600">{error}</p>
{:else}
  {#each officials as official}
    <a href="/officials/{official.id}">{official.fullName}</a>
  {/each}
{/if}
```

### Naming Conventions

- **Files**: kebab-case (`case-involvement.entity.ts`)
- **Components**: PascalCase (`OfficialCard.svelte`)
- **Variables/Functions**: camelCase (`loadOfficials`)
- **Constants**: UPPER_SNAKE_CASE (`API_URL`)
- **Database Tables**: snake_case (`officials`)
- **Database Columns**: snake_case (`full_name`)
- **TypeScript Properties**: camelCase (`fullName`)

### Git Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```bash
feat: add testaferros CRUD endpoints
fix: resolve sanction date formatting bug
docs: update API documentation
refactor: extract validation logic
test: add unit tests for sanctions service
chore: update dependencies
perf: optimize officials query
```

## Testing

### Backend Tests (Jest)

```typescript
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
```

### Frontend Tests (Vitest)

```typescript
import { render, screen } from '@testing-library/svelte';
import OfficialCard from './OfficialCard.svelte';

test('renders official name', () => {
  render(OfficialCard, { 
    props: { 
      official: { fullName: 'Test Official', status: 'active' } 
    } 
  });
  
  expect(screen.getByText('Test Official')).toBeInTheDocument();
});
```

### Running Tests

```bash
# Backend
cd backend
pnpm test

# Frontend
cd frontend
pnpm test
```

## Submitting Changes

### Pull Request Checklist

- [ ] Code follows project coding standards
- [ ] All tests pass (`pnpm test`)
- [ ] New features have tests
- [ ] Documentation is updated
- [ ] Commit messages follow conventional format
- [ ] No console errors or warnings
- [ ] Responsive design tested (mobile, tablet, desktop)
- [ ] Bilingual support (Spanish and English) for user-facing text

### Pull Request Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Data addition
- [ ] Documentation update
- [ ] Performance improvement

## Testing
How has this been tested?

## Screenshots (if applicable)
Add screenshots for UI changes

## Related Issues
Closes #123
```

## Data Contribution Guidelines

### Adding Officials, Sanctions, or Cases

All data must meet these criteria:

1. **Source Verification**
   - OFAC SDN List
   - DOJ/FBI indictments
   - IACHR reports
   - ICC filings
   - Reputable journalism (NYT, WaPo, BBC, El País)

2. **Confidence Level** (Required for all entries)
   - 1 = Rumor (unverified social media)
   - 2 = Unverified (single unconfirmed source)
   - 3 = Credible (multiple independent sources)
   - 4 = Verified (government reports, NGO investigations)
   - 5 = Official (OFAC, DOJ, ICC documents)

3. **Bilingual Content**
   - All descriptions in Spanish AND English
   - Use professional translations
   - Avoid slang or inflammatory language

4. **Source Links**
   - Include `sourceUrl` for every entry
   - Link to official government documents when possible
   - Archive.org links for news articles

### Example Data Submission

```typescript
// ✅ GOOD: Well-documented sanction
{
  "officialId": "uuid-here",
  "type": "ofac_sdn",
  "programName": "Venezuela Sanctions Program",
  "programCode": "VENEZUELA",
  "ofacId": "12345",
  "reason": "Corruption, undermining democratic institutions",
  "reasonEs": "Corrupción, socavar instituciones democráticas",
  "imposedDate": "2018-05-21",
  "sourceUrl": "https://ofac.treasury.gov/...",
  "confidenceLevel": 5 // Official OFAC document
}

// ❌ BAD: Missing sources and confidence level
{
  "officialId": "uuid-here",
  "type": "ofac_sdn",
  "reason": "Bad guy"
  // Missing: sourceUrl, confidence level, bilingual content
}
```

## Getting Help

- **GitHub Issues**: https://github.com/takove/la-memoria-de-venezuela/issues
- **Documentation**: See `/docs` directory
- **Code Examples**: See `/SAMPLE_DATA.md`

## License

By contributing, you agree that your contributions will be licensed under the same license as the project.

## Recognition

All contributors will be recognized in the project README. Significant contributions may be highlighted in release notes.

Thank you for helping hold the powerful accountable! 🇻🇪
