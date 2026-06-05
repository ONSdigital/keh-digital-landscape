// This tests banner functionality across the tool, including:
// - Making banners via the admin page
// - How the banners display on specific pages

import { test, expect } from 'playwright/test';

// This variable will hold the current banners in memory for the purpose of testing.
// Instead of the backend doing anything, we will mock it to push to/from this variable.
var banners = {
  messages: [],
};

// Mock the backend API calls to get and set banners
test.beforeEach(async ({ page }) => {
  await test.step('Mock backend API calls', async () => {
    // Mock the GET request to fetch existing banners
    await page.route('**/admin/api/banners', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(banners),
      });
    });

    // Mock the POST request to update banners
    await page.route('**/admin/api/banners/update', async route => {
      const requestBody = await route.request().postData();
      const { banner } = JSON.parse(requestBody);
      banners.messages.push(banner); // Add the new banner to our in-memory variable

      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Banner added successfully' }),
      });
    });

    // Mock the POST request to toggle banner visibility
    await page.route('**/admin/api/banners/toggle', async route => {
      const requestBody = await route.request().postData();
      const { index, show } = JSON.parse(requestBody);

      if (index === undefined || show === undefined) {
        route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Invalid banner index or show value' }),
        });
        return;
      }

      if (index < 0 || index >= banners.messages.length) {
        route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Banner index out of range' }),
        });
        return;
      }

      banners.messages[index].show = show; // Update the show property of the specified banner

      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          message: 'Banner visibility updated successfully',
        }),
      });
    });

    // Mock the POST request to delete a banner
    await page.route('**/admin/api/banners/delete', async route => {
      const requestBody = await route.request().postData();
      const { index } = JSON.parse(requestBody);

      if (index === undefined) {
        route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Invalid banner index' }),
        });
        return;
      }

      if (index < 0 || index >= banners.messages.length) {
        route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Banner index out of range' }),
        });
        return;
      }

      banners.messages.splice(index, 1); // Remove the specified banner from our in-memory variable

      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Banner deleted successfully' }),
      });
    });
  });

  await test.step('Reset banners variable', async () => {
    banners = { messages: [] }; // Reset the banners before each test
  });

  await test.step('Navigate to admin banners page', async () => {
    await page.goto('http://localhost:3000/admin/dashboard');
  });
});

/**
 * Fills in the banner form with the provided values.
 * @param {object} page - The Playwright page object
 * @param {object} formValues - An object containing the banner form values
 */
async function fillInBannerForm(
  page,
  formValues = { title: '', description: '', type: 'info', pages: [] }
) {
  const bannerTitle = page.locator('#banner-title-input');
  const bannerDescription = page.locator('#banner-message-input');
  const typeOption = page.locator(`#${formValues.type}-type-option`);
  const multiselectInput = page.locator('input[placeholder="Select pages..."]');

  await bannerTitle.fill(formValues.title);
  await bannerDescription.fill(formValues.description);
  await typeOption.click();
  await multiselectInput.click();

  for (const pageOption of formValues.pages) {
    await page
      .locator(`.multi-select-option:has-text("${pageOption}")`)
      .click();
  }

  // Ensure dropdown is closed before clicking save
  await page.keyboard.press('Escape');
  await expect(page.locator('#save-banner-button')).toBeEnabled();
}

