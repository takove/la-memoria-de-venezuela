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

// Officials
export async function getOfficials(params: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
} = {}) {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.set('page', params.page.toString());
  if (params.limit) searchParams.set('limit', params.limit.toString());
  if (params.search) searchParams.set('search', params.search);
  if (params.status) searchParams.set('status', params.status);
  
  return fetchAPI(`/officials?${searchParams}`);
}

export async function getOfficial(id: string) {
  return fetchAPI(`/officials/${id}`);
}

export async function getOfficialStatistics() {
  return fetchAPI('/officials/statistics');
}

// Sanctions
export async function getSanctions(params: {
  page?: number;
  limit?: number;
  type?: string;
  status?: string;
} = {}) {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.set('page', params.page.toString());
  if (params.limit) searchParams.set('limit', params.limit.toString());
  if (params.type) searchParams.set('type', params.type);
  if (params.status) searchParams.set('status', params.status);
  
  return fetchAPI(`/sanctions?${searchParams}`);
}

export async function getSanctionsTimeline() {
  return fetchAPI('/sanctions/timeline');
}

export async function getSanctionsStatistics() {
  return fetchAPI('/sanctions/statistics');
}

// Cases
export async function getCases(params: {
  page?: number;
  limit?: number;
  type?: string;
  jurisdiction?: string;
} = {}) {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.set('page', params.page.toString());
  if (params.limit) searchParams.set('limit', params.limit.toString());
  if (params.type) searchParams.set('type', params.type);
  if (params.jurisdiction) searchParams.set('jurisdiction', params.jurisdiction);
  
  return fetchAPI(`/cases?${searchParams}`);
}

export async function getCase(id: string) {
  return fetchAPI(`/cases/${id}`);
}

// Search
export async function search(query: string, options: {
  limit?: number;
  types?: string;
} = {}) {
  const searchParams = new URLSearchParams();
  searchParams.set('q', query);
  if (options.limit) searchParams.set('limit', options.limit.toString());
  if (options.types) searchParams.set('types', options.types);
  
  return fetchAPI(`/search?${searchParams}`);
}

export async function autocomplete(query: string, limit = 5) {
  return fetchAPI(`/search/autocomplete?q=${encodeURIComponent(query)}&limit=${limit}`);
}

export async function getHighlightedOfficials(limit = 6) {
  return fetchAPI(`/search/highlighted?limit=${limit}`);
}

// Export as object for convenient imports
export const api = {
  getOfficials,
  getOfficial,
  getOfficialStatistics,
  getSanctions,
  getSanctionsTimeline,
  getSanctionsStatistics,
  getCases,
  getCase,
  search,
  autocomplete,
  getHighlightedOfficials,
};
