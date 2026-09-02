import {
  MODEL_NAMES,
  IDE_NAMES,
  LANGUAGE_NAMES,
} from '../../../constants/copilotConstants';
import { buildPieSlices } from '../../buildPieSlices';

const EXCLUDED_CHAT_FEATURES = new Set(['chat_panel_unknown_mode']);

function buildCumulativeAcceptanceGraph(data) {
  const monthly = {};

  for (const day of data) {
    const month = day.day.slice(0, 7);
    if (!monthly[month]) {
      monthly[month] = {
        suggestions: 0,
        acceptances: 0,
        locSuggested: 0,
        locAccepted: 0,
      };
    }
    for (const f of day.totals_by_feature ?? []) {
      const isCompletion = f.feature === 'code_completion';
      const isChat =
        f.feature.startsWith('chat_') && !EXCLUDED_CHAT_FEATURES.has(f.feature);
      if (!isCompletion && !isChat) continue;
      monthly[month].suggestions += f.code_generation_activity_count ?? 0;
      monthly[month].acceptances += f.code_acceptance_activity_count ?? 0;
      monthly[month].locSuggested += f.loc_suggested_to_add_sum ?? 0;
      monthly[month].locAccepted += f.loc_added_sum ?? 0;
    }
  }

  let cumSuggestions = 0;
  let cumAcceptances = 0;
  let cumLocSuggested = 0;
  let cumLocAccepted = 0;

  return Object.keys(monthly)
    .sort()
    .map(month => {
      cumSuggestions += monthly[month].suggestions;
      cumAcceptances += monthly[month].acceptances;
      cumLocSuggested += monthly[month].locSuggested;
      cumLocAccepted += monthly[month].locAccepted;
      return {
        date: month,
        suggestions: cumSuggestions,
        acceptances: cumAcceptances,
        acceptanceRate:
          cumSuggestions > 0 ? (cumAcceptances / cumSuggestions) * 100 : 0,
        locSuggested: cumLocSuggested,
        locAccepted: cumLocAccepted,
        lineAcceptanceRate:
          cumLocSuggested > 0 ? (cumLocAccepted / cumLocSuggested) * 100 : 0,
      };
    });
}

function formatModelName(model) {
  return MODEL_NAMES[model] || model;
}

function formatIdeName(ide) {
  return IDE_NAMES[ide] || ide;
}

function formatLanguageName(language) {
  return LANGUAGE_NAMES[language] || language.toUpperCase();
}

function buildUserAdoption(day) {
  return {
    chatUsers: {
      count: day.monthly_active_chat_users || 0,
      total: day.monthly_active_users || 0,
    },
    agentAdoption: {
      count: day.monthly_active_agent_users || 0,
      total: day.monthly_active_users || 0,
    },
  };
}

function buildEngagedUsersOverTime(data) {
  const months = {};

  for (const day of data) {
    const month = day.day.slice(0, 7);
    months[month] = {
      date: month,
      allActiveUsers: day.monthly_active_users || 0,
      chatUsers: day.monthly_active_chat_users || 0,
      agentUsers: day.monthly_active_agent_users || 0,
    };
  }

  const sorted = Object.values(months).sort((a, b) =>
    a.date.localeCompare(b.date)
  );

  // Remove the last month if it hasn't ended yet
  const lastDate = new Date(data[data.length - 1].day);
  const lastDayOfMonth = new Date(
    lastDate.getFullYear(),
    lastDate.getMonth() + 1,
    0
  ).getDate();

  if (lastDate.getDate() < lastDayOfMonth) {
    sorted.pop();
  }

  return sorted;
}

function buildModelUsage(data) {
  const modelTotals = {};

  for (const day of data) {
    for (const entry of day.totals_by_model_feature || []) {
      const model = formatModelName(entry.model);
      if (!modelTotals[model]) modelTotals[model] = 0;
      modelTotals[model] += entry.user_initiated_interaction_count || 0;
    }
  }

  return buildPieSlices(modelTotals);
}

function buildIdeUsage(data) {
  const ideTotals = {};

  for (const day of data) {
    for (const entry of day.totals_by_ide || []) {
      const ide = formatIdeName(entry.ide);
      if (!ideTotals[ide]) ideTotals[ide] = 0;
      ideTotals[ide] += entry.user_initiated_interaction_count || 0;
    }
  }

  return buildPieSlices(ideTotals);
}

function buildCodeImpact(data) {
  const langTotals = {};

  for (const day of data) {
    for (const entry of day.totals_by_language_model || []) {
      const language = formatLanguageName(entry.language);
      if (!langTotals[language]) langTotals[language] = 0;
      langTotals[language] +=
        (entry.loc_added_sum || 0) + (entry.loc_deleted_sum || 0);
    }
  }

  return buildPieSlices(langTotals);
}

/**
 * Processes organisation history data for the General Usage dashboard.
 *
 * @param {Array} data - Array of daily organisation history entries
 * @returns {Object} Processed data for the General Usage dashboard
 */
export function processGeneralUsageData(data) {
  if (!data || data.length === 0) return null;

  // Get the latest day of data to extract user adoption metrics
  const latestDay = data[data.length - 1];

  return {
    userAdoption: buildUserAdoption(latestDay),
    engagedUsersOverTime: buildEngagedUsersOverTime(data),
    cumulativeAcceptanceOverTime: buildCumulativeAcceptanceGraph(data),
    modelUsage: buildModelUsage(data),
    ideUsage: buildIdeUsage(data),
    codeImpact: buildCodeImpact(data),
  };
}
