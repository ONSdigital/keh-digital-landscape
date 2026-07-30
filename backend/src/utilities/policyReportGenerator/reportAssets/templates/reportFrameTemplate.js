const { escapeHtml } = require('../../functions/common');

const buildMetadataItemsHtml = metadataItems =>
  metadataItems
    .map(
      ({ label, value }) => `          <p class="meta-priority-item">
            <span class="meta-priority-label">${escapeHtml(label)}</span>
            ${escapeHtml(value)}
          </p>`
    )
    .join('\n');

const buildReportHeaderHtml = ({
  heading,
  description,
  metadataItems = [],
  useThreeColumns = false,
}) => {
  const priorityClassName = useThreeColumns
    ? 'meta-priority three-col'
    : 'meta-priority';

  return `      <header class="page-header">
        <h1>${escapeHtml(heading)}</h1>
        <p>${escapeHtml(description)}</p>
        <div class="${priorityClassName}" aria-label="Primary report metadata">
${buildMetadataItemsHtml(metadataItems)}
        </div>
      </header>`;
};

const buildReportFooterHtml = ({ generatedAt, debugLines = [] }) => {
  const debugLineHtml = debugLines
    .map(debugLine => `        <p class="note">${escapeHtml(debugLine)}</p>`)
    .join('\n');

  return `      <footer class="report-footer">
        <p>Report generated: ${escapeHtml(generatedAt)}</p>
${debugLineHtml}
      </footer>`;
};

module.exports = {
  buildReportFooterHtml,
  buildReportHeaderHtml,
};
