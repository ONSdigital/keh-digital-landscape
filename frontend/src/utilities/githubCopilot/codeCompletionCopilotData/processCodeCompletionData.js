// This file is responsible for processing the Copilot usage data and formatting it into relevant data for the code completion dashboard

import { LANGUAGE_NAMES } from '../../../constants/copilotConstants';
import { buildPieSlices } from '../../buildPieSlices';

function isWeekendDate(dateString) {
  const date = new Date(`${dateString}T00:00:00`);
  const day = date.getDay();
  return day === 0 || day === 6;
}

function formatLanguageName(language) {
  return LANGUAGE_NAMES[language] || language;
}

export function processCodeCompletionData(data, options = {}) {
  /** This function aggregates the compontentised graphs and cards with the data, where the components are:
   * - Chat cards
   * - Acceptance graph (suggestions vs acceptances) - Bar chart
   * - (Toggleable) Acceptance graph (lines of code suggested vs lines of code accepted) - Bar chart
   * - Average LOC size line graph (suggestions vs acceptances) - Line graph
   * - Language breakdown chart (programming language usage rates) - Pie chart
   */

  // This parameter is passed in from the dashboard to determine whether to include weekend data or not
  const { includeWeekendUsage = true } = options;

  // Overall Dictionary
  let codeCompletionMetrics = {};

  // List for Acceptance graph (suggestions vs acceptances),
  // Format: [{ date: 'YYYY-MM-DD', suggestions: daySuggested, acceptances: dayAccepted, acceptanceRate: dayAcceptanceRate }]
  let suggestedGraph = [];

  // List for (Optional) Acceptance graph (lines of code suggested vs lines of code accepted),
  // Format: [{ date: 'YYYY-MM-DD', locSuggestions: dayLOCSuggested, locAcceptances: dayLOCAccepted, acceptanceRate: dayLOCAcceptanceRate, }]
  let suggestedLOCGraph = [];

  // List for Average LOC size line graph (average lines of code per suggestion vs average lines of code per acceptance),
  // Format: [{ date: 'YYYY-MM-DD', avgLOCSuggested: dayLOCSuggested / daySuggested, avgLOCAccepted: dayLOCAccepted / dayAccepted}]
  let averageSuggestedLOCGraph = [];

  let suggestionsSum = 0;
  let acceptancesSum = 0;
  let suggestionsLOCSum = 0;
  let acceptancesLOCSum = 0;

  const langSuggestionCounts = {};
  const langAcceptanceCounts = {};

  for (const index in data) {
    const day = data[index];

    if (!includeWeekendUsage && isWeekendDate(day.day)) {
      continue;
    }

    let codeCompletionData = day.totals_by_feature?.find(
      item => item.feature === 'code_completion'
    );

    if (!codeCompletionData) {
      continue;
    }

    // suggestedCards calculations
    let daySuggested = codeCompletionData.code_generation_activity_count;
    let dayAccepted = codeCompletionData.code_acceptance_activity_count;
    let dayLOCSuggested = codeCompletionData.loc_suggested_to_add_sum;
    let dayLOCAccepted = codeCompletionData.loc_added_sum;

    suggestionsSum += daySuggested;
    acceptancesSum += dayAccepted;
    suggestionsLOCSum += dayLOCSuggested;
    acceptancesLOCSum += dayLOCAccepted;

    const dayAcceptanceRate =
      daySuggested > 0 ? (dayAccepted / daySuggested) * 100 : 0;
    const dayLOCAcceptanceRate =
      dayLOCSuggested > 0 ? (dayLOCAccepted / dayLOCSuggested) * 100 : 0;

    suggestedGraph.push({
      date: day.day,
      suggestions: daySuggested,
      acceptances: dayAccepted,
      acceptanceRate: dayAcceptanceRate,
    });

    suggestedLOCGraph.push({
      date: day.day,
      locSuggestions: dayLOCSuggested,
      locAcceptances: dayLOCAccepted,
      acceptanceRate: dayLOCAcceptanceRate,
    });

    averageSuggestedLOCGraph.push({
      date: day.day,
      avgLOCSuggested: daySuggested > 0 ? dayLOCSuggested / daySuggested : 0,
      avgLOCAccepted: dayAccepted > 0 ? dayLOCAccepted / dayAccepted : 0,
    });

    // Language breakdown
    const completionLangRows = (day.totals_by_language_feature ?? []).filter(
      item => item.feature === 'code_completion'
    );

    for (const row of completionLangRows) {
      const lang = formatLanguageName(row.language);
      langSuggestionCounts[lang] =
        (langSuggestionCounts[lang] ?? 0) +
        (row.code_generation_activity_count ?? 0);
      langAcceptanceCounts[lang] =
        (langAcceptanceCounts[lang] ?? 0) +
        (row.code_acceptance_activity_count ?? 0);
    }
  }

  const suggestedCards = {
    totalSuggestionInstances: suggestionsSum,
    totalAcceptances: acceptancesSum,
    overallAcceptanceRate:
      suggestionsSum > 0 ? acceptancesSum / suggestionsSum : 0,
    totalLinesSuggested: suggestionsLOCSum,
    totalLinesAccepted: acceptancesLOCSum,
    overallLineAcceptanceRate:
      suggestionsLOCSum > 0 ? acceptancesLOCSum / suggestionsLOCSum : 0,
    averageLocPerSuggestion:
      suggestionsSum > 0 ? suggestionsLOCSum / suggestionsSum : 0,
    averageLocPerAcceptance:
      acceptancesSum > 0 ? acceptancesLOCSum / acceptancesSum : 0,
  };

  codeCompletionMetrics = {
    suggestedCards,
    suggestedGraph,
    suggestedLOCGraph,
    averageSuggestedLOCGraph,
    languagePieChart: {
      suggestions: buildPieSlices(langSuggestionCounts),
      acceptances: buildPieSlices(langAcceptanceCounts),
    },
  };

  return codeCompletionMetrics;
}
