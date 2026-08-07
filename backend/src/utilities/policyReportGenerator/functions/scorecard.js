const { escapeHtml, formatCheckName } = require('./common');

const formatRatingLabel = rating =>
  String(rating || '')
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');

const getScorecardCriteriaEntries = scorecardCriteria => {
  if (!scorecardCriteria || typeof scorecardCriteria !== 'object') {
    return [];
  }

  return Object.entries(scorecardCriteria)
    .filter(([, criteria]) => criteria && typeof criteria === 'object')
    .map(([rating, criteria]) => ({
      rating: String(rating || '').toLowerCase(),
      minCompliance:
        typeof criteria.min_compliance === 'number'
          ? criteria.min_compliance
          : Number(criteria.min_compliance),
      requiredChecks: Array.isArray(criteria.required_checks)
        ? criteria.required_checks.map(check => String(check || ''))
        : [],
    }))
    .filter(
      criteriaEntry =>
        criteriaEntry.rating && Number.isFinite(criteriaEntry.minCompliance)
    )
    .sort((left, right) => {
      if (right.minCompliance !== left.minCompliance) {
        return right.minCompliance - left.minCompliance;
      }

      return left.rating.localeCompare(right.rating);
    });
};

const buildScorecardCriteriaRows = scorecardCriteriaEntries => {
  return scorecardCriteriaEntries
    .map(criteriaEntry => {
      const requiredChecksLabel =
        criteriaEntry.requiredChecks.length > 0
          ? criteriaEntry.requiredChecks
              .map(requiredCheck => escapeHtml(formatCheckName(requiredCheck)))
              .join(', ')
          : 'No mandatory checks';

      return `                <tr>
                  <td><span class="pill rating rating-${escapeHtml(criteriaEntry.rating)}">${escapeHtml(formatRatingLabel(criteriaEntry.rating))}</span></td>
                  <td>${criteriaEntry.minCompliance.toFixed(1)}%</td>
                  <td>${requiredChecksLabel}</td>
                </tr>`;
    })
    .join('\n');
};

module.exports = {
  buildScorecardCriteriaRows,
  formatRatingLabel,
  getScorecardCriteriaEntries,
};
