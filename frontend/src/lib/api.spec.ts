import { describe, it, expect, beforeEach, vi } from "vitest";
import { api } from "$lib/api";

// Mock fetch globally
global.fetch = vi.fn();

describe("API Client", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Officials API", () => {
    it("should fetch officials with default pagination", async () => {
      const mockData = {
        data: [
          {
            id: "uuid-123",
            fullName: "Nicolás Maduro Moros",
            status: "active",
            confidenceLevel: 5,
          },
        ],
        meta: {
          total: 1,
          page: 1,
          limit: 20,
          totalPages: 1,
        },
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      const result = await api.getOfficials();

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/v1/officials"),
        expect.objectContaining({
          headers: expect.objectContaining({
            "Content-Type": "application/json",
          }),
        }),
      );
      expect(result).toEqual(mockData);
    });

    it("should fetch officials with custom pagination", async () => {
      const mockData = {
        data: [],
        meta: {
          total: 0,
          page: 2,
          limit: 10,
          totalPages: 0,
        },
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      await api.getOfficials({ page: 2, limit: 10 });

      const call = (global.fetch as any).mock.calls[0][0];
      expect(call).toContain("page=2");
      expect(call).toContain("limit=10");
    });

    it("should fetch official by id", async () => {
      const mockOfficial = {
        id: "uuid-123",
        fullName: "Nicolás Maduro Moros",
        status: "active",
        confidenceLevel: 5,
        sanctions: [],
        caseInvolvements: [],
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockOfficial,
      });

      const result = await api.getOfficial("uuid-123");

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/v1/officials/uuid-123"),
        expect.any(Object),
      );
      expect(result).toEqual(mockOfficial);
    });

    it("should throw error when fetch fails", async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: "Not Found",
      });

      await expect(api.getOfficial("invalid")).rejects.toThrow(
        "API Error: 404 Not Found",
      );
    });
  });

  describe("Sanctions API", () => {
    it("should fetch sanctions", async () => {
      const mockData = {
        data: [
          {
            id: "sanction-uuid",
            type: "ofac_sdn",
            status: "active",
            imposedDate: "2018-05-21",
          },
        ],
        meta: {
          total: 1,
          page: 1,
          limit: 20,
          totalPages: 1,
        },
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      const result = await api.getSanctions();

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/v1/sanctions"),
        expect.any(Object),
      );
      expect(result).toEqual(mockData);
    });
  });

  describe("Cases API", () => {
    it("should fetch cases", async () => {
      const mockData = {
        data: [
          {
            id: "case-uuid",
            caseNumber: "CASE-001",
            type: "criminal",
            status: "active",
          },
        ],
        meta: {
          total: 1,
          page: 1,
          limit: 20,
          totalPages: 1,
        },
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      const result = await api.getCases();

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/v1/cases"),
        expect.any(Object),
      );
      expect(result).toEqual(mockData);
    });
  });

  describe("Search API", () => {
    it("should perform search", async () => {
      const mockResults = {
        officials: [
          {
            id: "uuid-123",
            fullName: "Nicolás Maduro",
            type: "official",
          },
        ],
        sanctions: [],
        cases: [],
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResults,
      });

      const result = await api.search("Maduro");

      const call = (global.fetch as any).mock.calls[0][0];
      expect(call).toContain("/api/v1/search");
      expect(call).toContain("q=Maduro");
      expect(result).toEqual(mockResults);
    });
  });
});
