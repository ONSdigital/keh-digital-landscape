// This file is responsible for processing legacy Copilot data and transforming it into a format that can be used by the frontend components.

/**
 * Processes Pre-February 2025 Copilot data, producing aggregate totals, preparing monthly data for graphing and user metrics.
 * @param {Object} data
 * @returns {Object} An object containing the totals, monthly data, and user metrics for February Copilot data.
 */
export function processFebruaryCopilotData(data) {
  // Logic Summary

  // User Metrics: For each day, we extract the total active users and total active chat users to create daily user metrics for total users, completion users, and chat users.
  // Aggregate Totals: We sum up the total suggestions, acceptances, lines suggested, lines accepted, chat turns, and chat acceptances across all days to get overall totals for the whole dataset.
  // Monthly Data for Graphing: We prepare daily counts for suggestions, acceptances, lines suggested, lines accepted, chat turns, and chat acceptances to create time series data that can be used for graphing trends over time.
  //    Note: this monthly data gets processed further in the graph preparation functions to calculate rates and format it for the specific graph components.

  let febDataTotals = {
    suggestions: 0,
    acceptances: 0,
    linesSuggested: 0,
    linesAccepted: 0,
    chats: 0,
    chatAcceptances: 0,
  };

  let febDataMonthly = {
    suggestions: [],
    acceptances: [],
    linesSuggested: [],
    linesAccepted: [],
    chats: [],
    chatAcceptances: [],
  };

  let userMetricsFeb = {
    totalUsers: [],
    completionUsers: [],
    chatUsers: [],
  };

  for (const index in data) {
    const day = data[index];

    // User metrics
    userMetricsFeb.totalUsers.push({
      date: day.day,
      count: (day.total_active_users || 0) + (day.total_active_chat_users || 0),
    });
    userMetricsFeb.completionUsers.push({
      date: day.day,
      count: day.total_active_users || 0,
    });
    userMetricsFeb.chatUsers.push({
      date: day.day,
      count: day.total_active_chat_users || 0,
    });

    // Aggregate totals

    febDataTotals.suggestions += day.total_suggestions_count || 0;
    febDataTotals.acceptances += day.total_acceptances_count || 0;
    febDataTotals.linesSuggested += day.total_lines_suggested || 0;
    febDataTotals.linesAccepted += day.total_lines_accepted || 0;
    febDataTotals.chats += day.total_chat_turns || 0;
    febDataTotals.chatAcceptances += day.total_chat_acceptances || 0;

    // Prepare monthly data for graphing

    febDataMonthly.suggestions.push({
      date: day.day,
      count: day.total_suggestions_count || 0,
    });
    febDataMonthly.acceptances.push({
      date: day.day,
      count: day.total_acceptances_count || 0,
    });
    febDataMonthly.linesSuggested.push({
      date: day.day,
      count: day.total_lines_suggested || 0,
    });
    febDataMonthly.linesAccepted.push({
      date: day.day,
      count: day.total_lines_accepted || 0,
    });
    febDataMonthly.chats.push({
      date: day.day,
      count: day.total_chat_turns || 0,
    });
    febDataMonthly.chatAcceptances.push({
      date: day.day,
      count: day.total_chat_acceptances || 0,
    });
  }

  return {
    totals: febDataTotals,
    monthly: febDataMonthly,
    users: userMetricsFeb,
  };
}

/**
 * Processes Pre-March 2026 Copilot data, producing aggregate totals, preparing monthly data for graphing and user metrics.
 * @param {Object} data
 * @returns {Object} An object containing the totals, monthly data, and user metrics for March Copilot data.
 */
