import { test, expect } from 'playwright/test';
import { radarData } from './data/radarData';
import { csvData } from './data/csvData';

// Function to intercept and mock the API call
const interceptAPICall = async ({ page }) => {
  // Function to intercept and mock the API radarData call
  const interceptAPIJsonCall = async ({ page }) => {
    // Intercept and mock the teams API response with teamsDummyData
    await page.route('**/api/tech-radar/json', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(radarData),
      });
    });
  };

  // Function to intercept and mock the API csvData call
  const interceptAPICSVCall = async ({ page }) => {
    // Intercept and mock the teams API response with teamsDummyData
    await page.route('**/api/csv', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(csvData),
      });
    });
  };

  await interceptAPIJsonCall({ page });
  await interceptAPICSVCall({ page });
  await page.goto('http://localhost:3000/statistics');

  // Clear all cookies
  await page.context().clearCookies();

  // Set a dummy authentication cookie to simulate logged-in user
  await page.context().addCookies([
    {
      name: 'githubUserToken',
      value: 'dummy-token',
      domain: 'localhost',
      path: '/',
      httpOnly: true,
      secure: false,
      sameSite: 'Lax',
    },
  ]);
  await page.reload();
};

test.describe('Test the colour help accordion on the statistics page', () => {
  test.beforeEach(interceptAPICall);

  test('should open and close the colour help accordion when the trigger is clicked', async ({ page }) => {
    // Click the colour help accordion trigger
    await page.click('#colour-help-trigger');

    // Assert that the colour help content is visible
    const content = await page.locator('#colour-help-content');
    await expect(content).toBeVisible();

    // Assert that the contents are hidden when the trigger is clicked again
    await page.click('#colour-help-trigger');
    await expect(content).not.toBeVisible();
  });

  test('should have the correct content in the colour help accordion', async ({ page }) => {
    // Click the colour help accordion trigger
    await page.click('#colour-help-trigger');

    // Assert that the colour help content contains the expected text
    const content = await page.locator('#colour-help-content');
    await expect(content).toContainText('The colours at the bottom of each language card indicate the technology status of that language on the Tech Radar.');

    // Assert that there are 4 language cards within the content
    const languageCards = await content.locator('.language-card');
    await expect(languageCards).toHaveCount(4);
  });
});
