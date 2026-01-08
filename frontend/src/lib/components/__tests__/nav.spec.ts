import { fireEvent, render, screen } from "@testing-library/svelte";
import { describe, expect, it, vi, beforeEach } from "vitest";
import Nav from "../Nav.svelte";

// Mock $app/stores
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
    // Call the callback immediately for testing
    callback();
  }),
  goto: vi.fn(),
}));

describe("Nav", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders logo and navigation links", () => {
    render(Nav);

    expect(
      screen.getByLabelText("La Memoria de Venezuela - Inicio"),
    ).toBeInTheDocument();
    expect(screen.getByText("🇻🇪")).toBeInTheDocument();
  });

  it("shows desktop navigation on larger screens", () => {
    render(Nav);

    // Desktop nav should have hidden md:flex class
    const desktopNav = screen.getByText("Funcionarios").closest("div");
    expect(desktopNav).toHaveClass("hidden");
    expect(desktopNav).toHaveClass("md:flex");
  });

  it("toggles mobile drawer on hamburger click", async () => {
    render(Nav);

    const hamburgerButton = screen.getByLabelText("Abrir menú");
    expect(hamburgerButton).toBeInTheDocument();

    // Click to open drawer
    await fireEvent.click(hamburgerButton);

    // Check if close button is visible - use getAllByLabelText since there are two elements
    const closeElements = screen.getAllByLabelText("Cerrar menú");
    const closeButton = closeElements.find((el) => el.tagName === "BUTTON");
    expect(closeButton).toBeInTheDocument();
    expect(closeButton).toHaveAttribute("aria-expanded", "true");
  });

  it("has touch-friendly targets (min 44x44px)", () => {
    render(Nav);

    const logo = screen.getByLabelText("La Memoria de Venezuela - Inicio");
    expect(logo).toHaveClass("min-h-[44px]");
    expect(logo).toHaveClass("min-w-[44px]");

    const hamburgerButton = screen.getByLabelText("Abrir menú");
    expect(hamburgerButton).toHaveClass("min-h-[44px]");
    expect(hamburgerButton).toHaveClass("min-w-[44px]");
  });

  it("applies active state to current route", () => {
    render(Nav);

    // The mock sets pathname to '/', so Inicio should be active
    const inicioLinks = screen.getAllByText("Inicio");
    // Desktop link should have active classes
    const desktopLink = inicioLinks.find((el) =>
      el.classList.contains("text-primary-600"),
    );
    expect(desktopLink).toBeInTheDocument();
  });

  it("includes search link in mobile drawer", async () => {
    render(Nav);

    const hamburgerButton = screen.getByLabelText("Abrir menú");
    await fireEvent.click(hamburgerButton);

    // Search should be in the drawer
    const searchLink = screen.getByText("Buscar");
    expect(searchLink).toBeInTheDocument();
  });
});