export function processMarchCopilotData(data) {
  // Logic Summary

  // User Metrics: For each day, we extract the total active users, total active completion users and total active chat users to create daily user metrics for total users, completion users, and chat users.
  // Aggregate Totals: We sum up the total suggestions, acceptances, lines suggested, lines accepted, chat turns, chat insertions and chat copies across all days to get overall totals for the whole dataset.
  // Monthly Data for Graphing: We prepare daily counts for suggestions, acceptances, lines suggested, lines accepted, chat turns, chat insertions and chat copies to create time series data that can be used for graphing trends over time.
  //    Note: this monthly data gets processed further in the graph preparation functions to calculate rates and format it for the specific graph components.

  let marDataTotals = {
    suggestions: 0,
    acceptances: 0,
    linesSuggested: 0,
    linesAccepted: 0,
    chats: 0,
    chatInsertions: 0,
    chatCopies: 0,
  };

  let marDataMonthly = {
    suggestions: [],
    acceptances: [],
    linesSuggested: [],
    linesAccepted: [],
    chats: [],
    chatInsertions: [],
    chatCopies: [],
  };

  let userMetricsMar = {
    totalUsers: [],
    completionUsers: [],
    chatUsers: [],
  };

  for (const index in data) {
    const day = data[index];

    // User metrics

    userMetricsMar.totalUsers.push({
      date: day.date,
      count: day.total_active_users || 0,
    });
    userMetricsMar.completionUsers.push({
      date: day.date,
      count: day.copilot_ide_code_completions?.total_engaged_users || 0,
    });
    userMetricsMar.chatUsers.push({
      date: day.date,
      count: day.copilot_ide_chat?.total_engaged_users || 0,
    });

    const ideChat = day.copilot_ide_chat || {};
    const ideCompletions = day.copilot_ide_code_completions || {};

    let dayTotals = {
      suggestions: 0,
      acceptances: 0,
      linesSuggested: 0,
      linesAccepted: 0,
      chats: 0,
      chatInsertions: 0,
      chatCopies: 0,
    };

    (ideChat.editors || []).forEach(editor => {
      (editor.models || []).forEach(model => {
        // Overall totals
        marDataTotals.chats += model.total_chats || 0;
        marDataTotals.chatInsertions += model.total_chat_insertion_events || 0;
        marDataTotals.chatCopies += model.total_chat_copy_events || 0;

        // Monthly data for graphing
        dayTotals.chats += model.total_chats || 0;
        dayTotals.chatInsertions += model.total_chat_insertion_events || 0;
        dayTotals.chatCopies += model.total_chat_copy_events || 0;
      });
    });

    (ideCompletions.editors || []).forEach(editor => {
      (editor.models || []).forEach(model => {
        (model.languages || []).forEach(language => {
          // Overall totals
          marDataTotals.suggestions += language.total_code_suggestions || 0;
          marDataTotals.acceptances += language.total_code_acceptances || 0;
          marDataTotals.linesSuggested +=
            language.total_code_lines_suggested || 0;
          marDataTotals.linesAccepted +=
            language.total_code_lines_accepted || 0;

          // Monthly data for graphing
          dayTotals.suggestions += language.total_code_suggestions || 0;
          dayTotals.acceptances += language.total_code_acceptances || 0;
          dayTotals.linesSuggested += language.total_code_lines_suggested || 0;
          dayTotals.linesAccepted += language.total_code_lines_accepted || 0;
        });
      });
    });

    marDataMonthly.suggestions.push({
      date: day.date,
      count: dayTotals.suggestions,
    });
    marDataMonthly.acceptances.push({
      date: day.date,
      count: dayTotals.acceptances,
    });
    marDataMonthly.linesSuggested.push({
      date: day.date,
      count: dayTotals.linesSuggested,
    });
    marDataMonthly.linesAccepted.push({
      date: day.date,
      count: dayTotals.linesAccepted,
    });
    marDataMonthly.chats.push({ date: day.date, count: dayTotals.chats });
    marDataMonthly.chatInsertions.push({
      date: day.date,
      count: dayTotals.chatInsertions,
    });
    marDataMonthly.chatCopies.push({
      date: day.date,
      count: dayTotals.chatCopies,
    });
  }

  return {
    totals: marDataTotals,
    monthly: marDataMonthly,
    users: userMetricsMar,
  };
}

/**
 * Prepares completion graph data, calculating acceptance rates.
 * @param {Object} monthlyData - The monthly completion data.
 * @returns {Array<Object>} Completion graph data.
 */
