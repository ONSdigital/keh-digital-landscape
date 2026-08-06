const {
  generateHtmlDocument,
} = require('../../functions/generateHtmlDocument');
const {
  escapeHtml,
  formatCheckName,
  getInputString,
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

const getRequiredNumericSummaryValue = ({
  summary,
  summaryLabel,
  fieldKey,
}) => {
  if (typeof summary?.[fieldKey] !== 'number') {
    throw new Error(
      `${summaryLabel} is missing required numeric field: ${fieldKey}`
    );
  }

  return summary[fieldKey];
};

const getSummaryEntityMetrics = ({
  summary,
  totalKey,
  compliantKey,
  summaryLabel,
}) => {
  if (!summary || typeof summary !== 'object') {
    throw new Error(`${summaryLabel} is missing or invalid.`);
  }

  const total = getRequiredNumericSummaryValue({
    summary,
    summaryLabel,
    fieldKey: totalKey,
  });
  const compliant = getRequiredNumericSummaryValue({
    summary,
    summaryLabel,
    fieldKey: compliantKey,
  });

  return {
    total,
    compliant,
    complianceRate: percentage(compliant, total),
  };
};

const getRequiredSummaryObjectValue = ({ summary, summaryLabel, fieldKey }) => {
  if (!summary?.[fieldKey] || typeof summary[fieldKey] !== 'object') {
    throw new Error(
      `${summaryLabel} is missing required object field: ${fieldKey}`
    );
  }

  return summary[fieldKey];
};

const buildDeltaView = ({
  current,
  previous,
  invertDirection = false,
  forceNeutral = false,
}) => {
  if (previous === null || previous === undefined) {
    return {
      className: 'neutral',
      text: 'No comparison data available.',
    };
  }

  const delta = current - previous;

  if (delta === 0) {
    return {
      className: 'neutral',
      text: 'No change vs comparison dataset.',
    };
  }

  const deltaForClass = invertDirection ? -delta : delta;
  const className = forceNeutral
    ? 'neutral'
    : deltaForClass > 0
      ? 'up'
      : 'down';
  const sign = delta > 0 ? '+' : '';

  return {
    className,
    text: `${sign}${delta} vs comparison dataset.`,
  };
};

const buildRateDeltaView = ({ currentRate, previousRate }) => {
  if (previousRate === null || previousRate === undefined) {
    return {
      className: 'neutral',
      text: 'No comparison data available.',
    };
  }

  const delta = currentRate - previousRate;

  if (delta === 0) {
    return {
      className: 'neutral',
      text: 'No change vs comparison dataset.',
    };
  }

  const className = delta > 0 ? 'up' : 'down';
  const sign = delta > 0 ? '+' : '';

  return {
    className,
    text: `${sign}${delta.toFixed(1)}pp vs comparison dataset.`,
  };
};

const buildCheckPerformanceRows = summaryChecks => {
  return Object.entries(summaryChecks)
    .filter(
      ([, checkCounts]) =>
        checkCounts &&
        typeof checkCounts === 'object' &&
        typeof checkCounts.total === 'number' &&
        typeof checkCounts.compliant === 'number'
    )
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([checkName, checkCounts]) => {
      const nonCompliant = Math.max(
        0,
        checkCounts.total - checkCounts.compliant
      );
      const checkRate = percentage(checkCounts.compliant, checkCounts.total);
      const compliantClassName =
        checkCounts.compliant === checkCounts.total && checkCounts.total > 0
          ? 'compliant-check'
          : '';

      return `                <tr class="${compliantClassName}">
                  <td>${escapeHtml(formatCheckName(checkName))}</td>
                  <td>${checkCounts.compliant}</td>
                  <td>${nonCompliant}</td>
                  <td>${checkCounts.total}</td>
                  <td>${checkRate}%</td>
                </tr>`;
    });
};

const sanitiseRatingCount = value => {
  const n = Number(value);
  return Number.isFinite(n) ? Math.max(0, Math.floor(n)) : 0;
};