test.describe('add banner', () => {
  const bannerTypes = ['info', 'warning', 'error'];

  const pageOptions = [
    { label: 'Radar', value: 'radar' },
    { label: 'Statistics', value: 'statistics' },
    { label: 'Projects', value: 'projects' },
    { label: 'Copilot Team', value: 'copilot/team' },
    { label: 'Copilot Org', value: 'copilot/org' },
    { label: 'Address Book', value: 'addressbook' },
  ];

  for (const type of bannerTypes) {
    test(`should add a ${type} banner and get shown in existing banners list`, async ({
      page,
    }) => {
      const bannerData = {
        title: `Test ${type} Banner`,
        description: `This is a test ${type} banner message.`,
        type,
        pages: ['radar', 'projects'],
      };

      await fillInBannerForm(page, bannerData);
      await page.locator('#save-banner-button').click();
      await page.locator('#confirm-banner-button').click(); // Confirm the save in the modal

      // Get index of new banner from in-memory variable
      const newBannerIndex = banners.messages.length - 1;

      // Check that the new banner appears in the existing banners list with correct details
      const bannerTitleLocator = page.locator(
        `#banner-title-${newBannerIndex}`
      );
      const bannerMessageLocator = page.locator(
        `#banner-message-${newBannerIndex}`
      );
      const bannerTypeLocator = page.locator(`#banner-type-${newBannerIndex}`);
      const bannerPagesLocator = page.locator(
        `#banner-pages-${newBannerIndex}`
      );

      await expect(bannerTitleLocator).toHaveText(`Test ${type} Banner`);
      await expect(bannerMessageLocator).toHaveText(
        `This is a test ${type} banner message.`
      );
      await expect(bannerTypeLocator).toHaveText(type);
      await expect(bannerPagesLocator).toHaveText('Pages: radar, projects');
    });
  }

  for (const option of pageOptions) {
    test(`should allow selecting ${option.value} page for banner`, async ({
      page,
    }) => {
      const bannerData = {
        title: `Test Banner for ${option.label}`,
        description: `This banner is for ${option.label} page.`,
        type: 'info',
        pages: [option.label],
      };

      await fillInBannerForm(page, bannerData);
      await page.locator('#save-banner-button').click();
      await page.locator('#confirm-banner-button').click(); // Confirm the save in the modal

      // Get index of new banner from in-memory variable
      const newBannerIndex = banners.messages.length - 1;

      // Check that the new banner appears in the existing banners list with correct page
      const bannerPagesLocator = page.locator(
        `#banner-pages-${newBannerIndex}`
      );
      await expect(bannerPagesLocator).toHaveText(`Pages: ${option.value}`);
    });
  }

  test('should allow save to be cancelled in confirmation modal', async ({
    page,
  }) => {
    const bannerData = {
      title: 'Test Cancel Banner',
      description: 'This banner should not be saved.',
      type: 'warning',
      pages: ['statistics'],
    };

    await fillInBannerForm(page, bannerData);

    // Click save but then cancel in the confirmation modal
    await page.locator('#save-banner-button').click();
    await page.locator('#cancel-banner-button').click();

    // Check that the banner was not added to the in-memory variable
    expect(banners.messages).toEqual([]);
  });

  test('save button should be disabled until all required fields are filled', async ({
    page,
  }) => {
    const bannerTitle = page.locator('#banner-title-input');
    const bannerMessage = page.locator('#banner-message-input');
    const typeOption = page.locator('#info-type-option');
    const multiselectInput = page.locator(
      'input[placeholder="Select pages..."]'
    );
    const saveButton = page.locator('#save-banner-button');

    // Initially, save button should be disabled
    await expect(saveButton).toBeDisabled();

    // Fill in title and message, but not type or pages
    await bannerTitle.fill('Incomplete Banner');
    await bannerMessage.fill('This banner is missing type and pages.');
    await expect(saveButton).toBeDisabled();

    // Select type but not pages
    await typeOption.click();
    await expect(saveButton).toBeDisabled();

    // Select a page
    await multiselectInput.click();
    await page.locator('.multi-select-option:has-text("Radar")').click();
    await expect(saveButton).toBeEnabled();
  });
});

test.describe('banner type selector', () => {
  test('info type should be selected by default', async ({ page }) => {
    await expect(
      page.locator('input[aria-label="Info banner type"]')
    ).toBeChecked();
    await expect(
      page.locator('input[aria-label="Warning banner type"]')
    ).not.toBeChecked();
    await expect(
      page.locator('input[aria-label="Error banner type"]')
    ).not.toBeChecked();
    await expect(page.locator('#info-type-option')).toHaveClass(/selected/);
    await expect(page.locator('#warning-type-option')).not.toHaveClass(
      /selected/
    );
    await expect(page.locator('#error-type-option')).not.toHaveClass(
      /selected/
    );
  });

  const bannerTypes = [
    { type: 'info', ariaLabel: 'Info banner type' },
    { type: 'warning', ariaLabel: 'Warning banner type' },
    { type: 'error', ariaLabel: 'Error banner type' },
  ];

  for (const { type, ariaLabel } of bannerTypes) {
    test(`clicking ${type} type should select it and deselect others`, async ({
      page,
    }) => {
      await page.locator(`#${type}-type-option`).click();

      await expect(
        page.locator(`input[aria-label="${ariaLabel}"]`)
      ).toBeChecked();
      await expect(page.locator(`#${type}-type-option`)).toHaveClass(
        /selected/
      );

      for (const {
        type: otherType,
        ariaLabel: otherAriaLabel,
      } of bannerTypes.filter(t => t.type !== type)) {
        await expect(
          page.locator(`input[aria-label="${otherAriaLabel}"]`)
        ).not.toBeChecked();
        await expect(page.locator(`#${otherType}-type-option`)).not.toHaveClass(
          /selected/
        );
      }
    });
  }

  test('selecting a type should be reflected in the saved banner', async ({
    page,
  }) => {
    const bannerData = {
      title: 'Type Test Banner',
      description: 'Testing banner type selection.',
      type: 'warning',
      pages: ['radar'],
    };

    await fillInBannerForm(page, bannerData);
    await page.locator('#save-banner-button').click();
    await page.locator('#confirm-banner-button').click();

    const newBannerIndex = banners.messages.length - 1;
    const bannerTypeLocator = page.locator(`#banner-type-${newBannerIndex}`);

    await expect(bannerTypeLocator).toHaveText('warning');
  });
});

