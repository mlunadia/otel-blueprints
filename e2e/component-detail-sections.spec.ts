import { test, expect } from '@playwright/test';

const BASE_URL = '/otel-blueprints/';

test.describe('Component detail panel sections', () => {
  test('Agent Collector detail panel - verify all sections', async ({ page }) => {
    test.setTimeout(45000);

    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    // 1. Click Explore components
    await page.getByRole('button', { name: /Explore components/i }).click();
    await page.waitForTimeout(500);

    // 2. Click Agent Collector card - "Learn more" on 2nd card (Core: SDK, Agent, Gateway)
    await page.waitForTimeout(500);
    const learnMoreLinks = page.getByText(/Learn more/i);
    const count = await learnMoreLinks.count();
    if (count >= 2) {
      await learnMoreLinks.nth(1).click(); // 2nd = Agent Collector
    } else {
      await page.getByText('Agent Collector').first().click();
    }
    await page.waitForTimeout(600);

    // Verify we're in the component detail panel
    await expect(page.getByRole('heading', { name: /Agent Collector/i }).first()).toBeVisible({
      timeout: 5000,
    });

    const report: string[] = [];

    // Check each section
    const hasDescription = await page.getByText(/The Agent Collector runs on the same host/i).first().isVisible().catch(() => false)
      || await page.locator('p').filter({ hasText: /Agent Collector|DaemonSet|sidecar/ }).first().isVisible().catch(() => false);
    report.push(hasDescription ? '✓ Description - visible' : '✗ Description - not found');

    const hasWhatItDoes = await page.getByText(/What It Does/i).isVisible().catch(() => false);
    report.push(hasWhatItDoes ? '✓ What It Does section - visible' : '✗ What It Does - not found');

    const hasWhenToUse = await page.getByText(/When to Use/i).isVisible().catch(() => false);
    report.push(hasWhenToUse ? '✓ When to Use section - visible' : '✗ When to Use - not found');

    const hasWhenNotToUse = await page.getByText(/When Not to Use|When not to use/i).isVisible().catch(() => false);
    report.push(hasWhenNotToUse ? '✓ When Not to Use section - visible' : '✗ When Not to Use - not found');

    // Scroll down to find Configuration Examples
    const panel = page.locator('.fixed.inset-0, [class*="overflow-y-auto"]').first();
    await panel.evaluate((el) => el.scrollTo(0, 1000));
    await page.waitForTimeout(400);

    const hasConfigSection = await page.getByText(/Configuration Examples|Example Configuration|Configuration/i).isVisible().catch(() => false);
    report.push(hasConfigSection ? '✓ Configuration section heading - visible' : '✗ Configuration section - not found');

    const hasYamlBlock = await page.locator('pre, code, [class*="CodeBlock"]').filter({
      hasText: /receivers:|otlp:|processors:|exporters:|service:|pipelines/i,
    }).first().isVisible().catch(() => false);
    report.push(hasYamlBlock ? '✓ YAML code block - visible' : '✗ YAML code block - not found');

    // Scroll more for Related Patterns
    await panel.evaluate((el) => el.scrollTo(0, 2000));
    await page.waitForTimeout(400);

    const hasRelatedPatterns = await page.getByText(/Related Architecture Patterns|Related Patterns/i).isVisible().catch(() => false);
    report.push(hasRelatedPatterns ? '✓ Related Architecture Patterns - visible' : '✗ Related Patterns - not found');

    const hasLearnMore = await page.getByText(/Learn More|External|Documentation/i).isVisible().catch(() => false);
    report.push(hasLearnMore ? '✓ Learn More / external links - visible' : '✗ Learn More section - not found');

    // Scroll to bottom to ensure we've seen everything
    await panel.evaluate((el) => el.scrollTo(0, el.scrollHeight));
    await page.waitForTimeout(400);

    // Final full-page screenshot
    await page.screenshot({ path: 'test-results/component-detail-sections.png', fullPage: true });

    // Also take screenshot of scrolled position showing Config/Related/Learn More
    await panel.evaluate((el) => el.scrollTo(0, 1500));
    await page.waitForTimeout(300);
    await page.screenshot({ path: 'test-results/component-detail-mid.png', fullPage: true });

    console.log('\n--- AGENT COLLECTOR DETAIL PANEL SECTIONS ---');
    report.forEach(r => console.log(r));
  });
});
