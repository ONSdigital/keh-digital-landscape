const getPolicyReportsConfig = async () => {
  return {
    organisationOptions: ['ONSdigital', 'ONS-Innovation'],
    sourceDatasetOptions: [
      '2026-07-24 dataset',
      '2026-07-17 dataset',
      '2026-07-10 dataset',
      '2026-07-03 dataset',
    ],
    comparisonDatasetOptions: [
      '2026-07-17 dataset',
      '2026-07-10 dataset',
      '2026-07-03 dataset',
      '2026-06-26 dataset',
    ],
    repositoryOptions: [
      'onsdigital/digital-landscape',
      'ONS-Innovation/innovation-playbook',
      'ONSdigital/data-ingestion-service',
      'ONSdigital/metadata-catalogue',
      'ONS-Innovation/prototype-lab',
      'ONSdigital/risk-register-api',
      'ONSdigital/identity-service',
      'ONS-Innovation/team-insights',
      'ONSdigital/platform-observability',
      'ONSdigital/secure-deployments',
    ],
    teamOptions: [
      'Data Platform Engineering',
      'Innovation Core Services',
      'Platform Reliability',
      'Developer Experience',
      'Architecture and Governance',
      'Data Discovery Team',
      'Internal Tooling',
      'Cloud Enablement',
    ],
    repositoryResultCap: 10,
    teamResultCap: 10,
    totalAccessibleRepositories: 1400,
    totalAccessibleTeams: 120,
  };
};

module.exports = {
  getPolicyReportsConfig,
};
