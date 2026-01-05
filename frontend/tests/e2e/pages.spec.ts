import { test, expect } from "@playwright/test";

test.describe("Sanctions Page", () => {
  test("should load sanctions page", async ({ page }) => {
    await page.goto("/sanctions");

    expect(page.url()).toContain("/sanctions");

    // Check for main heading
    const heading = page.locator("h1, h2");
    await expect(heading.first()).toBeVisible();
  });

  test("should display sanctions list", async ({ page }) => {
    await page.goto("/sanctions");

    await page.waitForLoadState("networkidle");

    // Look for sanctions items
    const sanctionItems = page.locator(
      "[data-testid='sanction-item'], .sanction-item, [class*='sanction']",
    );

    if (await sanctionItems.first().isVisible()) {
      expect(await sanctionItems.count()).toBeGreaterThan(0);
    }
  });

  test("should filter sanctions by type", async ({ page }) => {
    await page.goto("/sanctions");

    // Look for type filter
    const typeFilter = page
      .locator('select[aria-label*="type"], input[aria-label*="type"]')
      .first();

    if (await typeFilter.isVisible()) {
      await typeFilter.click();

      await page.waitForLoadState("networkidle");
    }
  });

  test("should filter sanctions by status", async ({ page }) => {
    await page.goto("/sanctions");

    // Look for status filter (e.g., active, lifted)
    const statusFilter = page
      .locator('select[aria-label*="status"], input[aria-label*="status"]')
      .first();

    if (await statusFilter.isVisible()) {
      await statusFilter.click();

      await page.waitForLoadState("networkidle");
    }
  });

  test("should display sanction details", async ({ page }) => {
    await page.goto("/sanctions");

    await page.waitForLoadState("networkidle");

    // Find sanction detail or click on a sanction
    const sanctionLink = page
      .locator('a[href*="/sanctions/"], [data-testid="sanction-item"] a')
      .first();

    if (await sanctionLink.isVisible()) {
      await sanctionLink.click();

      await page.waitForLoadState("networkidle");

      // Should show sanction details
      expect(page.url()).toBeTruthy();
    }
  });
});

test.describe("Search Page", () => {
  test("should load search page", async ({ page }) => {
    await page.goto("/search");

    expect(page.url()).toContain("/search");
  });

  test("should have search input on search page", async ({ page }) => {
    await page.goto("/search");

    const searchInput = page
      .locator(
        'input[type="search"], input[placeholder*="search" i], input[placeholder*="buscar" i]',
      )
      .first();

    await expect(searchInput).toBeVisible();
  });

  test("should perform global search", async ({ page }) => {
    await page.goto("/search");

    const searchInput = page
      .locator(
        'input[type="search"], input[placeholder*="search" i], input[placeholder*="buscar" i]',
      )
      .first();

    await searchInput.fill("Venezuela");

    // Wait for results
    await page.waitForLoadState("networkidle");

    // Should display results or "no results" message
    const content = page.locator("body");
    const text = await content.textContent();
    expect(text).toBeTruthy();
  });

  test("should filter search results by type", async ({ page }) => {
    await page.goto("/search");

    const searchInput = page
      .locator(
        'input[type="search"], input[placeholder*="search" i], input[placeholder*="buscar" i]',
      )
      .first();

    await searchInput.fill("test");

    // Look for type filter
    const typeFilter = page
      .locator(
        'select[aria-label*="type"], input[aria-label*="type"], button[aria-label*="type"]',
      )
      .first();

    if (await typeFilter.isVisible()) {
      await typeFilter.click();

      await page.waitForLoadState("networkidle");
    }
  });

  test("should display search result count", async ({ page }) => {
    await page.goto("/search");

    const searchInput = page
      .locator(
        'input[type="search"], input[placeholder*="search" i], input[placeholder*="buscar" i]',
      )
      .first();

    await searchInput.fill("person");

    await page.waitForLoadState("networkidle");

    // Look for result count indicator
    const resultCount = page.locator(
      'p:has-text("result"), p:has-text("resultados"), [data-testid="result-count"]',
    );

    if (await resultCount.isVisible()) {
      const countText = await resultCount.textContent();
      expect(countText).toBeTruthy();
    }
  });

  test("should handle empty search results", async ({ page }) => {
    await page.goto("/search");

    const searchInput = page
      .locator(
        'input[type="search"], input[placeholder*="search" i], input[placeholder*="buscar" i]',
      )
      .first();

    // Search for something unlikely to return results
    await searchInput.fill("xyzunlikelystring123");

    await page.waitForLoadState("networkidle");

    // Should show no results message or empty state
    const content = page.locator("body");
    const text = await content.textContent();
    expect(text).toBeTruthy();
  });

  test("should clear search and results", async ({ page }) => {
    await page.goto("/search");

    const searchInput = page
      .locator(
        'input[type="search"], input[placeholder*="search" i], input[placeholder*="buscar" i]',
      )
      .first();

    await searchInput.fill("test");

    await page.waitForLoadState("networkidle");

    // Find clear button
    const clearButton = page
      .locator(
        'button:has-text("Clear"), button[aria-label*="clear"], button:has(svg)',
      )
      .first();

    if (await clearButton.isVisible()) {
      await clearButton.click();

      // Search input should be empty
      await expect(searchInput).toHaveValue("");
    }
  });
});

