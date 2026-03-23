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

test.describe('Test the colour help button on the statistics page', () => {
  test('should show the colour help modal when the button is clicked', async ({
    page,
  }) => {
    await interceptAPICall({ page });

    const colourHelpButton = await page.locator('#colour-help-button');
    const colourHelpDescription = await page.locator(
      '#colour-help-description'
    );

    await expect(colourHelpDescription).toBeHidden();

    await colourHelpButton.click();

    await expect(colourHelpDescription).toBeVisible();
    await expect(colourHelpButton).toBeHidden();
  });

  test('should hide the colour help modal when the close button is clicked', async ({
    page,
  }) => {
    await interceptAPICall({ page });

    const colourHelpButton = await page.locator('#colour-help-button');
    const colourHelpDescription = await page.locator(
      '#colour-help-description'
    );
    const closeButton = await page.locator('#close-colour-help-button');

    await colourHelpButton.click();
    await expect(colourHelpDescription).toBeVisible();

    await page.waitForTimeout(500); // Wait for the modal to be fully visible before clicking close

    await closeButton.click();
    await expect(colourHelpDescription).toBeHidden();
    await expect(colourHelpButton).toBeVisible();
  });

  test('description should contain 4 examples of colours', async ({ page }) => {
    await interceptAPICall({ page });

    const colourHelpButton = await page.locator('#colour-help-button');
    const colourHelpDescription = await page.locator(
      '#colour-help-description'
    );

    await colourHelpButton.click();
    await expect(colourHelpDescription).toBeVisible();

    const examples = await colourHelpDescription.locator('.language-card');
    await expect(examples).toHaveCount(4);
  });
});
