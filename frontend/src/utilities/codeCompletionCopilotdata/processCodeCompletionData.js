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

  // Dictionary for Acceptance graph (suggestions vs acceptances), format: { day_date: [suggestions, acceptances, acceptance_rate] }
  let suggestedGraph = [];

  // Dictionary for (Optional) Acceptance graph (lines of code suggested vs lines of code accepted), format: { day_date: [locSuggestions, locAcceptances, acceptance_rate] }
  let suggestedLOCGraph = [];

  // Dictionary for Average LOC size line graph (average lines of code per suggestion vs average lines of code per acceptance), format: { day_date: [locSuggestions, locAcceptances] }
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

    // Suggested Graph data
    let suggestionsVSAcceptances = [
      daySuggested,
      dayAccepted,
      (dayAccepted / daySuggested) * 100,
    ];

    suggestedGraph.push({
      [day.day]: suggestionsVSAcceptances,
    });

    // Suggested LOC Graph data
    let suggestionsLOCVSAcceptancesLOC = [
      dayLOCSuggested,
      dayLOCAccepted,
      (dayLOCAccepted / dayLOCSuggested) * 100,
    ];

    suggestedLOCGraph.push({
      [day.day]: suggestionsLOCVSAcceptancesLOC,
    });

    // Average LOC Suggested vs Accepted Graph data
    let averageSuggestionsVSAcceptancesLOC = [
      dayLOCSuggested / daySuggested,
      dayLOCAccepted / dayAccepted,
    ];

    averageSuggestedLOCGraph.push({
      [day.day]: averageSuggestionsVSAcceptancesLOC,
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

  // TODO: Logic to add values from organisation_history.json (S3 or backend/data/copilot)
  // TODO: Add all dictionaries and values to the 'codeCompletionMetrics' dictionary
}
