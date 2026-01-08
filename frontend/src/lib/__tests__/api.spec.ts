import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  getMemorialStatistics,
  getVictims,
  getVictim,
  getPrisoners,
  getExileStories,
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
} from "$lib/api";

describe("api helpers", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.stubGlobal("fetch", fetchMock);
    fetchMock.mockReset();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  // Memorial API
  it("fetches memorial statistics", async () => {
    const payload = { total: 10 };
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => payload,
      status: 200,
      statusText: "OK",
    });

    const result = await getMemorialStatistics();

    expect(result).toEqual(payload);
    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:3000/api/v1/memorial/statistics",
      expect.objectContaining({ headers: expect.any(Object) }),
    );
  });

  it("builds victim query params", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ data: [], meta: {} }),
      status: 200,
      statusText: "OK",
    });

    await getVictims({
      page: 1,
      limit: 10,
      search: "victim",
      category: "death",
      minConfidence: 4,
      yearFrom: 2000,
      yearTo: 2024,
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:3000/api/v1/memorial/victims?page=1&limit=10&search=victim&category=death&minConfidence=4&yearFrom=2000&yearTo=2024",
      expect.objectContaining({ headers: expect.any(Object) }),
    );
  });

  it("fetches single victim", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ id: "123", name: "Test Victim" }),
      status: 200,
      statusText: "OK",
    });

    await getVictim("123");

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:3000/api/v1/memorial/victims/123",
      expect.objectContaining({ headers: expect.any(Object) }),
    );
  });

  it("builds prisoner query params", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ data: [], meta: {} }),
      status: 200,
      statusText: "OK",
    });

    await getPrisoners({
      page: 1,
      limit: 20,
      search: "prisoner",
      status: "detained",
      facilityType: "military",
      torture: true,
      currentlyDetained: true,
    });

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("memorial/prisoners"),
      expect.objectContaining({ headers: expect.any(Object) }),
    );
  });

  it("builds exile story query params", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ data: [], meta: {} }),
      status: 200,
      statusText: "OK",
    });

    await getExileStories({
      page: 1,
      limit: 15,
      search: "exile",
      destination: "Colombia",
      reason: "persecution",
      journeyRoute: "land",
      yearFrom: 2015,
      yearTo: 2024,
    });

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("memorial/exiles"),
      expect.objectContaining({ headers: expect.any(Object) }),
    );
  });

  // Officials API
  it("fetches officials with filters", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ data: [], meta: {} }),
      status: 200,
      statusText: "OK",
    });

    await getOfficials({
      page: 2,
      limit: 20,
      search: "Maduro",
      status: "active",
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:3000/api/v1/officials?page=2&limit=20&search=Maduro&status=active",
      expect.objectContaining({ headers: expect.any(Object) }),
    );
  });

  it("fetches single official", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ id: "456", fullName: "Official Name" }),
      status: 200,
      statusText: "OK",
    });

    await getOfficial("456");

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:3000/api/v1/officials/456",
      expect.objectContaining({ headers: expect.any(Object) }),
    );
  });

  it("fetches official statistics", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ total: 150 }),
      status: 200,
      statusText: "OK",
    });

    await getOfficialStatistics();

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:3000/api/v1/officials/statistics",
      expect.objectContaining({ headers: expect.any(Object) }),
    );
  });

  // Sanctions API
  it("fetches sanctions with filters", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ data: [], meta: {} }),
      status: 200,
      statusText: "OK",
    });

    await getSanctions({ page: 1, limit: 30, type: "OFAC", status: "active" });

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:3000/api/v1/sanctions?page=1&limit=30&type=OFAC&status=active",
      expect.objectContaining({ headers: expect.any(Object) }),
    );
  });

  it("fetches sanctions timeline", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ events: [] }),
      status: 200,
      statusText: "OK",
    });

    await getSanctionsTimeline();

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:3000/api/v1/sanctions/timeline",
      expect.objectContaining({ headers: expect.any(Object) }),
    );
  });

  it("fetches sanctions statistics", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ total: 200 }),
      status: 200,
      statusText: "OK",
    });

    await getSanctionsStatistics();

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:3000/api/v1/sanctions/statistics",
      expect.objectContaining({ headers: expect.any(Object) }),
    );
  });

  // Cases API
  it("fetches cases with filters", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ data: [], meta: {} }),
      status: 200,
      statusText: "OK",
    });

    await getCases({
      page: 1,
      limit: 25,
      type: "criminal",
      jurisdiction: "US",
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:3000/api/v1/cases?page=1&limit=25&type=criminal&jurisdiction=US",
      expect.objectContaining({ headers: expect.any(Object) }),
    );
  });

  it("fetches single case", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ id: "789", title: "Case Title" }),
      status: 200,
      statusText: "OK",
    });

    await getCase("789");

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:3000/api/v1/cases/789",
      expect.objectContaining({ headers: expect.any(Object) }),
    );
  });

  // Search API
  it("performs search with query and options", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ results: [] }),
      status: 200,
      statusText: "OK",
    });

    await search("corruption", { limit: 10, types: "officials,cases" });

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:3000/api/v1/search?q=corruption&limit=10&types=officials%2Ccases",
      expect.objectContaining({ headers: expect.any(Object) }),
    );
  });

  it("performs autocomplete search", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ suggestions: [] }),
      status: 200,
      statusText: "OK",
    });

    await autocomplete("Mad", 5);

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:3000/api/v1/search/autocomplete?q=Mad&limit=5",
      expect.objectContaining({ headers: expect.any(Object) }),
    );
  });

  it("fetches highlighted officials", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ officials: [] }),
      status: 200,
      statusText: "OK",
    });

    await getHighlightedOfficials(6);

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:3000/api/v1/search/highlighted?limit=6",
      expect.objectContaining({ headers: expect.any(Object) }),
    );
  });

  it("throws on API error responses", async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 500,
      statusText: "Server Error",
    });

    await expect(getVictim("123")).rejects.toThrow(
      "API Error: 500 Server Error",
    );
  });
});
