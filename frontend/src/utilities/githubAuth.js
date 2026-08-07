import customFetch from './customFetch';

const GITHUB_AUTH_STATE_STORAGE_KEY = 'githubAuthState';
const GITHUB_AUTH_CODE_VERIFIER_STORAGE_KEY = 'githubAuthCodeVerifier';
const GITHUB_AUTH_FORM_STORAGE_KEY = 'githubAuthFormState';

const getBackendUrl = () => import.meta.env.VITE_BACKEND_URL || '';
const GITHUB_AUTH_BASE = '/api/github/auth';

const normaliseRedirectPath = redirectPath => {
  if (
    typeof redirectPath === 'string' &&
    redirectPath.startsWith('/') &&
    !redirectPath.startsWith('//')
  ) {
    return redirectPath;
  }

  return window.location.pathname;
};

const createAuthState = () => {
  if (window.crypto?.getRandomValues) {
    const bytes = new Uint8Array(16);
    window.crypto.getRandomValues(bytes);
    return Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join(
      ''
    );
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

const createCodeVerifier = () => {
  if (window.crypto?.getRandomValues) {
    const bytes = new Uint8Array(32);
    window.crypto.getRandomValues(bytes);
    return Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join(
      ''
    );
  }

  return Math.random().toString(36).slice(2);
};

const sha256 = async data => {
  const encoder = new TextEncoder();
  const buffer = encoder.encode(data);
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
};

const base64UrlEncode = str => {
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
};

const createCodeChallenge = async codeVerifier => {
  const hash = await sha256(codeVerifier);
  const hashBytes = new Uint8Array(
    hash.match(/.{1,2}/g).map(byte => parseInt(byte, 16))
  );
  return base64UrlEncode(String.fromCharCode(...hashBytes));
};

const clearAuthParamsFromUrl = () => {
  const url = new URL(window.location.href);
  url.searchParams.delete('code');
  url.searchParams.delete('state');
  url.searchParams.delete('error');
  url.searchParams.delete('error_description');
  window.history.replaceState({}, '', url);
};

/**
 * Redirect the user to begin GitHub App authentication flow with PKCE.
 * @param {Object} options
 * @param {string} options.redirectPath - Frontend path that should receive auth callback
 * @param {Object} options.formState - Optional page state to persist across the auth redirect
 */
export const loginWithGitHub = async ({ redirectPath, formState } = {}) => {
  const safeRedirectPath = normaliseRedirectPath(
    redirectPath || window.location.pathname
  );
  const state = createAuthState();
  const codeVerifier = createCodeVerifier();
  const codeChallenge = await createCodeChallenge(codeVerifier);

  sessionStorage.setItem(GITHUB_AUTH_STATE_STORAGE_KEY, state);
  sessionStorage.setItem(GITHUB_AUTH_CODE_VERIFIER_STORAGE_KEY, codeVerifier);

  // Persist form state if provided
  if (formState && Object.values(formState).some(Boolean)) {
    sessionStorage.setItem(
      GITHUB_AUTH_FORM_STORAGE_KEY,
      JSON.stringify(formState)
    );
  }

  const baseUrl = `${getBackendUrl()}${GITHUB_AUTH_BASE}/login`;
  const params = new URLSearchParams({
    state,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
    redirectPath: safeRedirectPath,
  });

  window.location.assign(`${baseUrl}?${params.toString()}`);
};

/**
 * Exchange GitHub App code for an access token cookie with PKCE verification.
 * @param {string} code
 * @param {Object} options
 * @param {string} options.redirectPath - Frontend path used as redirect URI during authorization
 * @returns {Promise<boolean>}
 */
export const exchangeCodeForToken = async (code, { redirectPath } = {}) => {
  try {
    const codeVerifier = sessionStorage.getItem(
      GITHUB_AUTH_CODE_VERIFIER_STORAGE_KEY
    );

    const response = await customFetch(`${GITHUB_AUTH_BASE}/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        code,
        codeVerifier,
        redirectPath: normaliseRedirectPath(redirectPath),
      }),
    });

    const data = await response.json();
    return data.success === true;
  } catch (error) {
    console.error('Error exchanging GitHub App code for token:', error);
    return false;
  }
};

/**
 * Process GitHub App authentication callback parameters from the current URL.
 * Validates state before exchanging code with PKCE verification.
 * @param {Object} options
 * @param {string} options.redirectPath - Frontend path used as redirect URI during authorization
 * @returns {Promise<{processed: boolean, success: boolean, reason: string|null}>}
 */
export const handleAuthCallback = async ({ redirectPath } = {}) => {
  const params = new URLSearchParams(window.location.search);
  const code = params.get('code');
  const returnedState = params.get('state');
  const oauthError = params.get('error');

  if (!code && !oauthError) {
    return { processed: false, success: false, reason: null };
  }

  const expectedState = sessionStorage.getItem(GITHUB_AUTH_STATE_STORAGE_KEY);
  const savedCodeVerifier = sessionStorage.getItem(
    GITHUB_AUTH_CODE_VERIFIER_STORAGE_KEY
  );

  if (oauthError) {
    sessionStorage.removeItem(GITHUB_AUTH_STATE_STORAGE_KEY);
    sessionStorage.removeItem(GITHUB_AUTH_CODE_VERIFIER_STORAGE_KEY);
    clearAuthParamsFromUrl();
    return { processed: true, success: false, reason: oauthError };
  }

  if (!expectedState || !returnedState || expectedState !== returnedState) {
    sessionStorage.removeItem(GITHUB_AUTH_STATE_STORAGE_KEY);
    sessionStorage.removeItem(GITHUB_AUTH_CODE_VERIFIER_STORAGE_KEY);
    clearAuthParamsFromUrl();
    console.error('GitHub authentication state validation failed');
    return { processed: true, success: false, reason: 'state_mismatch' };
  }

  // Restore codeVerifier temporarily for token exchange
  if (savedCodeVerifier) {
    sessionStorage.setItem(
      GITHUB_AUTH_CODE_VERIFIER_STORAGE_KEY,
      savedCodeVerifier
    );
  }

  const success = await exchangeCodeForToken(code, { redirectPath });

  // Clean up after token exchange
  sessionStorage.removeItem(GITHUB_AUTH_STATE_STORAGE_KEY);
  sessionStorage.removeItem(GITHUB_AUTH_CODE_VERIFIER_STORAGE_KEY);
  clearAuthParamsFromUrl();

  return {
    processed: true,
    success,
    reason: success ? null : 'token_exchange_failed',
  };
};

/**
 * Retrieve and clear form state persisted during authentication.
 * @returns {Object} The persisted state object, or an empty object if none was saved
 */
export const retrievePersistedFormState = () => {
  try {
    const stored = sessionStorage.getItem(GITHUB_AUTH_FORM_STORAGE_KEY);
    sessionStorage.removeItem(GITHUB_AUTH_FORM_STORAGE_KEY);

    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error retrieving persisted form state:', error);
  }

  return {};
};

/**
 * Check whether a valid GitHub authentication cookie is present.
 * @returns {Promise<boolean>}
 */
export const checkAuthStatus = async () => {
  try {
    const response = await customFetch(`${GITHUB_AUTH_BASE}/status`, {
      credentials: 'include',
    });

    const data = await response.json();
    return data.authenticated === true;
  } catch (error) {
    console.error('Error checking auth status:', error);
    return false;
  }
};

/**
 * Fetch the authenticated GitHub user's profile.
 * @returns {Promise<{login: string, name: string, avatar_url: string}|null>}
 */
export const fetchGitHubUserProfile = async () => {
  try {
    const response = await customFetch(`${GITHUB_AUTH_BASE}/user`, {
      credentials: 'include',
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching GitHub user profile:', error);
    return null;
  }
};

/**
 * Clear GitHub App authentication cookie.
 * @returns {Promise<boolean>}
 */
export const logoutUser = async () => {
  try {
    const response = await customFetch(`${GITHUB_AUTH_BASE}/logout`, {
      method: 'POST',
      credentials: 'include',
    });

    return response.ok;
  } catch (error) {
    console.error('Error logging out of GitHub authentication session:', error);
    return false;
  }
};
