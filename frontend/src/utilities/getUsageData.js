import customFetch from './customFetch';

/**
 * Fetch organisation historic usage data from AWS S3
 *
 * @returns {Promise<Object>} - The historic usage data
 */
export const fetchOrgHistoricUsageData = async () => {
  try {
    const response = await customFetch('/copilot/api/org/historic');
    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching usage data:', error);
    return null;
  }
};

/**
 * Fetch all teams' historic usage data from S3
 *
 * @returns {Promise<Array>} - Array of team objects with historic usage data
 */
export const fetchTeamsHistoricData = async () => {
  try {
    const response = await customFetch('/copilot/api/teams/historic');
    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching teams historic data:', error);
    return null;
  }
};

// TODO: Implement function to extract a team's usage data from aggregated teams usage data.
// To be displayed in the frontend. Implementation of this function will depend on the format of the data
// returned from S3.
export const extractTeamData = () => {
  return null;
};

/**
 * Filter usage data based on start and end date
 *
 * @param {Object} data - The full, raw usage data
 * @param {string} startDate - ISO date string for start of range to filter
 * @param {string} endDate - ISO date string for end of range to filter
 * @returns {Object} - The filtered usage data
 */
export const filterUsageData = (data, startDate, endDate) => {
  if (!data || !data.length) return [];
  const start = new Date(startDate);
  const end = new Date(endDate);

  return data.filter(item => {
    const itemDate = new Date(item.day);
    return itemDate >= start && itemDate <= end;
  });
};

/**
 * Normalise date based on grouping level
 * @param {string} dateStr - ISO date string
 * @param {string} groupBy - Grouping by day, week, month or year
 * @returns {string} - Normalised date string
 */
const getGroupedDate = (dateStr, groupBy) => {
  const date = new Date(dateStr);
  if (groupBy === 'week') {
    const firstDayOfWeek = new Date(date);
    firstDayOfWeek.setDate(date.getDate() - date.getDay());
    return firstDayOfWeek.toISOString().split('T')[0];
  } else if (groupBy === 'month') {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  } else if (groupBy === 'year') {
    return `${date.getFullYear()}`;
  } else {
    return date.toISOString().split('T')[0];
  }
};

const CHAT_MODES = [
  'chat_panel_agent_mode',
  'chat_panel_ask_mode',
  'chat_panel_edit_mode',
  'chat_panel_plan_mode',
  'chat_panel_custom_mode',
  'chat_panel_unknown_mode',
  'chat_inline',
];

const ENGAGED_USERS_FIELD = {
  day: 'daily_active_users',
  week: 'weekly_active_users',
  month: 'monthly_active_users',
  year: 'monthly_active_users',
};

/**
 * Process usage data in a format suitable for dashboard display
 *
 * @param {Object[]} data  - Filtered usage data
 * @param {string} groupBy - Grouping by day, week, month or year
 * @returns {Object} - The processed usage data
 */
