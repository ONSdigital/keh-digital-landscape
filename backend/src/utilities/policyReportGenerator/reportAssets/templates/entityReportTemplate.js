const {
  generateHtmlDocument,
} = require('../../functions/generateHtmlDocument');
const {
  escapeHtml,
  formatCheckName,
  getInputList,
  getInputString,
  normaliseSectionAnchor,
  percentage,
} = require('../../functions/common');
const {
  buildReportFooterHtml,
  buildReportHeaderHtml,
} = require('./reportFrameTemplate');

const getCheckOutcome = checkResult => {
  if (!checkResult || typeof checkResult !== 'object') {
    return 'unknown';
  }

  const rawResult = checkResult.result;

  if (!rawResult) {
    return 'unknown';
  }

  const normalised = String(rawResult).toLowerCase();

  if (['pass', 'fail', 'error'].includes(normalised)) {
    return normalised;
  }

  return 'unknown';
};

const getEntityCheckRows = entityRecord =>
  Object.entries(entityRecord || {})
    .filter(([checkName]) => checkName !== 'is_compliant')
    .map(([checkName, checkResult]) => {
      const outcome = getCheckOutcome(checkResult);
      const pillClassName = outcome;
      const resultLabel = outcome;

      return {
        checkName,
        pillClassName,
        resultLabel,
        detail: checkResult?.message || 'No check detail available.',
        isCompliant: outcome === 'pass',
        isError: outcome === 'error',
      };
    });

const getNormalisedRepoName = repoName => String(repoName || '').toLowerCase();

const getRepositoryEntry = ({ repositories, repositoryName }) => {
  if (!repositories || typeof repositories !== 'object') return null;

  const normalisedTarget = getNormalisedRepoName(repositoryName);

  for (const [repoKey, repoValue] of Object.entries(repositories)) {
    const normalisedRepoKey = getNormalisedRepoName(repoKey);
    const repoSuffix = normalisedRepoKey.includes('/')
      ? normalisedRepoKey.split('/').slice(1).join('/')
      : normalisedRepoKey;

    if (
      normalisedRepoKey === normalisedTarget ||
      repoSuffix === normalisedTarget
    ) {
      return repoValue;
    }
  }

  return null;
};

const getSeverityCounts = countData => {
  if (!countData || typeof countData !== 'object') return null;

  const counts = {
    critical: Number(countData.critical || 0),
    high: Number(countData.high || 0),
    medium: Number(countData.medium || 0),
    low: Number(countData.low || 0),
  };

  return counts;
};

const getAlertCount = countData => {
  if (typeof countData === 'number') return countData;
  if (!countData || typeof countData !== 'object') return 0;
  if (typeof countData.count === 'number') return countData.count;
  if (typeof countData.alerts === 'number') return countData.alerts;

  const severityCounts = getSeverityCounts(countData);
  if (!severityCounts) return 0;

  return (
    severityCounts.critical +
    severityCounts.high +
    severityCounts.medium +
    severityCounts.low
  );
};

const buildDependabotSeverityHtml = dependabotCounts => {
  const severityCounts = getSeverityCounts(dependabotCounts);
  if (!severityCounts) return '';

  return `<div class="severity-grid">
            <dl class="severity-item"><dt>Critical</dt><dd>${severityCounts.critical}</dd></dl>
            <dl class="severity-item"><dt>High</dt><dd>${severityCounts.high}</dd></dl>
            <dl class="severity-item"><dt>Medium</dt><dd>${severityCounts.medium}</dd></dl>
            <dl class="severity-item"><dt>Low</dt><dd>${severityCounts.low}</dd></dl>
          </div>`;
};

const buildRepositorySloCardsByEntity = ({ entities, organisationChecks }) => {
  const dependabotRepositories =
    organisationChecks?.dependabot_slo?.details?.repositories;
  const secretScanningRepositories =
    organisationChecks?.secret_scanning_slo?.details?.repositories;

  return Object.fromEntries(
    entities.map(repositoryName => {
      const dependabotCounts = getRepositoryEntry({
        repositories: dependabotRepositories,
        repositoryName,
      });
      const secretScanningCounts = getRepositoryEntry({
        repositories: secretScanningRepositories,
        repositoryName,
      });

      const dependabotAlertCount = getAlertCount(dependabotCounts);
      const secretScanningAlertCount = getAlertCount(secretScanningCounts);

      if (dependabotAlertCount <= 0 && secretScanningAlertCount <= 0) {
        return [repositoryName, ''];
      }

      const cards = [];

      if (dependabotAlertCount > 0) {
        cards.push(`<article class="slo-card">
                <h3>Dependabot SLO</h3>
                <div class="slo-metric">
                  <p class="slo-metric-label"><strong>${dependabotAlertCount}</strong> open alerts breaching SLO</p>
                </div>
                ${buildDependabotSeverityHtml(dependabotCounts)}
              </article>`);
      }

      if (secretScanningAlertCount > 0) {
        cards.push(`<article class="slo-card">
                <h3>Secret Scanning SLO</h3>
                <div class="slo-metric">
                  <p class="slo-metric-label"><strong>${secretScanningAlertCount}</strong> open alerts breaching SLO</p>
                </div>
              </article>`);
      }

      return [
        repositoryName,
        `            <div class="block">
              <h3>SLO alert breaches</h3>
              <div class="slo-grid">
${cards.join('\n')}
              </div>
            </div>`,
      ];
    })
  );
};

