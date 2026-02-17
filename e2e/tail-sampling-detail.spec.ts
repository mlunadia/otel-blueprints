import { test, expect } from '@playwright/test';

const BASE_URL = '/otel-blueprints/';

test.describe('Tail Sampling Processor detail panel', () => {
  test('verify description and configuration content', async ({ page }) => {
    test.setTimeout(45000);

    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    // 1. Click Explore components
    await page.getByRole('button', { name: /Explore components/i }).click();
    await page.waitForTimeout(500);

    // 2. Click Tail Sampling Processor card (in Advanced Processing)
    await page.waitForTimeout(300);
    const tailSamplingText = page.getByText('Tail Sampling Processor');
    await tailSamplingText.first().click();
    await page.waitForTimeout(600);

    // Verify we're in the Tail Sampling detail panel
    await expect(page.getByRole('heading', { name: /Tail Sampling Processor/i }).first()).toBeVisible({
      timeout: 5000,
    });

    const report: string[] = [];

    // Scroll and check content
    const panel = page.locator('.fixed.inset-0, [class*="overflow-y-auto"]').first();

    // Check description for two-step pipeline requirement
    const hasTwoStepPipeline = await page.getByText(/two-step pipeline|two step pipeline/i).isVisible().catch(() => false);
    report.push(hasTwoStepPipeline ? '✓ Description mentions two-step pipeline requirement' : '✗ Two-step pipeline not found in description');

    // Check for Forward connector mention
    const hasForwardConnector = await page.getByText(/Forward connector|forward connector/i).isVisible().catch(() => false);
    report.push(hasForwardConnector ? '✓ Description mentions Forward connector' : '✗ Forward connector not found');

    // Scroll to Configuration section
    await panel.evaluate((el) => el.scrollTo(0, 1500));
    await page.waitForTimeout(400);

    // Check for YAML with two-step pipeline, elasticapm, forward
    const hasElasticapm = await page.locator('pre, code').filter({
      hasText: /elasticapm|elasticapm:/i,
    }).first().isVisible().catch(() => false);
    report.push(hasElasticapm ? '✓ Configuration includes elasticapm connector' : '✗ elasticapm not found in config');

    const hasForwardConnectorYaml = await page.locator('pre, code').filter({
      hasText: /forward:|forward \{\}|forwardconnector/i,
    }).first().isVisible().catch(() => false);
    report.push(hasForwardConnectorYaml ? '✓ Configuration includes forward connector' : '✗ forward connector not found in config');

    const hasTwoStepPipelineYaml = await page.locator('pre, code').filter({
      hasText: /traces\/1|traces\/2|traces_1|traces_2|Step 1|Step 2/i,
    }).first().isVisible().catch(() => false);
    report.push(hasTwoStepPipelineYaml ? '✓ Configuration shows two-step pipeline structure' : '✗ Two-step pipeline structure not found in YAML');

    // Scroll to Learn More section
    await panel.evaluate((el) => el.scrollTo(0, el.scrollHeight));
    await page.waitForTimeout(400);

    const hasElasticGuide = await page.getByText(/Elastic Tail Sampling Guide/i).isVisible().catch(() => false);
    report.push(hasElasticGuide ? '✓ Learn More: Elastic Tail Sampling Guide link present' : '✗ Elastic Tail Sampling Guide link not found');

    await page.screenshot({ path: 'test-results/tail-sampling-detail.png', fullPage: true });

    console.log('\n--- TAIL SAMPLING PROCESSOR DETAIL PANEL ---');
    report.forEach(r => console.log(r));
  });
});