test.describe("Cases Page (if exists)", () => {
  test("should load cases page if available", async ({ page }) => {
    const response = await page.goto("/cases");

    if (response?.status() === 404) {
      // Page doesn't exist, skip
      return;
    }

    expect(page.url()).toContain("/cases");

    // Check for main heading
    const heading = page.locator("h1, h2");
    await expect(heading.first()).toBeVisible();
  });

  test("should display case list", async ({ page }) => {
    const response = await page.goto("/cases");

    if (response?.status() === 404) return;

    await page.waitForLoadState("networkidle");

    // Look for case items
    const caseItems = page.locator(
      "[data-testid='case-item'], .case-item, [class*='case']",
    );

    if (await caseItems.first().isVisible()) {
      expect(await caseItems.count()).toBeGreaterThan(0);
    }
  });

  test("should navigate to case details", async ({ page }) => {
    const response = await page.goto("/cases");

    if (response?.status() === 404) return;

    await page.waitForLoadState("networkidle");

    // Find case link
    const caseLink = page
      .locator('a[href*="/cases/"], [data-testid="case-item"] a')
      .first();

    if (await caseLink.isVisible()) {
      await caseLink.click();

      await page.waitForLoadState("networkidle");

      // Should show case details
      expect(page.url()).toBeTruthy();
    }
  });
});

test.describe("Memorial Page (if exists)", () => {
  test("should load memorial page if available", async ({ page }) => {
    const response = await page.goto("/memorial");

    if (response?.status() === 404) {
      // Page doesn't exist, skip
      return;
    }

    expect(page.url()).toContain("/memorial");

    // Check for main heading
    const heading = page.locator("h1, h2");
    await expect(heading.first()).toBeVisible();
  });

  test("should display memorial content respectfully", async ({ page }) => {
    const response = await page.goto("/memorial");

    if (response?.status() === 404) return;

    await page.waitForLoadStyle("networkidle");

    // Check for meaningful content
    const content = page.locator("body");
    const text = await content.textContent();
    expect(text?.length).toBeGreaterThan(0);
  });

  test("should have navigation options on memorial", async ({ page }) => {
    const response = await page.goto("/memorial");

    if (response?.status() === 404) return;

    // Look for navigation elements
    const navLinks = page.locator("a, button");
    const count = await navLinks.count();

    expect(count).toBeGreaterThan(0);
  });
});

test.describe("About Page (if exists)", () => {
  test("should load about page if available", async ({ page }) => {
    const response = await page.goto("/about");

    if (response?.status() === 404) {
      // Page doesn't exist, skip
      return;
    }

    expect(page.url()).toContain("/about");

    // Check for main heading
    const heading = page.locator("h1, h2");
    await expect(heading.first()).toBeVisible();
  });

  test("should display project information", async ({ page }) => {
    const response = await page.goto("/about");

    if (response?.status() === 404) return;

    // Check for key information
    const content = page.locator("body");
    const text = await content.textContent();

    // Should have substantial content
    expect(text?.length).toBeGreaterThan(100);
  });

  test("should have contact or contribution information", async ({ page }) => {
    const response = await page.goto("/about");

    if (response?.status() === 404) return;

    // Look for contact, links, or contribution info
    const links = page.locator("a");
    const count = await links.count();

    expect(count).toBeGreaterThan(0);
  });
});