const getOrderedRatingKeys = ({ repositoryRatings, scorecardCriteria }) => {
  const ratingEntries = Object.entries(repositoryRatings || {})
    .filter(([, count]) => Number.isFinite(Number(count)))
    .map(([rating]) => String(rating).toLowerCase());
  const scorecardCriteriaEntries =
    getScorecardCriteriaEntries(scorecardCriteria);
  const orderedFromCriteria = scorecardCriteriaEntries
    .map(criteriaEntry => criteriaEntry.rating)
    .filter(rating => ratingEntries.includes(rating));
  const remainingRatings = ratingEntries
    .filter(rating => !orderedFromCriteria.includes(rating))
    .sort((left, right) => {
      if (left === 'unrated' && right !== 'unrated') return 1;
      if (right === 'unrated' && left !== 'unrated') return -1;
      return left.localeCompare(right);
    });

  return [...orderedFromCriteria, ...remainingRatings];
};

const normaliseRepositoryRatings = repositoryRatings => {
  if (!repositoryRatings || typeof repositoryRatings !== 'object') {
    return null;
  }

  return Object.entries(repositoryRatings).reduce((acc, [rating, count]) => {
    acc[String(rating).toLowerCase()] = sanitiseRatingCount(count);
    return acc;
  }, {});
};

const buildRepositoryRatingCards = ({
  repositoryRatings,
  comparisonRepositoryRatings,
  totalRepositories,
  scorecardCriteria,
}) => {
  const ratingEntries = Object.entries(repositoryRatings || {})
    .filter(([, count]) => Number.isFinite(Number(count)))
    .map(([rating, count]) => [String(rating).toLowerCase(), count]);

  const orderedRatings = getOrderedRatingKeys({
    repositoryRatings,
    scorecardCriteria,
  });

  return orderedRatings
    .map(rating => {
      const matchingEntry = ratingEntries.find(
        ([entryRating]) => entryRating === rating
      );
      const count = sanitiseRatingCount(matchingEntry?.[1]);
      const previousCount = comparisonRepositoryRatings
        ? sanitiseRatingCount(comparisonRepositoryRatings[rating] ?? 0)
        : null;
      const deltaView = buildDeltaView({
        current: count,
        previous: previousCount,
        forceNeutral: true,
      });
      const share = percentage(count, totalRepositories);

      return `              <article class="rating-stat-card">
                <p class="rating-stat-heading"><span class="pill rating rating-${escapeHtml(rating)}">${escapeHtml(formatRatingLabel(rating))}</span></p>
                <p class="rating-stat-value">${count}</p>
                <p class="rating-stat-sub">${share}% of repositories</p>
                <p class="rating-delta ${deltaView.className}">${escapeHtml(deltaView.text)}</p>
              </article>`;
    })
    .join('\n');
};

const getSloBreachCount = sloRecord => {
  if (!sloRecord || typeof sloRecord !== 'object') return null;
  if (String(sloRecord.result || '').toLowerCase() === 'pass') return 0;
  const details =
    sloRecord.details && typeof sloRecord.details === 'object'
      ? sloRecord.details
      : {};
  return typeof details.failing_alerts === 'number'
    ? details.failing_alerts
    : null;
};

const getSloAffectedRepositoryCount = sloRecord => {
  if (!sloRecord || typeof sloRecord !== 'object') return null;
  if (String(sloRecord.result || '').toLowerCase() === 'pass') return 0;
  const details =
    sloRecord.details && typeof sloRecord.details === 'object'
      ? sloRecord.details
      : {};
  return typeof details.total_repositories_affected === 'number'
    ? details.total_repositories_affected
    : null;
};

// Sanitise a severity count to a safe non-negative integer.
// Prevents unexpected dataset values (strings, objects, etc.) from
// being interpolated as raw HTML into the report.
const sanitiseSeverityCount = value => {
  const n = Number(value);
  return Number.isFinite(n) ? Math.max(0, Math.floor(n)) : 0;
};

