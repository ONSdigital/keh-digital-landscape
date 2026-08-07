import { test, expect } from 'playwright/test';
import { copilotCodeCompletionsData } from './data/copilotCodeCompletionsData';

async function mockCopilotAPI(page, data = copilotCodeCompletionsData) {
  await page.route('**/copilot/api/org/historic', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(data),
    });
  });
}

test('Code Completions page routes correctly from landing page', async ({
  page,
}) => {
  await page.goto('http://localhost:3000/copilot/home');
  await page.getByText('IDE Code Completions').click();
  await expect(page).toHaveURL('http://localhost:3000/copilot/completions');
});

test('Code Completions page shows skeleton loading state', async ({ page }) => {
  await page.route('**/copilot/api/org/historic', async route => {
    await new Promise(resolve => setTimeout(resolve, 2000));
    await route.continue();
  });

  await page.goto('http://localhost:3000/copilot/completions');
  await expect(page.locator('.stat-card.skeleton').first()).toBeVisible();

  await expect
    .poll(async () => page.locator('.copilot-graph-container.skeleton').count())
    .toBeGreaterThan(0);
});

test('Code Completions page displays correct page structure', async ({
  page,
}) => {
  await mockCopilotAPI(page);
  await page.goto('http://localhost:3000/copilot/completions');
  await expect(page.locator('.stat-card.skeleton')).toHaveCount(0, {
    timeout: 10000,
  });

  await expect(
    page.getByRole('heading', { name: 'IDE Code Completions' })
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Overall Usage' })
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Suggestions vs Acceptance Sizes' })
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Language Breakdown' })
  ).toBeVisible();

  await expect(
    page.getByRole('heading', { name: 'Total Suggestion Instances' })
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Total Acceptances' })
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Overall Acceptance Rate' })
  ).toBeVisible();

  await expect(
    page.getByRole('heading', { name: 'Average LoC per suggestion' })
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Average LoC per acceptance' })
  ).toBeVisible();
});

test('Code Completions page reveals LoC cards when Include LoC usage is enabled', async ({
  page,
}) => {
  await mockCopilotAPI(page);

  await page.goto('http://localhost:3000/copilot/completions');
  await expect(page.locator('.stat-card.skeleton')).toHaveCount(0, {
    timeout: 10000,
  });

  await expect(
    page.getByRole('heading', { name: 'Total Lines Suggested' })
  ).toHaveCount(0);

  await page.getByLabel('Open settings for page').click();
  await page.getByLabel('Include LoC usage').check();

  await expect(
    page.getByRole('heading', { name: 'Total Lines Suggested' })
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Total Lines Accepted' })
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Overall Line Acceptance Rate' })
  ).toBeVisible();
});

test('Code Completions page back button navigates to landing page', async ({
  page,
}) => {
  await page.goto('http://localhost:3000/copilot/completions');
  await page.locator('.copilot-back-button').click();
  await expect(page).toHaveURL('http://localhost:3000/copilot/home');
});
