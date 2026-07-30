const {
  generateHtmlDocument,
} = require('../../functions/generateHtmlDocument');
const { getInputString } = require('../../functions/common');
const {
  buildReportFooterHtml,
  buildReportHeaderHtml,
} = require('./reportFrameTemplate');

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
  const generatedAt = new Date().toISOString();

  const reportHeaderHtml = buildReportHeaderHtml({
    heading: 'Organisational GitHub Usage Policy Report',
    description:
      'Generated organisational compliance report from backend snapshot data.',
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
              <dd>Pending</dd>
            </dl>
            <dl class="kpi">
              <dt>Compliant repositories</dt>
              <dd>Pending</dd>
            </dl>
            <dl class="kpi">
              <dt>Repository compliance</dt>
              <dd>Pending</dd>
            </dl>
            <dl class="kpi">
              <dt>Total teams</dt>
              <dd>Pending</dd>
            </dl>
            <dl class="kpi">
              <dt>Compliant teams</dt>
              <dd>Pending</dd>
            </dl>
            <dl class="kpi">
              <dt>Team compliance</dt>
              <dd>Pending</dd>
            </dl>
          </div>

          <div class="slo-grid">
            <article class="slo-card">
              <h3>Dependabot SLO breaches</h3>
              <div class="slo-metric">
                <strong>Pending</strong>
                <span class="note">open alerts breaching SLO</span>
              </div>
              <p class="slo-delta neutral">Awaiting source/comparison calculation.</p>
            </article>

            <article class="slo-card">
              <h3>Secret scanning SLO breaches</h3>
              <div class="slo-metric">
                <strong>Pending</strong>
                <span class="note">open alerts breaching SLO</span>
              </div>
              <p class="slo-delta neutral">Awaiting source/comparison calculation.</p>
            </article>
          </div>

          <article class="block">
            <h3>Repository check performance</h3>
            <table class="check-table">
              <colgroup>
                <col style="width: 40%" />
                <col style="width: 18%" />
                <col style="width: 18%" />
                <col style="width: 24%" />
              </colgroup>
              <thead>
                <tr>
                  <th>Check</th>
                  <th>Compliant</th>
                  <th>Total</th>
                  <th>Rate</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Pending backend checks</td>
                  <td>-</td>
                  <td>-</td>
                  <td>-</td>
                </tr>
              </tbody>
            </table>
          </article>

          <article class="block">
            <h3>Team check performance</h3>
            <table class="check-table">
              <colgroup>
                <col style="width: 40%" />
                <col style="width: 18%" />
                <col style="width: 18%" />
                <col style="width: 24%" />
              </colgroup>
              <thead>
                <tr>
                  <th>Check</th>
                  <th>Compliant</th>
                  <th>Total</th>
                  <th>Rate</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Pending backend checks</td>
                  <td>-</td>
                  <td>-</td>
                  <td>-</td>
                </tr>
              </tbody>
            </table>
          </article>
        </div>
      </section>

${reportFooterHtml}
    </main>`,
  });
};

module.exports = { buildOrganisationReportHtml };
