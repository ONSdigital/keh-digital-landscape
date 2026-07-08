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

    // Dictionary for Acceptance graph (suggestions vs acceptances), format: day_date: [suggestions, acceptances]
    let suggestedGraph = {};

    // Dictionary for (Optional) Acceptance graph (lines of code suggested vs lines of code accepted), format: day_date: [locSuggestions, locAcceptances]
    let suggestedLOCGraph = {};

    // Dictionary for Average LOC size line graph (average lines of code per suggestion vs average lines of code per acceptance), format: day_date: [averageLOCSuggestions, averageLOCAcceptances]
    let averageSuggestedLOCGraph = {};

    // Dictionary for percentage of suggestions/acceptances using 'x' language, format: [language, percentageUsed]
    let languagesUsedPieChart = {
        suggestions: [],
        acceptances: [],
    };

    // TODO: Logic to add values from organisation_history.json (S3 or backend/data/copilot)
    // TODO: Add all dictionaries and values to the 'codeCompletionMetrics' dictionary
}