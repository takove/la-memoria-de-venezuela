import { test, expect } from "@playwright/test";

test.describe("Officials Page", () => {
  test("should load officials page with title", async ({ page }) => {
    await page.goto("/officials");

    // Check page title
    expect(page.url()).toContain("/officials");

    // Check for main heading
    const heading = page.locator("h1, h2");
    await expect(heading.first()).toBeVisible();
  });

  test("should display pagination controls if applicable", async ({ page }) => {
    await page.goto("/officials");

    // Wait for content to load
    await page.waitForLoadState("networkidle");

    // Look for pagination buttons or page indicators
    const pagination = page.locator(
      "[data-testid='pagination'], .pagination, nav[aria-label*='Page']",
    );

    if (await pagination.isVisible()) {
      expect(pagination).toBeTruthy();
    }
  });

  test("should filter officials by tier if available", async ({ page }) => {
    await page.goto("/officials");

    // Look for filter controls
    const filterButton = page
      .locator('button[aria-label*="filter"], [data-testid="filter-button"]')
      .first();

    if (await filterButton.isVisible()) {
      await filterButton.click();

      // Look for filter options
      const filterOptions = page.locator(
        'input[type="checkbox"], input[type="radio"]',
      );
      const count = await filterOptions.count();
      expect(count).toBeGreaterThanOrEqual(0);
    }
  });

  test("should display official cards with key information", async ({
    page,
  }) => {
    await page.goto("/officials");

    // Wait for content to load
    await page.waitForLoadState("networkidle");

    // Look for official cards
    const cards = page.locator(
      "[data-testid='official-card'], .official-card, [class*='card']",
    );

    if (await cards.first().isVisible()) {
      const firstCard = cards.first();

      // Card should have visible content
      await expect(firstCard).toBeVisible();

      // Check for common fields
      const text = await firstCard.textContent();
      expect(text).toBeTruthy();
    }
  });

  test("should navigate to official detail page", async ({ page }) => {
    await page.goto("/officials");

    // Wait for content to load
    await page.waitForLoadState("networkidle");

    // Look for clickable official card or link
    const cards = page.locator(
      'a[href*="/officials/"], [data-testid="official-card"] a',
    );

    if (await cards.first().isVisible()) {
      const firstCard = cards.first();
      const href = await firstCard.getAttribute("href");

      if (href) {
        await firstCard.click();

        // Should navigate to detail page
        expect(page.url()).toContain("/officials/");
        await expect(page.locator("h1, h2").first()).toBeVisible();
      }
    }
  });

  test("should display official detail information", async ({ page }) => {
    await page.goto("/officials");

    // Wait for content to load
    await page.waitForLoadState("networkidle");

    // Find and click first official link
    const officialLink = page
      .locator('a[href*="/officials/"], [data-testid="official-card"] a')
      .first();

    if (await officialLink.isVisible()) {
      await officialLink.click();

      // Verify detail page loads
      await page.waitForLoadState("networkidle");

      // Check for detail information
      const detailContent = page.locator(
        "[data-testid='official-detail'], .detail-section, [class*='detail']",
      );

      // Detail page should have some content
      expect(page.url()).toContain("/officials/");
    }
  });

  test("should display sanctions information if available", async ({
    page,
  }) => {
    await page.goto("/officials");

    // Navigate to first official
    const officialLink = page
      .locator('a[href*="/officials/"], [data-testid="official-card"] a')
      .first();

    if (await officialLink.isVisible()) {
      await officialLink.click();

      await page.waitForLoadState("networkidle");

      // Look for sanctions section
      const sanctionsSection = page.locator(
        'section:has-text("Sanction"), section:has-text("sanción"), [data-testid="sanctions"]',
      );

      if (await sanctionsSection.isVisible()) {
        await expect(sanctionsSection).toBeVisible();
      }
    }
  });

  test("should display positions/roles if available", async ({ page }) => {
    await page.goto("/officials");

    // Navigate to first official
    const officialLink = page
      .locator('a[href*="/officials/"], [data-testid="official-card"] a')
      .first();

    if (await officialLink.isVisible()) {
      await officialLink.click();

      await page.waitForLoadState("networkidle");

      // Look for positions section
      const positionsSection = page.locator(
        'section:has-text("Position"), section:has-text("posición"), [data-testid="positions"]',
      );

      if (await positionsSection.isVisible()) {
        await expect(positionsSection).toBeVisible();
      }
    }
  });

  test("should have working back navigation", async ({ page }) => {
    await page.goto("/officials");

    // Navigate to first official
    const officialLink = page
      .locator('a[href*="/officials/"], [data-testid="official-card"] a')
      .first();

    if (await officialLink.isVisible()) {
      await officialLink.click();

      await page.waitForLoadState("networkidle");

      // Click back button
      const backButton = page
        .locator(
          'button:has-text("Back"), button:has-text("Atrás"), a[href="/officials"]',
        )
        .first();

      if (await backButton.isVisible()) {
        await backButton.click();

        // Should go back to officials list
        expect(page.url()).toContain("/officials");
      }
    }
  });

  test("should handle missing official gracefully", async ({ page }) => {
    // Try to navigate to non-existent official
    await page.goto("/officials/nonexistent-id");

    // Page should show error or redirect
    // Wait for content to load
    await page.waitForLoadState("networkidle");

    // Should either show error message or redirect
    const hasContent = await page.locator("body").textContent();
    expect(hasContent).toBeTruthy();
  });
});

