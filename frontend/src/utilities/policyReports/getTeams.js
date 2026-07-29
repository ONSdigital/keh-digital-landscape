import customFetch from '../customFetch';

/**
 * Fetch teams from a dataset that the user is a member of.
 * Only returns teams that are in the dataset AND the user is a member of.
 * @param {string} organisation - GitHub organisation name
 * @param {string} dataset - Dataset name (ISO timestamp)
 * @returns {Promise<string[]>} Array of team slugs, or empty array on error
 */
export const fetchDatasetTeamsForUser = async (organisation, dataset) => {
  try {
    if (!organisation || !dataset) {
      return [];
    }

    const response = await customFetch(
      `/policy-reports/api/teams?organisation=${encodeURIComponent(
        organisation
      )}&dataset=${encodeURIComponent(dataset)}`,
      {
        credentials: 'include',
      }
    );

    if (!response.ok) {
      console.error(
        'Error fetching dataset teams:',
        response.status,
        response.statusText
      );
      return [];
    }

    const data = await response.json();
    return data.teams || [];
  } catch (error) {
    console.error('Error fetching dataset teams:', error);
    return [];
  }
};
