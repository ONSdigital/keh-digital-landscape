const fs = require('fs');
const path = require('path');
const { escapeHtml } = require('./common');

const sharedReportCss = fs.readFileSync(
  path.join(__dirname, '../reportAssets/reportStyles.css'),
  'utf8'
);

const generateHtmlDocument = ({ title, description, body }) => `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}" />
    <style>
${sharedReportCss}
    </style>
  </head>
  <body>
${body}
  </body>
</html>`;

module.exports = { generateHtmlDocument };
