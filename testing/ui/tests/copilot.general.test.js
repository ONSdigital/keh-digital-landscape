import { test, expect } from 'playwright/test';

test('General Usage page routes correctly from landing page', async ({
  page,
}) => {
  await page.goto('http://localhost:3000/copilot/home');
  await page.getByText('General Usage').click();
  await expect(page).toHaveURL('http://localhost:3000/copilot/general');
});

test('General Usage page shows skeleton loading state', async ({ page }) => {
  await page.goto('http://localhost:3000/copilot/general');
  await expect(page.locator('.usage-card.skeleton').first()).toBeVisible();
});

test('General Usage page displays correct page structure', async ({
  page,
}) => {
  await page.goto('http://localhost:3000/copilot/general');
  await expect(page.locator('.usage-card.skeleton')).toHaveCount(0, {
    timeout: 10000,
  });

  // User Adoption cards
  await expect(
    page.getByRole('heading', { name: 'User Adoption' })
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Chat Users' })
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Agent Adoption' })
  ).toBeVisible();
  await expect(page.locator('.usage-card')).toHaveCount(2);

  // Engaged Users Overtime section
  await expect(
    page.getByRole('heading', { name: 'Engaged Users Overtime' })
  ).toBeVisible();
  await expect(page.locator('.copilot-graph-container')).toHaveCount(1);

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

test('General Usage page tooltip shows on hover for Engaged Users', async ({
  page,
}) => {
  await page.goto('http://localhost:3000/copilot/general');
  await expect(page.locator('.usage-card.skeleton')).toHaveCount(0, {
    timeout: 10000,
  });

  const infoIcon = page
    .getByRole('heading', { name: 'Engaged Users Overtime' })
    .locator('.info-icon');
  await infoIcon.hover();

  await expect(page.locator('.tooltip-content')).toBeVisible();
  await expect(page.locator('.tooltip-content')).toContainText(
    'Monthly unique active users across all Copilot features'
  );
});

test('General Usage page tooltip shows on hover for Model & IDE Usage', async ({
  page,
}) => {
  await page.goto('http://localhost:3000/copilot/general');
  await expect(page.locator('.usage-card.skeleton')).toHaveCount(0, {
    timeout: 10000,
  });

  const infoIcon = page
    .getByRole('heading', {
      name: 'Model & IDE Usage Amongst Developers',
    })
    .locator('.info-icon');
  await infoIcon.scrollIntoViewIfNeeded();
  await infoIcon.hover({ force: true });

  await expect(page.locator('.tooltip-content')).toBeVisible();
  await expect(page.locator('.tooltip-content')).toContainText(
    'share of user-initiated interactions by model'
  );
});

test('General Usage page tooltip shows on hover for Code Impact', async ({
  page,
}) => {
  await page.goto('http://localhost:3000/copilot/general');
  await expect(page.locator('.usage-card.skeleton')).toHaveCount(0, {
    timeout: 10000,
  });

  const infoIcon = page
    .getByRole('heading', { name: 'Code Impact By Language' })
    .locator('.info-icon');
  await infoIcon.hover();

  await expect(page.locator('.tooltip-content')).toBeVisible();
  await expect(page.locator('.tooltip-content')).toContainText(
    'Share of total lines added and deleted'
  );
});

test('General Usage page back button navigates to landing page', async ({
  page,
}) => {
  await page.goto('http://localhost:3000/copilot/general');
  await page.locator('.copilot-back-button').click();
  await expect(page).toHaveURL('http://localhost:3000/copilot/home');
});