const buildSloCardHtml = (
  sloRecord,
  fallbackHeading,
  deltaView,
  affectedRepositoriesDeltaView,
  options = {}
) => {
  const showHeading = options.showHeading !== false;
  const headingHtml = showHeading
    ? `<h3>${escapeHtml(fallbackHeading)}</h3>`
    : '';

  const wrapSloContent = innerHtml =>
    showHeading
      ? `<article class="slo-card">${innerHtml}</article>`
      : innerHtml;

  if (!sloRecord || typeof sloRecord !== 'object') {
    return wrapSloContent(`
              ${headingHtml}
              <p class="note">No SLO data present in the selected dataset.</p>
            `);
  }

  const heading = escapeHtml(
    formatCheckName(sloRecord.check_name || fallbackHeading)
  );
  const result = String(sloRecord.result || '').toLowerCase();
  const alertsDeltaHtml = `<p class="slo-delta ${deltaView.className}">${escapeHtml(deltaView.text)}</p>`;
  const reposDeltaHtml = affectedRepositoriesDeltaView
    ? `<p class="slo-delta ${affectedRepositoriesDeltaView.className}">${escapeHtml(affectedRepositoriesDeltaView.text)}</p>`
    : '';

  if (result === 'pass') {
    return wrapSloContent(`
              ${showHeading ? `<h3>${heading}</h3>` : ''}
              <div class="slo-metrics">
                <div class="slo-metric">
                  <p class="slo-metric-label"><strong>0</strong> open alerts breaching SLO</p>
                  ${alertsDeltaHtml}
                </div>
                <div class="slo-metric">
                  <p class="slo-metric-label"><strong>0</strong> repositories affected by SLO</p>
                  ${reposDeltaHtml}
                </div>
              </div>
            `);
  }

  // result is fail — extract rich detail from the details object
  const details =
    sloRecord.details && typeof sloRecord.details === 'object'
      ? sloRecord.details
      : {};
  const failingAlerts =
    typeof details.failing_alerts === 'number' ? details.failing_alerts : null;
  const totalReposAffected =
    typeof details.total_repositories_affected === 'number'
      ? details.total_repositories_affected
      : null;
  const severity =
    details.number_exceeded_by_severity &&
    typeof details.number_exceeded_by_severity === 'object'
      ? details.number_exceeded_by_severity
      : null;

  let severityHtml = '';
  if (severity) {
    severityHtml = `<div class="severity-grid">
                <dl class="severity-item"><dt>Critical</dt><dd>${sanitiseSeverityCount(severity.critical)}</dd></dl>
                <dl class="severity-item"><dt>High</dt><dd>${sanitiseSeverityCount(severity.high)}</dd></dl>
                <dl class="severity-item"><dt>Medium</dt><dd>${sanitiseSeverityCount(severity.medium)}</dd></dl>
                <dl class="severity-item"><dt>Low</dt><dd>${sanitiseSeverityCount(severity.low)}</dd></dl>
              </div>`;
  }

  return wrapSloContent(`
              ${showHeading ? `<h3>${heading}</h3>` : ''}
              <div class="slo-metrics">
                <div class="slo-metric">
                  <p class="slo-metric-label"><strong>${failingAlerts !== null ? failingAlerts : 'Unknown'}</strong> open alerts breaching SLO</p>
                  ${alertsDeltaHtml}
                </div>
                <div class="slo-metric">
                  <p class="slo-metric-label"><strong>${totalReposAffected !== null ? totalReposAffected : 'Unknown'}</strong> repositories affected by SLO</p>
                  ${reposDeltaHtml}
                </div>
              </div>
              ${severityHtml}
            `);
};

