import { test, expect } from 'playwright/test';
import { copilotDirectEditsData } from './data/copilotDirectEditsData';

async function mockCopilotAPI(page, data = copilotDirectEditsData) {
  await page.route('**/copilot/api/org/historic', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(data),
    });
  });
}

test('Direct Edits page routes correctly from landing page', async ({
  page,
}) => {
  await page.goto('http://localhost:3000/copilot/home');
  await page.getByText('Direct Edits').click();
  await expect(page).toHaveURL('http://localhost:3000/copilot/edits');
});

test('Direct Edits page shows skeleton loading state', async ({ page }) => {
  await page.route('**/copilot/api/org/historic', async route => {
    await new Promise(resolve => setTimeout(resolve, 2000));
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(copilotDirectEditsData),
    });
  });

  await page.goto('http://localhost:3000/copilot/edits');
  await expect(page.locator('.stat-card.skeleton').first()).toBeVisible();
  await expect(page.locator('.copilot-graph-container.skeleton')).toBeVisible();
});

test('Direct Edits page displays correct page structure', async ({ page }) => {
  await mockCopilotAPI(page);

  await page.goto('http://localhost:3000/copilot/edits');
  await expect(page.locator('.stat-card.skeleton')).toHaveCount(0, {
    timeout: 10000,
  });

  await expect(page.getByRole('heading', { name: 'Direct Edits' })).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Overall Usage' })
  ).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Breakdowns' })).toBeVisible();

  await expect(
    page.getByRole('heading', { name: 'Total Lines Added' })
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Total Lines Deleted' })
  ).toBeVisible();

  await expect(
    page.getByRole('heading', { name: 'Language Breakdown' })
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Model Breakdown' })
  ).toBeVisible();
});

test('Direct Edits page shows weekend setting control', async ({ page }) => {
  await mockCopilotAPI(page);

  await page.goto('http://localhost:3000/copilot/edits');
  await expect(page.locator('.stat-card.skeleton')).toHaveCount(0, {
    timeout: 10000,
  });

  await page.getByLabel('Open settings for page').click();
  await expect(page.getByLabel('Include weekend usage')).toBeVisible();
});

test('Direct Edits page back button navigates to landing page', async ({
  page,
}) => {
  await page.goto('http://localhost:3000/copilot/edits');
  await page.locator('.copilot-back-button').click();
  await expect(page).toHaveURL('http://localhost:3000/copilot/home');
});
