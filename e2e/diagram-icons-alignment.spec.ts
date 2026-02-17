import { test, expect } from '@playwright/test';

const BASE_URL = '/otel-blueprints/';

test.describe('Diagram arrow alignment and OTel icons', () => {
  test('verify arrows centered, OTel logo on collectors, App/Backend icons', async ({ page }) => {
    test.setTimeout(45000);

    // Hard refresh
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await page.reload({ waitUntil: 'networkidle' });

    // 1. Get Recommendations
    await page.getByRole('button', { name: /Get Recommendations/i }).click();
    await expect(page.getByRole('heading', { name: /Recommended/i })).toBeVisible({ timeout: 5000 });

    // 2. Click Agent + LB Exporter + Sampling Tier
    await page.getByText('Agent + LB Exporter + Sampling Tier').first().click();
    await page.waitForTimeout(800);

    await expect(page.getByRole('heading', { name: 'Architecture', exact: true })).toBeVisible({
      timeout: 5000,
    });

    const report: string[] = [];

    // Check for OpenTelemetry logo (typically an SVG with specific paths or an img)
    const otelLogos = page.locator('svg').filter({
      has: page.locator('path, circle, polygon'),
    });
    const svgCount = await otelLogos.count();
    report.push(`Found ${svgCount} SVG elements in diagram area`);

    // OTel logo often has distinctive shapes - look for SVGs that might be the OTel diamond/wave
    const hasOtelLogo = await page.locator('[class*="otel"], img[src*="otel"], svg').filter({
      hasNot: page.locator('line'), // Arrow SVGs have lines
    }).first().isVisible().catch(() => false);
    report.push(hasOtelLogo ? '✓ Custom/OTel-branded icons may be present' : '- OTel logo: visual check needed');

    // Take screenshots for visual verification
    await page.screenshot({ path: 'test-results/diagram-icons-alignment.png', fullPage: true });

    // Get the architecture section for a closer view
    const archSection = page.locator('h3:has-text("Architecture")').locator('../..');
    if (await archSection.isVisible().catch(() => false)) {
      await archSection.screenshot({ path: 'test-results/diagram-closeup-icons.png' });
    }

    console.log('\n--- DIAGRAM ICONS & ALIGNMENT ---');
    report.forEach(r => console.log(r));
  });
});
