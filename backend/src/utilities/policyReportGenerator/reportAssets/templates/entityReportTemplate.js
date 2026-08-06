const {
  generateHtmlDocument,
} = require('../../functions/generateHtmlDocument');
const {
  escapeHtml,
  formatCheckName,
  getInputList,
  getInputString,
  normaliseForFileName,
  normaliseSectionAnchor,
  percentage,
} = require('../../functions/common');
const {
  buildScorecardCriteriaRows,
  formatRatingLabel,
  getScorecardCriteriaEntries,
} = require('../../functions/scorecard');
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

const getEntityChecksObject = entityRecord => {
  if (!entityRecord || typeof entityRecord !== 'object') {
    return {};
  }

  if (entityRecord.checks && typeof entityRecord.checks === 'object') {
    return entityRecord.checks;
  }

  return {};
};

const getEntityCheckRows = entityRecord =>
  Object.entries(getEntityChecksObject(entityRecord)).map(
    ([checkName, checkResult]) => {
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
    }
  );

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
        cards.push(`<article class="slo-card repository-slo-card">
                <h3 class="repository-slo-card-title">Dependabot SLO</h3>
                <div class="slo-metric">
                  <p class="slo-metric-label"><strong>${dependabotAlertCount}</strong> open alerts breaching SLO</p>
                </div>
                ${buildDependabotSeverityHtml(dependabotCounts)}
              </article>`);
      }

      if (secretScanningAlertCount > 0) {
        cards.push(`<article class="slo-card repository-slo-card">
                <h3 class="repository-slo-card-title">Secret Scanning SLO</h3>
                <div class="slo-metric">
                  <p class="slo-metric-label"><strong>${secretScanningAlertCount}</strong> open alerts breaching SLO</p>
                </div>
              </article>`);
      }

      return [
        repositoryName,
        `            <div class="block repository-slo-section">
              <h3>SLO Alert Breaches</h3>
              <p class="note repository-slo-subtitle">Current open alerts exceeding SLO thresholds for this repository.</p>
              <div class="slo-grid">
${cards.join('\n')}
              </div>
            </div>`,
      ];
    })
  );
};

const encodePathSegments = value =>
  String(value || '')
    .split('/')
    .filter(Boolean)
    .map(segment => encodeURIComponent(segment))
    .join('/');

