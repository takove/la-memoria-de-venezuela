import "@testing-library/jest-dom";
import { vi } from "vitest";

// Mock $env/static/public
vi.mock("$env/static/public", () => ({
  PUBLIC_API_URL: "http://localhost:3000/api/v1",
}));

// Mock $env/dynamic/public
vi.mock("$env/dynamic/public", () => ({
  env: {},
}));

// Mock $app/navigation
vi.mock("$app/navigation", () => ({
  goto: vi.fn(),
  invalidate: vi.fn(),
  invalidateAll: vi.fn(),
  preloadData: vi.fn(),
  preloadCode: vi.fn(),
  beforeNavigate: vi.fn(),
  afterNavigate: vi.fn(),
}));

// Mock $app/stores
vi.mock("$app/stores", () => ({
  page: {
    subscribe: vi.fn(),
  },
  navigating: {
    subscribe: vi.fn(),
  },
  updated: {
    subscribe: vi.fn(),
  },
}));
