import { test, expect } from "@playwright/test";

const viewports = [
  { name: "mobile-320", width: 320, height: 568 },
  { name: "mobile-375", width: 375, height: 667 },
  { name: "mobile-414", width: 414, height: 896 },
  { name: "tablet-640", width: 640, height: 1024 },
  { name: "tablet-768", width: 768, height: 1024 },
  { name: "desktop-1024", width: 1024, height: 768 },
  { name: "desktop-1440", width: 1440, height: 900 },
];

test.describe("Mobile-First Responsive Design", () => {
  for (const viewport of viewports) {
    test(`${viewport.name} - Homepage`, async ({ page }) => {
      await page.setViewportSize({
        width: viewport.width,
        height: viewport.height,
      });

      await page.goto("http://localhost:5173/");
      await page.waitForLoadState("networkidle");

      // Check for horizontal scroll
      const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
      const viewportWidth = viewport.width;
      expect(bodyWidth).toBeLessThanOrEqual(viewportWidth);

      // Take screenshot
      await page.screenshot({
        path: `test-results/screenshots/${viewport.name}-homepage.png`,
        fullPage: true,
      });
    });

    test(`${viewport.name} - Navigation`, async ({ page }) => {
      await page.setViewportSize({
        width: viewport.width,
        height: viewport.height,
      });

      await page.goto("http://localhost:5173/");
      await page.waitForLoadState("networkidle");

      // Check if hamburger menu appears on mobile
      if (viewport.width < 768) {
        const hamburger = page.getByLabel("Abrir menú");
        await expect(hamburger).toBeVisible();

        // Click to open drawer
        await hamburger.click();
        await page.waitForTimeout(300); // Wait for animation

        // Take screenshot with drawer open
        await page.screenshot({
          path: `test-results/screenshots/${viewport.name}-nav-open.png`,
          fullPage: false,
        });

        // Check drawer is visible
        const closeButton = page.getByLabel("Cerrar menú").first();
        await expect(closeButton).toBeVisible();
      } else {
        // Desktop nav should be visible
        const desktopNav = page.getByText("Funcionarios").first();
        await expect(desktopNav).toBeVisible();
      }
    });

    test(`${viewport.name} - Touch targets`, async ({ page }) => {
      await page.setViewportSize({
        width: viewport.width,
        height: viewport.height,
      });

      await page.goto("http://localhost:5173/");
      await page.waitForLoadState("networkidle");

      // Check touch target sizes
      const logo = page.getByLabel("La Memoria de Venezuela - Inicio");
      const logoBox = await logo.boundingBox();
      if (logoBox) {
        expect(logoBox.height).toBeGreaterThanOrEqual(44);
        expect(logoBox.width).toBeGreaterThanOrEqual(44);
      }

      // Check search bar input height
      const searchInput = page.getByPlaceholder(
        "Buscar funcionarios, sanciones, casos...",
      );
      const inputBox = await searchInput.boundingBox();
      if (inputBox) {
        expect(inputBox.height).toBeGreaterThanOrEqual(48);
      }

      // Check search button
      const searchButton = page.getByLabel("Buscar").last();
      const buttonBox = await searchButton.boundingBox();
      if (buttonBox) {
        expect(buttonBox.height).toBeGreaterThanOrEqual(44);
        expect(buttonBox.width).toBeGreaterThanOrEqual(44);
      }
    });
  }
});
