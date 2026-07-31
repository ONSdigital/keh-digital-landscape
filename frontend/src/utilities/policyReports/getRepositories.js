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
  dataset,
  options = {}
) => {
  try {
    if (!organisation || !dataset) {
      if (options.includeCacheMetadata) {
        return {
          repositories: [],
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
      `/policy-reports/api/repositories?${query.toString()}`,
      {
        credentials: 'include',
      }
    );

    const data = await response.json();

    if (options.includeCacheMetadata) {
      return {
        repositories: data.repositories || [],
        cacheUsed: Boolean(data.cacheUsed),
        cachedAt: data.cachedAt || null,
        githubCurrentPage: data.githubCurrentPage || null,
        githubTotalPages: data.githubTotalPages || null,
      };
    }

    return data.repositories || [];
  } catch (error) {
    console.error('Error fetching dataset repositories:', error);

    if (options.includeCacheMetadata) {
      return {
        repositories: [],
        cacheUsed: false,
        cachedAt: null,
        githubCurrentPage: null,
        githubTotalPages: null,
      };
    }

    return [];
  }
};
