import { test, expect } from 'playwright/test';
import { copilotChatModeData } from './data/copilotChatModeData';

async function mockCopilotAPI(page, data = copilotChatModeData) {
  await page.route('**/copilot/api/org/historic', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(data),
    });
  });
}

test('Chat Mode page routes correctly from landing page', async ({ page }) => {
  await page.goto('http://localhost:3000/copilot/home');
  await page.getByText('Copilot Chat').click();
  await expect(page).toHaveURL('http://localhost:3000/copilot/chat');
});

test('Chat Mode page shows skeleton loading state', async ({ page }) => {
  await page.route('**/copilot/api/org/historic', async route => {
    await new Promise(resolve => setTimeout(resolve, 2000));
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(copilotChatModeData),
    });
  });

  await page.goto('http://localhost:3000/copilot/chat');
  await expect(page.locator('.stat-card.skeleton').first()).toBeVisible();
  await expect(page.locator('.copilot-graph-container.skeleton').first()).toBeVisible();
});

test('Chat Mode page displays correct page structure', async ({ page }) => {
  await mockCopilotAPI(page);

  await page.goto('http://localhost:3000/copilot/chat');
  await expect(page.locator('.stat-card.skeleton')).toHaveCount(0, {
    timeout: 10000,
  });

  await expect(page.getByRole('heading', { name: 'Copilot Chat' })).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Overall Usage' })
  ).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Breakdowns' })).toBeVisible();

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
    page.getByRole('heading', { name: 'Language Breakdown' })
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Model Breakdown' })
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Chat Mode Breakdown' })
  ).toBeVisible();
});

test('Chat Mode page shows weekend setting control', async ({ page }) => {
  await mockCopilotAPI(page);

  await page.goto('http://localhost:3000/copilot/chat');
  await expect(page.locator('.stat-card.skeleton')).toHaveCount(0, {
    timeout: 10000,
  });

  await page.getByLabel('Open settings for page').click();
  await expect(page.getByLabel('Include weekend usage')).toBeVisible();
});

test('Chat Mode page back button navigates to landing page', async ({
  page,
}) => {
  await page.goto('http://localhost:3000/copilot/chat');
  await page.locator('.copilot-back-button').click();
  await expect(page).toHaveURL('http://localhost:3000/copilot/home');
});
