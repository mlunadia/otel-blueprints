import { test, expect } from '@playwright/test';

const BASE_URL = '/otel-blueprints/';

test.describe('Components and Architecture Diagram', () => {
  test('full flow: Explore components, component detail, Get Recommendations, diagram node interaction', async ({
    page,
  }) => {
    // 1. Home page - verify "Explore components" link below Get Recommendations
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    const exploreComponentsLink = page.getByRole('button', { name: /Explore components/i });
    const exploreAllLink = page.getByRole('button', { name: /Explore all architectures/i });

    // Report which link exists
    const hasExploreComponents = await exploreComponentsLink.isVisible().catch(() => false);
    const hasExploreAll = await exploreAllLink.isVisible().catch(() => false);

    if (!hasExploreComponents && !hasExploreAll) {
      await page.screenshot({ path: 'test-results/01-home-no-explore-link.png', fullPage: true });
      throw new Error('No Explore link found below Get Recommendations');
    }

    // 2. Click Explore link (components or architectures)
    if (hasExploreComponents) {
      await exploreComponentsLink.click();
    } else {
      await exploreAllLink.click();
    }

    // 3. Check for Components page (categories: Core, Advanced, Infrastructure) or Explore (patterns)
    await page.waitForTimeout(1000);
    const hasComponentsCategories =
      (await page.getByText(/Core Components/i).isVisible().catch(() => false)) ||
      (await page.getByText(/Advanced Processing/i).isVisible().catch(() => false)) ||
      (await page.getByText(/Infrastructure/i).isVisible().catch(() => false));

    const hasArchitecturePatterns = await page
      .getByRole('heading', { name: /OpenTelemetry Architecture Patterns/i })
      .isVisible()
      .catch(() => false);

    await page.screenshot({
      path: 'test-results/02-explore-page.png',
      fullPage: true,
    });

    // 4. If Components page: click Agent Collector card and verify detail panel
    const agentCollectorCard = page.getByRole('button', { name: /Agent Collector/i });
    const learnMoreLink = page.getByRole('link', { name: /Learn more/i }).first();
    const viewDetailsBtn = page.getByRole('button', { name: /View Details/i }).first();

    if (await agentCollectorCard.isVisible().catch(() => false)) {
      await agentCollectorCard.click();
    } else if (await learnMoreLink.isVisible().catch(() => false)) {
      await learnMoreLink.click();
    } else if (await viewDetailsBtn.isVisible().catch(() => false)) {
      await viewDetailsBtn.click();
    }

    // Wait for potential detail panel
    await page.waitForTimeout(500);

    const hasComponentDetailPanel =
      (await page.getByRole('heading', { name: /Agent Collector/i }).first().isVisible().catch(() => false)) &&
      (await page.getByText(/What It Does/i).isVisible().catch(() => false));

    if (hasComponentDetailPanel) {
      await page.screenshot({
        path: 'test-results/03-component-detail-panel.png',
        fullPage: true,
      });
    }

    // 5. Close detail panel and go back
    const backBtn = page.getByRole('button', { name: /Back to/i });
    const closeBtn = page.getByRole('button', { name: /close|Back to results/i }).first();
    if (await backBtn.isVisible().catch(() => false)) {
      await backBtn.click();
    } else if (await closeBtn.isVisible().catch(() => false)) {
      await closeBtn.click();
    }
    await page.waitForTimeout(500);

    // 6. Go to home and click Get Recommendations
    const backToAdvisor = page.getByRole('button', { name: /Back to Advisor/i });
    if (await backToAdvisor.isVisible().catch(() => false)) {
      await backToAdvisor.click();
    }

    await page.waitForTimeout(300);
    await page.getByRole('button', { name: /Get Recommendations/i }).click();

    await expect(
      page.getByRole('heading', { name: /Recommended Architectures/i })
    ).toBeVisible({ timeout: 5000 });

    await page.screenshot({
      path: 'test-results/04-results.png',
      fullPage: true,
    });

    // 7. Click pattern card to open sidebar
    const firstPatternCard = page
      .getByText('Recommended', { exact: true })
      .locator('..')
      .or(page.locator('[class*="cursor-pointer"]').first());
    await firstPatternCard.click();

    await page.waitForTimeout(800);

    await page.screenshot({
      path: 'test-results/05-pattern-sidebar.png',
      fullPage: true,
    });

    // 8. Check if diagram nodes have hover "Click for details" (scoped to Architecture section)
    const architectureSection = page.locator('text=Architecture').locator('..');
    const diagramNodes = architectureSection.locator('[class*="flex flex-col items-center"]');
    const clickForDetailsVisible = await page.getByText(/Click for details/i).isVisible().catch(() => false);

    await page.screenshot({
      path: 'test-results/06-pattern-detail-with-diagram.png',
      fullPage: true,
    });

    // 9. Try clicking a diagram node (Agent icon in diagram) - only if nodes are clickable
    const agentNode = page.locator('svg').locator('..').filter({ hasText: /Agent|Application/ }).first();
    if ((await agentNode.count()) > 0) {
      await agentNode.click().catch(() => {});
      await page.waitForTimeout(500);
    }

    await page.screenshot({
      path: 'test-results/07-after-node-click.png',
      fullPage: true,
    });
  });
});
