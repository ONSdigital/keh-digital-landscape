# Playwright

Sometimes, it can be useful to run Playwright commands manually to debug tests. Here are some useful commands:

```bash
npx playwright test <test-file> # Run a specific test file
npx playwright test <test-file> --headed # Run tests with a visible browser window
```

Additionally, you can add `await page.pause();` in your test code to pause execution and open the Playwright Inspector, allowing you to step through the test interactively.
This can be particularly helpful for debugging, understanding the flow of your tests and verifying that they check what you expect.