export const processUsageData = (data, groupBy = 'day') => {
  const completions = {
    totalSuggestions: 0,
    totalAcceptances: 0,
    totalLinesSuggested: 0,
    totalLinesAccepted: 0,
    perGroupedPeriod: [],
  };

  const chat = {
    totalChats: 0,
    totalLinesSuggested: 0,
    totalLinesAdded: 0,
    totalLineAcceptanceRate: 0,
    perGroupedPeriod: [],
    modeBreakdown: {},
  };

  // Computed for future display — not yet rendered in the UI
  const agentEdit = {
    totalLinesAdded: 0,
    totalLinesDeleted: 0,
    totalAgentSessions: 0,
    perGroupedPeriod: [],
  };

  // Language breakdown is provided for all features
  const languageBreakdown = {};

  if (!data || !data.length)
    return { completions, chat, agentEdit, languageBreakdown };

  const engagedUsersField =
    ENGAGED_USERS_FIELD[groupBy] ?? 'daily_active_users';

  const completionsPerDate = {};
  const chatPerDate = {};
  const agentEditPerDate = {};

  data.forEach(entry => {
    const rawDate = entry.day;
    const groupDate = getGroupedDate(rawDate, groupBy);

    // Initialise per-date buckets before the feature loop
    if (!completionsPerDate[groupDate]) {
      completionsPerDate[groupDate] = {
        date: groupDate,
        suggestions: 0,
        acceptances: 0,
        engagedUsers: 0,
        monthlyValues: [],
      };
    }
    if (!chatPerDate[groupDate]) {
      chatPerDate[groupDate] = {
        date: groupDate,
        linesSuggested: 0,
        linesAdded: 0,
      };
    }
    if (!agentEditPerDate[groupDate]) {
      agentEditPerDate[groupDate] = {
        date: groupDate,
        linesAdded: 0,
        linesDeleted: 0,
        agentSessions: 0,
      };
    }

    // === COMPLETIONS ===
    const completionFeature =
      entry.totals_by_feature?.find(f => f.feature === 'code_completion') ?? {};
    const dailySuggestions =
      completionFeature.code_generation_activity_count ?? 0;
    const dailyAcceptances =
      completionFeature.code_acceptance_activity_count ?? 0;
    const dailyLinesSuggested = completionFeature.loc_suggested_to_add_sum ?? 0;
    const dailyLinesAccepted = completionFeature.loc_added_sum ?? 0;

    completions.totalSuggestions += dailySuggestions;
    completions.totalAcceptances += dailyAcceptances;
    completions.totalLinesSuggested += dailyLinesSuggested;
    completions.totalLinesAccepted += dailyLinesAccepted;

    completionsPerDate[groupDate].suggestions += dailySuggestions;
    completionsPerDate[groupDate].acceptances += dailyAcceptances;
    completionsPerDate[groupDate].engagedUsers = entry[engagedUsersField] ?? 0;
    if (groupBy === 'year') {
      completionsPerDate[groupDate].monthlyValues.push(
        entry[engagedUsersField] ?? 0
      );
    }

    // === CHAT ===
    entry.totals_by_feature
      ?.filter(f => CHAT_MODES.includes(f.feature))
      .forEach(f => {
        const dailyChatLinesSuggested = f.loc_suggested_to_add_sum ?? 0;
        const dailyChatLinesAdded = f.loc_added_sum ?? 0;

        chat.totalChats += f.user_initiated_interaction_count ?? 0;
        chat.totalLinesSuggested += dailyChatLinesSuggested;
        chat.totalLinesAdded += dailyChatLinesAdded;

        chatPerDate[groupDate].linesSuggested += dailyChatLinesSuggested;
        chatPerDate[groupDate].linesAdded += dailyChatLinesAdded;

        if (!chat.modeBreakdown[f.feature]) {
          chat.modeBreakdown[f.feature] = {
            interactions: 0,
            codeGenerated: 0,
            codeAccepted: 0,
            linesSuggested: 0,
            linesAdded: 0,
          };
        }
        chat.modeBreakdown[f.feature].interactions +=
          f.user_initiated_interaction_count ?? 0;
        chat.modeBreakdown[f.feature].codeGenerated +=
          f.code_generation_activity_count ?? 0;
        chat.modeBreakdown[f.feature].codeAccepted +=
          f.code_acceptance_activity_count ?? 0;
        chat.modeBreakdown[f.feature].linesSuggested += dailyChatLinesSuggested;
        chat.modeBreakdown[f.feature].linesAdded += dailyChatLinesAdded;
      });

    // === AGENT EDIT (computed, not yet displayed) ===
    const agentEditFeature =
      entry.totals_by_feature?.find(f => f.feature === 'agent_edit') ?? {};
    const dailyAgentAdded = agentEditFeature.loc_added_sum ?? 0;
    const dailyAgentDeleted = agentEditFeature.loc_deleted_sum ?? 0;
    const dailyAgentSessions =
      agentEditFeature.code_generation_activity_count ?? 0;

    agentEdit.totalLinesAdded += dailyAgentAdded;
    agentEdit.totalLinesDeleted += dailyAgentDeleted;
    agentEdit.totalAgentSessions += dailyAgentSessions;

    agentEditPerDate[groupDate].linesAdded += dailyAgentAdded;
    agentEditPerDate[groupDate].linesDeleted += dailyAgentDeleted;
    agentEditPerDate[groupDate].agentSessions += dailyAgentSessions;

    // === LANGUAGE BREAKDOWN (computed, not yet displayed) ===
    entry.totals_by_language_feature?.forEach(item => {
      languageBreakdown[item.feature] ??= {};
      languageBreakdown[item.feature][item.language] ??= {
        suggestions: 0,
        acceptances: 0,
        linesSuggested: 0,
        linesAccepted: 0,
        linesDeleted: 0,
      };
      const b = languageBreakdown[item.feature][item.language];
      b.suggestions += item.code_generation_activity_count ?? 0;
      b.acceptances += item.code_acceptance_activity_count ?? 0;
      b.linesSuggested += item.loc_suggested_to_add_sum ?? 0;
      b.linesAccepted += item.loc_added_sum ?? 0;
      b.linesDeleted += item.loc_deleted_sum ?? 0;
    });
  });

  // Build perGroupedPeriod arrays
  completions.perGroupedPeriod = Object.values(completionsPerDate)
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .map(day => {
      const engagedUsers =
        groupBy === 'year' && day.monthlyValues.length > 0
          ? Math.round(
              day.monthlyValues.reduce((s, v) => s + v, 0) /
                day.monthlyValues.length
            )
          : day.engagedUsers;
      return {
        date: day.date,
        acceptances: day.acceptances,
        acceptanceRate:
          day.suggestions > 0 ? (day.acceptances / day.suggestions) * 100 : 0,
        engagedUsers,
      };
    });

  chat.perGroupedPeriod = Object.values(chatPerDate)
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .map(day => ({
      date: day.date,
      linesSuggested: day.linesSuggested,
      linesAdded: day.linesAdded,
      lineAcceptanceRate:
        day.linesSuggested > 0
          ? (day.linesAdded / day.linesSuggested) * 100
          : 0,
    }));

  agentEdit.perGroupedPeriod = Object.values(agentEditPerDate).sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );

  // Derived rates
  completions.acceptanceRate =
    completions.totalSuggestions > 0
      ? completions.totalAcceptances / completions.totalSuggestions
      : 0;

  completions.lineAcceptanceRate =
    completions.totalLinesSuggested > 0
      ? completions.totalLinesAccepted / completions.totalLinesSuggested
      : 0;

  chat.totalLineAcceptanceRate =
    chat.totalLinesSuggested > 0
      ? chat.totalLinesAdded / chat.totalLinesSuggested
      : 0;

  return { completions, chat, agentEdit, languageBreakdown };
};
