import { test, expect } from 'playwright/test';
import { copilotGeneralUsageData } from './data/copilotGeneralUsageData';

test('General Usage page routes correctly from landing page', async ({
  page,
}) => {
  await page.goto('http://localhost:3000/copilot/home');
  await page.getByText('General Usage').click();
  await expect(page).toHaveURL('http://localhost:3000/copilot/general');
});

test('General Usage page shows skeleton loading state', async ({ page }) => {
  await page.route('**/copilot/api/org/historic', async route => {
    await new Promise(resolve => setTimeout(resolve, 2000));
    await route.continue();
  });
  await page.goto('http://localhost:3000/copilot/general');
  await expect(page.locator('.usage-card.skeleton').first()).toBeVisible();
  await expect(
    page.locator('.copilot-graph-container.skeleton').first()
  ).toBeVisible();
  await expect(
    page.locator('.usage-pie-chart-card.skeleton').first()
  ).toBeVisible();
});

test('General Usage page displays correct page structure', async ({ page }) => {
  await page.route('**/copilot/api/org/historic', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(copilotGeneralUsageData),
    });
  });
  await page.goto('http://localhost:3000/copilot/general');
  await expect(page.locator('.usage-card.skeleton')).toHaveCount(0, {
    timeout: 10000,
  });

  // User Adoption cards
  await expect(
    page.getByRole('heading', { name: 'User Adoption' })
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Chat Mode Adoption' })
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Agent Mode Adoption' })
  ).toBeVisible();
  await expect(page.locator('.usage-card')).toHaveCount(2);

  // Engaged Users Over Time section
  await expect(
    page.getByRole('heading', { name: 'Engaged Users Over Time' })
  ).toBeVisible();

  // Cumulative Acceptance Over Time section
  await expect(
    page.getByRole('heading', { name: 'Cumulative Acceptance Over Time' })
  ).toBeVisible();
  await expect(page.locator('.copilot-graph-container')).toHaveCount(2);

  // Model & IDE Usage section
  await expect(
    page.getByRole('heading', {
      name: 'Model & IDE Usage Amongst Developers',
    })
  ).toBeVisible();
  await expect(page.locator('.usage-pie-chart-card')).toHaveCount(3);

  // Code Impact By Language section
  await expect(
    page.getByRole('heading', { name: 'Code Impact By Language' })
  ).toBeVisible();
});