const buildEntityGitHubUrl = ({
  organisation,
  entityName,
  entityNounSingular,
}) => {
  const safeOrganisation = String(organisation || '').trim();
  const safeEntityName = String(entityName || '').trim();

  if (!safeOrganisation || !safeEntityName) {
    return '';
  }

  if (entityNounSingular === 'team') {
    return `https://github.com/orgs/${encodeURIComponent(safeOrganisation)}/teams/${encodeURIComponent(safeEntityName)}`;
  }

  if (safeEntityName.includes('/')) {
    return `https://github.com/${encodePathSegments(safeEntityName)}`;
  }

  return `https://github.com/${encodeURIComponent(safeOrganisation)}/${encodeURIComponent(safeEntityName)}`;
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

const getEntityRatingView = entityRecord => {
  const rawRating = String(entityRecord?.rating || 'unrated')
    .trim()
    .toLowerCase();

  const safeRating = rawRating || 'unrated';

  return {
    label: formatRatingLabel(safeRating),
    className: `rating-${normaliseForFileName(safeRating || 'unrated')}`,
  };
};

const renderEntitySummaryRows = ({
  entityViews,
  anchorPrefix,
  includeEntityRatings,
}) =>
  entityViews
    .map(entityView => {
      const escapedEntity = escapeHtml(entityView.name);
      const anchorId = normaliseSectionAnchor(anchorPrefix, entityView.name);
      const ratingCell = includeEntityRatings
        ? `<td><span class="pill rating ${escapeHtml(entityView.ratingClassName || 'rating-unrated')}">${escapeHtml(entityView.ratingLabel || 'Unrated')}</span></td>`
        : '';

      return `                <tr>
                  <td><a href="#${anchorId}">${escapedEntity}</a></td>
                  ${ratingCell}
                  <td>${escapeHtml(entityView.checksPassedSummary)}</td>
                </tr>`;
    })
    .join('\n');

const renderEntityDetailBlocks = ({
  entityViews,
  entityNounSingular,
  anchorPrefix,
  repositorySloCardsByEntity,
  organisation,
  includeEntityRatings,
}) =>
  entityViews
    .map(entityView => {
      const escapedEntity = escapeHtml(entityView.name);
      const anchorId = normaliseSectionAnchor(anchorPrefix, entityView.name);
      const githubUrl = buildEntityGitHubUrl({
        organisation,
        entityName: entityView.name,
        entityNounSingular,
      });
      const githubAction = githubUrl
        ? `<a class="github-link-button" href="${escapeHtml(githubUrl)}" target="_blank" rel="noreferrer">
                <svg class="github-link-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                  <path fill="currentColor" d="M12 2a10 10 0 0 0-3.162 19.486c.5.092.684-.217.684-.483 0-.237-.009-.867-.014-1.702-2.782.605-3.37-1.34-3.37-1.34-.454-1.153-1.108-1.46-1.108-1.46-.907-.62.069-.608.069-.608 1.003.07 1.53 1.03 1.53 1.03.89 1.525 2.336 1.084 2.904.83.09-.645.35-1.085.636-1.334-2.22-.252-4.555-1.111-4.555-4.943 0-1.091.39-1.984 1.03-2.683-.103-.253-.447-1.27.097-2.647 0 0 .84-.269 2.75 1.024A9.58 9.58 0 0 1 12 6.844a9.58 9.58 0 0 1 2.504.337c1.91-1.293 2.748-1.024 2.748-1.024.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.338 4.688-4.566 4.935.359.309.679.92.679 1.855 0 1.339-.012 2.42-.012 2.749 0 .268.18.58.688.482A10 10 0 0 0 12 2Z"/>
                </svg>
                <span>View on GitHub</span>
              </a>`
        : '';
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

      const ratingHeader = includeEntityRatings
        ? `            <span class="pill rating ${escapeHtml(entityView.ratingClassName || 'rating-unrated')}">${escapeHtml(entityView.ratingLabel || 'Unrated')}</span>`
        : '';

      const repositorySloSection =
        repositorySloCardsByEntity?.[entityView.name];
      const noRepositorySloBreachesMessage =
        entityNounSingular === 'repository' &&
        entityView.isFound &&
        !repositorySloSection
          ? '            <p class="note repository-slo-clear-note">No SLO alert breaches for this repository.</p>'
          : '';

      return `          <article class="block" id="${anchorId}">
        <div class="detail-block-header">
          <div class="detail-block-title-row">
            <h3>${escapedEntity}</h3>
${ratingHeader}
          </div>
    ${githubAction ? `              ${githubAction}` : ''}
        </div>
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
  const includeEntityRatings =
    selectedInputKey === 'selectedRepositories' && entities.length > 0;
  const scorecardCriteriaEntries = includeEntityRatings
    ? getScorecardCriteriaEntries(sourceDatasetData.scorecard_criteria)
    : [];
  const scorecardCriteriaRows = buildScorecardCriteriaRows(
    scorecardCriteriaEntries
  );
  const entityViewsWithRatings = entityViews.map(entityView => ({
    ...entityView,
    ...(includeEntityRatings
      ? (() => {
          const ratingView = getEntityRatingView(
            entityRecords[entityView.name]
          );

          return {
            ratingLabel: ratingView.label,
            ratingClassName: ratingView.className,
          };
        })()
      : {}),
  }));
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
      ? entityViewsWithRatings
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
            <h3>Selected ${escapeHtml(entityNounPlural.charAt(0).toUpperCase() + entityNounPlural.slice(1))} Summary</h3>
            <table class="check-table">
              <colgroup>
                <col style="width: 68%" />
                ${includeEntityRatings ? '<col style="width: 16%" />' : ''}
                <col style="width: 32%" />
              </colgroup>
              <thead>
                <tr>
                  <th>${escapeHtml(reportLabel)}</th>
                  ${includeEntityRatings ? '<th>Rating</th>' : ''}
                  <th>Checks passed</th>
                </tr>
              </thead>
              <tbody>
${renderEntitySummaryRows({
  entityViews: safeEntityViews,
  anchorPrefix: detailAnchorPrefix,
  includeEntityRatings,
})}
              </tbody>
            </table>
            ${
              includeEntityRatings
                ? `<details class="collapsible-block rating-criteria-collapsible scorecard-help-card">
              <summary>What do these ratings mean?</summary>
              ${
                scorecardCriteriaEntries.length > 0
                  ? `<table class="check-table">
                <colgroup>
                  <col style="width: 20%" />
                  <col style="width: 24%" />
                  <col style="width: 56%" />
                </colgroup>
                <thead>
                  <tr>
                    <th>Rating</th>
                    <th>Minimum compliance</th>
                    <th>Required checks</th>
                  </tr>
                </thead>
                <tbody>
${scorecardCriteriaRows}
                </tbody>
              </table>
              <p class="note">Repositories are shown as Unrated when they do not meet any configured scorecard threshold.</p>`
                  : '<p class="note">No scorecard criteria is present in this dataset.</p>'
              }
            </details>`
                : ''
            }
          </article>

${renderEntityDetailBlocks({
  entityViews: safeEntityViews,
  entityNounSingular,
  anchorPrefix: detailAnchorPrefix,
  repositorySloCardsByEntity,
  organisation,
  includeEntityRatings,
})}
        </div>
      </section>

${reportFooterHtml}
    </main>`,
  });
};

module.exports = { buildEntityReportHtml };
