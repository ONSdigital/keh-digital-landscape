// Data for the org history API response
export const copilotGeneralUsageData = [
  {
    day: '2024-01-31',
    monthly_active_users: 50,
    monthly_active_chat_users: 30,
    monthly_active_agent_users: 10,
    totals_by_model_feature: [
      { model: 'gpt-4o', user_initiated_interaction_count: 200 },
      { model: 'claude-sonnet-4.6', user_initiated_interaction_count: 150 },
    ],
    totals_by_ide: [
      { ide: 'vscode', user_initiated_interaction_count: 300 },
      { ide: 'intellij', user_initiated_interaction_count: 50 },
    ],
    totals_by_language_model: [
      { language: 'python', loc_added_sum: 500, loc_deleted_sum: 100 },
      { language: 'javascript', loc_added_sum: 300, loc_deleted_sum: 50 },
    ],
  },
];
