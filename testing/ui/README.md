# UI Tests

The UI tests are written using [Playwright](https://playwright.dev/). These tests are designed to verify the application's user interface and user flows.

## Contents

- [UI Tests](#ui-tests)
  - [Contents](#contents)
  - [Test Structure](#test-structure)
  - [Test Coverage](#test-coverage)
  - [Running the Tests](#running-the-tests)

## Test Structure

- **Test Files:**  
  All UI test scripts are located in the `/tests` directory. Each file typically targets a specific feature or page (e.g., `review.test.js`, `search.test.js`).

- **Test Data:**  
  Test data used by the UI tests is stored in the `tests/data` directory. This data is loaded and used to mock API responses, ensuring tests are deterministic and not dependent on live backend data.

- **Mocking API Calls:**  
  Playwright’s [`route.fulfill`](https://playwright.dev/docs/network#handle-requests) function is used to intercept and mock API requests. This allows the tests to simulate various backend responses and edge cases without requiring changes to the backend or test environment.

- **Test Configuration:**  
  The `test-config.json` file defines which routes require authentication and other test-specific settings. Routes that require authentication are marked with `"authenticated": "githubUserToken"`.

- **Reports:**  
  After running the tests, reports are generated in the `/reports/{timestamp}` directory. These include both JSON and human-readable HTML/Markdown summaries.

## Test Coverage

To see the coverage of the UI tests, please refer to the MkDocs documentation (See: [`testing > frontend`](../../docs/testing/ui.md)) which includes detailed information on the specific tests implemented and their coverage across the application.

## Running the Tests

Before running the tests, ensure that the application is running locally.

Move into the `testing/ui` directory:

```bash
cd testing/ui
```

Install the dependencies:

```bash
make setup
```

Run the following to execute the tests:

```bash
make test-ui
```

Additional commands such as running specific test files or running in headed mode can be found in the MkDocs documentation (See: [`testing > frontend`](../../docs/testing/playwright.md)).
