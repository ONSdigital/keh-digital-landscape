// This file is responsible for processing the Copilot usage data and formatting it into relevant data for the code completion dashboard

/**
 * Returns the Monday (week start) for a given date string as 'YYYY-MM-DD'
 * @param {string} dateStr
 * @returns {string}
 */
function getWeekStart(dateStr) {
  const date = new Date(dateStr);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1); // adjust to Monday
  const monday = new Date(date);
  monday.setDate(diff);
  return monday.toISOString().split('T')[0];
}

/**
 * Process the Copilot data and format it into useful data for graphs and data cards
 * @param {Object} data
 * @returns {Object} An object containing the total Copilot suggestions and suggested lines of code,
 * the total Copilot accepted suggestions and accepted lines of code
 */
export function processCodeCompletionData(data) {
  /** This function aggregates the compontentised graphs and cards with the data, where the components are:
   * - Chat cards
   * - Acceptance graph (suggestions vs acceptances) - Bar chart
   * - (Toggleable) Acceptance graph (lines of code suggested vs lines of code accepted) - Bar chart
   * - Average LOC size line graph (suggestions vs acceptances) - Line graph
   * - Language breakdown chart (programming language usage rates) - Pie chart
   */

  // Overall Dictionary
  let codeCompletionMetrics = {};

  // Dictionary for the all pages Chat Cards
  let suggestedCards = {
    suggestions: {
      totalSuggestions: 0,
      totalAcceptances: 0,
      acceptanceRate: 0,
    },
    loc: {
      totalLOCSuggestions: 0,
      totalLOCAcceptances: 0,
      acceptanceLOCRate: 0,
    },
    average: {
      averageLOCSuggestions: 0,
      averageLOCAccepted: 0,
    },
  };

  // Weekly buckets for graph data — keyed by Monday date string
  const weeklyGraphData = {};

  // Dictionary for Acceptance graph (suggestions vs acceptances), format: { date: 'YYYY-MM-DD', suggestions, acceptances, acceptanceRate }
  let suggestedGraph = [];

  // Dictionary for (Optional) Acceptance graph (lines of code suggested vs lines of code accepted), format: { date: 'YYYY-MM-DD', locSuggestions, locAcceptances, acceptanceRate }
  let suggestedLOCGraph = [];

  // Dictionary for Average LOC size line graph (average lines of code per suggestion vs average lines of code per acceptance), format: { date: 'YYYY-MM-DD', avgLOCSuggested, avgLOCAccepted }
  let averageSuggestedLOCGraph = [];

  // Dictionary for percentage of suggestions/acceptances using 'x' language, format: {language: percentageUsed}
  let languagesUsedPieChart = {
    suggestions: [],
    acceptances: [],
  };

  let suggestionsSum = 0;
  let acceptancesSum = 0;
  let suggestionsLOCSum = 0;
  let acceptancesLOCSum = 0;

  let numberLOCSuggestions = 0;
  let numberLOCAcceptances = 0;

  let totalGeneratedSuggestions = 0;
  const langSuggestionCounts = {};
  const langAcceptanceCounts = {};

  for (const index in data) {
    const day = data[index];

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

    // Counting number of times LOC was accepted
    if (dayLOCSuggested > 0) {
      numberLOCSuggestions += 1;
    }
    if (dayLOCAccepted > 0) {
      numberLOCAcceptances += 1;
    }

    // Accumulate into weekly buckets for graph data
    const weekKey = getWeekStart(day.day);
    if (!weeklyGraphData[weekKey]) {
      weeklyGraphData[weekKey] = {
        suggestions: 0,
        acceptances: 0,
        locSuggested: 0,
        locAccepted: 0,
      };
    }
    weeklyGraphData[weekKey].suggestions += daySuggested;
    weeklyGraphData[weekKey].acceptances += dayAccepted;
    weeklyGraphData[weekKey].locSuggested += dayLOCSuggested;
    weeklyGraphData[weekKey].locAccepted += dayLOCAccepted;

    // Pie Chart Language
    const languages = day.totals_by_language_feature ?? [];
    const completionLangRows = languages.filter(
      item => item.feature === 'code_completion'
    );

    // Total suggestions generated overall
    totalGeneratedSuggestions += completionLangRows.reduce(
      (sum, item) => sum + (item.code_generation_activity_count ?? 0),
      0
    );

    for (const pieChartLanguage of completionLangRows) {
      const lang = pieChartLanguage.language;
      langSuggestionCounts[lang] =
        (langSuggestionCounts[lang] ?? 0) +
        (pieChartLanguage.code_generation_activity_count ?? 0);
      langAcceptanceCounts[lang] =
        (langAcceptanceCounts[lang] ?? 0) +
        (pieChartLanguage.code_acceptance_activity_count ?? 0);
    }
  }

  // Convert weekly buckets into sorted graph arrays
  for (const weekKey of Object.keys(weeklyGraphData).sort()) {
    const w = weeklyGraphData[weekKey];
    const weekAcceptanceRate = w.suggestions > 0 ? (w.acceptances / w.suggestions) * 100 : 0;
    const weekLOCAcceptanceRate = w.locSuggested > 0 ? (w.locAccepted / w.locSuggested) * 100 : 0;

    suggestedGraph.push({
      date: weekKey,
      suggestions: w.suggestions,
      acceptances: w.acceptances,
      acceptanceRate: weekAcceptanceRate,
    });

    suggestedLOCGraph.push({
      date: weekKey,
      locSuggestions: w.locSuggested,
      locAcceptances: w.locAccepted,
      acceptanceRate: weekLOCAcceptanceRate,
    });

    averageSuggestedLOCGraph.push({
      date: weekKey,
      avgLOCSuggested: w.suggestions > 0 ? w.locSuggested / w.suggestions : 0,
      avgLOCAccepted: w.acceptances > 0 ? w.locAccepted / w.acceptances : 0,
    });
  }

  for (const [lang, count] of Object.entries(langSuggestionCounts)) {
    languagesUsedPieChart.suggestions.push({
      [lang]: count / totalGeneratedSuggestions,
    });
    languagesUsedPieChart.acceptances.push({
      [lang]: (langAcceptanceCounts[lang] ?? 0) / totalGeneratedSuggestions,
    });
  }

  suggestedCards.suggestions.totalSuggestions = suggestionsSum;
  suggestedCards.suggestions.totalAcceptances = acceptancesSum;
  suggestedCards.suggestions.acceptanceRate =
    (acceptancesSum / suggestionsSum) * 100;

  suggestedCards.loc.totalLOCSuggestions = suggestionsLOCSum;
  suggestedCards.loc.totalLOCAcceptances = acceptancesLOCSum;
  suggestedCards.loc.acceptanceLOCRate =
    (acceptancesLOCSum / suggestionsLOCSum) * 100;

  suggestedCards.average.averageLOCSuggestions =
    suggestionsLOCSum / numberLOCSuggestions;
  suggestedCards.average.averageLOCAccepted =
    acceptancesLOCSum / numberLOCAcceptances;

  codeCompletionMetrics = {
    suggestedCards: suggestedCards,
    suggestedGraph: suggestedGraph,
    suggestedLOCGraph: suggestedLOCGraph,
    averageSuggestedLOCGraph: averageSuggestedLOCGraph,
    languagesUsedPieChart: languagesUsedPieChart,
  };

  return codeCompletionMetrics;
}
