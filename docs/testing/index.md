# Testing

## Testing Structure

The Digital Landscape uses the following for testing:

- Vitest (Frontend and Backend unit tests)
- Playwright (UI tests)
- Axe Core (via Playwright for accessibility tests)

### Unit Tests

Unit tests are written using [Vitest](https://vitest.dev/). These tests are designed to verify the functionality of individual components and functions in both the frontend and backend.

Unit tests are located in the `src` directory, alongside the code they are testing. Test files are named with a `.test.js` suffix (e.g., `component.test.js`).

A common pattern you will see:

```bash
frontend
├── src
│   ├── components
│   │   ├── MyComponent.js
│   │   └── MyComponent.test.js
│   └── utils
│       ├── myUtil.js
│       └── myUtil.test.js
backend
├── src
│   ├── services
│   │   ├── myService.js
│   │   └── myService.test.js
│   └── utils
│       ├── myUtil.js
│       └── myUtil.test.js
```

Having tests located alongside the code they test gives the following benefits:

- **Context:** Tests are close to the code they are testing, making it easier to understand the context and purpose of the tests.
- **Maintenance:** When code is updated, it's easier to find and update the corresponding tests.
- **Organisation:** It keeps the project organised by feature or component, rather than having a separate test directory that may become cluttered.
- **Testing Gaps:** It makes it easy to identify areas of the codebase that are not covered by tests, as you can see at a glance which files have corresponding test files.

Instructions for running unit tests can be found within the repository's main README file at the root of the project.

### UI Tests

UI tests are written using [Playwright](https://playwright.dev/). These tests are designed to verify the application's user interface and user flows.
These also test the functionality of the application as a whole, including the backend, and are therefore considered end-to-end tests (sort of).

Tests can be found within the `testing/ui` directory, with instructions for running the tests and details on the test structure available in the `README.md` file.
This README also includes information on the coverage of the UI tests (i.e. which pages / features are currently tested).

### Accessibility Tests

Accessibility tests are run using [Playwright](https://playwright.dev/docs/accessibility-testing) which makes use of [Axe Core](https://www.deque.com/axe/). These tests are designed to identify and report accessibility issues in the application, ensuring that it meets accessibility standards and provides an inclusive experience for all users.

Tests can be found within the `testing/accessibility` directory, with instructions for running the tests and details on the test structure available in the `README.md` file.
This README also includes information on the coverage of the accessibility tests, which pages are currently tested, how authenticated routes are tested, and what standards the tests follow.

## Playwright Usage

Additional information on using Playwright for both UI and accessibility tests can be found in the respective documentation (See: [`testing > playwright`](./playwright.md)).
This can be useful when debugging or writing new tests, as it includes information on running tests in headed mode and running specific test files.

## Testing in CI (GitHub Actions)

All tests are run in the CI pipeline on GitHub Actions. This ensures that tests are run consistently and that any issues are identified early in the development process.

For more information on the use of GitHub Actions for testing, please refer to the repository's main README file at the root of the project.
