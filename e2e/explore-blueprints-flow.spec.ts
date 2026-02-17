import { test, expect } from '@playwright/test';

const BASE_URL = '/otel-blueprints/';

test.describe('Explore blueprints and results flow', () => {
  test('verify two links, blueprints page, requirements summary, pattern overlay', async ({
    page,
  }) => {
    test.setTimeout(60000);

    // Hard refresh
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await page.reload({ waitUntil: 'networkidle' });

    const report: string[] = [];

    // 1. Verify TWO links below Get Recommendations
    const getRecsBtn = page.getByRole('button', { name: /Get Recommendations/i });
    await expect(getRecsBtn).toBeVisible();

    const exploreComponents = page.getByRole('button', { name: /Explore components/i });
    const exploreBlueprints = page.getByRole('button', { name: /Explore blueprints/i });

    const hasExploreComponents = await exploreComponents.isVisible().catch(() => false);
    const hasExploreBlueprints = await exploreBlueprints.isVisible().catch(() => false);

    report.push(hasExploreComponents ? '✓ "Explore components" link (Box icon) - visible' : '✗ "Explore components" not found');
    report.push(hasExploreBlueprints ? '✓ "Explore blueprints" link (Layers icon) - visible' : '✗ "Explore blueprints" not found');
    report.push(hasExploreComponents && hasExploreBlueprints ? '✓ Both links present below Get Recommendations' : '✗ Missing one or both links');

    await page.screenshot({ path: 'test-results/step1-home-links.png', fullPage: true });

    // 2. Click Explore blueprints
    if (hasExploreBlueprints) {
      await exploreBlueprints.click();
      await page.waitForTimeout(600);

      const hasBlueprintsTitle = await page
        .getByRole('heading', { name: /OpenTelemetry Architecture Blueprints/i })
        .isVisible()
        .catch(() => false);
      report.push(hasBlueprintsTitle ? '✓ "OpenTelemetry Architecture Blueprints" title - visible' : '✗ Blueprints title not found');

      const hasPatternCards = await page.locator('[class*="rounded"]').filter({ hasText: /View full details/i }).first().isVisible().catch(() => false);
      report.push(hasPatternCards ? '✓ Pattern cards with "View full details" - visible' : '✗ Pattern cards not found');

      const hasDiagrams = await page.locator('[class*="flex flex-col items-center"]').first().isVisible().catch(() => false);
      report.push(hasDiagrams ? '✓ Diagram elements visible' : '- Diagrams: check manually');

      await page.screenshot({ path: 'test-results/step2-blueprints-page.png', fullPage: true });
    }

    // 3. Go back to home, Get Recommendations
    const backBtn = page.getByRole('button', { name: /Back to home|Back to Advisor/i });
    if (await backBtn.isVisible().catch(() => false)) {
      await backBtn.click();
      await page.waitForTimeout(400);
    }
    if (!(await getRecsBtn.isVisible().catch(() => false))) {
      await page.goto(BASE_URL);
      await page.waitForLoadState('networkidle');
    }
    await getRecsBtn.click();
    await expect(page.getByRole('heading', { name: /Recommended/i })).toBeVisible({ timeout: 5000 });

    // 4. Your Requirements Summary section
    const requirementsSummary = page.getByText(/Your Requirements Summary/i);
    await requirementsSummary.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);

    const hasScaleSection = await page.getByText(/Scale Requirements/i).isVisible().catch(() => false);
    report.push(hasScaleSection ? '✓ "Scale Requirements" section - visible' : '✗ Scale Requirements not found');

    const hasDataVolume = await page.getByText(/Data Volume/i).isVisible().catch(() => false);
    const hasDataLoss = await page.getByText(/Data Loss Tolerance/i).isVisible().catch(() => false);
    const hasLatency = await page.getByText(/Latency Tolerance/i).isVisible().catch(() => false);
    const hasComplexity = await page.getByText(/Complexity Tolerance/i).isVisible().catch(() => false);
    report.push(hasDataVolume && hasDataLoss && hasLatency && hasComplexity
      ? '✓ All 4 scale sliders (Data Volume, Data Loss, Latency, Complexity) - visible'
      : `Scale sliders: DataVolume=${hasDataVolume} DataLoss=${hasDataLoss} Latency=${hasLatency} Complexity=${hasComplexity}`);

    const hasProgressBars = await page.locator('[role="progressbar"], [class*="progress"], [class*="bg-"].rounded').filter({
      hasNot: page.locator('svg'),
    }).first().isVisible().catch(() => false);
    report.push(hasProgressBars ? '✓ Progress bar elements visible' : '- Progress bars: check manually');

    const hasFeatureSection = await page.getByText(/Feature Requirements/i).isVisible().catch(() => false);
    report.push(hasFeatureSection ? '✓ "Feature Requirements" section - visible' : '✗ Feature Requirements not found');

    await page.screenshot({ path: 'test-results/step3-requirements-summary.png', fullPage: true });

    // 5. Click pattern card - verify full-screen overlay
    const patternCard = page.getByText('Recommended', { exact: true }).locator('..').or(
      page.locator('[class*="cursor-pointer"]').first()
    );
    await patternCard.click();
    await page.waitForTimeout(800);

    const overlay = page.locator('.fixed.inset-0');
    const hasFullScreenOverlay = await overlay.first().isVisible().catch(() => false);
    report.push(hasFullScreenOverlay ? '✓ Full-screen overlay (fixed inset-0) - visible' : '✗ Full-screen overlay not found');

    const hasBackToResults = await page.getByRole('button', { name: /Back to results/i }).isVisible().catch(() => false);
    report.push(hasBackToResults ? '✓ "Back to results" button on left - visible' : '✗ Back to results not found');

    const hasCenteredName = await page.locator('h2').filter({ hasText: /Agent|Gateway|Direct|Kafka|Sampling/i }).first().isVisible().catch(() => false);
    report.push(hasCenteredName ? '✓ Pattern name in header - visible' : '- Pattern name: check manually');

    const hasXClose = await overlay.locator('button').filter({ has: page.locator('svg') }).last().isVisible().catch(() => false);
    report.push(hasXClose ? '✓ X close button on right - visible' : '- X button: check manually');

    await page.screenshot({ path: 'test-results/step4-pattern-overlay.png', fullPage: true });

    console.log('\n--- EXPLORE BLUEPRINTS FLOW REPORT ---');
    report.forEach(r => console.log(r));
  });
});