const buildOrganisationReportHtml = inputs => {
  const organisation = getInputString(inputs, 'organisation');
  const sourceDatasetDisplay = getInputString(inputs, 'sourceDatasetDisplay');
  const comparisonDatasetDisplay = getInputString(
    inputs,
    'comparisonDatasetDisplay'
  );
  const sourceDatasetDebugValue = getInputString(inputs, 'sourceDataset');
  const comparisonDatasetDebugValue = getInputString(
    inputs,
    'comparisonDataset'
  );
  const sourceDatasetData = inputs.sourceDatasetData || {};
  const comparisonDatasetData = inputs.comparisonDatasetData || null;
  const sourceSummary = sourceDatasetData.summary;
  const comparisonSummary = comparisonDatasetData?.summary || null;

  if (comparisonDatasetData && !comparisonSummary) {
    throw new Error('Comparison dataset summary is missing or invalid.');
  }

  const repositorySummary = getSummaryEntityMetrics({
    summary: sourceSummary,
    totalKey: 'total_repositories',
    compliantKey: 'compliant_repositories',
    summaryLabel: 'Source dataset summary',
  });
  const comparisonRepositorySummary = comparisonSummary
    ? getSummaryEntityMetrics({
        summary: comparisonSummary,
        totalKey: 'total_repositories',
        compliantKey: 'compliant_repositories',
        summaryLabel: 'Comparison dataset summary',
      })
    : null;
  const teamSummary = getSummaryEntityMetrics({
    summary: sourceSummary,
    totalKey: 'total_teams',
    compliantKey: 'compliant_teams',
    summaryLabel: 'Source dataset summary',
  });
  const comparisonTeamSummary = comparisonSummary
    ? getSummaryEntityMetrics({
        summary: comparisonSummary,
        totalKey: 'total_teams',
        compliantKey: 'compliant_teams',
        summaryLabel: 'Comparison dataset summary',
      })
    : null;

  const repositoryTotalDelta = buildDeltaView({
    current: repositorySummary.total,
    previous: comparisonRepositorySummary?.total,
    forceNeutral: true,
  });
  const repositoryCompliantDelta = buildDeltaView({
    current: repositorySummary.compliant,
    previous: comparisonRepositorySummary?.compliant,
  });
  const repositoryRateDelta = buildRateDeltaView({
    currentRate: Number(repositorySummary.complianceRate),
    previousRate: comparisonRepositorySummary
      ? Number(comparisonRepositorySummary.complianceRate)
      : null,
  });
  const teamTotalDelta = buildDeltaView({
    current: teamSummary.total,
    previous: comparisonTeamSummary?.total,
    forceNeutral: true,
  });
  const teamCompliantDelta = buildDeltaView({
    current: teamSummary.compliant,
    previous: comparisonTeamSummary?.compliant,
  });
  const teamRateDelta = buildRateDeltaView({
    currentRate: Number(teamSummary.complianceRate),
    previousRate: comparisonTeamSummary
      ? Number(comparisonTeamSummary.complianceRate)
      : null,
  });

  const sourceRepositoryChecks = getRequiredSummaryObjectValue({
    summary: sourceSummary,
    summaryLabel: 'Source dataset summary',
    fieldKey: 'repository_checks',
  });
  const sourceTeamChecks = getRequiredSummaryObjectValue({
    summary: sourceSummary,
    summaryLabel: 'Source dataset summary',
    fieldKey: 'team_checks',
  });
  const sourceRepositoryRatings = getRequiredSummaryObjectValue({
    summary: sourceSummary,
    summaryLabel: 'Source dataset summary',
    fieldKey: 'repository_ratings',
  });
  const comparisonRepositoryRatings = normaliseRepositoryRatings(
    comparisonSummary?.repository_ratings
  );
  const sourceScorecardCriteria =
    sourceDatasetData.scorecard_criteria &&
    typeof sourceDatasetData.scorecard_criteria === 'object'
      ? sourceDatasetData.scorecard_criteria
      : null;
  const scorecardCriteriaEntries = getScorecardCriteriaEntries(
    sourceScorecardCriteria
  );

  const repositoryCheckRows = buildCheckPerformanceRows(sourceRepositoryChecks);
  const teamCheckRows = buildCheckPerformanceRows(sourceTeamChecks);
  const repositoryRatingCards = buildRepositoryRatingCards({
    repositoryRatings: sourceRepositoryRatings,
    comparisonRepositoryRatings,
    totalRepositories: repositorySummary.total,
    scorecardCriteria: sourceScorecardCriteria,
  });
  const scorecardCriteriaRows = buildScorecardCriteriaRows(
    scorecardCriteriaEntries
  );
  const sourceDependabotSloRecord =
    sourceDatasetData.organisation_checks?.dependabot_slo;
  const sourceSecretScanningSloRecord =
    sourceDatasetData.organisation_checks?.secret_scanning_slo;
  const comparisonDependabotSloRecord =
    comparisonDatasetData?.organisation_checks?.dependabot_slo;
  const comparisonSecretScanningSloRecord =
    comparisonDatasetData?.organisation_checks?.secret_scanning_slo;

  const dependabotDelta = buildDeltaView({
    current: getSloBreachCount(sourceDependabotSloRecord) ?? 0,
    previous: getSloBreachCount(comparisonDependabotSloRecord),
    invertDirection: true,
  });
  const dependabotAffectedRepositoriesDelta = buildDeltaView({
    current: getSloAffectedRepositoryCount(sourceDependabotSloRecord) ?? 0,
    previous: getSloAffectedRepositoryCount(comparisonDependabotSloRecord),
    invertDirection: true,
  });
  const secretScanningDelta = buildDeltaView({
    current: getSloBreachCount(sourceSecretScanningSloRecord) ?? 0,
    previous: getSloBreachCount(comparisonSecretScanningSloRecord),
    invertDirection: true,
  });
  const secretScanningAffectedRepositoriesDelta = buildDeltaView({
    current: getSloAffectedRepositoryCount(sourceSecretScanningSloRecord) ?? 0,
    previous: getSloAffectedRepositoryCount(comparisonSecretScanningSloRecord),
    invertDirection: true,
  });
  const generatedAt = new Date().toISOString();

  const reportHeaderHtml = buildReportHeaderHtml({
    heading: 'Organisational GitHub Usage Policy Report',
    description:
      'Snapshot of organisational policy compliance for the selected datasets.',
    useThreeColumns: true,
    metadataItems: [
      { label: 'Organisation scanned', value: organisation },
      { label: 'Data from', value: sourceDatasetDisplay },
      { label: 'Compared against', value: comparisonDatasetDisplay },
    ],
  });

  const reportFooterHtml = buildReportFooterHtml({
    generatedAt,
    debugLines: [
      `Source dataset file: ${sourceDatasetDebugValue}`,
      `Comparison dataset file: ${comparisonDatasetDebugValue}`,
    ],
  });

  return generateHtmlDocument({
    title: 'Organisational GitHub Usage Policy Report',
    description:
      'Organisational GitHub Usage Policy report populated from selected datasets.',
    body: `    <main class="page">
${reportHeaderHtml}

      <section class="report-card" aria-labelledby="org-report-title">
        <div class="report-head">
          <h2 id="org-report-title" class="report-title">Organisational Report</h2>
          <p class="report-subtitle">High-level compliance posture across repositories and teams.</p>
        </div>
        <div class="report-body">
          <section class="report-section overview-section" aria-labelledby="repository-section-title">
            <div class="section-header">
              <h3 id="repository-section-title" class="section-title">Repository Section</h3>
              <p class="section-subtitle">Repository compliance totals and scorecard rating distribution.</p>
            </div>

            <div class="kpi-grid">
              <dl class="kpi">
                <dt>Total repositories</dt>
                <dd>${repositorySummary.total}</dd>
                <p class="kpi-delta ${repositoryTotalDelta.className}">${escapeHtml(repositoryTotalDelta.text)}</p>
              </dl>
              <dl class="kpi">
                <dt>Compliant repositories</dt>
                <dd>${repositorySummary.compliant}</dd>
                <p class="kpi-delta ${repositoryCompliantDelta.className}">${escapeHtml(repositoryCompliantDelta.text)}</p>
              </dl>
              <dl class="kpi">
                <dt>Repository compliance</dt>
                <dd>${repositorySummary.complianceRate}%</dd>
                <p class="kpi-delta ${repositoryRateDelta.className}">${escapeHtml(repositoryRateDelta.text)}</p>
              </dl>
            </div>

            <article class="block rating-breakdown-card">
              <h3>Repository Rating Breakdown</h3>
              <div class="rating-card-grid">
${repositoryRatingCards}
              </div>

              <details class="collapsible-block rating-criteria-collapsible scorecard-help-card">
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
              </details>
            </article>
          </section>

          <section class="report-section team-section" aria-labelledby="team-section-title">
            <div class="section-header">
              <h3 id="team-section-title" class="section-title">Teams Section</h3>
              <p class="section-subtitle">Team compliance totals for the selected organisation snapshot.</p>
            </div>

            <div class="kpi-grid">
              <dl class="kpi">
                <dt>Total teams</dt>
                <dd>${teamSummary.total}</dd>
                <p class="kpi-delta ${teamTotalDelta.className}">${escapeHtml(teamTotalDelta.text)}</p>
              </dl>
              <dl class="kpi">
                <dt>Compliant teams</dt>
                <dd>${teamSummary.compliant}</dd>
                <p class="kpi-delta ${teamCompliantDelta.className}">${escapeHtml(teamCompliantDelta.text)}</p>
              </dl>
              <dl class="kpi">
                <dt>Team compliance</dt>
                <dd>${teamSummary.complianceRate}%</dd>
                <p class="kpi-delta ${teamRateDelta.className}">${escapeHtml(teamRateDelta.text)}</p>
              </dl>
            </div>
          </section>

          <section class="report-section slo-section" aria-labelledby="secret-scanning-slo-title">
            <div class="section-header">
              <h3 id="secret-scanning-slo-title" class="section-title">Secret Scanning SLOs</h3>
              <p class="section-subtitle">Current secret scanning breach posture versus the comparison dataset.</p>
            </div>

            ${buildSloCardHtml(sourceSecretScanningSloRecord, 'Secret scanning SLO breaches', secretScanningDelta, secretScanningAffectedRepositoriesDelta, { showHeading: false })}
          </section>

          <section class="report-section slo-section" aria-labelledby="dependabot-slo-title">
            <div class="section-header">
              <h3 id="dependabot-slo-title" class="section-title">Dependabot SLOs</h3>
              <p class="section-subtitle">Current Dependabot alert breach posture versus the comparison dataset.</p>
            </div>

            ${buildSloCardHtml(sourceDependabotSloRecord, 'Dependabot SLO breaches', dependabotDelta, dependabotAffectedRepositoriesDelta, { showHeading: false })}
          </section>

          <section class="report-section details-section" aria-labelledby="details-breakdowns-title">
            <div class="section-header">
              <h3 id="details-breakdowns-title" class="section-title">Details Breakdowns</h3>
              <p class="section-subtitle">Expanded check performance detail for repositories and teams.</p>
            </div>

            <details class="block collapsible-block">
              <summary>Repository Check Breakdown</summary>
              <table class="check-table">
                <colgroup>
                  <col style="width: 36%" />
                  <col style="width: 16%" />
                  <col style="width: 16%" />
                  <col style="width: 16%" />
                  <col style="width: 16%" />
                </colgroup>
                <thead>
                  <tr>
                    <th>Check</th>
                    <th>Compliant</th>
                    <th>Non-compliant</th>
                    <th>Total</th>
                    <th>Rate</th>
                  </tr>
                </thead>
                <tbody>
${repositoryCheckRows.join('\n')}
                </tbody>
              </table>
            </details>

            <details class="block collapsible-block">
              <summary>Team Check Breakdown</summary>
              <table class="check-table">
                <colgroup>
                  <col style="width: 36%" />
                  <col style="width: 16%" />
                  <col style="width: 16%" />
                  <col style="width: 16%" />
                  <col style="width: 16%" />
                </colgroup>
                <thead>
                  <tr>
                    <th>Check</th>
                    <th>Compliant</th>
                    <th>Non-compliant</th>
                    <th>Total</th>
                    <th>Rate</th>
                  </tr>
                </thead>
                <tbody>
${teamCheckRows.join('\n')}
                </tbody>
              </table>
            </details>
          </section>

        </div>
      </section>

${reportFooterHtml}
    </main>`,
  });
};

module.exports = { buildOrganisationReportHtml };
