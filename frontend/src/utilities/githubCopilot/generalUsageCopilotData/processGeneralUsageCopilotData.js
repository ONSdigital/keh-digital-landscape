import {
  MODEL_NAMES,
  IDE_NAMES,
  LANGUAGE_NAMES,
} from '../../../constants/copilotConstants';
import { buildPieSlices } from '../../buildPieSlices';

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

function buildEngagedUsersOvertime(data) {
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
    engagedUsersOvertime: buildEngagedUsersOvertime(data),
    modelUsage: buildModelUsage(data),
    ideUsage: buildIdeUsage(data),
    codeImpact: buildCodeImpact(data),
  };
}
