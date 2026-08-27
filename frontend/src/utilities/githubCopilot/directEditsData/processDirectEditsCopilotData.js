// This file is responsible for processing the Copilot usage data and formatting it
// into relevant data for the Direct Edits section of the dashboard.
import {
  LANGUAGE_NAMES,
  MODEL_NAMES,
} from '../../../constants/copilotConstants';
import { buildPieSlices } from '../../buildPieSlices';

/**
 * Returns true when the given date string falls on a Saturday or Sunday.
 * @param {string} dateString - ISO date string e.g. '2026-03-01'
 * @returns {boolean}
 */
function isWeekendDate(dateString) {
  const date = new Date(`${dateString}T00:00:00`);
  const day = date.getDay();
  return day === 0 || day === 6;
}

/**
 * Process the organisation history data and extract all Agent Edit metrics.
 *
 * Returns an object with:
 *  - summaryCards:      { totalLinesAdded, totalLinesDeleted }
 *  - dailyGraph:        [{ date, linesAdded, linesDeleted }]  (one entry per included day)
 *  - languagePieChart:  { added: [{ <lang>: fraction }], deleted: [{ <lang>: fraction }] }
 *  - modelPieChart:     { added: [{ <model>: fraction }], deleted: [{ <model>: fraction }] }
 *
 * Fractions sum to 1 across each array (same pattern as processCodeCompletionData).
 *
 * @param {Array}  data    - Array of daily records from organisation_history.json
 * @param {Object} options
 * @param {boolean} [options.includeWeekendUsage=true]
 * @returns {Object}
 */
export function processDirectEditsCopilotData(data, options = {}) {
  const { includeWeekendUsage = true } = options;

  // ── Summary totals ─────────────────────────────────────────────────────────
  let totalLinesAdded = 0;
  let totalLinesDeleted = 0;

  // ── Daily graph ────────────────────────────────────────────────────────────
  // Format: [{ date: 'YYYY-MM-DD', linesAdded: number, linesDeleted: number }]
  const dailyGraph = [];

  // ── Language pie chart accumulators ───────────────────────────────────────
  const langAdded = {};
  const langDeleted = {};
  let totalLangAdded = 0;
  let totalLangDeleted = 0;

  // ── Model pie chart accumulators ───────────────────────────────────────────
  const modelAdded = {};
  const modelDeleted = {};
  let totalModelAdded = 0;
  let totalModelDeleted = 0;

  for (const entry of data) {
    if (!includeWeekendUsage && isWeekendDate(entry.day)) {
      continue;
    }

    // ── Agent edit feature row from totals_by_feature ──────────────────────
    const agentEditsFeature =
      entry.totals_by_feature?.find(f => f.feature === 'agent_edit') ?? {};

    const dayAdded = agentEditsFeature.loc_added_sum ?? 0;
    const dayDeleted = agentEditsFeature.loc_deleted_sum ?? 0;

    totalLinesAdded += dayAdded;
    totalLinesDeleted += dayDeleted;

    dailyGraph.push({
      date: entry.day,
      linesAdded: dayAdded,
      linesDeleted: dayDeleted,
    });

    // ── Language breakdown from totals_by_language_feature ─────────────────
    const agentLangRows = (entry.totals_by_language_feature ?? []).filter(
      row => row.feature === 'agent_edit'
    );

    for (const row of agentLangRows) {
      const lang = LANGUAGE_NAMES[row.language] ?? row.language;
      const added = row.loc_added_sum ?? 0;
      const deleted = row.loc_deleted_sum ?? 0;

      langAdded[lang] = (langAdded[lang] ?? 0) + added;
      langDeleted[lang] = (langDeleted[lang] ?? 0) + deleted;
      totalLangAdded += added;
      totalLangDeleted += deleted;
    }

    // ── Model breakdown from totals_by_model_feature ───────────────────────
    const agentModelRows = (entry.totals_by_model_feature ?? []).filter(
      row => row.feature === 'agent_edit'
    );

    for (const row of agentModelRows) {
      const model = MODEL_NAMES[row.model] ?? row.model;
      const added = row.loc_added_sum ?? 0;
      const deleted = row.loc_deleted_sum ?? 0;

      modelAdded[model] = (modelAdded[model] ?? 0) + added;
      modelDeleted[model] = (modelDeleted[model] ?? 0) + deleted;
      totalModelAdded += added;
      totalModelDeleted += deleted;
    }
  }

  const languagePieChart = {
    added: buildPieSlices(langAdded),
    deleted: buildPieSlices(langDeleted),
  };

  const modelPieChart = {
    added: buildPieSlices(modelAdded),
    deleted: buildPieSlices(modelDeleted),
  };

  return {
    summaryCards: {
      totalLinesAdded,
      totalLinesDeleted,
    },
    dailyGraph,
    languagePieChart,
    modelPieChart,
  };
}