const buildEntityViewModel = (entityName, entityRecord) => {
  if (!entityRecord || typeof entityRecord !== 'object') {
    return {
      name: entityName,
      isFound: false,
      isCompliant: null,
      checkRows: [],
      checksPassedSummary: 'Not found in dataset',
      statusText: 'missing',
      statusClassName: 'warn',
    };
  }

  const checkRows = getEntityCheckRows(entityRecord);
  const compliantChecks = checkRows.filter(
    checkRow => checkRow.isCompliant
  ).length;
  const errorChecks = checkRows.filter(checkRow => checkRow.isError).length;
  const totalChecks = checkRows.length;

  const isCompliant =
    typeof entityRecord.is_compliant === 'boolean'
      ? entityRecord.is_compliant
      : null;

  return {
    name: entityName,
    isFound: true,
    isCompliant,
    checkRows,
    checksPassedSummary:
      totalChecks > 0
        ? `${compliantChecks} / ${totalChecks}${
            errorChecks > 0 ? ` (${errorChecks} errors)` : ''
          }`
        : isCompliant === true
          ? 'Compliant'
          : isCompliant === false
            ? 'Non-compliant'
            : 'No checks',
    statusText:
      errorChecks > 0
        ? 'error'
        : isCompliant === true
          ? 'compliant'
          : isCompliant === false
            ? 'non-compliant'
            : 'unknown',
    statusClassName:
      errorChecks > 0
        ? 'error'
        : isCompliant === true
          ? 'pass'
          : isCompliant === false
            ? 'fail'
            : 'warn',
  };
};

const renderEntitySummaryRows = ({ entityViews, anchorPrefix }) =>
  entityViews
    .map(entityView => {
      const escapedEntity = escapeHtml(entityView.name);
      const anchorId = normaliseSectionAnchor(anchorPrefix, entityView.name);

      return `                <tr>
                  <td><a href="#${anchorId}">${escapedEntity}</a></td>
                  <td><span class="pill ${entityView.statusClassName}">${escapeHtml(entityView.statusText)}</span></td>
                  <td>${escapeHtml(entityView.checksPassedSummary)}</td>
                </tr>`;
    })
    .join('\n');

const renderEntityDetailBlocks = ({
  entityViews,
  entityNounSingular,
  anchorPrefix,
  repositorySloCardsByEntity,
}) =>
  entityViews
    .map(entityView => {
      const escapedEntity = escapeHtml(entityView.name);
      const anchorId = normaliseSectionAnchor(anchorPrefix, entityView.name);
      const detailRows =
        entityView.checkRows.length > 0
          ? entityView.checkRows
              .map(
                checkRow => `                <tr>
                  <td>${escapeHtml(formatCheckName(checkRow.checkName))}</td>
                  <td><span class="pill ${checkRow.pillClassName}">${escapeHtml(checkRow.resultLabel)}</span></td>
                  <td>${escapeHtml(checkRow.detail)}</td>
                </tr>`
              )
              .join('\n')
          : `                <tr>
                  <td>policy_checks</td>
                  <td><span class="pill unknown">unknown</span></td>
                  <td>${escapeHtml(
                    entityView.isFound
                      ? `Detailed checks for this ${entityNounSingular} are unavailable in the selected dataset.`
                      : `${entityView.name} was not present in the selected dataset.`
                  )}</td>
                </tr>`;

      const repositorySloSection =
        repositorySloCardsByEntity?.[entityView.name];
      const noRepositorySloBreachesMessage =
        entityNounSingular === 'repository' &&
        entityView.isFound &&
        !repositorySloSection
          ? '            <p class="note">No SLO alert breaches for this repository.</p>'
          : '';

      return `          <article class="block" id="${anchorId}">
            <h3>${escapedEntity} details</h3>
            <table class="check-table">
              <colgroup>
                <col style="width: 24%" />
                <col style="width: 16%" />
                <col style="width: 60%" />
              </colgroup>
              <thead>
                <tr>
                  <th>Check</th>
                  <th>Result</th>
                  <th>Detail</th>
                </tr>
              </thead>
              <tbody>
${detailRows}
              </tbody>
            </table>
${repositorySloSection || ''}
${noRepositorySloBreachesMessage}
          </article>`;
    })
    .join('\n');

