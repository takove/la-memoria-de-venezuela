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

    const hamburgerButton = screen.getByLabelText("Abrir menú de navegación");
    expect(hamburgerButton).toBeInTheDocument();

    // Click to open drawer
    await fireEvent.click(hamburgerButton);

    // Check if close button is visible - use getAllByLabelText since there are two elements
    const closeElements = screen.getAllByLabelText("Cerrar menú de navegación");
    const closeButton = closeElements.find((el) => el.tagName === "BUTTON");
    expect(closeButton).toBeInTheDocument();
    expect(closeButton).toHaveAttribute("aria-expanded", "true");
  });

  it("has touch-friendly targets (min 44x44px)", () => {
    render(Nav);

    const logo = screen.getByLabelText("La Memoria de Venezuela - Inicio");
    expect(logo).toHaveClass("min-h-[44px]");
    expect(logo).toHaveClass("min-w-[44px]");

    const hamburgerButton = screen.getByLabelText("Abrir menú de navegación");
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

    const hamburgerButton = screen.getByLabelText("Abrir menú de navegación");
    await fireEvent.click(hamburgerButton);

    // Search should be in the drawer
    const searchLink = screen.getByText("Buscar");
    expect(searchLink).toBeInTheDocument();
  });

  // Accessibility tests
  it("has proper ARIA labels on navigation elements", () => {
    render(Nav);

    const nav = screen.getByRole("navigation", {
      name: "Navegación principal",
    });
    expect(nav).toBeInTheDocument();

    const menuButton = screen.getByLabelText("Abrir menú de navegación");
    expect(menuButton).toHaveAttribute("aria-expanded", "false");
    expect(menuButton).toHaveAttribute("aria-controls", "mobile-menu");
    expect(menuButton).toHaveAttribute("aria-haspopup", "true");
    expect(menuButton).toHaveAttribute("type", "button");
  });

  it("updates ARIA attributes when drawer is opened", async () => {
    render(Nav);

    const menuButton = screen.getByLabelText("Abrir menú de navegación");
    await fireEvent.click(menuButton);

    const closeButton = screen.getAllByLabelText(
      "Cerrar menú de navegación",
    )[0];
    expect(closeButton).toHaveAttribute("aria-expanded", "true");

    const drawer = screen.getByRole("dialog", {
      name: "Menú de navegación móvil",
    });
    expect(drawer).toBeInTheDocument();
    expect(drawer).toHaveAttribute("aria-modal", "true");
    expect(drawer).toHaveAttribute("id", "mobile-menu");
  });

  it("has aria-current on active page links", () => {
    render(Nav);

    // Desktop nav
    const desktopLinks = screen.getAllByText("Inicio");
    const activeDesktopLink = desktopLinks.find(
      (el) => el.getAttribute("aria-current") === "page",
    );
    expect(activeDesktopLink).toBeInTheDocument();
  });

  it("has aria-hidden on decorative icons", () => {
    render(Nav);

    const flagEmoji = screen.getByText("🇻🇪");
    expect(flagEmoji).toHaveAttribute("aria-hidden", "true");
  });

  it("closes drawer on Escape key", async () => {
    render(Nav);

    const menuButton = screen.getByLabelText("Abrir menú de navegación");
    await fireEvent.click(menuButton);

    // Drawer should be open
    expect(menuButton).toHaveAttribute("aria-expanded", "true");

    // Press Escape on the drawer
    const drawer = screen.getByRole("dialog");
    await fireEvent.keyDown(drawer, { key: "Escape" });

    // Drawer should be closed
    expect(menuButton).toHaveAttribute("aria-expanded", "false");
  });

  it("opens drawer on Enter key on menu button", async () => {
    render(Nav);

    const menuButton = screen.getByLabelText("Abrir menú de navegación");

    // Press Enter
    await fireEvent.keyDown(menuButton, { key: "Enter" });

    // Drawer should be open
    expect(menuButton).toHaveAttribute("aria-expanded", "true");
  });

  it("opens drawer on Space key on menu button", async () => {
    render(Nav);

    const menuButton = screen.getByLabelText("Abrir menú de navegación");

    // Press Space
    await fireEvent.keyDown(menuButton, { key: " " });

    // Drawer should be open
    expect(menuButton).toHaveAttribute("aria-expanded", "true");
  });
});
