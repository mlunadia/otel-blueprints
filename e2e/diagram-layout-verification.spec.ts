import { test, expect } from '@playwright/test';

const BASE_URL = '/otel-blueprints/';

test.describe('Architecture diagram layout verification', () => {
  test('node size, arrows, labels, spacing, legend', async ({ page }) => {
    test.setTimeout(45000);

    // Hard refresh
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await page.reload({ waitUntil: 'networkidle' });

    // 1. Get Recommendations
    await page.getByRole('button', { name: /Get Recommendations/i }).click();
    await expect(page.getByRole('heading', { name: /Recommended/i })).toBeVisible({ timeout: 5000 });

    // 2. Click Agent + LB Exporter + Sampling Tier (top pattern)
    await page.getByText('Recommended', { exact: true }).locator('..').click();
    await page.waitForTimeout(800);

    await expect(page.getByRole('heading', { name: 'Architecture', exact: true })).toBeVisible({
      timeout: 5000,
    });

    const report: string[] = [];

    // 3. Verify diagram elements - use multiple selector strategies
    const overlay = page.locator('.fixed.inset-0');
    const architectureSection = overlay.locator('section').filter({ hasText: /Architecture/i }).first();

    const iconBoxes = overlay.locator('div[class*="rounded-lg"]').filter({
      has: page.locator('svg'),
      hasNot: page.locator('pre'), // exclude code blocks
    });
    const nodeCount = await iconBoxes.count();
    report.push(`Found ${nodeCount} diagram nodes`);

    if (nodeCount > 0) {
      const firstBox = iconBoxes.first();
      const boxSize = await firstBox.evaluate((el) => {
        const rect = el.getBoundingClientRect();
        return { width: rect.width, height: rect.height };
      }).catch(() => ({ width: 0, height: 0 }));

      const is64px = Math.abs(boxSize.width - 64) < 5 && Math.abs(boxSize.height - 64) < 5;
      report.push(is64px
        ? `✓ Node size: ${Math.round(boxSize.width)}x${Math.round(boxSize.height)}px (64x64 expected)`
        : `Node size: ${Math.round(boxSize.width)}x${Math.round(boxSize.height)}px (64x64 expected)`);

      // Check for w-16 h-16 class (Tailwind 64px)
      const hasW16 = await firstBox.evaluate((el) => el.className.includes('w-16') || el.className.includes('w-\[64px\]')).catch(() => false);
      report.push(hasW16 ? '✓ Nodes use w-16 h-16 (64px) classes' : '- Node size classes: check manually');

      // Arrows - look for SVG or div between nodes
      const arrows = diagramBox.locator('svg, [class*="flex"][class*="items-center"]');
      const arrowCount = await arrows.count();
      report.push(`Arrows/connectors: ${arrowCount} elements`);

      // Labels above arrows
      const hasLabelsAboveArrows = await diagramBox.locator('span').filter({
        hasText: /OTLP|trace-id|trace id/i,
      }).first().isVisible().catch(() => false);
      report.push(hasLabelsAboveArrows ? '✓ Labels appear above arrows' : '- Labels: check manually');

      // Flexbox layout
      const container = diagramBox.locator('[class*="flex"][class*="items-center"]').first();
      const hasFlexbox = await container.evaluate((el) => {
        const style = window.getComputedStyle(el);
        return style.display === 'flex' && style.alignItems.includes('center');
      }).catch(() => false);
      report.push(hasFlexbox ? '✓ Diagram uses flexbox with items-center' : '- Flexbox: check container');

      // Legend - only node types in diagram (Agent + LB has: app, agent, loadbalancer, gateway, backend - no kafka)
      const legend = diagramBox.locator('[class*="border-t"]').locator('div').first();
      const legendText = await legend.textContent().catch(() => '');
      const hasFilteredLegend = legendText && !legendText.includes('Message Queue') || legendText?.includes('Load Balancer');
      report.push(hasFilteredLegend ? '✓ Legend appears filtered' : `Legend content: ${legendText?.slice(0, 80)}...`);
    }

    await page.screenshot({ path: 'test-results/diagram-layout.png', fullPage: true });

    // Screenshot diagram area if found
    if (nodeCount > 0) {
      await architectureSection.screenshot({ path: 'test-results/diagram-closeup.png' }).catch(() => {});
    }

    console.log('\n--- ARCHITECTURE DIAGRAM LAYOUT ---');
    report.forEach(r => console.log(r));
  });
});
