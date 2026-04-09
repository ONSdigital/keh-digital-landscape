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
  sendAlert('Critical Error', error.message, 'Additional context about the error');
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
  sendLog('error', 'Non-Critical Error', error.message, 'Additional context about the error');
}
```
