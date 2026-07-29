const escapeHtml = value =>
  String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

const normaliseForFileName = value =>
  String(value)
    .trim()
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/g, '-')
    .replaceAll(/^-+|-+$/g, '');

const formatInputValue = value => {
  if (Array.isArray(value)) {
    return value.length > 0 ? value.join(', ') : 'None selected';
  }

  return value ? String(value) : 'Not provided';
};

const buildPlaceholderHtml = ({ reportType, inputs }) => {
  const inputRows = Object.entries(inputs)
    .map(
      ([label, value]) =>
        `      <li><strong>${escapeHtml(label)}:</strong> ${escapeHtml(formatInputValue(value))}</li>`
    )
    .join('\n');

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(reportType)} Placeholder Report</title>
  </head>
  <body>
    <h1>${escapeHtml(reportType)} Placeholder Report</h1>
    <p>This is a temporary placeholder report while backend generation is being implemented.</p>
    <h2>Inputs</h2>
    <ul>
${inputRows}
    </ul>
  </body>
</html>`;
};

export const generatePolicyReport = async ({ reportType, inputs }) => {
  await new Promise(resolve => {
    setTimeout(resolve, 900);
  });

  const html = buildPlaceholderHtml({ reportType, inputs });
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const downloadUrl = URL.createObjectURL(blob);

  const dateStamp = new Date().toISOString().replaceAll(/[-:.]/g, '');
  const fileName = `policy-${normaliseForFileName(reportType)}-${dateStamp}.html`;

  const link = document.createElement('a');
  link.href = downloadUrl;
  link.download = fileName;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(downloadUrl);
};
