const EXCLUDED_CHAT_FEATURES = new Set(['chat_panel_unknown_mode']);

function inMonth(record, year, month, maxDay = 31) {
  const d = new Date(`${record.day}T00:00:00`);
  return (
    d.getFullYear() === year && d.getMonth() === month && d.getDate() <= maxDay
  );
}

function aggregateMetrics(records) {
  let linesAccepted = 0;
  let totalChats = 0;
  let agentLinesAdded = 0;
  let suggestions = 0;
  let acceptances = 0;
  let locSuggested = 0;
  let locAccepted = 0;

  for (const record of records) {
    for (const f of record.totals_by_feature || []) {
      if (f.feature === 'code_completion') {
        linesAccepted += f.loc_added_sum || 0;
        suggestions += f.code_generation_activity_count || 0;
        acceptances += f.code_acceptance_activity_count || 0;
        locSuggested += f.loc_suggested_to_add_sum || 0;
        locAccepted += f.loc_added_sum || 0;
      }
      if (f.feature === 'agent_edit') agentLinesAdded += f.loc_added_sum || 0;
      if (
        f.feature.startsWith('chat_') &&
        !EXCLUDED_CHAT_FEATURES.has(f.feature)
      ) {
        totalChats += f.user_initiated_interaction_count || 0;
        suggestions += f.code_generation_activity_count || 0;
        acceptances += f.code_acceptance_activity_count || 0;
        locSuggested += f.loc_suggested_to_add_sum || 0;
        locAccepted += f.loc_added_sum || 0;
      }
    }
  }

  return {
    linesAccepted,
    totalChats,
    agentLinesAdded,
    suggestions,
    acceptances,
    locSuggested,
    locAccepted,
  };
}

export function processPreviewCopilotData(data) {
  if (!data || data.length === 0) return null;

  const sorted = [...data].sort((a, b) => a.day.localeCompare(b.day));
  const latest = new Date(`${sorted.at(-1).day}T00:00:00`);
  const thisYear = latest.getFullYear();
  const thisMonth = latest.getMonth();
  const todayDOM = latest.getDate();

  const lastMonthRef = new Date(thisYear, thisMonth - 1, 1);
  const lastYear = lastMonthRef.getFullYear();
  const lastMonth = lastMonthRef.getMonth();

  // 1st of month -> today  vs  1st of last month -> same day last month
  const current = sorted.filter(r => inMonth(r, thisYear, thisMonth));
  const prior = sorted.filter(r => inMonth(r, lastYear, lastMonth, todayDOM));

  const currentMetrics = aggregateMetrics(current);
  const priorMetrics = aggregateMetrics(prior);
  const allTimeMetrics = aggregateMetrics(sorted);

  // monthly_active_users is a rolling 30-day count, so compare snapshots
  const currentEngagedUsers = sorted.at(-1).monthly_active_users || 0;
  const priorEngagedUsers = prior.at(-1)?.monthly_active_users || 0;

  const m = currentMetrics;
  return {
    engagedUsers: {
      value: currentEngagedUsers,
      increased: currentEngagedUsers > priorEngagedUsers,
    },
    linesAccepted: {
      value: m.linesAccepted,
      increased: m.linesAccepted > priorMetrics.linesAccepted,
    },
    totalChats: {
      value: m.totalChats,
      increased: m.totalChats > priorMetrics.totalChats,
    },
    agentLinesAdded: {
      value: m.agentLinesAdded,
      increased: m.agentLinesAdded > priorMetrics.agentLinesAdded,
    },
    combinedStats: {
      suggestions: allTimeMetrics.suggestions,
      acceptances: allTimeMetrics.acceptances,
      acceptanceRate:
        allTimeMetrics.suggestions > 0
          ? (allTimeMetrics.acceptances / allTimeMetrics.suggestions) * 100
          : 0,
      locSuggested: allTimeMetrics.locSuggested,
      locAccepted: allTimeMetrics.locAccepted,
      lineAcceptanceRate:
        allTimeMetrics.locSuggested > 0
          ? (allTimeMetrics.locAccepted / allTimeMetrics.locSuggested) * 100
          : 0,
    },
  };
}
