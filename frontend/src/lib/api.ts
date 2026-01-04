import { PUBLIC_API_URL } from "$env/static/public";
import type {
  Victim,
  PoliticalPrisoner,
  ExileStory,
  MemorialStatistics,
  PaginatedResponse,
} from "./types";

const API_URL = PUBLIC_API_URL || "http://localhost:3000/api/v1";

async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${API_URL}${endpoint}`;

  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
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
export async function getOfficials(
  params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
  } = {},
) {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.set("page", params.page.toString());
  if (params.limit) searchParams.set("limit", params.limit.toString());
  if (params.search) searchParams.set("search", params.search);
  if (params.status) searchParams.set("status", params.status);

  return fetchAPI(`/officials?${searchParams}`);
}

export async function getOfficial(id: string) {
  return fetchAPI(`/officials/${id}`);
}

export async function getOfficialStatistics() {
  return fetchAPI("/officials/statistics");
}

// Sanctions
export async function getSanctions(
  params: {
    page?: number;
    limit?: number;
    type?: string;
    status?: string;
  } = {},
) {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.set("page", params.page.toString());
  if (params.limit) searchParams.set("limit", params.limit.toString());
  if (params.type) searchParams.set("type", params.type);
  if (params.status) searchParams.set("status", params.status);

  return fetchAPI(`/sanctions?${searchParams}`);
}

export async function getSanctionsTimeline() {
  return fetchAPI("/sanctions/timeline");
}

export async function getSanctionsStatistics() {
  return fetchAPI("/sanctions/statistics");
}

// Cases
export async function getCases(
  params: {
    page?: number;
    limit?: number;
    type?: string;
    jurisdiction?: string;
  } = {},
) {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.set("page", params.page.toString());
  if (params.limit) searchParams.set("limit", params.limit.toString());
  if (params.type) searchParams.set("type", params.type);
  if (params.jurisdiction)
    searchParams.set("jurisdiction", params.jurisdiction);

  return fetchAPI(`/cases?${searchParams}`);
}

export async function getCase(id: string) {
  return fetchAPI(`/cases/${id}`);
}

// Search
export async function search(
  query: string,
  options: {
    limit?: number;
    types?: string;
  } = {},
) {
  const searchParams = new URLSearchParams();
  searchParams.set("q", query);
  if (options.limit) searchParams.set("limit", options.limit.toString());
  if (options.types) searchParams.set("types", options.types);

  return fetchAPI(`/search?${searchParams}`);
}

export async function autocomplete(query: string, limit = 5) {
  return fetchAPI(
    `/search/autocomplete?q=${encodeURIComponent(query)}&limit=${limit}`,
  );
}

export async function getHighlightedOfficials(limit = 6) {
  return fetchAPI(`/search/highlighted?limit=${limit}`);
}

// ==================== MEMORIAL API ====================

/**
 * Get overall memorial statistics
 */
export async function getMemorialStatistics(): Promise<MemorialStatistics> {
  return fetchAPI("/memorial/statistics");
}

// Victims
export async function getVictims(
  params: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    minConfidence?: number;
    yearFrom?: number;
    yearTo?: number;
  } = {},
): Promise<PaginatedResponse<Victim>> {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.set("page", params.page.toString());
  if (params.limit) searchParams.set("limit", params.limit.toString());
  if (params.search) searchParams.set("search", params.search);
  if (params.category) searchParams.set("category", params.category);
  if (params.minConfidence)
    searchParams.set("minConfidence", params.minConfidence.toString());
  if (params.yearFrom) searchParams.set("yearFrom", params.yearFrom.toString());
  if (params.yearTo) searchParams.set("yearTo", params.yearTo.toString());

  return fetchAPI(`/memorial/victims?${searchParams}`);
}

export async function getVictim(id: string): Promise<Victim> {
  return fetchAPI(`/memorial/victims/${id}`);
}

export async function getVictimStatistics() {
  return fetchAPI("/memorial/victims/statistics");
}

// Political Prisoners
export async function getPrisoners(
  params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    facilityType?: string;
    torture?: boolean;
    currentlyDetained?: boolean;
  } = {},
): Promise<PaginatedResponse<PoliticalPrisoner>> {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.set("page", params.page.toString());
  if (params.limit) searchParams.set("limit", params.limit.toString());
  if (params.search) searchParams.set("search", params.search);
  if (params.status) searchParams.set("status", params.status);
  if (params.facilityType)
    searchParams.set("facilityType", params.facilityType);
  if (params.torture !== undefined)
    searchParams.set("torture", params.torture.toString());
  if (params.currentlyDetained !== undefined)
    searchParams.set("currentlyDetained", params.currentlyDetained.toString());

  return fetchAPI(`/memorial/prisoners?${searchParams}`);
}

export async function getPrisoner(id: string): Promise<PoliticalPrisoner> {
  return fetchAPI(`/memorial/prisoners/${id}`);
}

export async function getPrisonerStatistics() {
  return fetchAPI("/memorial/prisoners/statistics");
}

// Exile Stories
export async function getExileStories(
  params: {
    page?: number;
    limit?: number;
    search?: string;
    reason?: string;
    journeyRoute?: string;
    destination?: string;
    yearFrom?: number;
    yearTo?: number;
  } = {},
): Promise<PaginatedResponse<ExileStory>> {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.set("page", params.page.toString());
  if (params.limit) searchParams.set("limit", params.limit.toString());
  if (params.search) searchParams.set("search", params.search);
  if (params.reason) searchParams.set("reason", params.reason);
  if (params.journeyRoute)
    searchParams.set("journeyRoute", params.journeyRoute);
  if (params.destination) searchParams.set("destination", params.destination);
  if (params.yearFrom) searchParams.set("yearFrom", params.yearFrom.toString());
  if (params.yearTo) searchParams.set("yearTo", params.yearTo.toString());

  return fetchAPI(`/memorial/exiles?${searchParams}`);
}

export async function getExileStory(id: string): Promise<ExileStory> {
  return fetchAPI(`/memorial/exiles/${id}`);
}

export async function getExileStatistics() {
  return fetchAPI("/memorial/exiles/statistics");
}

// Export as object for convenient imports
export const api = {
  // Officials
  getOfficials,
  getOfficial,
  getOfficialStatistics,
  // Sanctions
  getSanctions,
  getSanctionsTimeline,
  getSanctionsStatistics,
  // Cases
  getCases,
  getCase,
  // Search
  search,
  autocomplete,
  getHighlightedOfficials,
  // Memorial
  getMemorialStatistics,
  getVictims,
  getVictim,
  getVictimStatistics,
  getPrisoners,
  getPrisoner,
  getPrisonerStatistics,
  getExileStories,
  getExileStory,
  getExileStatistics,
};
