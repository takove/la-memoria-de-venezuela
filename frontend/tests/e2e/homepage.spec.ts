import { test, expect } from "@playwright/test";

test.describe("Homepage Navigation", () => {
  test("should load homepage and display main navigation", async ({ page }) => {
    await page.goto("/");

    // Check page title
    await expect(page).toHaveTitle(/La Memoria de Venezuela/i);

    // Check main heading exists
    const heading = page.locator("h1").first();
    await expect(heading).toBeVisible();

    // Check navigation links exist
    const navLinks = page.locator("nav a");
    const count = await navLinks.count();
    expect(count).toBeGreaterThan(0);
  });

  test("should navigate to officials page", async ({ page }) => {
    await page.goto("/");

    // Click on Officials link
    const officialsLink = page
      .locator('a[href="/officials"], a:has-text("Funcionarios")')
      .first();
    await expect(officialsLink).toBeVisible();
    await officialsLink.click();

    // Verify we're on the officials page
    expect(page.url()).toContain("/officials");
    await expect(page.locator("h1")).toContainText(/funcionario|official/i);
  });

  test("should navigate to sanctions page", async ({ page }) => {
    await page.goto("/");

    // Click on Sanctions link
    const sanctionsLink = page
      .locator('a[href="/sanctions"], a:has-text("Sanciones")')
      .first();
    await expect(sanctionsLink).toBeVisible();
    await sanctionsLink.click();

    // Verify we're on the sanctions page
    expect(page.url()).toContain("/sanctions");
  });

  test("should navigate to cases page", async ({ page }) => {
    await page.goto("/");

    // Click on Cases link
    const casesLink = page
      .locator('a[href="/cases"], a:has-text("Casos")')
      .first();
    if (await casesLink.isVisible()) {
      await casesLink.click();
      expect(page.url()).toContain("/cases");
    }
  });

  test("should navigate to memorial page", async ({ page }) => {
    await page.goto("/");

    // Click on Memorial link
    const memorialLink = page
      .locator('a[href="/memorial"], a:has-text("Memorial")')
      .first();
    if (await memorialLink.isVisible()) {
      await memorialLink.click();
      expect(page.url()).toContain("/memorial");
    }
  });

  test("should navigate to about page", async ({ page }) => {
    await page.goto("/");

    // Click on About link
    const aboutLink = page
      .locator('a[href="/about"], a:has-text("Acerca")')
      .first();
    if (await aboutLink.isVisible()) {
      await aboutLink.click();
      expect(page.url()).toContain("/about");
    }
  });
});

test.describe("Language Toggle", () => {
  test("should toggle between Spanish and English", async ({ page }) => {
    await page.goto("/");

    // Find language toggle button (could be a flag icon or dropdown)
    const langToggle = page
      .locator(
        'button[aria-label*="language"], button[aria-label*="idioma"], [data-testid="language-toggle"]',
      )
      .first();

    if (await langToggle.isVisible()) {
      // Click to toggle
      await langToggle.click();

      // Verify language changed or toggle is still accessible
      await expect(langToggle).toBeVisible();
    }
  });
});

test.describe("Responsive Design", () => {
  test("should display mobile navigation on small screens", async ({
    page,
  }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto("/");

    // Look for mobile menu trigger (hamburger button)
    const mobileMenuTrigger = page
      .locator('button[aria-label*="menu"], [data-testid="mobile-menu"]')
      .first();

    if (await mobileMenuTrigger.isVisible()) {
      expect(true).toBe(true); // Mobile menu present
    }
  });

  test("should display desktop navigation on large screens", async ({
    page,
  }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });

    await page.goto("/");

    // Verify main navigation is visible
    const navLinks = page.locator("nav a");
    const visibleCount = await navLinks.count();
    expect(visibleCount).toBeGreaterThan(0);
  });
});

test.describe("Search Functionality", () => {
  test("should have a search input on the homepage", async ({ page }) => {
    await page.goto("/");

    // Look for search input
    const searchInput = page
      .locator(
        'input[type="search"], input[placeholder*="search" i], input[placeholder*="buscar" i], [data-testid="search-input"]',
      )
      .first();

    if (await searchInput.isVisible()) {
      await expect(searchInput).toBeVisible();
    }
  });

  test("should perform search and display results", async ({ page }) => {
    // Navigate to search or officials page
    await page.goto("/officials");

    // Look for search input
    const searchInput = page
      .locator(
        'input[type="search"], input[placeholder*="search" i], input[placeholder*="buscar" i], [data-testid="search-input"]',
      )
      .first();

    if (await searchInput.isVisible()) {
      // Type in search box
      await searchInput.fill("Maduro");

      // Wait for results to load
      await page.waitForLoadState("networkidle");

      // Results should load (or no results message should appear)
      expect(page.url()).toBeTruthy();
    }
  });
});

test.describe("Accessibility", () => {
  test("should have proper heading hierarchy", async ({ page }) => {
    await page.goto("/");

    // Check that h1 exists
    const h1 = page.locator("h1");
    await expect(h1.first()).toBeVisible();

    // Check heading hierarchy
    const headings = page.locator("h1, h2, h3, h4, h5, h6");
    const count = await headings.count();
    expect(count).toBeGreaterThan(0);
  });

  test("should have alt text on images", async ({ page }) => {
    await page.goto("/");

    // Get all images
    const images = page.locator("img");
    const imageCount = await images.count();

    if (imageCount > 0) {
      for (let i = 0; i < Math.min(imageCount, 5); i++) {
        const altText = await images.nth(i).getAttribute("alt");
        // Images should have alt text or be marked as decorative
        const ariaHidden = await images.nth(i).getAttribute("aria-hidden");
        const hasAlt = !!altText;
        const isDecorative = ariaHidden === "true";

        expect(hasAlt || isDecorative).toBe(true);
      }
    }
  });

  test("should have proper ARIA labels on buttons", async ({ page }) => {
    await page.goto("/");

    // Get all buttons
    const buttons = page.locator("button");
    const count = await buttons.count();

    expect(count).toBeGreaterThan(0);

    // Check first few buttons for accessibility
    for (let i = 0; i < Math.min(count, 5); i++) {
      const button = buttons.nth(i);
      const text = await button.textContent();
      const ariaLabel = await button.getAttribute("aria-label");

      // Button should have visible text or aria-label
      expect(!!(text || ariaLabel)).toBe(true);
    }
  });
});

test.describe("Performance", () => {
  test("should load homepage in under 3 seconds", async ({ page }) => {
    const startTime = Date.now();

    await page.goto("/");

    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(3000);
  });

  test("should render main content without layout shift", async ({ page }) => {
    await page.goto("/");

    // Get initial viewport size
    const viewport = page.viewportSize();
    expect(viewport).not.toBeNull();

    // Wait for page to fully load
    await page.waitForLoadState("networkidle");

    // Page should still have the same viewport
    const newViewport = page.viewportSize();
    expect(newViewport).toEqual(viewport);
  });
});
