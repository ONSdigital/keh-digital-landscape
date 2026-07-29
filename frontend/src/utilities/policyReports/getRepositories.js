import customFetch from '../customFetch';

/**
 * Fetch repositories from a dataset that the user has access to.
 * Only returns repos that are in the dataset AND the user can access.
 * @param {string} organisation - GitHub organisation name
 * @param {string} dataset - Dataset name (ISO timestamp)
 * @returns {Promise<string[]>} Array of repository names, or empty array on error
 */
export const fetchDatasetRepositoriesForUser = async (
  organisation,
  dataset
) => {
  try {
    if (!organisation || !dataset) {
      return [];
    }

    const response = await customFetch(
      `/policy-reports/api/repositories?organisation=${encodeURIComponent(
        organisation
      )}&dataset=${encodeURIComponent(dataset)}`,
      {
        credentials: 'include',
      }
    );

    if (!response.ok) {
      console.error(
        'Error fetching dataset repositories:',
        response.status,
        response.statusText
      );
      return [];
    }

    const data = await response.json();
    return data.repositories || [];
  } catch (error) {
    console.error('Error fetching dataset repositories:', error);
    return [];
  }
};
