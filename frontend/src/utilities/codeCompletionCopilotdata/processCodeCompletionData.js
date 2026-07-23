// This file is responsible for processing the Copilot usage data and formatting it into relevant data for the code completion dashboard

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
  let totalGeneratedAcceptances = 0;
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
    totalGeneratedAcceptances += completionLangRows.reduce(
      (sum, item) => sum + (item.code_acceptance_activity_count ?? 0),
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

  for (const [lang, count] of Object.entries(langSuggestionCounts)) {
    languagesUsedPieChart.suggestions.push({
      [lang]:
        totalGeneratedSuggestions > 0 ? count / totalGeneratedSuggestions : 0,
    });
    languagesUsedPieChart.acceptances.push({
      [lang]:
        totalGeneratedAcceptances > 0
          ? (langAcceptanceCounts[lang] ?? 0) / totalGeneratedAcceptances
          : 0,
    });
  }

  suggestedCards.suggestions.totalSuggestions = suggestionsSum;
  suggestedCards.suggestions.totalAcceptances = acceptancesSum;
  suggestedCards.suggestions.acceptanceRate =
    suggestionsSum > 0 ? (acceptancesSum / suggestionsSum) * 100 : 0;

  suggestedCards.loc.totalLOCSuggestions = suggestionsLOCSum;
  suggestedCards.loc.totalLOCAcceptances = acceptancesLOCSum;
  suggestedCards.loc.acceptanceLOCRate =
    suggestionsLOCSum > 0 ? (acceptancesLOCSum / suggestionsLOCSum) * 100 : 0;

  suggestedCards.average.averageLOCSuggestions =
    numberLOCSuggestions > 0 ? suggestionsLOCSum / numberLOCSuggestions : 0;
  suggestedCards.average.averageLOCAccepted =
    numberLOCAcceptances > 0 ? acceptancesLOCSum / numberLOCAcceptances : 0;

  codeCompletionMetrics = {
    suggestedCards: suggestedCards,
    suggestedGraph: suggestedGraph,
    suggestedLOCGraph: suggestedLOCGraph,
    averageSuggestedLOCGraph: averageSuggestedLOCGraph,
    languagesUsedPieChart: languagesUsedPieChart,
  };

  return codeCompletionMetrics;
}
