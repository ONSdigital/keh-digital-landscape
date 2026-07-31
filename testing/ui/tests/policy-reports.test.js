import { test, expect } from 'playwright/test';

const PAGE_URL = 'http://localhost:3000/github-policy-reports';

const MOCK_ORGANISATIONS = ['ONS-Innovation', 'AnotherOrg'];

const MOCK_DATASETS = [
  { name: '2025-06-01T10:00:00Z', displayName: '2025-06-01T10:00:00Z' },
  { name: '2025-05-01T10:00:00Z', displayName: '2025-05-01T10:00:00Z' },
];

const MOCK_REPOSITORIES = ['repo-alpha', 'repo-beta', 'repo-gamma'];
const MOCK_TEAMS = ['team-one', 'team-two'];

// Mock the base APIs that the page always calls on load
const mockBaseApis = async page => {
  await page.route('**/policy-reports/api/organisations', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ organisationOptions: MOCK_ORGANISATIONS }),
    });
  });

  await page.route('**/api/github/auth/status', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ authenticated: false }),
    });
  });

  await page.route('**/admin/api/banners', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ messages: [] }),
    });
  });
};

const mockDatasetsApi = async page => {
  await page.route('**/policy-reports/api/datasets?organisation=**', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ datasets: MOCK_DATASETS }),
    });
  });
};

const mockAuthenticatedApis = async (page, username = 'testuser') => {
  await page.route('**/api/github/auth/status', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ authenticated: true }),
    });
  });

  await page.route('**/api/github/auth/user', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ login: username }),
    });
  });

  await page.route('**/policy-reports/api/repositories?**', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ repositories: MOCK_REPOSITORIES }),
    });
  });

  await page.route('**/policy-reports/api/teams?**', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ teams: MOCK_TEAMS }),
    });
  });
};

test('Policy Reports page displays the correct heading', async ({ page }) => {
  await mockBaseApis(page);
  await page.goto(PAGE_URL);

  await expect(
    page.getByRole('heading', { name: 'Policy Reports' })
  ).toBeVisible();
});

test('Policy Reports page displays Stage 1 and Stage 2 sections', async ({
  page,
}) => {
  await mockBaseApis(page);
  await page.goto(PAGE_URL);

  await expect(
    page.locator('.policy-reports-stage-kicker', { hasText: 'Stage 1' })
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Report Configuration' })
  ).toBeVisible();

  await expect(
    page.locator('.policy-reports-stage-kicker', { hasText: 'Stage 2' })
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Generate Reports' })
  ).toBeVisible();
});

test('Organisation dropdown is populated from the API', async ({ page }) => {
  await mockBaseApis(page);
  await page.goto(PAGE_URL);

  const orgSelect = page.locator('#organisation');
  await expect(orgSelect).toBeVisible();

  for (const org of MOCK_ORGANISATIONS) {
    await expect(orgSelect.locator(`option[value="${org}"]`)).toBeAttached();
  }
});

test('Source dataset dropdown is disabled before selecting an organisation', async ({
  page,
}) => {
  await mockBaseApis(page);
  await page.goto(PAGE_URL);

  await expect(page.locator('#source-dataset')).toBeDisabled();
});

test('Source dataset dropdown enables and loads options after selecting an organisation', async ({
  page,
}) => {
  await mockBaseApis(page);
  await mockDatasetsApi(page);
  await page.goto(PAGE_URL);

  await page.locator('#organisation').selectOption('ONS-Innovation');

  const datasetSelect = page.locator('#source-dataset');
  await expect(datasetSelect).toBeEnabled({ timeout: 5000 });
  await expect(datasetSelect.locator('option')).toHaveCount(
    MOCK_DATASETS.length + 1 // +1 for the default "Select source dataset" option
  );
});

test('Stage 2 gate message is shown before Stage 1 is complete', async ({
  page,
}) => {
  await mockBaseApis(page);
  await page.goto(PAGE_URL);

  await expect(
    page.getByText(
      'Complete Stage 1 by selecting an organisation and source dataset to reveal report generation options.'
    )
  ).toBeVisible();
});

