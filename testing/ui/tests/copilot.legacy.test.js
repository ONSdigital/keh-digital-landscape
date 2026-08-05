import { test, expect } from 'playwright/test';

test('Legacy Usage page routes correctly', async ({ page }) => {
  await page.goto('http://localhost:3000/copilot/home');
  await page.getByText('Legacy Usage').click();
  await expect(page).toHaveURL('http://localhost:3000/copilot/legacy');
});

test('Legacy Usage page shows skeleton loading state', async ({ page }) => {
  await page.route('**/copilot/api/org/legacy*', async route => {
    await new Promise(resolve => setTimeout(resolve, 2000));
    await route.continue();
  });
  await page.goto('http://localhost:3000/copilot/legacy');
  await expect(page.locator('.stat-card.skeleton').first()).toBeVisible();
});

test('Legacy Usage page displays the January 2025 - March 2026 dataset correctly', async ({
  page,
}) => {
  await page.goto('http://localhost:3000/copilot/legacy');
  await expect(page.locator('.stat-card.skeleton')).toHaveCount(0, {
    timeout: 10000,
  });

  const section = page.locator('[data-testid="mar-dataset"]');

  // IDE Code Completions
  await expect(
    section.getByRole('heading', { name: 'IDE Code Completions' })
  ).toBeVisible();
  await expect(section.getByText('Total Suggestions')).toBeVisible();
  await expect(section.getByText('Total Acceptances')).toBeVisible();
  await expect(
    section.locator('p.stat-card-title', { hasText: /^Acceptance Rate$/ })
  ).toBeVisible();
  await expect(section.getByText('Total Lines Suggested')).toBeVisible();
  await expect(section.getByText('Total Lines Accepted')).toBeVisible();
  await expect(section.getByText('Line Acceptance Rate')).toBeVisible();

  // IDE Chats
  await expect(
    section.getByRole('heading', { name: 'IDE Chats' })
  ).toBeVisible();
  await expect(section.getByText('Total Chats')).toBeVisible();
  await expect(section.getByText('Total Chat Insertions')).toBeVisible();
  await expect(section.getByText('Total Chat Copies')).toBeVisible();
  await expect(section.getByText('Chat Insertion Rate')).toBeVisible();
  await expect(section.getByText('Chat Copy Rate')).toBeVisible();

  // User Metrics
  await expect(
    section.getByRole('heading', { name: 'User Metrics' })
  ).toBeVisible();

  // 2 graph containers: 1 AcceptanceGraph + 1 stacked (chat + user metrics)
  await expect(section.locator('.copilot-graph-container--old')).toHaveCount(2);
});

test('Legacy Usage page displays the May 2024 - January 2025 dataset correctly', async ({
  page,
}) => {
  await page.goto('http://localhost:3000/copilot/legacy');
  await expect(page.locator('.stat-card.skeleton')).toHaveCount(0, {
    timeout: 10000,
  });

  const section = page.locator('[data-testid="feb-dataset"]');

  // IDE Code Completions
  await expect(
    section.getByRole('heading', { name: 'IDE Code Completions' })
  ).toBeVisible();
  await expect(section.getByText('Total Suggestions')).toBeVisible();
  await expect(section.getByText('Total Acceptances')).toBeVisible();
  await expect(
    section.locator('p.stat-card-title', { hasText: /^Acceptance Rate$/ })
  ).toBeVisible();
  await expect(section.getByText('Total Lines Suggested')).toBeVisible();
  await expect(section.getByText('Total Lines Accepted')).toBeVisible();
  await expect(section.getByText('Line Acceptance Rate')).toBeVisible();

  // IDE Chats (Feb has acceptance-based metrics instead of insertion/copy)
  await expect(
    section.getByRole('heading', { name: 'IDE Chats' })
  ).toBeVisible();
  await expect(section.getByText('Total Chats')).toBeVisible();
  await expect(section.getByText('Total Chat Acceptances')).toBeVisible();
  await expect(section.getByText('Chat Acceptance Rate')).toBeVisible();

  // User Metrics
  await expect(
    section.getByRole('heading', { name: 'User Metrics' })
  ).toBeVisible();

  // 2 graph containers: 1 AcceptanceGraph + 1 stacked (chat + user metrics)
  await expect(section.locator('.copilot-graph-container--old')).toHaveCount(2);
});

test('Legacy Usage page back button navigates to landing page', async ({
  page,
}) => {
  await page.goto('http://localhost:3000/copilot/legacy');
  await page.locator('.copilot-back-button').click();
  await expect(page).toHaveURL('http://localhost:3000/copilot/home');
});
