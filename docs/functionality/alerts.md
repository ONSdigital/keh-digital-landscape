# Logging and Alerts

The application may encounter errors or events that require attention, including issues that the user should or should not be aware of.

For errors which are fine to be exposed to the user, the frontend can simply use `console.log() / .error() / .warn()` to log the error in the browser console, and display a user-friendly message in the UI.

For errors which should not be exposed to the user, but still require attention from the development team, the frontend has functionality to send logs and alerts to the backend.
The backend can then log these messages to allow the development team to monitor and troubleshoot issues, and for critical errors, the backend can post an alert to a specified Microsoft Teams channel to notify the team immediately.

## Setup / Environment Variables

To enable this functionality, the following environment variables need to be set in the frontend:

- `VITE_BACKEND_URL`: The base URL of the backend API (e.g., `http://localhost:5001` for local development)
- `VITE_ALERTS_CHANNEL_ID`: The ID of the Microsoft Teams channel where critical alerts should be sent.

The following environment variables need to be set in the backend:

- `AZURE_TENANT_ID`
- `AZURE_CLIENT_ID`
- `AZURE_CLIENT_SECRET`
- `WEBHOOK_SCOPE`
- `WEBHOOK_URL` (the URL of the Azure webhook endpoint)
- `CHANNEL_ID`

More information on setting up alerts can be found in the README at the root of the project. See the Alerts (Azure Webhook) section within "Running the Project" for more details.

## Frontend

The frontend has two main functions for sending logs and alerts:

- `sendAlert`: This function sends an alert to the backend, which will then post it to the specified Teams channel. This should be used for critical errors that require immediate attention.
- `sendLog`: This function sends a log message to the backend to be recorded. This should be used for non-critical errors or events that do not require immediate attention.

This functionality can be captured within the `Alerts` component (`frontend/src/components/Alerts/Alerts.js`), which provides these functions for use throughout the frontend codebase.

### Send Alert

#### Alert Parameters

- `statusInfo`: A brief summary of the error status (string)
- `errorInfo`: The error message or event that occurred (string)
- `moreInfo`: Additional context or description of the error to help with troubleshooting (string)

#### Alert Usage Example

```javascript
import { sendAlert } from '../components/Alerts/Alerts';

// Example of sending an alert for a critical error
try {
  // Some code that may throw an error
} catch (error) {
  sendAlert(
    'Critical Error',
    error.message,
    'Additional context about the error'
  );
}
```

### Send Log

#### Log Parameters

- `logType`: The type or category of the log (i.e., 'error', 'warning', 'info') (string)
  - This parameter directly indicates which logging method is used in the backend (i.e., `logger.error()`, `logger.warn()`, `logger.info()`).
- `statusInfo`: A brief summary of the log status (string)
- `errorInfo`: The error message or event that occurred (string)
- `moreInfo`: Additional context or description of the log to help with troubleshooting (string)

#### Log Usage Example

```javascript
import { sendLog } from '../components/Alerts/Alerts';

// Example of sending a log for a non-critical error
try {
  // Some code that may throw an error
} catch (error) {
  sendLog(
    'error',
    'Non-Critical Error',
    error.message,
    'Additional context about the error'
  );
}
```

## Backend

For the backend, we use the `postToWebhook` function for sending teams alerts. The function works similarly to the `sendAlert` function in the frontend and is used after a log has been sent. For logging we simply use `logger.error` when reporting errors.

The functionality for `postToWebhook` can be found in `backend/src/services/alertService.js` and the logger can be found in `backend/src/config/logger.js`.

### Sending logs and alerts.

Teams alerts should be sent out after an error has been logged. This is usually done on services that would be deemed critical. For instance, a good chunk of Digital Landscape's functionality would be rendered unusable if the S3 service were broken, and it would make sense to have an alert present in the event that happens.

### Example

```javascript
const logger = require('../config/logger');
const postToWebhook = require('./alertService');

try {
  // Some code that may throw an error
} catch (error) {
    logger.error(`<summary of error message here>:`, {
      error: error.message,
    });
    postToWebhook({
        channel: process.env.CHANNEL_ID,
        message: `<b>🚨 Digital Landscape Error 🚨</b><br> <summary of error message here>: ${error.message}`,
      })
        .then(result => logger.info('Success:', result))
        .catch(err => logger.error('Failed:', err.message));
      throw error;
}
```

#### postToWebhook parameters

`postToWebhook` takes a single JSON structure that takes the following keys:

- `channel`: This is the Teams channel where the alerts will be sent. Usually this will be defined in the `.env` file and so the channel will almost always be set to `process.env.CHANNEL_ID`.
- `message`: The actual error message from the code that failed in the `try` block.




