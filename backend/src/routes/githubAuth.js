const express = require('express');
const logger = require('../config/logger');
const {
  buildGitHubAuthoriseUrl,
  buildTokenExchangeParams,
  fetchGitHubUserProfile,
} = require('../utilities/githubAuth');

const router = express.Router();

// GET /login
router.get('/login', (req, res) => {
  try {
    const { state, code_challenge, code_challenge_method } = req.query;
    const loginUrl = buildGitHubAuthoriseUrl({
      state,
      codeChallenge: code_challenge,
      codeChallengeMethod: code_challenge_method,
    });
    return res.redirect(loginUrl);
  } catch (error) {
    logger.error('Error building GitHub OAuth authorise URL', {
      error: error.message,
    });
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// POST /token
router.post('/token', async (req, res) => {
  const { code, codeVerifier } = req.body;

  if (!code) {
    return res.status(400).json({ error: 'Missing code' });
  }

  try {
    const params = buildTokenExchangeParams({ code, codeVerifier });

    const tokenResponse = await fetch(
      'https://github.com/login/oauth/access_token',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Accept: 'application/json',
        },
        body: params,
      }
    );

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      return res
        .status(400)
        .json({ error: tokenData.error_description || tokenData.error });
    }

    res.cookie('githubUserToken', tokenData.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 3 * 60 * 60 * 1000,
      path: '/',
    });

    return res.json({ success: true });
  } catch (error) {
    logger.error('Error exchanging GitHub OAuth code for token', {
      error: error.message,
    });
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// POST /logout
router.post('/logout', (req, res) => {
  res.clearCookie('githubUserToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });

  return res.json({ success: true });
});

// GET /status
router.get('/status', (req, res) => {
  try {
    const userToken = req.cookies?.githubUserToken;
    return res.json({ authenticated: !!userToken });
  } catch (error) {
    logger.error('Error fetching GitHub OAuth status', {
      error: error.message,
    });
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET /user
router.get('/user', async (req, res) => {
  try {
    const userToken = req.cookies?.githubUserToken;

    if (!userToken) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const userProfile = await fetchGitHubUserProfile(userToken);
    return res.json(userProfile);
  } catch (error) {
    logger.error('Error fetching GitHub user profile', {
      error: error.message,
    });
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
