const copilotChatModeData = [
  {
    day: '2026-04-07',
    totals_by_feature: [
      {
        feature: 'chat_panel_agent_mode',
        user_initiated_interaction_count: 200,
        code_generation_activity_count: 150,
        code_acceptance_activity_count: 40,
        loc_suggested_to_add_sum: 500,
        loc_suggested_to_delete_sum: 0,
        loc_added_sum: 30,
        loc_deleted_sum: 0,
      },
      {
        feature: 'chat_panel_ask_mode',
        user_initiated_interaction_count: 100,
        code_generation_activity_count: 80,
        code_acceptance_activity_count: 20,
        loc_suggested_to_add_sum: 200,
        loc_suggested_to_delete_sum: 0,
        loc_added_sum: 10,
        loc_deleted_sum: 0,
      },
      {
        feature: 'chat_inline',
        user_initiated_interaction_count: 50,
        code_generation_activity_count: 30,
        code_acceptance_activity_count: 10,
        loc_suggested_to_add_sum: 100,
        loc_suggested_to_delete_sum: 0,
        loc_added_sum: 5,
        loc_deleted_sum: 0,
      },
    ],
    totals_by_language_feature: [
      {
        feature: 'chat_panel_agent_mode',
        language: 'python',
        code_generation_activity_count: 90,
        code_acceptance_activity_count: 25,
      },
      {
        feature: 'chat_panel_agent_mode',
        language: 'javascript',
        code_generation_activity_count: 60,
        code_acceptance_activity_count: 15,
      },
      {
        feature: 'chat_panel_ask_mode',
        language: 'typescript',
        code_generation_activity_count: 80,
        code_acceptance_activity_count: 20,
      },
    ],
    totals_by_model_feature: [
      {
        feature: 'chat_panel_agent_mode',
        model: 'gpt-4.1',
        user_initiated_interaction_count: 120,
        code_generation_activity_count: 100,
        code_acceptance_activity_count: 30,
      },
      {
        feature: 'chat_panel_ask_mode',
        model: 'claude-4.5-sonnet',
        user_initiated_interaction_count: 80,
        code_generation_activity_count: 60,
        code_acceptance_activity_count: 15,
      },
    ],
  },
  {
    day: '2026-04-08',
    totals_by_feature: [
      {
        feature: 'chat_panel_agent_mode',
        user_initiated_interaction_count: 180,
        code_generation_activity_count: 120,
        code_acceptance_activity_count: 35,
        loc_suggested_to_add_sum: 400,
        loc_suggested_to_delete_sum: 0,
        loc_added_sum: 20,
        loc_deleted_sum: 0,
      },
      {
        feature: 'chat_panel_edit_mode',
        user_initiated_interaction_count: 60,
        code_generation_activity_count: 45,
        code_acceptance_activity_count: 12,
        loc_suggested_to_add_sum: 150,
        loc_suggested_to_delete_sum: 0,
        loc_added_sum: 8,
        loc_deleted_sum: 0,
      },
    ],
    totals_by_language_feature: [
      {
        feature: 'chat_panel_agent_mode',
        language: 'python',
        code_generation_activity_count: 70,
        code_acceptance_activity_count: 20,
      },
      {
        feature: 'chat_panel_edit_mode',
        language: 'javascript',
        code_generation_activity_count: 45,
        code_acceptance_activity_count: 12,
      },
    ],
    totals_by_model_feature: [
      {
        feature: 'chat_panel_agent_mode',
        model: 'gpt-4.1',
        user_initiated_interaction_count: 100,
        code_generation_activity_count: 80,
        code_acceptance_activity_count: 25,
      },
      {
        feature: 'chat_panel_edit_mode',
        model: 'claude-4.5-sonnet',
        user_initiated_interaction_count: 60,
        code_generation_activity_count: 45,
        code_acceptance_activity_count: 12,
      },
    ],
  },
];

export { copilotChatModeData };
