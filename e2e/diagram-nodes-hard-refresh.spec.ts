import { test, expect } from '@playwright/test';

const BASE_URL = '/otel-blueprints/';

test.describe('Diagram node interaction after hard refresh', () => {
  test('hover and click diagram nodes including icon box', async ({ page }) => {
    test.setTimeout(60000);

    // Hard refresh: navigate with cache bypass
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await page.reload({ waitUntil: 'networkidle' });

    // Step 1: Get Recommendations
    await page.getByRole('button', { name: /Get Recommendations/i }).click();
    await expect(page.getByRole('heading', { name: /Recommended/i })).toBeVisible({ timeout: 5000 });

    // Step 2: Click pattern card to open detail panel
    await page.getByText('Recommended', { exact: true }).locator('..').click();
    await page.waitForTimeout(800);

    await expect(page.getByRole('heading', { name: 'Architecture', exact: true })).toBeVisible({
      timeout: 5000,
    });

    // Step 3 & 4: Target the diagram - Architecture heading is followed by the diagram
    const architectureHeading = page.locator('h3:has-text("Architecture")');
    const diagramSection = architectureHeading.locator('..');
    // Diagram has p-6, rounded-xl, and contains the flow - the icon boxes are inside
    const diagramBox = diagramSection.locator('> div').first();

    // Icon boxes: w-12 h-12 or w-10 h-10, rounded-lg, border-2 (diagram nodes)
    const iconBoxes = diagramBox.locator('div[class*="rounded-lg"][class*="border-2"]').filter({
      has: page.locator('svg'),
    });
    const nodeCount = await iconBoxes.count();

    const report: string[] = [];
    report.push(`Found ${nodeCount} diagram node icon boxes`);

    if (nodeCount > 0) {
      const firstIconBox = iconBoxes.first();
      const secondIconBox = iconBoxes.nth(1);

      // Hover over first node (Application)
      await firstIconBox.scrollIntoViewIfNeeded();
      await firstIconBox.hover({ force: true });
      await page.waitForTimeout(400);

      report.push('Hovered over first node (Application/App)');

      // Check cursor - inspect element's computed style
      const cursorStyle = await firstIconBox.evaluate((el) => window.getComputedStyle(el).cursor).catch(() => 'unknown');
      report.push(cursorStyle === 'pointer' ? 'Cursor: pointer ✓' : `Cursor: ${cursorStyle} (expected: pointer)`);

      // Check for "Click for details" text
      const hasClickForDetails = await page.getByText(/Click for details/i).isVisible().catch(() => false);
      report.push(hasClickForDetails ? '"Click for details" visible ✓' : '"Click for details" NOT visible');

      // Check if element has hover-related classes (scale, border change)
      const boxClasses = await firstIconBox.getAttribute('class').catch(() => '');
      const hasHoverClasses = /hover|scale|ring/.test(boxClasses || '');
      report.push(hasHoverClasses ? `Hover classes: ${boxClasses}` : 'No obvious hover classes on icon box');

      // Step 4: Click the icon box
      await firstIconBox.click({ force: true });
      await page.waitForTimeout(600);

      let componentPanelOpened = await page.getByText(/What It Does|When to Use/i).isVisible().catch(() => false);
      report.push(componentPanelOpened ? 'Click on icon box: Component panel OPENED ✓' : 'Click on icon box: Component panel did NOT open');

      // If first click didn't work, try clicking the full node container (including label)
      if (!componentPanelOpened && nodeCount > 1) {
        const nodeWrapper = firstIconBox.locator('..');
        await nodeWrapper.click({ force: true });
        await page.waitForTimeout(500);
        componentPanelOpened = await page.getByText(/What It Does|When to Use/i).isVisible().catch(() => false);
        report.push(componentPanelOpened ? 'Click on node wrapper: Component panel OPENED ✓' : 'Click on node wrapper: No effect');
      }

      // Try clicking Agent node (usually 2nd) - might be more likely to have component mapping
      if (!componentPanelOpened && nodeCount >= 2) {
        await secondIconBox.scrollIntoViewIfNeeded();
        await secondIconBox.click({ force: true });
        await page.waitForTimeout(600);
        componentPanelOpened = await page.getByText(/What It Does|When to Use/i).isVisible().catch(() => false);
        report.push(componentPanelOpened ? 'Click on Agent icon: Component panel OPENED ✓' : 'Click on Agent icon: No effect');
      }

      if (componentPanelOpened) {
        const headerText = await page.locator('h2').first().textContent().catch(() => '');
        report.push(`Component panel header: ${headerText.trim()}`);
      }
    } else {
      report.push('ERROR: No diagram icon boxes found - selector may need adjustment');
    }

    await page.screenshot({ path: 'test-results/diagram-hard-refresh.png', fullPage: true });

    console.log('\n--- DIAGRAM NODE TEST (HARD REFRESH) ---');
    report.forEach(r => console.log(r));
  });
});
