import { test, expect } from 'playwright/test';
import { copilotAgentEditsData } from './data/copilotAgentEditsData';

async function mockCopilotAPI(page, data = copilotAgentEditsData) {
  await page.route('**/copilot/api/org/historic', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(data),
    });
  });
}

test('Agent Mode page routes correctly from landing page', async ({
  page,
}) => {
  await page.goto('http://localhost:3000/copilot/home');
  await page.getByText('Agent Mode').click();
  await expect(page).toHaveURL('http://localhost:3000/copilot/agent');
});

test('Agent Mode page shows skeleton loading state', async ({ page }) => {
  await page.route('**/copilot/api/org/historic', async route => {
    await new Promise(resolve => setTimeout(resolve, 2000));
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(copilotAgentEditsData),
    });
  });

  await page.goto('http://localhost:3000/copilot/agent');
  await expect(page.locator('.stat-card.skeleton').first()).toBeVisible();
  await expect(page.locator('.copilot-graph-container.skeleton')).toBeVisible();
});

test('Agent Mode page displays correct page structure', async ({ page }) => {
  await mockCopilotAPI(page);

  await page.goto('http://localhost:3000/copilot/agent');
  await expect(page.locator('.stat-card.skeleton')).toHaveCount(0, {
    timeout: 10000,
  });

  await expect(page.getByRole('heading', { name: 'Agent Mode' })).toBeVisible();
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

test('Agent Mode page shows weekend setting control', async ({ page }) => {
  await mockCopilotAPI(page);

  await page.goto('http://localhost:3000/copilot/agent');
  await expect(page.locator('.stat-card.skeleton')).toHaveCount(0, {
    timeout: 10000,
  });

  await page.getByLabel('Open settings for page').click();
  await expect(page.getByLabel('Include weekend usage')).toBeVisible();
});

test('Agent Mode page back button navigates to landing page', async ({
  page,
}) => {
  await page.goto('http://localhost:3000/copilot/agent');
  await page.locator('.copilot-back-button').click();
  await expect(page).toHaveURL('http://localhost:3000/copilot/home');
});