const buildEntityReportHtml = ({
  inputs,
  reportLabel,
  entityNounSingular,
  entityNounPlural,
  selectedInputKey,
  detailAnchorPrefix,
}) => {
  const organisation = getInputString(inputs, 'organisation');
  const sourceDatasetDisplay = getInputString(inputs, 'sourceDatasetDisplay');
  const sourceDatasetDebugValue = getInputString(inputs, 'sourceDataset');
  const entities = getInputList(inputs, selectedInputKey);
  const sourceDatasetData = inputs.sourceDatasetData || {};
  const entityRecords =
    selectedInputKey === 'selectedRepositories'
      ? sourceDatasetData.repositories || {}
      : sourceDatasetData.teams || {};
  const entityViews = entities.map(entityName =>
    buildEntityViewModel(entityName, entityRecords[entityName])
  );
  const repositorySloCardsByEntity =
    selectedInputKey === 'selectedRepositories'
      ? buildRepositorySloCardsByEntity({
          entities,
          organisationChecks: sourceDatasetData.organisation_checks,
        })
      : {};
  const safeEntities =
    entities.length > 0 ? entities : [`No ${entityNounPlural} selected`];
  const safeEntityViews =
    entities.length > 0
      ? entityViews
      : safeEntities.map(entityName => buildEntityViewModel(entityName));
  const generatedAt = new Date().toISOString();

  const totalSelected = entities.length;
  const assessedCount = entityViews.filter(
    entityView => entityView.isCompliant === true
  ).length;
  const complianceRate = percentage(assessedCount, totalSelected);

  const reportHeaderHtml = buildReportHeaderHtml({
    heading: `${reportLabel} GitHub Usage Policy Report`,
    description: `Generated ${entityNounSingular}-level compliance report for selected ${entityNounPlural}.`,
    metadataItems: [
      { label: 'Organisation scanned', value: organisation },
      { label: 'Data from', value: sourceDatasetDisplay },
    ],
  });

  const reportFooterHtml = buildReportFooterHtml({
    generatedAt,
    debugLines: [`Source dataset file: ${sourceDatasetDebugValue}`],
  });

  return generateHtmlDocument({
    title: `${reportLabel} GitHub Usage Policy Report`,
    description: `${reportLabel} GitHub Usage Policy report for selected ${entityNounPlural}.`,
    body: `    <main class="page">
${reportHeaderHtml}

      <section class="report-card" aria-labelledby="entity-report-title">
        <div class="report-head">
          <h2 id="entity-report-title" class="report-title">${escapeHtml(reportLabel)} Report</h2>
          <p class="report-subtitle">At-a-glance compliance summary for selected ${escapeHtml(entityNounPlural)}.</p>
        </div>
        <div class="report-body">
          <div class="kpi-grid summary-kpi" aria-label="${escapeHtml(reportLabel)} compliance totals">
            <dl class="kpi">
              <dt>Total ${escapeHtml(entityNounPlural)} compliant</dt>
              <dd>${assessedCount} / ${totalSelected}</dd>
              <p class="kpi-sub">${complianceRate}% of selected ${escapeHtml(entityNounPlural)} are currently assessed as compliant.</p>
            </dl>
          </div>

          <article class="block">
            <h3>Selected ${escapeHtml(entityNounPlural)} summary</h3>
            <table class="check-table">
              <colgroup>
                <col style="width: 52%" />
                <col style="width: 20%" />
                <col style="width: 28%" />
              </colgroup>
              <thead>
                <tr>
                  <th>${escapeHtml(reportLabel)}</th>
                  <th>Compliance</th>
                  <th>Checks passed</th>
                </tr>
              </thead>
              <tbody>
${renderEntitySummaryRows({
  entityViews: safeEntityViews,
  anchorPrefix: detailAnchorPrefix,
})}
              </tbody>
            </table>
          </article>

${renderEntityDetailBlocks({
  entityViews: safeEntityViews,
  entityNounSingular,
  anchorPrefix: detailAnchorPrefix,
  repositorySloCardsByEntity,
})}
        </div>
      </section>

${reportFooterHtml}
    </main>`,
  });
};

module.exports = { buildEntityReportHtml };
