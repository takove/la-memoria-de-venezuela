import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "../+server";

// Mock SvelteKit modules
vi.mock("$env/dynamic/public", () => ({
  env: {
    PUBLIC_API_URL: "http://localhost:3000/api/v1",
  },
}));

vi.mock("@sveltejs/kit", () => ({
  error: (status: number, message: string) => {
    const err = new Error(message) as any;
    err.status = status;
    throw err;
  },
}));

describe("OG Image Endpoint", () => {
  const mockOfficial = {
    id: "123",
    fullName: "Nicolás Maduro",
    status: "active",
    confidenceLevel: 5,
    sanctions: [
      { id: "1", type: "ofac_sdn" },
      { id: "2", type: "eu" },
    ],
  };

  beforeEach(() => {
    // Reset fetch mock
    global.fetch = vi.fn();
  });

  it("returns SVG image with correct content-type", async () => {
    // Mock successful API response
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockOfficial,
    });

    const mockSetHeaders = vi.fn();
    const response = await GET({
      params: { id: "123" },
      setHeaders: mockSetHeaders,
    } as any);

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe("image/svg+xml");
  });

  it("sets cache headers", async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockOfficial,
    });

    const mockSetHeaders = vi.fn();
    const response = await GET({
      params: { id: "123" },
      setHeaders: mockSetHeaders,
    } as any);

    const cacheControl = response.headers.get("Cache-Control");
    expect(cacheControl).toContain("public");
    expect(cacheControl).toContain("max-age");
  });

  it("includes official name in SVG", async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockOfficial,
    });

    const mockSetHeaders = vi.fn();
    const response = await GET({
      params: { id: "123" },
      setHeaders: mockSetHeaders,
    } as any);

    const svgText = await response.text();
    expect(svgText).toContain("Nicolás Maduro");
    expect(svgText).toContain("La Memoria de Venezuela");
  });

  it("includes status badge", async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockOfficial,
    });

    const mockSetHeaders = vi.fn();
    const response = await GET({
      params: { id: "123" },
      setHeaders: mockSetHeaders,
    } as any);

    const svgText = await response.text();
    expect(svgText).toContain("Activo");
  });

  it("includes confidence level", async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockOfficial,
    });

    const mockSetHeaders = vi.fn();
    const response = await GET({
      params: { id: "123" },
      setHeaders: mockSetHeaders,
    } as any);

    const svgText = await response.text();
    expect(svgText).toContain("Confianza: 5/5");
  });

  it("includes sanctions count when present", async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockOfficial,
    });

    const mockSetHeaders = vi.fn();
    const response = await GET({
      params: { id: "123" },
      setHeaders: mockSetHeaders,
    } as any);

    const svgText = await response.text();
    expect(svgText).toContain("2 Sanciones");
  });

  it("handles officials without sanctions", async () => {
    const officialWithoutSanctions = { ...mockOfficial, sanctions: [] };
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => officialWithoutSanctions,
    });

    const mockSetHeaders = vi.fn();
    const response = await GET({
      params: { id: "123" },
      setHeaders: mockSetHeaders,
    } as any);

    const svgText = await response.text();
    expect(svgText).toContain("Nicolás Maduro");
    // Should not contain sanctions text when there are none
    expect(svgText).not.toContain("Sanciones");
  });

  it("throws 404 when official not found", async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 404,
    });

    const mockSetHeaders = vi.fn();

    await expect(
      GET({
        params: { id: "invalid" },
        setHeaders: mockSetHeaders,
      } as any),
    ).rejects.toThrow();
  });

  it("generates valid SVG structure", async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockOfficial,
    });

    const mockSetHeaders = vi.fn();
    const response = await GET({
      params: { id: "123" },
      setHeaders: mockSetHeaders,
    } as any);

    const svgText = await response.text();

    // Check for SVG structure
    expect(svgText).toContain("<svg");
    expect(svgText).toContain('width="1200"');
    expect(svgText).toContain('height="630"');
    expect(svgText).toContain("</svg>");
  });

  it("truncates long names", async () => {
    const longNameOfficial = {
      ...mockOfficial,
      fullName:
        "This is a very long name that should be truncated in the image",
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => longNameOfficial,
    });

    const mockSetHeaders = vi.fn();
    const response = await GET({
      params: { id: "123" },
      setHeaders: mockSetHeaders,
    } as any);

    const svgText = await response.text();
    expect(svgText).toContain("...");
  });

  it("handles different status values", async () => {
    const statuses = ["active", "inactive", "deceased", "exiled", "imprisoned"];

    for (const status of statuses) {
      const official = { ...mockOfficial, status };
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => official,
      });

      const mockSetHeaders = vi.fn();
      const response = await GET({
        params: { id: "123" },
        setHeaders: mockSetHeaders,
      } as any);

      const svgText = await response.text();
      expect(svgText).toContain("<svg");
      expect(svgText.length).toBeGreaterThan(100);
    }
  });
});
