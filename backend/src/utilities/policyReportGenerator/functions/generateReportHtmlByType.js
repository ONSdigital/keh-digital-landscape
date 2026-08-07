const {
  buildEntityReportHtml,
} = require('../reportAssets/templates/entityReportTemplate');
const {
  buildOrganisationReportHtml,
} = require('../reportAssets/templates/organisationReportTemplate');

const ENTITY_REPORT_CONFIG = {
  repository: {
    reportLabel: 'Repository',
    entityNounSingular: 'repository',
    entityNounPlural: 'repositories',
    selectedInputKey: 'selectedRepositories',
    detailAnchorPrefix: 'repo',
  },
  team: {
    reportLabel: 'Team',
    entityNounSingular: 'team',
    entityNounPlural: 'teams',
    selectedInputKey: 'selectedTeams',
    detailAnchorPrefix: 'team',
  },
};

const generateReportHtmlByType = ({ reportType, inputs }) => {
  const normalisedType = String(reportType || '')
    .trim()
    .toLowerCase();

  if (normalisedType === 'organisation') {
    return buildOrganisationReportHtml(inputs);
  }

  const entityReportConfig = ENTITY_REPORT_CONFIG[normalisedType];

  if (entityReportConfig) {
    return buildEntityReportHtml({
      inputs,
      ...entityReportConfig,
    });
  }

  throw new Error(`Unsupported report type: ${reportType}`);
};

module.exports = { generateReportHtmlByType };
