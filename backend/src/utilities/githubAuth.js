const buildAuthRedirectUri = () => {
  if (process.env.NODE_ENV === 'production') {
    return `${process.env.FRONTEND_URL}/github-policy-reports`;
  }

  return 'http://localhost:3000/github-policy-reports';
};

const buildGitHubAuthoriseUrl = ({
  state,
  codeChallenge,
  codeChallengeMethod,
} = {}) => {
  const params = new URLSearchParams({
    client_id: process.env.GITHUB_APP_CLIENT_ID,
    redirect_uri: buildAuthRedirectUri(),
    scope: 'user:email read:org',
    ...(state ? { state } : {}),
    ...(codeChallenge && codeChallengeMethod
      ? {
          code_challenge: codeChallenge,
          code_challenge_method: codeChallengeMethod,
        }
      : {}),
  });

  return `https://github.com/login/oauth/authorize?${params.toString()}`;
};

const buildTokenExchangeParams = ({ code, codeVerifier }) => {
  const params = new URLSearchParams({
    client_id: process.env.GITHUB_APP_CLIENT_ID,
    client_secret: process.env.GITHUB_APP_CLIENT_SECRET,
    code,
    redirect_uri: buildAuthRedirectUri(),
  });

  if (codeVerifier) {
    params.append('code_verifier', codeVerifier);
  }

  return params;
};

const fetchGitHubUserProfile = async userToken => {
  if (!userToken) {
    throw new Error('User token is required');
  }

  try {
    const response = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `token ${userToken}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.statusText}`);
    }

    const data = await response.json();

    return {
      login: data.login,
      name: data.name,
      avatar_url: data.avatar_url,
    };
  } catch (error) {
    throw new Error(`Failed to fetch GitHub user profile: ${error.message}`);
  }
};

module.exports = {
  buildGitHubAuthoriseUrl,
  buildTokenExchangeParams,
  fetchGitHubUserProfile,
};
