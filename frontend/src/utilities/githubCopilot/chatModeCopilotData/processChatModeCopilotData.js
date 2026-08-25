import {
  MODEL_NAMES,
  LANGUAGE_NAMES,
} from '../../../constants/copilotConstants';
import { buildPieSlices } from '../../buildPieSlices';

const CHAT_FEATURE_PREFIX = 'chat_';

const CHAT_MODE_NAMES = {
  chat_inline: 'Inline Chat',
  chat_panel_agent_mode: 'Agent Mode',
  chat_panel_ask_mode: 'Ask Mode',
  chat_panel_edit_mode: 'Edit Mode',
  chat_panel_plan_mode: 'Plan Mode',
  chat_panel_custom_mode: 'Custom Mode',
};

const EXCLUDED_CHAT_FEATURES = new Set(['chat_panel_unknown_mode']);

function isChatFeature(feature) {
  return (
    feature?.startsWith(CHAT_FEATURE_PREFIX) &&
    !EXCLUDED_CHAT_FEATURES.has(feature)
  );
}

function isWeekendDate(dateString) {
  const date = new Date(`${dateString}T00:00:00`);
  const day = date.getDay();
  return day === 0 || day === 6;
}

function formatModelName(model) {
  return MODEL_NAMES[model] || model;
}

function formatLanguageName(language) {
  return LANGUAGE_NAMES[language] || language;
}

function formatChatModeName(feature) {
  return CHAT_MODE_NAMES[feature] || feature;
}

export function processChatModeData(data, options = {}) {
  const { includeWeekendUsage = true } = options;

  let totalSuggestions = 0;
  let totalAcceptances = 0;
  let totalLOCSuggested = 0;
  let totalLOCAccepted = 0;

  const suggestedGraph = [];
  const suggestedLOCGraph = [];
  const averageSuggestedLOCGraph = [];

  // Language pie accumulators
  const langSuggestions = {};
  const langAcceptances = {};
  let totalLangSuggestions = 0;
  let totalLangAcceptances = 0;

  // Model pie accumulators
  const modelSuggestions = {};
  const modelAcceptances = {};
  let totalModelSuggestions = 0;
  let totalModelAcceptances = 0;

  // Chat mode pie accumulators
  const modeSuggestions = {};
  const modeAcceptances = {};
  let totalModeSuggestions = 0;
  let totalModeAcceptances = 0;

  for (const entry of data) {
    if (!includeWeekendUsage && isWeekendDate(entry.day)) {
      continue;
    }

    // Aggregate all chat features for the day
    const chatFeatureRows = (entry.totals_by_feature ?? []).filter(row =>
      isChatFeature(row.feature)
    );

    let daySuggestions = 0;
    let dayAcceptances = 0;
    let dayLOCSuggested = 0;
    let dayLOCAccepted = 0;

    for (const row of chatFeatureRows) {
      const suggestions = row.code_generation_activity_count ?? 0;
      const acceptances = row.code_acceptance_activity_count ?? 0;

      daySuggestions += suggestions;
      dayAcceptances += acceptances;
      dayLOCSuggested += row.loc_suggested_to_add_sum ?? 0;
      dayLOCAccepted += row.loc_added_sum ?? 0;

      // Chat mode breakdown
      const modeName = formatChatModeName(row.feature);
      modeSuggestions[modeName] =
        (modeSuggestions[modeName] ?? 0) + suggestions;
      modeAcceptances[modeName] =
        (modeAcceptances[modeName] ?? 0) + acceptances;
      totalModeSuggestions += suggestions;
      totalModeAcceptances += acceptances;
    }

    // Skip anomalous days where acceptances exceed suggestions
    if (dayAcceptances > daySuggestions) {
      continue;
    }

    totalSuggestions += daySuggestions;
    totalAcceptances += dayAcceptances;
    totalLOCSuggested += dayLOCSuggested;
    totalLOCAccepted += dayLOCAccepted;

    const dayAcceptanceRate =
      daySuggestions > 0 ? (dayAcceptances / daySuggestions) * 100 : 0;
    const dayLOCAcceptanceRate =
      dayLOCSuggested > 0 ? (dayLOCAccepted / dayLOCSuggested) * 100 : 0;

    suggestedGraph.push({
      date: entry.day,
      suggestions: daySuggestions,
      acceptances: dayAcceptances,
      acceptanceRate: dayAcceptanceRate,
    });

    suggestedLOCGraph.push({
      date: entry.day,
      locSuggestions: dayLOCSuggested,
      locAcceptances: dayLOCAccepted,
      acceptanceRate: dayLOCAcceptanceRate,
    });

    averageSuggestedLOCGraph.push({
      date: entry.day,
      avgLOCSuggested:
        daySuggestions > 0 ? dayLOCSuggested / daySuggestions : 0,
      avgLOCAccepted: dayAcceptances > 0 ? dayLOCAccepted / dayAcceptances : 0,
    });

    // Language breakdown across all chat features
    const chatLangRows = (entry.totals_by_language_feature ?? []).filter(row =>
      isChatFeature(row.feature)
    );

    for (const row of chatLangRows) {
      const lang = formatLanguageName(row.language);
      const suggestions = row.code_generation_activity_count ?? 0;
      const acceptances = row.code_acceptance_activity_count ?? 0;

      langSuggestions[lang] = (langSuggestions[lang] ?? 0) + suggestions;
      langAcceptances[lang] = (langAcceptances[lang] ?? 0) + acceptances;
      totalLangSuggestions += suggestions;
      totalLangAcceptances += acceptances;
    }

    // Model breakdown across all chat features
    const chatModelRows = (entry.totals_by_model_feature ?? []).filter(row =>
      isChatFeature(row.feature)
    );

    for (const row of chatModelRows) {
      const model = formatModelName(row.model);
      const suggestions = row.code_generation_activity_count ?? 0;
      const acceptances = row.code_acceptance_activity_count ?? 0;

      modelSuggestions[model] = (modelSuggestions[model] ?? 0) + suggestions;
      modelAcceptances[model] = (modelAcceptances[model] ?? 0) + acceptances;
      totalModelSuggestions += suggestions;
      totalModelAcceptances += acceptances;
    }
  }

  return {
    suggestedCards: {
      totalSuggestionInstances: totalSuggestions,
      totalAcceptances: totalAcceptances,
      overallAcceptanceRate:
        totalSuggestions > 0 ? totalAcceptances / totalSuggestions : 0,
      totalLinesSuggested: totalLOCSuggested,
      totalLinesAccepted: totalLOCAccepted,
      overallLineAcceptanceRate:
        totalLOCSuggested > 0 ? totalLOCAccepted / totalLOCSuggested : 0,
      averageLocPerSuggestion:
        totalSuggestions > 0 ? totalLOCSuggested / totalSuggestions : 0,
      averageLocPerAcceptance:
        totalAcceptances > 0 ? totalLOCAccepted / totalAcceptances : 0,
    },
    suggestedGraph,
    suggestedLOCGraph,
    averageSuggestedLOCGraph,
    languagePieChart: {
      suggestions: buildPieSlices(langSuggestions),
      acceptances: buildPieSlices(langAcceptances),
    },
    modelPieChart: {
      suggestions: buildPieSlices(modelSuggestions),
      acceptances: buildPieSlices(modelAcceptances),
    },
    chatModePieChart: {
      suggestions: buildPieSlices(modeSuggestions),
      acceptances: buildPieSlices(modeAcceptances),
    },
  };
}
