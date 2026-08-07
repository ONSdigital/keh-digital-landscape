// This file is responsible for processing the Copilot usage data and formatting it into relevant data for the code completion dashboard

/**
 * Process the Copilot data and format it into useful data for graphs and data cards
 * @param {Object} data
 * @returns {Object} An object containing the total Copilot suggestions and suggested lines of code,
 * the total Copilot accepted suggestions and accepted lines of code
 */
function isWeekendDate(dateString) {
  const date = new Date(`${dateString}T00:00:00`);
  const day = date.getDay();
  return day === 0 || day === 6;
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

  // List for Acceptance graph (suggestions vs acceptances),
  // Format: [{ date: 'YYYY-MM-DD', suggestions: daySuggested, acceptances: dayAccepted, acceptanceRate: dayAcceptanceRate }]
  let suggestedGraph = [];

  // List for (Optional) Acceptance graph (lines of code suggested vs lines of code accepted),
  // Format: [{ date: 'YYYY-MM-DD', locSuggestions: dayLOCSuggested, locAcceptances: dayLOCAccepted, acceptanceRate: dayLOCAcceptanceRate, }]
  let suggestedLOCGraph = [];

  // List for Average LOC size line graph (average lines of code per suggestion vs average lines of code per acceptance),
  // Format: [{ date: 'YYYY-MM-DD', avgLOCSuggested: dayLOCSuggested / daySuggested, avgLOCAccepted: dayLOCAccepted / dayAccepted}]
  let averageSuggestedLOCGraph = [];

  // Dictionary for percentage of suggestions/acceptances using 'x' language,
  // Format: {suggestions: [language: percentageUsed], acceptances: [language: percentageUsged]}
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
    suggestionsSum > 0 ? acceptancesSum / suggestionsSum : 0;

  suggestedCards.loc.totalLOCSuggestions = suggestionsLOCSum;
  suggestedCards.loc.totalLOCAcceptances = acceptancesLOCSum;
  suggestedCards.loc.acceptanceLOCRate =
    suggestionsLOCSum > 0 ? acceptancesLOCSum / suggestionsLOCSum : 0;

  suggestedCards.average.averageLOCSuggestions =
    suggestionsSum > 0 ? suggestionsLOCSum / suggestionsSum : 0;
  suggestedCards.average.averageLOCAccepted =
    acceptancesSum > 0 ? acceptancesLOCSum / acceptancesSum : 0;

  codeCompletionMetrics = {
    suggestedCards: suggestedCards,
    suggestedGraph: suggestedGraph,
    suggestedLOCGraph: suggestedLOCGraph,
    averageSuggestedLOCGraph: averageSuggestedLOCGraph,
    languagesUsedPieChart: languagesUsedPieChart,
  };

  return codeCompletionMetrics;
}
