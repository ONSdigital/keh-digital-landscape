const escapeHtml = value =>
  String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

const normaliseForFileName = value => {
  const normalisedValue = String(value).trim().toLowerCase().slice(0, 2000);

  return normalisedValue
    .replaceAll(/[^a-z0-9]+/g, '-')
    .replaceAll(/^-+/g, '')
    .replaceAll(/-+$/g, '');
};

const getInputString = (inputs, key) =>
  inputs[key] === null || inputs[key] === undefined
    ? 'Not provided'
    : String(inputs[key]);

const getInputList = (inputs, key) => {
  const listValue = inputs[key];

  if (!Array.isArray(listValue) || listValue.length === 0) {
    return [];
  }

  return listValue.map(item => String(item));
};

const percentage = (numerator, denominator) => {
  if (!denominator) {
    return '0.0';
  }

  return ((numerator / denominator) * 100).toFixed(1);
};

const normaliseSectionAnchor = (prefix, value) =>
  `${prefix}-${normaliseForFileName(value || 'unknown-item')}`;

module.exports = {
  escapeHtml,
  getInputList,
  getInputString,
  normaliseForFileName,
  normaliseSectionAnchor,
  percentage,
};
