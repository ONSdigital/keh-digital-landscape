/**
 * Sends an alert to the backend to be posted in the specified Teams channel.
 * This should be used carefully and only for critical errors that require immediate attention, as it will trigger a notification in Teams.
 * @param {string} statusInfo - A brief summary of the error status
 * @param {string} errorInfo - The error message or event that occurred
 * @param {string} moreInfo - Additional context or description of the error to help with troubleshooting.
 */
const sendAlert = async (statusInfo, errorInfo, moreInfo) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL || '';
  const baseUrl = `${backendUrl}/alerts/api/alert`;
  const payload = {
    channel: import.meta.env.VITE_ALERTS_CHANNEL_ID,
    message: `
        <b>🚨 Digital Landscape Error 🚨</b><br>    
        status: ${statusInfo}, <br>
        event: ${errorInfo}, <br>
        description: ${moreInfo} <br>
        `,
  };
  const resp = await fetch(baseUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Error sending alert: ${text}`);
  }
};

/**
 * Sends a log message to the backend to be recorded.
 * This should be used for non-critical errors or events that do not require immediate attention.
 * @param {string} logType - The type or category of the log (i.e., 'error', 'warning', 'info')
 * @param {string} statusInfo - A brief summary of the log status
 * @param {string} errorInfo - The error message or event that occurred
 * @param {string} moreInfo - Additional context or description of the log to help with troubleshooting.
 */
const sendLog = async (logType, statusInfo, errorInfo, moreInfo) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL || '';
  const baseUrl = `${backendUrl}/alerts/api/log`;
  const payload = {
    type: logType,
    status: statusInfo,
    event: errorInfo,
    description: moreInfo,
  };

  if (!['error', 'warning', 'info'].includes(logType)) {
    throw new Error(
      `Invalid log type: ${logType}. Must be one of 'error', 'warning', or 'info'.`
    );
  }

  const resp = await fetch(baseUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Error sending log: ${text}`);
  }
};

export default sendAlert;
export { sendAlert, sendLog };
