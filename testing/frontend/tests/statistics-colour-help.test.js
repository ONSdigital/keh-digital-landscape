import { test, expect } from 'playwright/test';

test.describe('Test the colour help button on the statistics page', () => {
    test('should show the colour help modal when the button is clicked', async ({ page }) => {
        await page.goto('http://localhost:3000/statistics');

        const colourHelpButton = await page.locator('#colour-key-button');
        const colourHelpDescription = await page.locator('#colour-key-description');

        await expect(colourHelpDescription).toBeHidden();

        await colourHelpButton.click();

        await expect(colourHelpDescription).toBeVisible();
        await expect(colourHelpButton).toBeHidden();
    });

    test('should hide the colour help modal when the close button is clicked', async ({ page }) => {
        await page.goto('http://localhost:3000/statistics');

        // If there is a banner on the page, close it to ensure it does not interfere with the test
        // Once we mock the API responses, we can remove this as the banner will not be shown
        // TODO: Mock API Calls so that synthetic data is used for these tests
        const banner = await page.locator(".banner");

        if (banner) {
            const closeBannerButton = await banner.locator(".banner-close-btn");
            await closeBannerButton.click();
        }

        const colourHelpButton = await page.locator('#colour-key-button');
        const colourHelpDescription = await page.locator('#colour-key-description');
        const closeButton = await page.locator('#close-colour-key-button');

        await colourHelpButton.click();
        await expect(colourHelpDescription).toBeVisible();

        await page.waitForTimeout(500); // Wait for the modal to be fully visible before clicking close

        await closeButton.click();
        await expect(colourHelpDescription).toBeHidden();
        await expect(colourHelpButton).toBeVisible();
    });

    test('description should contain 4 examples of colours', async ({ page }) => {
        await page.goto('http://localhost:3000/statistics');

        const colourHelpButton = await page.locator('#colour-key-button');
        const colourHelpDescription = await page.locator('#colour-key-description');

        await colourHelpButton.click();
        await expect(colourHelpDescription).toBeVisible();

        const examples = await colourHelpDescription.locator('.language-card');
        await expect(examples).toHaveCount(4);
    });
});