# Custom Fetch Utility

The `customFetch` utility provides a wrapper around the native `fetch` API, adding enhanced error handling and toast notifications for a consistent user experience across the application.

## Core Functionality

The utility exports a primary function and uses an internal helper:

### extractErrorMessage (internal)

An async helper that extracts a human-readable error message from a failed response. It handles:

1. JSON responses (identified via `Content-Type: application/json`) — returns `error` or `message` field.
2. Plain text or ambiguous responses — attempts `JSON.parse`; if that succeeds returns `error` or `message`, otherwise returns the raw text.
3. Any parse failure — returns an empty string so the caller can fall back to a generic status message.

### customFetch

```javascript
const customFetch = async (url, options) => {
  // Implementation details
};
```

This function:

1. Constructs the full API endpoint URL, prepending a backend URL if available.
2. Executes the `fetch` request with the given URL and options.
3. Checks for `response.ok` to determine if the request was successful.
4. If the response is not OK, calls `extractErrorMessage` to parse the body into a user-facing string.
5. Displays a custom `ErrorToast` notification with the extracted message, falling back to `"Request failed with status <code>"`.
6. Re-throws the error to allow calling functions to handle it further if necessary.

## Implementation Details

```javascript
import toast from 'react-hot-toast';
import ErrorToast from '../components/Toast/ErrorToast';

const extractErrorMessage = async response => {
  const contentType = response.headers.get('Content-Type') || '';

  try {
    if (contentType.includes('application/json')) {
      const data = await response.json();
      return data?.error || data?.message || '';
    }

    const text = await response.text();

    if (!text) {
      return '';
    }

    try {
      const data = JSON.parse(text);
      return data?.error || data?.message || text;
    } catch (_) {
      return text;
    }
  } catch (_) {
    return '';
  }
};

const customFetch = async (url, options) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL || '';
  const response = await fetch(backendUrl + url, options);

  if (!response.ok) {
    const extractedErrorMessage = await extractErrorMessage(response);
    const errorMessage =
      extractedErrorMessage || `Request failed with status ${response.status}`;

    toast.custom(t => <ErrorToast t={t} error={errorMessage} />, {
      duration: 10000,
    });

    // Re-throw the error to be caught by the calling function if needed
    throw new Error(errorMessage);
  }

  return response;
};

export default customFetch;
```

## Example Usage in `getUser.js`

The `customFetch` utility is used throughout the application for making API requests. Below is an example from `frontend/src/utilities/getUser.js`, demonstrating its use for handling user logout:

```javascript
// ... existing code ...
    try {
      const response = await customFetch('/user/api/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ logout_uri: window.location.origin }),
      });
// ... existing code ...
```

In this example, `customFetch` is used to send a POST request to the `/user/api/logout` endpoint. Any network errors or non-OK HTTP responses will be automatically handled by `customFetch`, displaying a toast notification to the user and re-throwing the error for local handling if needed.
