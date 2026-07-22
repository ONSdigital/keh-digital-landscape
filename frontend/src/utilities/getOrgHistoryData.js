import customFetch from './customFetch';

/**
 * Fetches organisation history data from the backend (S3-backed).
 * @returns {Promise<Array|null>} - The organisation history data or null if an error occurs.
 */
export async function getOrgHistoryData() {
  try {
    const response = await customFetch('/copilot/api/org/historic');
    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch (err) {
    console.error('Error fetching organisation history data:', err);
    return null;
  }
}
