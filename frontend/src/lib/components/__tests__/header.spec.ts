import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/svelte";
import Header from "../Header.svelte";

// Mock $app/stores for Nav component
vi.mock("$app/stores", () => ({
  page: {
    subscribe: vi.fn((callback) => {
      callback({ url: { pathname: "/" } });
      return () => {};
    }),
  },
}));

// Mock $app/navigation
vi.mock("$app/navigation", () => ({
  afterNavigate: vi.fn((callback) => {
    callback();
  }),
  goto: vi.fn(),
}));

describe("Header", () => {
  it("renders without errors", () => {
    const { container } = render(Header);
    expect(container.querySelector("header")).toBeInTheDocument();
  });

  it("includes the Nav component", () => {
    const { container } = render(Header);
    // Nav component renders nav element
    expect(container.querySelector("nav")).toBeInTheDocument();
  });

  it("has proper semantic HTML structure", () => {
    const { container } = render(Header);
    const header = container.querySelector("header");
    expect(header).toBeInTheDocument();
  });

  it("renders navigation links from Nav component", () => {
    const { container } = render(Header);
    const links = container.querySelectorAll("a");
    expect(links.length).toBeGreaterThan(0);
  });
});
