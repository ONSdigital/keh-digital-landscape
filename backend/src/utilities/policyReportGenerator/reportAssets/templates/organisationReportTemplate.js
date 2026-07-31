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
  affectedRepositoriesDeltaView
) => {
  if (!sloRecord || typeof sloRecord !== 'object') {
    return `<article class="slo-card">
              <h3>${escapeHtml(fallbackHeading)}</h3>
              <p class="note">No SLO data present in the selected dataset.</p>
            </article>`;
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
    return `<article class="slo-card">
              <h3>${heading}</h3>
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
            </article>`;
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

  return `<article class="slo-card">
              <h3>${heading}</h3>
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
            </article>`;
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

  const repositoryCheckRows = buildCheckPerformanceRows(sourceRepositoryChecks);
  const teamCheckRows = buildCheckPerformanceRows(sourceTeamChecks);
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

          <div class="slo-grid">
            ${buildSloCardHtml(sourceDependabotSloRecord, 'Dependabot SLO breaches', dependabotDelta, dependabotAffectedRepositoriesDelta)}

            ${buildSloCardHtml(sourceSecretScanningSloRecord, 'Secret scanning SLO breaches', secretScanningDelta, secretScanningAffectedRepositoriesDelta)}
          </div>

          <details class="block collapsible-block">
            <summary>Repository check breakdown</summary>
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
            <summary>Team check breakdown</summary>
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
        </div>
      </section>

${reportFooterHtml}
    </main>`,
  });
};

module.exports = { buildOrganisationReportHtml };
