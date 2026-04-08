// Get Axe fixture
const { test, expect } = require('../axe-test');

// Get test.config.js
const config = require('../test.config.js');
const pages = config.pages;

// Define base URL
const baseUrl = 'http://localhost:3000';

/**
 * Sets authentication cookies for routes that require them
 *
 * @param {Object} context
 * @param {string} pageUrl
 * @param {Object} pageConfig
 * @returns {Promise<void>}
 */
const handleAuthentication = async (context, pageUrl, pageConfig) => {
  if (pageConfig.authentication.length > 0) {
    const cookieName = pageConfig.authentication[0];
    const cookieValue = process.env[`TEST_${cookieName.toUpperCase()}`];

    if (!cookieValue) {
      console.warn(
        `Warning: Authentication required for ${pageUrl} but TEST_${cookieName.toUpperCase()} environment variable is not set.`
      );
      return;
    }

    console.log(`Setting authentication cookie '${cookieName}' for ${pageUrl}`);

    await context.addCookies([
      {
        name: cookieName,
        value: cookieValue,
        domain: new URL(baseUrl).hostname,
        path: '/',
      },
    ]);

    return;
  }
};

test.describe('Accessibility Tests', () => {
  pages.forEach(appPage => {
    test(`should have no accessibility violations on ${appPage.name}`, async ({
      page,
      context,
      makeAxeBuilder,
    }, testInfo) => {
      const url = `${baseUrl}${appPage.url}`;
      await handleAuthentication(context, url, appPage);
      await page.goto(url);

      const accessibilityScanResults = await makeAxeBuilder().analyze();

      await testInfo.attach('accessibility-scan-results', {
        body: JSON.stringify(accessibilityScanResults, null, 2),
        contentType: 'application/json',
      });

      expect(accessibilityScanResults.violations).toEqual([]);
    });
  });
});
