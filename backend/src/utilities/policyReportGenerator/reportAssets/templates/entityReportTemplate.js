const {
  generateHtmlDocument,
} = require('../../functions/generateHtmlDocument');
const {
  escapeHtml,
  getInputList,
  getInputString,
  normaliseSectionAnchor,
  percentage,
} = require('../../functions/common');
const {
  buildReportFooterHtml,
  buildReportHeaderHtml,
} = require('./reportFrameTemplate');

const renderEntitySummaryRows = ({ entities, anchorPrefix }) =>
  entities
    .map(entity => {
      const escapedEntity = escapeHtml(entity);
      const anchorId = normaliseSectionAnchor(anchorPrefix, entity);

      return `                <tr>
                  <td><a href="#${anchorId}">${escapedEntity}</a></td>
                  <td><span class="pill warn">pending</span></td>
                  <td>Pending backend checks</td>
                </tr>`;
    })
    .join('\n');

const renderEntityDetailBlocks = ({
  entities,
  entityNounSingular,
  anchorPrefix,
}) =>
  entities
    .map(entity => {
      const escapedEntity = escapeHtml(entity);
      const anchorId = normaliseSectionAnchor(anchorPrefix, entity);

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
                <tr>
                  <td>policy_checks</td>
                  <td><span class="pill warn">pending</span></td>
                  <td>Detailed checks for this ${escapeHtml(entityNounSingular)} will be populated from backend policy results.</td>
                </tr>
              </tbody>
            </table>
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
  const safeEntities =
    entities.length > 0 ? entities : [`No ${entityNounPlural} selected`];
  const generatedAt = new Date().toISOString();

  const totalSelected = entities.length;
  const assessedCount = 0;
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
              <dd class="kpi-sub">${complianceRate}% of selected ${escapeHtml(entityNounPlural)} are currently assessed as compliant.</dd>
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
  entities: safeEntities,
  anchorPrefix: detailAnchorPrefix,
})}
              </tbody>
            </table>
          </article>

${renderEntityDetailBlocks({
  entities,
  entityNounSingular,
  anchorPrefix: detailAnchorPrefix,
})}
        </div>
      </section>

${reportFooterHtml}
    </main>`,
  });
};

module.exports = { buildEntityReportHtml };
