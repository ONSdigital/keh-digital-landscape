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
    let hasMore = true;

    while (hasMore) {
      const response = await fetch(
        `https://api.github.com/orgs/${encodeURIComponent(
          organisation
        )}/repos?per_page=100&page=${page}`,
        {
          headers: {
            Authorization: `token ${userToken}`,
            Accept: 'application/vnd.github.v3+json',
          },
        }
      );

      if (response.status === 404) {
        // Organisation does not exist or user doesn't have access
        return [];
      }

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.length === 0) {
        hasMore = false;
      } else {
        // GitHub API automatically returns only repos user has access to
        data.forEach(repo => {
          if (repo.name) {
            repositories.push(repo.name);
          }
        });
        page += 1;
      }
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
    let hasMore = true;

    while (hasMore) {
      const response = await fetch(
        `https://api.github.com/orgs/${encodeURIComponent(
          organisation
        )}/teams?per_page=100&page=${page}`,
        {
          headers: {
            Authorization: `token ${userToken}`,
            Accept: 'application/vnd.github.v3+json',
          },
        }
      );

      if (response.status === 404) {
        // Organisation does not exist or user doesn't have access
        return [];
      }

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.length === 0) {
        hasMore = false;
      } else {
        // Add team slugs (unique identifiers within org)
        data.forEach(team => {
          if (team.slug) {
            teams.push(team.slug);
          }
        });
        page += 1;
      }
    }

    return teams.sort();
  } catch (error) {
    throw new Error(
      `Failed to fetch teams for organisation: ${error.message}`
    );
  }
};

module.exports = {
  fetchUserRepositoriesInOrganisation,
  fetchUserTeamsInOrganisation,
};
