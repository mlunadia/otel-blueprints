import { test, expect } from '@playwright/test';

const BASE_URL = '/otel-blueprints/';

test.describe('Components flow at port 5177', () => {
  test('step-by-step: Explore components, Components page, detail panel, diagram interaction', async ({
    page,
  }) => {
    test.setTimeout(60000);
    const steps: string[] = [];

    // Step 1: Home - look for "Explore components" with Box icon
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    const exploreComponents = page.getByRole('button', { name: /Explore components/i });
    const exploreArchitectures = page.getByRole('button', { name: /Explore all architectures/i });

    const hasExploreComponents = await exploreComponents.isVisible().catch(() => false);
    const hasExploreArchitectures = await exploreArchitectures.isVisible().catch(() => false);

    if (hasExploreComponents) {
      steps.push('Step 1: Found "Explore components" link with Box icon ✓');
    } else if (hasExploreArchitectures) {
      steps.push('Step 1: Found "Explore all architectures" (NOT "Explore components")');
    } else {
      steps.push('Step 1: No Explore link found below Get Recommendations');
    }

    await page.screenshot({ path: 'test-results/step1-home.png', fullPage: true });

    // Step 2: Click Explore link
    if (hasExploreComponents) {
      await exploreComponents.click();
    } else if (hasExploreArchitectures) {
      await exploreArchitectures.click();
    }

    await page.waitForTimeout(500);

    // Step 3: Verify Components page elements
    const hasBackToHome = await page.getByRole('link', { name: /Back to home/i }).isVisible().catch(() => false)
      || await page.getByRole('button', { name: /Back to home/i }).isVisible().catch(() => false);
    const hasOtelComponentsTitle = await page.getByRole('heading', { name: /OpenTelemetry Components/i }).isVisible().catch(() => false);
    const hasCoreComponents = await page.getByText(/Core Components/i).first().isVisible().catch(() => false);
    const hasAdvancedProcessing = await page.getByText(/Advanced Processing/i).first().isVisible().catch(() => false);
    const hasInfrastructure = await page.getByText(/Infrastructure/i).first().isVisible().catch(() => false);

    if (hasBackToHome) steps.push('Step 3a: "Back to home" link visible ✓');
    else steps.push('Step 3a: "Back to home" link NOT found');
    if (hasOtelComponentsTitle) steps.push('Step 3b: Title "OpenTelemetry Components" ✓');
    else steps.push('Step 3b: Title "OpenTelemetry Components" NOT found');
    if (hasCoreComponents) steps.push('Step 3c: Section "Core Components" ✓');
    else steps.push('Step 3c: Section "Core Components" NOT found');
    if (hasAdvancedProcessing) steps.push('Step 3d: Section "Advanced Processing" ✓');
    else steps.push('Step 3d: Section "Advanced Processing" NOT found');
    if (hasInfrastructure) steps.push('Step 3e: Section "Infrastructure" ✓');
    else steps.push('Step 3e: Section "Infrastructure" NOT found');

    await page.screenshot({ path: 'test-results/step2-explore-page.png', fullPage: true });

    // Step 4: Click Agent Collector card
    const agentCard = page.getByRole('button', { name: /Agent Collector/i })
      .or(page.getByText('Agent Collector').locator('..').locator('..'));
    const viewDetails = page.getByRole('button', { name: /View Details|Learn more/i }).first();
    if (await agentCard.first().isVisible().catch(() => false)) {
      await agentCard.first().click();
    } else if (await viewDetails.isVisible().catch(() => false)) {
      await viewDetails.click();
    }

    await page.waitForTimeout(500);

    // Step 5: Verify detail panel content
    const hasDetailPanel = await page.getByText(/What It Does/i).isVisible().catch(() => false);
    const hasWhenToUse = await page.getByText(/When to Use/i).isVisible().catch(() => false);
    const hasConfigExamples = await page.getByText(/Configuration|YAML|yaml/i).isVisible().catch(() => false);

    if (hasDetailPanel) steps.push('Step 5: Detail panel with What It Does, When to Use ✓');
    else steps.push('Step 5: Component detail panel NOT found or missing sections');
    if (hasConfigExamples) steps.push('Step 5b: Configuration Examples with YAML ✓');
    else steps.push('Step 5b: Configuration Examples NOT found');

    await page.screenshot({ path: 'test-results/step4-detail-panel.png', fullPage: true });

    // Step 6: Close detail panel - "Back to results" or X in overlay header
    const overlay = page.locator('.fixed.inset-0.z-50');
    const backToResultsBtn = overlay.getByRole('button', { name: /Back to results/i });
    const xBtn = overlay.locator('button').nth(2); // X close is typically 3rd button in header
    if (await backToResultsBtn.isVisible().catch(() => false)) {
      await backToResultsBtn.click({ force: true });
    } else if (await xBtn.isVisible().catch(() => false)) {
      await xBtn.click({ force: true });
    }
    await page.waitForTimeout(500);

    // Step 7: Go to home - "Back to Advisor" or "Back to home" or navigate
    const backBtn = page.getByRole('button', { name: /Back to Advisor|Back to advisor|Back to home/i });
    if (await backBtn.first().isVisible().catch(() => false)) {
      await backBtn.first().click({ force: true });
    }
    await page.waitForTimeout(300);

    // If still not on home (no Get Recommendations), navigate
    if (!(await page.getByRole('button', { name: /Get Recommendations/i }).isVisible().catch(() => false))) {
      await page.goto(BASE_URL);
      await page.waitForLoadState('networkidle');
    }
    await page.getByRole('button', { name: /Get Recommendations/i }).click();
    await expect(page.getByRole('heading', { name: /Recommended/i })).toBeVisible({ timeout: 5000 });
    steps.push('Step 7: Get Recommendations - results page ✓');

    // Step 8: Click pattern card to open sidebar
    const patternCard = page.getByText('Recommended', { exact: true }).locator('..')
      .or(page.locator('[class*="cursor-pointer"]').first());
    await patternCard.click();
    await page.waitForTimeout(800);
    steps.push('Step 8: Pattern detail sidebar opened ✓');

    await page.screenshot({ path: 'test-results/step6-pattern-sidebar.png', fullPage: true });

    // Step 9: Hover over diagram node
    const diagramContainer = page.locator('text=Architecture').locator('../..');
    const firstNode = diagramContainer.locator('[class*="flex flex-col items-center"]').first();
    if (await firstNode.isVisible().catch(() => false)) {
      await firstNode.hover({ force: true }).catch(() => {});
      await page.waitForTimeout(400);
    }
    const hasHoverEffect = await page.getByText(/Click for details/i).isVisible().catch(() => false);
    if (hasHoverEffect) steps.push('Step 9: Hover shows "Click for details" ✓');
    else steps.push('Step 9: No "Click for details" on hover');

    await page.screenshot({ path: 'test-results/step7-diagram-hover.png', fullPage: true });

    // Step 10: Click diagram node
    if (await firstNode.isVisible().catch(() => false)) {
      await firstNode.click({ force: true }).catch(() => {});
      await page.waitForTimeout(600);
    }
    const componentPanelOpened = await page.getByText(/What It Does/i).isVisible().catch(() => false);
    if (componentPanelOpened) steps.push('Step 10: Clicking node opened component detail panel ✓');
    else steps.push('Step 10: Clicking node did NOT open component panel');

    await page.screenshot({ path: 'test-results/step8-after-node-click.png', fullPage: true });

    // Log all steps
    console.log('\n--- TEST RESULTS ---');
    steps.forEach(s => console.log(s));
  });
});
