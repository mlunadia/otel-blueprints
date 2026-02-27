import { test, expect } from '@playwright/test';

const BASE_PATH = '/otel-blueprints/';

test.describe('Build My Architecture - Diagram Verification', () => {
  test('click Build My Architecture and verify diagram rendering', async ({ page }) => {
    test.setTimeout(30000);

    // 1. Navigate to page
    await page.goto(BASE_PATH, { waitUntil: 'networkidle' });

    // 2. Take initial snapshot
    await page.screenshot({ path: 'test-results/01-initial-page.png', fullPage: true });

    // 3. Find and click "Build My Architecture" button
    const buildBtn = page.getByRole('button', { name: /Build My Architecture/i });
    await expect(buildBtn).toBeVisible({ timeout: 5000 });
    await buildBtn.click();

    // 4. Wait for architecture view
    await expect(page.getByRole('heading', { name: /Your Architecture/i })).toBeVisible({
      timeout: 5000,
    });
    await page.waitForTimeout(1000); // Let animations settle

    // 5. Full page screenshot of diagram
    await page.screenshot({ path: 'test-results/02-architecture-diagram-full.png', fullPage: true });

    // 6. Screenshot diagram area (the pipeline container)
    const diagramArea = page.locator('[class*="bg-[var(--bg-tertiary)]"]').filter({
      has: page.locator('text=Kubernetes Cluster').or(page.locator('text=Host / VM')),
    }).first();
    if ((await diagramArea.count()) > 0) {
      await diagramArea.screenshot({ path: 'test-results/03-architecture-diagram-closeup.png' });
    }

    // 7. Verification report
    const report: string[] = [];
    report.push('=== ARCHITECTURE DIAGRAM VERIFICATION REPORT ===');

    // Environment containers (Kubernetes Cluster or Host/VM)
    const hasK8s = await page.getByText('Kubernetes Cluster').isVisible().catch(() => false);
    const hasHostVM = await page.getByText('Host / VM').isVisible().catch(() => false);
    report.push(
      hasK8s || hasHostVM
        ? `✓ Environment containers: ${hasK8s ? 'Kubernetes Cluster' : ''}${hasK8s && hasHostVM ? ' ' : ''}${hasHostVM ? 'Host/VM' : ''}`
        : '✗ Environment containers (Kubernetes Cluster or Host/VM) NOT found'
    );

    // Component boxes (Application, DaemonSet Agent, etc.)
    const hasApplication = await page.getByText('Application', { exact: true }).first().isVisible().catch(() => false);
    const hasDaemonSet = await page.getByText('DaemonSet Agent').isVisible().catch(() => false);
    const hasSidecar = await page.getByText('Sidecar Agent').isVisible().catch(() => false);
    const hasHostAgent = await page.getByText('Host Agent').isVisible().catch(() => false);
    const hasBackend = await page.getByText('Observability Backend').isVisible().catch(() => false);
    report.push(
      hasApplication
        ? '✓ Component box: Application'
        : '- Application component: not visible (may depend on selections)'
    );
    report.push(
      hasDaemonSet || hasSidecar || hasHostAgent
        ? `✓ Agent component: ${[hasDaemonSet && 'DaemonSet', hasSidecar && 'Sidecar', hasHostAgent && 'Host'].filter(Boolean).join(', ')}`
        : '- Agent components: not visible'
    );
    report.push(hasBackend ? '✓ Component box: Observability Backend' : '✗ Backend section NOT found');

    // Flow connectors (SVG with animated dots)
    const flowConnectors = page.locator('svg').filter({
      has: page.locator('animateMotion'),
    });
    const connectorCount = await flowConnectors.count();
    report.push(
      connectorCount > 0
        ? `✓ Flow connectors with animated dots: ${connectorCount} found`
        : '- Flow connectors: check for SVG with animateMotion'
    );

    // Legend at bottom
    const legend = page.locator('[class*="border-t"]').filter({ hasText: /Application|OTel Collector|Backend/ });
    const hasLegend = await legend.first().isVisible().catch(() => false);
    report.push(hasLegend ? '✓ Legend at bottom: visible' : '- Legend: check manually');

    // Visual issues - basic overlap check (diagram should have reasonable dimensions)
    const diagramContainer = page.locator('[class*="overflow-x-auto"]').first();
    const hasDiagramContainer = (await diagramContainer.count()) > 0;
    report.push(hasDiagramContainer ? '✓ Diagram container (overflow-x-auto) present' : '- Diagram container: check');

    console.log('\n');
    report.forEach((r) => console.log(r));
    console.log('\nScreenshots saved to test-results/');
  });
});
