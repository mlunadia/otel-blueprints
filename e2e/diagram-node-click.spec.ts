import { test, expect } from '@playwright/test';

const BASE_URL = '/otel-blueprints/';

test.describe('Diagram node click functionality', () => {
  test('hover and click on diagram nodes', async ({ page }) => {
    test.setTimeout(60000);

    // Step 1: Get to results page
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    await page.getByRole('button', { name: /Get Recommendations/i }).click();
    await expect(page.getByRole('heading', { name: /Recommended/i })).toBeVisible({ timeout: 5000 });

    // Step 2: Click pattern card to open sidebar
    const patternCard = page.getByText('Recommended', { exact: true }).locator('..')
      .or(page.locator('[class*="cursor-pointer"]').first());
    await patternCard.click();
    await page.waitForTimeout(800);

    // Wait for sidebar with architecture diagram
    const architectureHeading = page.getByRole('heading', { name: 'Architecture', exact: true });
    await expect(architectureHeading).toBeVisible({ timeout: 5000 });

    // Step 3 & 4: Find diagram nodes - look for nodes in the Architecture section
    // The diagram has nodes with type labels: Agent, Backend, Application, etc.
    const diagramSection = page.locator('text=Architecture').locator('../..');
    const nodeContainer = diagramSection.locator('[class*="flex flex-col items-center"]').first();

    // Check if nodes exist and get count
    const nodeCount = await nodeContainer.count();
    const observations: string[] = [];

    if (nodeCount > 0) {
      // Hover over first node (e.g., Application or Agent)
      const firstNode = nodeContainer.first();
      await firstNode.scrollIntoViewIfNeeded();

      // Check cursor before hover - inspect computed style would need evaluate
      observations.push(`Found ${nodeCount} node containers in diagram`);

      // Hover and check for "Click for details"
      await firstNode.hover({ force: true });
      await page.waitForTimeout(500);

      const hasClickForDetails = await page.getByText(/Click for details/i).isVisible().catch(() => false);
      observations.push(hasClickForDetails ? 'Hover: "Click for details" text APPEARS ✓' : 'Hover: "Click for details" text NOT visible');

      // Check cursor - node might have cursor-pointer class on hover
      const nodeClasses = await firstNode.getAttribute('class').catch(() => '');
      const hasPointerCursor = nodeClasses?.includes('cursor-pointer') ?? false;
      observations.push(hasPointerCursor ? 'Node has cursor-pointer class ✓' : 'Node cursor class: ' + (nodeClasses || 'none'));

      // Step 4: Click the node
      await firstNode.click({ force: true });
      await page.waitForTimeout(800);

      // Step 5: Verify component detail panel opened
      const componentPanelOpen = await page.getByText(/What It Does|When to Use/i).isVisible().catch(() => false);
      const hasComponentName = await page.getByRole('heading', { level: 2 }).filter({ hasText: /Agent|Gateway|Backend|Application|Collector/i }).isVisible().catch(() => false);

      observations.push(componentPanelOpen ? 'Click: Component detail panel OPENED ✓' : 'Click: Component detail panel did NOT open');
      if (componentPanelOpen) {
        observations.push(hasComponentName ? 'Correct component name in panel header ✓' : 'Component name in header: check manually');
      }
    } else {
      observations.push('No diagram nodes found with selector');
    }

    await page.screenshot({ path: 'test-results/diagram-node-test.png', fullPage: true });

    console.log('\n--- DIAGRAM NODE TEST RESULTS ---');
    observations.forEach(o => console.log(o));
  });
});
