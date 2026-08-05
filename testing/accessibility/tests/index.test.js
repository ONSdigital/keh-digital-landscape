// Get Axe fixture
const { test, expect } = require('../axe-test');

// Get test.config.js
const config = require('../test.config.js');
const pages = config.pages;

// Define base URL
const baseUrl = 'http://localhost:3000';

/**
 * Extracts useful diagnostics from Vite's error overlay, including shadow DOM text.
 *
 * @param {import('@playwright/test').Page} page
 * @returns {Promise<Object|null>}
 */
const getViteOverlayDiagnostics = async page => {
  return page.evaluate(() => {
    const overlay = document.querySelector('vite-error-overlay');
    if (!overlay) {
      return null;
    }

    const shadow = overlay.shadowRoot;
    if (!shadow) {
      return {
        hasOverlay: true,
        hasShadowRoot: false,
        text: (overlay.textContent || '').trim(),
      };
    }

    const message =
      shadow.querySelector('h1, h2, .title, .message')?.textContent?.trim() ||
      '';
    const stack =
      shadow.querySelector('.stack, pre, code')?.textContent?.trim() || '';

    return {
      hasOverlay: true,
      hasShadowRoot: true,
      message,
      stack,
      text: (shadow.textContent || '').trim(),
      html: shadow.innerHTML,
    };
  });
};

/**
 * Attaches page diagnostics to test artifacts for CI triage.
 *
 * @param {import('@playwright/test').Page} page
 * @param {import('@playwright/test').TestInfo} testInfo
 * @param {Object} diagnostics
 * @returns {Promise<void>}
 */
const attachDiagnostics = async (page, testInfo, diagnostics) => {
  await testInfo.attach('page-diagnostics', {
    body: JSON.stringify(diagnostics, null, 2),
    contentType: 'application/json',
  });

  await testInfo.attach('page-html', {
    body: await page.content(),
    contentType: 'text/html',
  });

  await testInfo.attach('page-screenshot', {
    body: await page.screenshot({ fullPage: true }),
    contentType: 'image/png',
  });
};

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
      // Collect console errors, page errors, failed requests, and failed responses for diagnostics
      const consoleErrors = [];
      const pageErrors = [];
      const failedRequests = [];
      const failedResponses = [];

      page.on('console', message => {
        if (message.type() === 'error') {
          consoleErrors.push(message.text());
        }
      });

      page.on('pageerror', error => {
        pageErrors.push(error.message);
      });

      page.on('requestfailed', request => {
        failedRequests.push({
          url: request.url(),
          method: request.method(),
          failure: request.failure()?.errorText || 'unknown',
        });
      });

      page.on('response', response => {
        if (response.status() >= 400) {
          failedResponses.push({
            url: response.url(),
            status: response.status(),
            statusText: response.statusText(),
          });
        }
      });

      const url = `${baseUrl}${appPage.url}`;
      await handleAuthentication(context, url, appPage);
      await page.goto(url);

      // Wait for the page to load completely
      await page.waitForLoadState('networkidle');

      // Detect Vite runtime overlays and attach diagnostics immediately.
      const overlayCount = await page.locator('vite-error-overlay').count();
      if (overlayCount > 0) {
        const overlayDiagnostics = await getViteOverlayDiagnostics(page);
        const diagnostics = {
          url,
          overlayDiagnostics,
          pageErrors,
          consoleErrors,
          failedRequests,
          failedResponses,
        };

        console.error(
          `Vite overlay detected for ${url}. Diagnostics:\n${JSON.stringify(diagnostics, null, 2)}`
        );

        await attachDiagnostics(page, testInfo, diagnostics);
        throw new Error(`Vite error overlay detected for ${url}`);
      }

      const accessibilityScanResults = await makeAxeBuilder().analyze();

      await testInfo.attach('accessibility-scan-results', {
        body: JSON.stringify(accessibilityScanResults, null, 2),
        contentType: 'application/json',
      });

      expect(accessibilityScanResults.violations).toEqual([]);
    });
  });
});
