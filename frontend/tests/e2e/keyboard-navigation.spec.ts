import { test, expect } from "@playwright/test";

test.describe("Keyboard Navigation - Accessibility", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
  });

  test("desktop navigation is keyboard accessible", async ({ page }) => {
    // Set to desktop viewport
    await page.setViewportSize({ width: 1024, height: 768 });

    // Tab to logo
    await page.keyboard.press("Tab");
    let focused = await page.evaluate(() =>
      document.activeElement?.getAttribute("aria-label"),
    );
    expect(focused).toBe("La Memoria de Venezuela - Inicio");

    // Tab through navigation links
    await page.keyboard.press("Tab");
    focused = await page.evaluate(() =>
      document.activeElement?.textContent?.trim(),
    );
    expect(focused).toBe("Inicio");

    // Continue tabbing through nav items
    await page.keyboard.press("Tab");
    focused = await page.evaluate(() =>
      document.activeElement?.textContent?.trim(),
    );
    expect(focused).toBe("🕯️ Memorial");

    // Verify focus visible styles are present
    const navLink = page.getByRole("menuitem", { name: "Funcionarios" });
    await navLink.focus();
    const focusVisible = await navLink.evaluate((el) => {
      const styles = window.getComputedStyle(el);
      return styles.outline !== "none" || styles.boxShadow.includes("rgb");
    });
    expect(focusVisible).toBe(true);
  });

  test("mobile menu opens with Enter key", async ({ page }) => {
    // Set to mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Find the hamburger button
    const menuButton = page.getByLabel("Abrir menú de navegación");
    await expect(menuButton).toBeVisible();

    // Focus the menu button
    await menuButton.focus();

    // Verify it's focused
    const isFocused = await menuButton.evaluate(
      (el) => el === document.activeElement,
    );
    expect(isFocused).toBe(true);

    // Press Enter to open menu
    await page.keyboard.press("Enter");

    // Wait a bit for the drawer to open
    await page.waitForTimeout(200);

    // Check the drawer is open
    const drawer = page.getByRole("dialog", {
      name: "Menú de navegación móvil",
    });
    await expect(drawer).toBeVisible();

    // Verify aria-expanded is true
    await expect(menuButton).toHaveAttribute("aria-expanded", "true");
  });

  test("mobile menu opens with Space key", async ({ page }) => {
    // Set to mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    const menuButton = page.getByLabel("Abrir menú de navegación");
    await menuButton.focus();

    // Press Space to open menu
    await page.keyboard.press("Space");
    await page.waitForTimeout(200);

    // Check the drawer is open
    const drawer = page.getByRole("dialog");
    await expect(drawer).toBeVisible();
  });

  test("mobile menu closes with Escape key", async ({ page }) => {
    // Set to mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    const menuButton = page.getByLabel("Abrir menú de navegación");

    // Open menu
    await menuButton.click();
    await page.waitForTimeout(200);

    const drawer = page.getByRole("dialog");
    await expect(drawer).toBeVisible();

    // Press Escape to close
    await page.keyboard.press("Escape");
    await page.waitForTimeout(200);

    // Drawer should be closed
    await expect(drawer).not.toBeVisible();

    // Focus should return to menu button
    const isFocused = await menuButton.evaluate(
      (el) => el === document.activeElement,
    );
    expect(isFocused).toBe(true);
  });

  test("focus is trapped in mobile menu", async ({ page }) => {
    // Set to mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    const menuButton = page.getByLabel("Abrir menú de navegación");
    await menuButton.click();
    await page.waitForTimeout(200);

    // Get all focusable elements in drawer
    const drawer = page.getByRole("dialog");
    await expect(drawer).toBeVisible();

    // First link should be focused after opening
    const firstLink = drawer.getByRole("menuitem").first();
    const firstIsFocused = await firstLink.evaluate(
      (el) => el === document.activeElement,
    );
    expect(firstIsFocused).toBe(true);

    // Tab through all items to get to the last one
    const menuItems = await drawer.getByRole("menuitem").count();

    // Tab to last item
    for (let i = 1; i < menuItems; i++) {
      await page.keyboard.press("Tab");
    }

    // Get the current focused element
    const lastItemText = await page.evaluate(() =>
      document.activeElement?.textContent?.trim(),
    );
    expect(lastItemText).toBe("Buscar");

    // Tab once more - should wrap to first item (focus trap)
    await page.keyboard.press("Tab");
    await page.waitForTimeout(100);

    const wrappedText = await page.evaluate(() =>
      document.activeElement?.textContent?.trim(),
    );
    expect(wrappedText).toBe("Inicio");
  });

  test("shift+tab works in focus trap", async ({ page }) => {
    // Set to mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    const menuButton = page.getByLabel("Abrir menú de navegación");
    await menuButton.click();
    await page.waitForTimeout(200);

    // First link should be focused
    const drawer = page.getByRole("dialog");
    const firstLink = drawer.getByRole("menuitem").first();
    const firstIsFocused = await firstLink.evaluate(
      (el) => el === document.activeElement,
    );
    expect(firstIsFocused).toBe(true);

    // Shift+Tab should wrap to last item
    await page.keyboard.press("Shift+Tab");
    await page.waitForTimeout(100);

    const lastItemText = await page.evaluate(() =>
      document.activeElement?.textContent?.trim(),
    );
    expect(lastItemText).toBe("Buscar");
  });

  test("menu button has proper ARIA attributes", async ({ page }) => {
    // Set to mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    const menuButton = page.getByLabel("Abrir menú de navegación");

    // Check initial ARIA attributes
    await expect(menuButton).toHaveAttribute("aria-expanded", "false");
    await expect(menuButton).toHaveAttribute("aria-controls", "mobile-menu");
    await expect(menuButton).toHaveAttribute("aria-haspopup", "true");
    await expect(menuButton).toHaveAttribute("type", "button");

    // Open menu
    await menuButton.click();
    await page.waitForTimeout(200);

    // Check updated ARIA attributes
    await expect(menuButton).toHaveAttribute("aria-expanded", "true");
  });

  test("navigation links have aria-current on active page", async ({
    page,
  }) => {
    // Desktop view
    await page.setViewportSize({ width: 1024, height: 768 });

    // On homepage, "Inicio" should have aria-current="page"
    const inicioLink = page.getByRole("menuitem", { name: "Inicio" });
    await expect(inicioLink).toHaveAttribute("aria-current", "page");

    // Other links should not have aria-current
    const funcionariosLink = page.getByRole("menuitem", {
      name: "Funcionarios",
    });
    const ariaCurrent = await funcionariosLink.getAttribute("aria-current");
    expect(ariaCurrent).toBeNull();
  });

  test("all interactive elements have visible focus indicators", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1024, height: 768 });

    // Test logo focus
    const logo = page.getByLabel("La Memoria de Venezuela - Inicio");
    await logo.focus();

    // Check for focus ring
    const logoHasFocusRing = await logo.evaluate((el) => {
      const styles = window.getComputedStyle(el);
      return styles.boxShadow.includes("rgb") || styles.outline !== "none";
    });
    expect(logoHasFocusRing).toBe(true);

    // Test nav link focus
    const navLink = page.getByRole("menuitem", { name: "Sanciones" });
    await navLink.focus();

    const linkHasFocusRing = await navLink.evaluate((el) => {
      const styles = window.getComputedStyle(el);
      return styles.boxShadow.includes("rgb") || styles.outline !== "none";
    });
    expect(linkHasFocusRing).toBe(true);

    // Test search button focus
    const searchButton = page.getByLabel("Buscar");
    await searchButton.focus();

    const searchHasFocusRing = await searchButton.evaluate((el) => {
      const styles = window.getComputedStyle(el);
      return styles.boxShadow.includes("rgb") || styles.outline !== "none";
    });
    expect(searchHasFocusRing).toBe(true);
  });

  test("mobile menu has correct dialog semantics", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    const menuButton = page.getByLabel("Abrir menú de navegación");
    await menuButton.click();
    await page.waitForTimeout(200);

    const drawer = page.getByRole("dialog", {
      name: "Menú de navegación móvil",
    });
    await expect(drawer).toBeVisible();
    await expect(drawer).toHaveAttribute("aria-modal", "true");
    await expect(drawer).toHaveAttribute("id", "mobile-menu");
  });
});
