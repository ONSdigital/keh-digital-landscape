# This script file is used to run Playwright tests
# It simply identifies each test in the `./tests` directory and runs them one by one
# This helps reduce flakiness in CI environments where tests intermittently fail due to timeouts

#!/bin/bash
set -e
TESTS_DIR="./tests"

for test_file in "$TESTS_DIR"/*.test.js; do
  echo "Running test: $test_file"
  npx playwright test "$test_file"
done