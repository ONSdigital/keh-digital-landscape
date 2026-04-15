import customFetch from './customFetch';

/**
 * Fetches legacy Copilot data based on the specified type.
 * @param {string} type - The type of legacy Copilot data to fetch (i.e., 'pre-0225' or 'pre-0326').
 * @returns {Promise<Object|null>} - The legacy Copilot data or null if an error occurs.
 */
export async function getLegacyCopilotData(type) {
  try {
    const response = await customFetch(`/copilot/api/org/legacy?type=${type}`);
    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch (err) {
    console.error('Error fetching legacy Copilot data:', err);
    return null;
  }
}
