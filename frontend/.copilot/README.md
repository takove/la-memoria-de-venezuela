# Frontend Development Context for Copilot

This file provides additional context for GitHub Copilot when working on the SvelteKit frontend.

## Current Architecture

### Route Structure

```
/                      - Homepage with overview and statistics
/officials             - List all officials
/officials/[id]        - Official detail page
/sanctions             - List all sanctions
/cases                 - List legal cases
/about                 - About the project and La Lista Tascón context
/search                - Search functionality
```

### Key Files

- **`src/lib/api.ts`** - API client functions
- **`src/lib/types.ts`** - TypeScript interfaces
- **`src/routes/+layout.svelte`** - Main layout with navigation
- **`src/app.css`** - Global Tailwind styles

### API Client Pattern

```typescript
// src/lib/api.ts
import { PUBLIC_API_URL } from '$env/static/public';

const API_URL = PUBLIC_API_URL || 'http://localhost:3000/api/v1';

async function fetchAPI<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_URL}${endpoint}`;
  
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

export async function getOfficials(params = {}) {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.set('page', params.page.toString());
  if (params.limit) searchParams.set('limit', params.limit.toString());
  
  return fetchAPI(`/officials?${searchParams}`);
}
```

### Component Pattern

```svelte
<script lang="ts">
  import { onMount } from 'svelte';
  import type { Official } from '$lib/types';
  import { api } from '$lib/api';
  
  // State
  let officials: Official[] = [];
  let loading = true;
  let error = '';
  
  // Functions
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
  
  // Lifecycle
  onMount(() => {
    loadOfficials();
  });
</script>