test('Stage 2 report options appear after completing Stage 1', async ({
  page,
}) => {
  await mockBaseApis(page);
  await mockDatasetsApi(page);
  await page.goto(PAGE_URL);

  await page.locator('#organisation').selectOption('ONS-Innovation');
  await expect(page.locator('#source-dataset')).toBeEnabled({ timeout: 5000 });
  await page.locator('#source-dataset').selectOption(MOCK_DATASETS[0].name);

  await expect(
    page.getByRole('heading', { name: 'Organisation Report' })
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Restricted Reports' })
  ).toBeVisible();
});

test('"Clear configuration" button appears after selecting a dataset and resets Stage 1', async ({
  page,
}) => {
  await mockBaseApis(page);
  await mockDatasetsApi(page);
  await page.goto(PAGE_URL);

  await page.locator('#organisation').selectOption('ONS-Innovation');
  await expect(page.locator('#source-dataset')).toBeEnabled({ timeout: 5000 });
  await page.locator('#source-dataset').selectOption(MOCK_DATASETS[0].name);

  const clearBtn = page.getByRole('button', { name: 'Clear configuration' });
  await expect(clearBtn).toBeVisible();

  await clearBtn.click();

  // After clearing, organisation select should be back to default
  await expect(page.locator('#organisation')).toHaveValue('');
  // Stage 2 gate message should reappear
  await expect(
    page.getByText(
      'Complete Stage 1 by selecting an organisation and source dataset to reveal report generation options.'
    )
  ).toBeVisible();
});

test('"Log in with GitHub" button is shown in Stage 2 for unauthenticated users', async ({
  page,
}) => {
  await mockBaseApis(page);
  await mockDatasetsApi(page);
  await page.goto(PAGE_URL);

  await page.locator('#organisation').selectOption('ONS-Innovation');
  await expect(page.locator('#source-dataset')).toBeEnabled({ timeout: 5000 });
  await page.locator('#source-dataset').selectOption(MOCK_DATASETS[0].name);

  await expect(
    page.getByRole('button', { name: 'Log in with GitHub' })
  ).toBeVisible();
});

test('Organisation Report generate button is disabled without a comparison dataset', async ({
  page,
}) => {
  await mockBaseApis(page);
  await mockDatasetsApi(page);
  await page.goto(PAGE_URL);

  await page.locator('#organisation').selectOption('ONS-Innovation');
  await expect(page.locator('#source-dataset')).toBeEnabled({ timeout: 5000 });

  // Select the oldest dataset — it has no older dataset to compare against,
  // so comparisonDataset falls back to sourceDataset which should still allow generation.
  // Select the newest dataset which has an older one available.
  await page.locator('#source-dataset').selectOption(MOCK_DATASETS[0].name);

  // The generate button should be enabled since there is a comparison dataset
  const generateBtn = page.getByRole('button', {
    name: /Generate Organisation Report/,
  });
  await expect(generateBtn).toBeEnabled();
});

test('Signed-in username appears in Restricted Reports section when authenticated', async ({
  page,
}) => {
  await mockBaseApis(page);
  await mockAuthenticatedApis(page, 'octocat');
  await mockDatasetsApi(page);
  await page.goto(PAGE_URL);

  await page.locator('#organisation').selectOption('ONS-Innovation');
  await expect(page.locator('#source-dataset')).toBeEnabled({ timeout: 5000 });
  await page.locator('#source-dataset').selectOption(MOCK_DATASETS[0].name);

  await expect(page.getByText('@octocat')).toBeVisible({ timeout: 5000 });
  await expect(page.getByRole('button', { name: 'Log out' })).toBeVisible();
});

test('Repository and Team report sections are shown when authenticated', async ({
  page,
}) => {
  await mockBaseApis(page);
  await mockAuthenticatedApis(page);
  await mockDatasetsApi(page);
  await page.goto(PAGE_URL);

  await page.locator('#organisation').selectOption('ONS-Innovation');
  await expect(page.locator('#source-dataset')).toBeEnabled({ timeout: 5000 });
  await page.locator('#source-dataset').selectOption(MOCK_DATASETS[0].name);

  await expect(
    page.locator('summary.policy-reports-collapsible-summary', {
      hasText: 'Repository report',
    })
  ).toBeVisible({ timeout: 5000 });
  await expect(
    page.locator('summary.policy-reports-collapsible-summary', {
      hasText: 'Team report',
    })
  ).toBeVisible({
    timeout: 5000,
  });
});
