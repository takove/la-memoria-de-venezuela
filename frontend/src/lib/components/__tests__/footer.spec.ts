import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/svelte";
import Footer from "../Footer.svelte";

// Mock $app/stores
vi.mock("$app/stores", () => ({
  page: {
    subscribe: vi.fn((callback) => {
      callback({ url: { pathname: "/" } });
      return () => {};
    }),
  },
}));

describe("Footer", () => {
  it("renders the platform title in footer", () => {
    const { container } = render(Footer);
    const footer = container.querySelector("footer");
    expect(footer?.textContent).toMatch(/La Memoria de Venezuela/i);
  });

  it("renders all navigation links", () => {
    render(Footer);

    const funcionariosLink = screen.getByRole("link", {
      name: /^funcionarios$/i,
    });
    const sancionesLink = screen.getByRole("link", { name: /^sanciones$/i });
    const casosLink = screen.getByRole("link", { name: /^casos legales$/i });
    const acercaLink = screen.getByRole("link", { name: /^acerca de$/i });

    expect(funcionariosLink).toHaveAttribute("href", "/officials");
    expect(sancionesLink).toHaveAttribute("href", "/sanctions");
    expect(casosLink).toHaveAttribute("href", "/cases");
    expect(acercaLink).toHaveAttribute("href", "/about");
  });

  it("renders source links (OFAC, DOJ, IACHR)", () => {
    render(Footer);

    // Check for specific source links
    const ofacLink = screen.getByRole("link", { name: /^ofac treasury$/i });
    const dojLink = screen.getByRole("link", { name: /^doj$/i });
    const iachrLink = screen.getByRole("link", { name: /^iachr$/i });

    expect(ofacLink).toHaveAttribute("href", "https://ofac.treasury.gov");
    expect(dojLink).toHaveAttribute("href", "https://www.justice.gov");
    expect(iachrLink).toHaveAttribute("href", "https://www.oas.org/en/iachr/");
  });

  it("displays platform description", () => {
    render(Footer);
    expect(
      screen.getByText(/plataforma de transparencia/i),
    ).toBeInTheDocument();
  });

  it("includes copyright notice", () => {
    render(Footer);
    const currentYear = new Date().getFullYear();
    expect(
      screen.getByText(new RegExp(String(currentYear))),
    ).toBeInTheDocument();
  });

  it("has proper semantic HTML structure", () => {
    const { container } = render(Footer);
    const footer = container.querySelector("footer");
    expect(footer).toBeInTheDocument();
  });

  it("applies proper styling classes", () => {
    const { container } = render(Footer);
    const footer = container.querySelector("footer");
    expect(footer).toHaveClass("bg-gray-900");
    expect(footer).toHaveClass("text-gray-400");
  });

  it("renders responsive grid layout", () => {
    const { container } = render(Footer);
    const grid = container.querySelector(".grid");
    expect(grid).toBeInTheDocument();
    expect(grid).toHaveClass("md:grid-cols-4");
  });

  it("all links have hover states for accessibility", () => {
    const { container } = render(Footer);
    const links = container.querySelectorAll("a");

    links.forEach((link) => {
      const classes = link.className;
      // Links should have transition or hover classes
      expect(classes).toMatch(/hover:|transition/);
    });
  });
});
