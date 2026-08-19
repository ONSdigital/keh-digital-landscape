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

  for (const record of records) {
    for (const f of record.totals_by_feature || []) {
      if (f.feature === 'code_completion')
        linesAccepted += f.loc_added_sum || 0;
      if (f.feature === 'agent_edit') agentLinesAdded += f.loc_added_sum || 0;
      if (
        f.feature.startsWith('chat_') &&
        !EXCLUDED_CHAT_FEATURES.has(f.feature)
      ) {
        totalChats += f.user_initiated_interaction_count || 0;
      }
    }
  }

  return { linesAccepted, totalChats, agentLinesAdded };
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

  // monthly_active_users is a rolling 30-day count, so compare snapshots
  const currentEngagedUsers = sorted.at(-1).monthly_active_users || 0;
  const priorEngagedUsers = prior.at(-1)?.monthly_active_users || 0;

  return {
    engagedUsers: {
      value: currentEngagedUsers,
      increased: currentEngagedUsers > priorEngagedUsers,
    },
    linesAccepted: {
      value: currentMetrics.linesAccepted,
      increased: currentMetrics.linesAccepted > priorMetrics.linesAccepted,
    },
    totalChats: {
      value: currentMetrics.totalChats,
      increased: currentMetrics.totalChats > priorMetrics.totalChats,
    },
    agentLinesAdded: {
      value: currentMetrics.agentLinesAdded,
      increased: currentMetrics.agentLinesAdded > priorMetrics.agentLinesAdded,
    },
  };
}
