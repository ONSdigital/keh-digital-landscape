/**
 * Parse the GitHub Link header and extract pagination metadata.
 * @param {string|null} linkHeader - Value of the Link response header
 * @param {number} currentPage - Current requested page
 * @returns {{totalPages: number}}
 */
const parseGitHubPagination = (linkHeader, currentPage) => {
  if (!linkHeader) {
    return { totalPages: currentPage };
  }

  const lastPageMatch = linkHeader.match(/&page=(\d+)>;\s*rel="last"/);

  if (lastPageMatch?.[1]) {
    return {
      totalPages: Number(lastPageMatch[1]),
    };
  }

  // If only rel="next" is present, we know at least one more page exists.
  if (linkHeader.includes('rel="next"')) {
    return {
      totalPages: currentPage + 1,
    };
  }

  return { totalPages: currentPage };
};

/**
 * Fetch one repositories page in an organization that the user has access to.
 * @param {string} userToken - GitHub user access token
 * @param {string} organisation - GitHub organization name
 * @param {number} page - Page number (1-indexed)
 * @param {number} perPage - Page size
 * @returns {Promise<{repositories: string[], currentPage: number, totalPages: number}>}
 */
const fetchUserRepositoriesInOrganisationPage = async (
  userToken,
  organisation,
  page = 1,
  perPage = 100
) => {
  if (!userToken) {
    throw new Error('User token is required');
  }

  if (!organisation) {
    throw new Error('Organisation is required');
  }

  try {
    const response = await fetch(
      `https://api.github.com/orgs/${encodeURIComponent(
        organisation
      )}/repos?per_page=${perPage}&page=${page}`,
      {
        headers: {
          Authorization: `token ${userToken}`,
          Accept: 'application/vnd.github.v3+json',
        },
      }
    );

    if (response.status === 404) {
      return {
        repositories: [],
        currentPage: page,
        totalPages: page,
      };
    }

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.statusText}`);
    }

    const data = await response.json();
    const repositories = data
      .map(repo => repo?.name)
      .filter(Boolean)
      .sort();

    const pagination = parseGitHubPagination(
      response.headers.get('link'),
      page
    );

    return {
      repositories,
      currentPage: page,
      totalPages: pagination.totalPages,
    };
  } catch (error) {
    throw new Error(
      `Failed to fetch repositories page for organisation: ${error.message}`
    );
  }
};

/**
 * Fetch one teams page in an organization that the user has access to.
 * @param {string} userToken - GitHub user access token
 * @param {string} organisation - GitHub organization name
 * @param {number} page - Page number (1-indexed)
 * @param {number} perPage - Page size
 * @returns {Promise<{teams: string[], currentPage: number, totalPages: number}>}
 */
const fetchUserTeamsInOrganisationPage = async (
  userToken,
  organisation,
  page = 1,
  perPage = 100
) => {
  if (!userToken) {
    throw new Error('User token is required');
  }

  if (!organisation) {
    throw new Error('Organisation is required');
  }

  try {
    const response = await fetch(
      `https://api.github.com/orgs/${encodeURIComponent(
        organisation
      )}/teams?per_page=${perPage}&page=${page}`,
      {
        headers: {
          Authorization: `token ${userToken}`,
          Accept: 'application/vnd.github.v3+json',
        },
      }
    );

    if (response.status === 404) {
      return {
        teams: [],
        currentPage: page,
        totalPages: page,
      };
    }

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.statusText}`);
    }

    const data = await response.json();
    const teams = data
      .map(team => team?.slug)
      .filter(Boolean)
      .sort();

    const pagination = parseGitHubPagination(
      response.headers.get('link'),
      page
    );

    return {
      teams,
      currentPage: page,
      totalPages: pagination.totalPages,
    };
  } catch (error) {
    throw new Error(
      `Failed to fetch teams page for organisation: ${error.message}`
    );
  }
};

/**
 * Fetches all repositories in an organization that the user has access to.
 * GitHub API automatically filters to only repos accessible to the authenticated user.
 * @param {string} userToken - GitHub user access token
 * @param {string} organisation - GitHub organization name
 * @returns {Promise<string[]>} Array of repository names the user has access to
 */
const fetchUserRepositoriesInOrganisation = async (userToken, organisation) => {
  if (!userToken) {
    throw new Error('User token is required');
  }

  if (!organisation) {
    throw new Error('Organisation is required');
  }

  try {
    const repositories = [];
    let page = 1;
    let totalPages = 1;

    while (page <= totalPages) {
      const pageResponse = await fetchUserRepositoriesInOrganisationPage(
        userToken,
        organisation,
        page,
        100
      );

      totalPages = pageResponse.totalPages;

      pageResponse.repositories.forEach(repo => {
        repositories.push(repo);
      });

      if (pageResponse.repositories.length === 0 && page >= totalPages) {
        break;
      }

      page += 1;
    }

    return repositories.sort();
  } catch (error) {
    throw new Error(
      `Failed to fetch repositories for organisation: ${error.message}`
    );
  }
};

/**
 * Fetches all teams in an organization that the user is a member of.
 * @param {string} userToken - GitHub user access token
 * @param {string} organisation - GitHub organization name
 * @returns {Promise<string[]>} Array of team slugs
 */
const fetchUserTeamsInOrganisation = async (userToken, organisation) => {
  if (!userToken) {
    throw new Error('User token is required');
  }

  if (!organisation) {
    throw new Error('Organisation is required');
  }

  try {
    const teams = [];
    let page = 1;
    let totalPages = 1;

    while (page <= totalPages) {
      const pageResponse = await fetchUserTeamsInOrganisationPage(
        userToken,
        organisation,
        page,
        100
      );

      totalPages = pageResponse.totalPages;

      pageResponse.teams.forEach(team => {
        teams.push(team);
      });

      if (pageResponse.teams.length === 0 && page >= totalPages) {
        break;
      }

      page += 1;
    }

    return teams.sort();
  } catch (error) {
    throw new Error(`Failed to fetch teams for organisation: ${error.message}`);
  }
};

module.exports = {
  fetchUserRepositoriesInOrganisationPage,
  fetchUserTeamsInOrganisationPage,
  fetchUserRepositoriesInOrganisation,
  fetchUserTeamsInOrganisation,
};
