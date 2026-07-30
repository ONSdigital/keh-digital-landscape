const {
  generateReportHtmlByType,
} = require('./functions/generateReportHtmlByType');
const { normaliseForFileName } = require('./functions/common');

const generateReportFileName = reportType => {
  const dateStamp = new Date().toISOString().replaceAll(/[-:.]/g, '');
  return `policy-${normaliseForFileName(reportType)}-${dateStamp}.html`;
};

const generateReport = ({ reportType, inputs }) => {
  const html = generateReportHtmlByType({ reportType, inputs });
  const fileName = generateReportFileName(reportType);
  return { html, fileName };
};

module.exports = {
  generateReport,
};
