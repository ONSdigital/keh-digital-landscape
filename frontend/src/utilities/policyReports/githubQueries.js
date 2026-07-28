import customFetch from '../customFetch';

/**
 * Fetch repositories in the given organisation that the user has access to.
 * @param {string} organisation - GitHub organisation name
 * @returns {Promise<string[]>} Array of repository names, or empty array on error
 */
export const fetchUserRepositoriesInOrganisation = async organisation => {
  try {
    if (!organisation) {
      return [];
    }

    const response = await customFetch(
      `/policy-reports/api/user-repositories?organisation=${encodeURIComponent(
        organisation
      )}`,
      {
        credentials: 'include',
      }
    );

    if (!response.ok) {
      console.error(
        'Error fetching user repositories:',
        response.status,
        response.statusText
      );
      return [];
    }

    const data = await response.json();
    return data.repositories || [];
  } catch (error) {
    console.error('Error fetching user repositories:', error);
    return [];
  }
};

/**
 * Fetch teams in the given organisation that the user is a member of.
 * @param {string} organisation - GitHub organisation name
 * @returns {Promise<string[]>} Array of team slugs, or empty array on error
 */
export const fetchUserTeamsInOrganisation = async organisation => {
  try {
    if (!organisation) {
      return [];
    }

    const response = await customFetch(
      `/policy-reports/api/user-teams?organisation=${encodeURIComponent(
        organisation
      )}`,
      {
        credentials: 'include',
      }
    );

    if (!response.ok) {
      console.error(
        'Error fetching user teams:',
        response.status,
        response.statusText
      );
      return [];
    }

    const data = await response.json();
    return data.teams || [];
  } catch (error) {
    console.error('Error fetching user teams:', error);
    return [];
  }
};

/**
 * Fetch repositories from a dataset that the user has access to.
 * Only returns repos that are in the dataset AND the user can access.
 * @param {string} organisation - GitHub organisation name
 * @param {string} dataset - Dataset name (ISO timestamp)
 * @returns {Promise<string[]>} Array of repository names, or empty array on error
 */
export const fetchDatasetRepositoriesForUser = async (organisation, dataset) => {
  try {
    if (!organisation || !dataset) {
      return [];
    }

    const response = await customFetch(
      `/policy-reports/api/dataset-repositories?organisation=${encodeURIComponent(
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
      `/policy-reports/api/dataset-teams?organisation=${encodeURIComponent(
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
