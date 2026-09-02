import { test, expect } from 'playwright/test';

test('Landing page sections are displayed correctly', async ({ page }) => {
  await page.goto('http://localhost:3000/copilot/home');

  // Cards are in the right sections
  const summarySection = page
    .locator('.copilot-section')
    .filter({ hasText: 'Summary' });
  await expect(summarySection.getByText('General Usage')).toBeVisible();

  const exploreUsageByFeatureSection = page
    .locator('.copilot-section')
    .filter({ hasText: 'Explore Usage by Feature' });
  await expect(
    exploreUsageByFeatureSection.getByText('IDE Code Completions')
  ).toBeVisible();
  await expect(
    exploreUsageByFeatureSection.getByText('Copilot Chat')
  ).toBeVisible();

  const otherSection = page
    .locator('.copilot-section')
    .filter({ hasText: 'Other' });
  await expect(otherSection.getByText('Direct Edits')).toBeVisible();
  await expect(otherSection.getByText('Legacy Usage')).toBeVisible();

  // Every card has a arrow button
  await expect(page.locator('.copilot-nav-card-arrow')).toHaveCount(5);
});