test.describe('banner actions', () => {
  test('hide button should hide banner on specified pages', async ({
    page,
  }) => {
    // First, add a banner that is shown on the radar page
    const bannerData = {
      title: 'Hide Test Banner',
      description: 'This banner will be hidden on radar page.',
      type: 'info',
      pages: ['radar'],
    };

    await fillInBannerForm(page, bannerData);
    await page.locator('#save-banner-button').click();
    await page.locator('#confirm-banner-button').click(); // Confirm the save in the modal

    // Wait for the modal to disappear before proceeding
    await expect(page.locator('#confirm-banner-button')).toBeHidden();

    // Get index of new banner from in-memory variable
    const newBannerIndex = banners.messages.length - 1;

    // Scroll to the banner to ensure the delete button is visible
    const bannerLocator = page.locator(`#banner-${newBannerIndex}`);
    await bannerLocator.scrollIntoViewIfNeeded();

    // Click the toggle button to hide the banner
    const toggleButton = page.locator(`#toggle-banner-${newBannerIndex}`);
    await toggleButton.click();

    // Check that the banner's show property is now false in the in-memory variable
    expect(banners.messages[newBannerIndex].show).toBe(false);

    // Click the toggle button again to show the banner
    await toggleButton.click();

    // Check that the banner's show property is now true in the in-memory variable
    expect(banners.messages[newBannerIndex].show).toBe(true);
  });

  test('delete button should remove banner from specified pages', async ({
    page,
  }) => {
    // First, add a banner that is shown on the radar page
    const bannerData = {
      title: 'Delete Test Banner',
      description: 'This banner will be deleted.',
      type: 'warning',
      pages: ['radar'],
    };

    await fillInBannerForm(page, bannerData);
    await page.locator('#save-banner-button').click();
    await page.locator('#confirm-banner-button').click(); // Confirm the save in the modal

    // Wait for the modal to disappear before proceeding
    await expect(page.locator('#confirm-banner-button')).toBeHidden();

    // Get index of new banner from in-memory variable
    const newBannerIndex = banners.messages.length - 1;

    // Scroll to the banner to ensure the delete button is visible
    const bannerLocator = page.locator(`#banner-${newBannerIndex}`);
    await bannerLocator.scrollIntoViewIfNeeded();

    // Click the delete button to remove the banner
    const deleteButton = page.locator(`#delete-banner-${newBannerIndex}`);
    await deleteButton.click();

    // Check that the banner has been removed from the in-memory variable
    expect(banners.messages[newBannerIndex]).toBeUndefined();
  });

  test('deleting a banner should persist the remaining banners', async ({
    page,
  }) => {
    // Add two banners
    const bannerData1 = {
      title: 'Banner 1',
      description: 'First banner.',
      type: 'info',
      pages: ['radar'],
    };
    const bannerData2 = {
      title: 'Banner 2',
      description: 'Second banner.',
      type: 'warning',
      pages: ['projects'],
    };

    await fillInBannerForm(page, bannerData1);
    await page.locator('#save-banner-button').click();
    await page.locator('#confirm-banner-button').click();

    // Wait for the first banner to be added before adding the second banner
    await expect(page.locator('#confirm-banner-button')).toBeHidden();

    await fillInBannerForm(page, bannerData2);
    await page.locator('#save-banner-button').click();
    await page.locator('#confirm-banner-button').click();

    // Wait for the second banner to be added before proceeding
    await expect(page.locator('#confirm-banner-button')).toBeHidden();

    // Get index of second banner from in-memory variable
    const secondBannerIndex = banners.messages.length - 1;

    // Scroll to the banner to ensure the delete button is visible
    const bannerLocator = page.locator(`#banner-${secondBannerIndex}`);
    await bannerLocator.scrollIntoViewIfNeeded();

    // Delete the first banner
    const deleteButton = page.locator(`#delete-banner-0`);
    await deleteButton.click();

    // Check that the second banner still exists in the in-memory variable
    expect(banners.messages[secondBannerIndex - 1]).toEqual({
      description: 'Second banner.',
      pages: ['projects'],
      show: true,
      type: 'warning',
      title: 'Banner 2',
    });
  });
});
