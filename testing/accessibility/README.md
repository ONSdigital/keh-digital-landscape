# Accessibility Tests

Accessibility tests are run using [Playwright](https://playwright.dev/docs/accessibility-testing) which makes use of [Axe Core](https://www.deque.com/axe/). These tests are designed to identify and report accessibility issues in the application, ensuring that it meets accessibility standards and provides an inclusive experience for all users.

Tests follow the WCAG 2.0 and 2.1 guidelines.

## Contents

- [Accessibility Tests](#accessibility-tests)
  - [Contents](#contents)
  - [Test Structure](#test-structure)
  - [Test Coverage](#test-coverage)
  - [Running the Tests](#running-the-tests)
  - [Testing Authenticated Routes](#testing-authenticated-routes)
    - [Marking Authenticated Routes](#marking-authenticated-routes)
  - [Axe DevTools](#axe-devtools)

## Test Structure

The Axe Core tests are available in the `/tests` directory, where `index.test.js` applies the Axe Core testing to the defined pages.
The pages to be tested are defined in `test.config.js`. Each page is defined with a `name` and `url` property, and optionally an `authenticated` property for routes that require authentication.

For example:

```json
{
  "pages": [
    {
      "name": "Homepage",
      "url": "/",
      "authentication": []
    },
    {
      "name": "Tech Radar",
      "url": "/radar",
      "authentication": []
    },
    {
      "name": "GitHub Copilot Team Usage",
      "url": "/copilot/team",
      "authentication": ["githubUserToken"]
    }
  ]
}
```

The test make use of a fixture (`axe-test.js`) to set up the Axe Builder with the appropriate tags and exclusions. This allows for consistent testing across all defined pages.

Currently, only `wcag2a`, `wcag2aa`, `wcag21a`, and `wcag21aa` tags are included in the tests, which cover a wide range of accessibility issues. However, additional tags can be added to the Axe Builder configuration as needed.

## Test Coverage

Axe-core tests are enabled for the following pages:

- Homepage (`/`)
- Tech Radar (`/radar`)
- Statistics (`/statistics`)
- Projects (`/projects`)
- GitHub Copilot:
  - Organisation Usage (`/copilot/org/historic`)
  - Team Usage (`/copilot/team`) - requires authentication
- GitHub Address Book (`/addressbook`)
- Review Dashboard (`/review/dashboard`)
- Admin Dashboard (`/admin/dashboard`)

As mentioned above, additional pages can be added to `test.config.js` to expand the test coverage as needed.
Also, additional Axe Core tags can be included in the tests by modifying the Axe Builder configuration in `axe-test.js`.

## Running the Tests

Before running the tests, ensure that the application is running locally.

Install the dependencies:

```bash
make setup
```

Run the following to execute the tests:

```bash
make test-accessibility
```

Additional commands such as running specific test files or running in headed mode can be found in the MkDocs documentation (See: [`testing > frontend`](../../docs/testing/playwright.md)).

## Testing Authenticated Routes

Some routes require authentication (like `/copilot/team`). For these routes, you need to provide a GitHub token as an environment variable.

To get this token, follow these steps:

1. Go to the GitHub Copilot team page:

   ```http
   http://localhost:3000/copilot/team
   ```

2. Click the "Login with GitHub" button.
3. You will be redirected to the GitHub login page. Login with your GitHub account.
4. You will be redirected back to the GitHub Copilot team page.
5. Open Chrome DevTools and navigate to the "Application" tab.
6. Under "Cookies", find the "githubUserToken" cookie.
7. Copy the `value` of the cookie, beginning with `ghu_`.
8. Set the environment variable before running tests:

   ```bash
   export TEST_GITHUBUSERTOKEN="your-generated-token"
   export TEST_GITHUBTEAM="your-team-slug"
   ```

   Alternatively, you can create a `.env` file in the `testing/axe-core` directory with:

   ```bash
   TEST_GITHUBUSERTOKEN=your-generated-token
   TEST_GITHUBTEAM=your-team-slug
   ```

   **Note:** An example is available in `.env.example`.

9. Finally, run the tests:

   ```bash
   make test-accessibility
   ```

**Note:** If the environment variable is not set, the tests will output a warning.

### Marking Authenticated Routes

Routes that require authentication are marked with `"authentication": ["githubUserToken"]` in `test.config.js`. This ensures that the tests will include the necessary authentication token when accessing these routes.

## Axe DevTools

In addition to running axe-core tests through the command line, you can also use the Axe DevTools Chrome extension for manual testing and debugging of accessibility issues.

This can be found here: https://chrome.google.com/webstore/detail/axe-devtools-web-accessib/lhdoppojpmngadmnindnejefpokejbdd
