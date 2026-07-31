import customFetch from '../customFetch';

/**
 * Fetch teams from a dataset that the user is a member of.
 * Only returns teams that are in the dataset AND the user is a member of.
 * @param {string} organisation - GitHub organisation name
 * @param {string} dataset - Dataset name (ISO timestamp)
 * @returns {Promise<string[]>} Array of team slugs, or empty array on error
 */
export const fetchDatasetTeamsForUser = async (
  organisation,
  dataset,
  options = {}
) => {
  try {
    if (!organisation || !dataset) {
      if (options.includeCacheMetadata) {
        return {
          teams: [],
          cacheUsed: false,
          cachedAt: null,
        };
      }

      return [];
    }

    const query = new URLSearchParams({
      organisation,
      dataset,
    });

    if (options.refreshCache) {
      query.set('refreshCache', 'true');
    }

    if (options.githubPage) {
      query.set('githubPage', String(options.githubPage));
    }

    if (options.githubPerPage) {
      query.set('githubPerPage', String(options.githubPerPage));
    }

    const response = await customFetch(
      `/policy-reports/api/teams?${query.toString()}`,
      {
        credentials: 'include',
      }
    );

    const data = await response.json();

    if (options.includeCacheMetadata) {
      return {
        teams: data.teams || [],
        cacheUsed: Boolean(data.cacheUsed),
        cachedAt: data.cachedAt || null,
        githubCurrentPage: data.githubCurrentPage || null,
        githubTotalPages: data.githubTotalPages || null,
      };
    }

    return data.teams || [];
  } catch (error) {
    console.error('Error fetching dataset teams:', error);

    if (options.includeCacheMetadata) {
      return {
        teams: [],
        cacheUsed: false,
        cachedAt: null,
        githubCurrentPage: null,
        githubTotalPages: null,
      };
    }

    return [];
  }
};