<!-- Template with loading states -->
<div class="container mx-auto px-4 py-8">
  <h1 class="text-3xl font-bold mb-6">Funcionarios</h1>
  
  {#if loading}
    <p class="text-gray-600">Cargando...</p>
  {:else if error}
    <p class="text-red-600">{error}</p>
  {:else if officials.length === 0}
    <p class="text-gray-600">No hay funcionarios disponibles</p>
  {:else}
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {#each officials as official}
        <a href="/officials/{official.id}" 
           class="block p-6 bg-white rounded-lg shadow hover:shadow-lg transition">
          <h3 class="text-xl font-semibold mb-2">{official.fullName}</h3>
          <span class="text-sm text-gray-600">{official.status}</span>
        </a>
      {/each}
    </div>
  {/if}
</div>
```

### TypeScript Types

```typescript
// src/lib/types.ts
export interface Official {
  id: string;
  fullName: string;
  fullNameEs?: string;
  biography?: string;
  biographyEs?: string;
  status: 'active' | 'inactive' | 'deceased';
  confidenceLevel: number; // 1-5
  createdAt: string;
  updatedAt: string;
  sanctions?: Sanction[];
  caseInvolvements?: CaseInvolvement[];
  positions?: Position[];
}

export interface Sanction {
  id: string;
  officialId: string;
  type: 'ofac_sdn' | 'ofac_ns_plc' | 'eu' | 'canada' | 'uk' | 'other';
  programName: string;
  programCode?: string;
  ofacId?: string;
  reason: string;
  reasonEs?: string;
  imposedDate: string;
  liftedDate?: string;
  status: 'active' | 'lifted' | 'modified';
  sourceUrl?: string;
  official?: Official;
}

export interface Case {
  id: string;
  caseNumber: string;
  title: string;
  titleEs?: string;
  type: 'indictment' | 'criminal' | 'civil' | 'iachr' | 'icc' | 'other';
  jurisdiction: 'usa' | 'venezuela' | 'spain' | 'colombia' | 'iachr' | 'icc' | 'other';
  court?: string;
  description?: string;
  descriptionEs?: string;
  filingDate?: string;
  resolutionDate?: string;
  status: 'open' | 'closed' | 'pending' | 'dismissed' | 'conviction' | 'acquittal';
  documentUrl?: string;
  sourceUrl?: string;
  involvements?: CaseInvolvement[];
}

export interface CaseInvolvement {
  id: string;
  officialId: string;
  caseId: string;
  role: 'defendant' | 'witness' | 'accused' | 'convicted' | 'mentioned';
  details?: string;
  detailsEs?: string;
  official?: Official;
  case?: Case;
}
```

### Tailwind Styling Patterns

```svelte
<!-- Page Container -->
<div class="container mx-auto px-4 py-8">
  <!-- Content -->
</div>

<!-- Card -->
<div class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
  <!-- Card content -->
</div>

<!-- Grid Layout -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <!-- Grid items -->
</div>

<!-- Button -->
<button class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
  Click me
</button>

<!-- Badge -->
<span class="inline-block bg-red-100 text-red-800 text-xs px-2 py-1 rounded">
  Active
</span>

<!-- Link -->
<a href="/path" class="text-blue-600 hover:text-blue-800 hover:underline">
  Link text
</a>
```

### Common Utility Functions

```typescript
// Format date in Spanish
function formatDate(dateString: string | null): string {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('es-VE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

// Get status badge color
function getStatusClass(status: string): string {
  switch (status) {
    case 'active': return 'bg-red-100 text-red-800';
    case 'inactive': return 'bg-gray-100 text-gray-800';
    case 'lifted': return 'bg-green-100 text-green-800';
    default: return 'bg-gray-100 text-gray-800';
  }
}

// Truncate text
function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
}
```

### Environment Variables

```bash
# .env file
PUBLIC_API_URL=http://localhost:3000/api/v1
```

### Navigation Pattern

```svelte
<!-- src/routes/+layout.svelte -->
<nav class="bg-white border-b border-gray-200">
  <div class="container mx-auto px-4">
    <div class="flex items-center justify-between h-16">
      <a href="/" class="text-xl font-bold">
        🇻🇪 La Memoria
      </a>
      
      <div class="flex gap-6">
        <a href="/" class="hover:text-blue-600">Inicio</a>
        <a href="/officials" class="hover:text-blue-600">Funcionarios</a>
        <a href="/sanctions" class="hover:text-blue-600">Sanciones</a>
        <a href="/cases" class="hover:text-blue-600">Casos</a>
        <a href="/about" class="hover:text-blue-600">Acerca de</a>
      </div>
      
      <a href="/search">
        <img src="/search-icon.svg" alt="Search" class="w-5 h-5" />
      </a>
    </div>
  </div>
</nav>

<main>
  <slot />
</main>

<footer class="bg-gray-800 text-white py-8 mt-12">
  <!-- Footer content -->
</footer>
```

## Bilingual Content Pattern

Always provide content in both Spanish and English:

```svelte
<script>
  const content = {
    title: 'Funcionarios',
    titleEn: 'Officials',
    description: 'Lista de funcionarios del régimen',
    descriptionEn: 'List of regime officials'
  };
</script>

<h1>{content.title}</h1>
<p>{content.description}</p>
```

## Accessibility

- Use semantic HTML (`<nav>`, `<main>`, `<footer>`, `<article>`)
- Add `alt` text to all images
- Use proper heading hierarchy (`h1` → `h2` → `h3`)
- Include ARIA labels for interactive elements
- Ensure keyboard navigation works

## Performance

- Lazy load images: `loading="lazy"`
- Paginate large lists (20 items per page)
- Use SvelteKit's built-in code splitting
- Minimize API calls with proper caching

## Testing Pattern (Vitest - Coming Soon)

```typescript
import { render, screen } from '@testing-library/svelte';
import OfficialCard from './OfficialCard.svelte';

test('renders official name', () => {
  render(OfficialCard, { 
    props: { 
      official: { 
        id: '123',
        fullName: 'Test Official', 
        status: 'active' 
      } 
    } 
  });
  
  expect(screen.getByText('Test Official')).toBeInTheDocument();
});
```

## Common Commands

```bash
# Development
pnpm dev

# Build
pnpm build

# Preview production build
pnpm preview

# Type checking
pnpm check

# Linting
pnpm lint
pnpm format
```

## Important Notes

- Always handle loading, error, and empty states
- Use TypeScript for all `.ts` and `.svelte` files
- Follow Tailwind utility-first approach
- Maintain responsive design (mobile-first)
- Include bilingual support (Spanish/English)
- Test on Chrome, Firefox, and Safari
- Ensure SEO-friendly meta tags
