export const TECH_RADAR_SUBMISSIONS_URL_ENV_KEY =
  'VITE_TECH_RADAR_SUBMISSIONS_URL';

export const DEFAULT_TECH_RADAR_SUBMISSIONS_URL =
  'https://github.com/ONSdigital/keh-tech-radar-submissions';

export const getTechRadarSubmissionsUrl = (env = {}) =>
  env[TECH_RADAR_SUBMISSIONS_URL_ENV_KEY] || DEFAULT_TECH_RADAR_SUBMISSIONS_URL;