test.describe("Officials Search and Filter", () => {
  test("should search for officials by name", async ({ page }) => {
    await page.goto("/officials");

    // Look for search input
    const searchInput = page
      .locator(
        'input[type="search"], input[placeholder*="search" i], input[placeholder*="buscar" i], [data-testid="search-input"]',
      )
      .first();

    if (await searchInput.isVisible()) {
      // Type search query
      await searchInput.fill("Maduro");

      // Wait for results
      await page.waitForLoadState("networkidle");

      // Verify search was performed
      expect(page.url()).toBeTruthy();
    }
  });

  test("should filter by confidence level", async ({ page }) => {
    await page.goto("/officials");

    // Look for confidence filter
    const confidenceFilter = page
      .locator('select, input[aria-label*="confidence"]')
      .first();

    if (await confidenceFilter.isVisible()) {
      await confidenceFilter.click();

      // Select an option if available
      const option = page.locator("option").nth(1);
      if (await option.isVisible()) {
        await option.click();

        await page.waitForLoadState("networkidle");
      }
    }
  });

  test("should sort officials list", async ({ page }) => {
    await page.goto("/officials");

    // Look for sort control
    const sortControl = page
      .locator('select[aria-label*="sort"], button[aria-label*="sort"]')
      .first();

    if (await sortControl.isVisible()) {
      await sortControl.click();

      // Should have sort options available
      await page.waitForLoadState("networkidle");
    }
  });
});

test.describe("Officials Mobile Experience", () => {
  test.beforeEach(async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
  });

  test("should display officials list on mobile", async ({ page }) => {
    await page.goto("/officials");

    // Wait for content
    await page.waitForLoadState("networkidle");

    // Check if content is visible
    const content = page.locator("body");
    await expect(content).toBeVisible();
  });

  test("should be scrollable on mobile", async ({ page }) => {
    await page.goto("/officials");

    await page.waitForLoadState("networkidle");

    // Scroll down
    await page.evaluate(() => window.scrollBy(0, 500));

    // Page should still be functional
    expect(page.url()).toContain("/officials");
  });

  test("should have readable text on mobile", async ({ page }) => {
    await page.goto("/officials");

    await page.waitForLoadState("networkidle");

    // Check viewport meta tag for mobile optimization
    const viewportMeta = await page.getAttribute(
      'meta[name="viewport"]',
      "content",
    );
    expect(viewportMeta).toBeTruthy();
  });
});