export function prepareCompletionGraphData(monthlyData) {
  // For each day, we calculate the acceptance rate as (acceptances / suggestions) * 100, handling cases where suggestions might be zero to avoid division errors.
  // This produces an array of objects where each object contains the date, number of suggestions, number of acceptances, and the calculated acceptance rate for that day.
  // This gets displayed on a graph where the x-axis is the date and the y-axis can show both the counts (suggestions and acceptances) and the acceptance rate, allowing us to visualise trends over time.

  return monthlyData.suggestions.map((item, index) => ({
    date: item.date,
    suggestions: item.count,
    acceptances: monthlyData.acceptances[index]
      ? monthlyData.acceptances[index].count
      : 0,
    acceptanceRate:
      (item.count
        ? monthlyData.acceptances[index]
          ? monthlyData.acceptances[index].count / item.count
          : 0
        : 0) * 100,
  }));
}

/**
 * Prepares March chat graph data, calculating insertion and copy rates.
 * @param {Object} marDataMonthly - The monthly data for March Copilot dataset.
 * @returns {Array<Object>} March chat graph data.
 */
export function prepareMarchChatGraphData(marDataMonthly) {
  // For each day, we calculate the chat insertion rate as (chat insertions / chats) * 100 and the chat copy rate as (chat copies / chats) * 100, handling cases where chats might be zero to avoid division errors.
  // This produces an array of objects where each object contains the date, number of chats, number of chat insertions, number of chat copies, and the calculated insertion and copy rates for that day.
  // This gets displayed on a graph where the x-axis is the date and the y-axis can show the counts (chats, chat insertions, chat copies) and the rates, allowing us to visualise trends over time.

  return marDataMonthly.chats.map((item, index) => {
    const chatInsertions = marDataMonthly.chatInsertions[index]
      ? marDataMonthly.chatInsertions[index].count
      : 0;
    const chatCopies = marDataMonthly.chatCopies[index]
      ? marDataMonthly.chatCopies[index].count
      : 0;

    return {
      date: item.date,
      chats: item.count,
      chatInsertions,
      chatCopies,
      chatInsertionRate: item.count ? (chatInsertions / item.count) * 100 : 0,
      chatCopyRate: item.count ? (chatCopies / item.count) * 100 : 0,
    };
  });
}

/**
 * Prepares February chat graph data, calculating acceptance rates.
 * @param {Object} febDataMonthly - The monthly data for February Copilot dataset.
 * @returns {Array<Object>} February chat graph data.
 */
export function prepareFebruaryChatGraphData(febDataMonthly) {
  // For each day, we calculate the chat acceptance rate as (chat acceptances / chats) * 100, handling cases where chats might be zero to avoid division errors.
  // This produces an array of objects where each object contains the date, number of chats, number of chat acceptances, and the calculated acceptance rate for that day.
  // This gets displayed on a graph where the x-axis is the date and the y-axis can show both the counts (chats and chat acceptances) and the acceptance rate, allowing us to visualise trends over time.

  return febDataMonthly.chats.map((item, index) => {
    const chatAcceptances = febDataMonthly.chatAcceptances[index]
      ? febDataMonthly.chatAcceptances[index].count
      : 0;

    return {
      date: item.date,
      chats: item.count,
      chatAcceptances,
      chatAcceptanceRate: item.count ? (chatAcceptances / item.count) * 100 : 0,
    };
  });
}

/**
 * Prepares user metrics graph data.
 * @param {Object} userMetrics - The user metrics dataset.
 * @returns {Array<Object>} User metrics graph data.
 */
export function prepareUserMetricsGraphData(userMetrics) {
  // For each day, we create an object that contains the date, total active users, total active completion users, and total active chat users.
  // We handle cases where the completion users or chat users data might be missing for a day by defaulting to zero.
  // This produces an array of objects where each object represents a day and contains the user metrics for that day, which can be used to graph trends in user engagement over time.

  return userMetrics.totalUsers.map((item, index) => ({
    date: item.date,
    totalUsers: item.count,
    completionUsers: userMetrics.completionUsers[index]
      ? userMetrics.completionUsers[index].count
      : 0,
    chatUsers: userMetrics.chatUsers[index]
      ? userMetrics.chatUsers[index].count
      : 0,
  }));
}
