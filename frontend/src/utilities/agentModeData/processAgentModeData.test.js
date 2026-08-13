import { describe, it, expect } from 'vitest';
import { processAgentModeData } from './processAgentModeData';

describe('processAgentModeData', () => {
  const sampleData = [
    {
      day: '2026-03-06',
      totals_by_feature: [
        {
          feature: 'agent_edit',
          loc_added_sum: 100,
          loc_deleted_sum: 40,
        },
      ],
      totals_by_language_feature: [
        {
          feature: 'agent_edit',
          language: 'javascript',
          loc_added_sum: 70,
          loc_deleted_sum: 20,
        },
        {
          feature: 'agent_edit',
          language: 'python',
          loc_added_sum: 30,
          loc_deleted_sum: 20,
        },
      ],
      totals_by_model_feature: [
        {
          feature: 'agent_edit',
          model: 'gpt-5',
          loc_added_sum: 80,
          loc_deleted_sum: 30,
        },
        {
          feature: 'agent_edit',
          model: 'gpt-4.1',
          loc_added_sum: 20,
          loc_deleted_sum: 10,
        },
      ],
    },
    {
      day: '2026-03-07',
      totals_by_feature: [
        {
          feature: 'agent_edit',
          loc_added_sum: 20,
          loc_deleted_sum: 10,
        },
      ],
      totals_by_language_feature: [
        {
          feature: 'agent_edit',
          language: 'go',
          loc_added_sum: 20,
          loc_deleted_sum: 10,
        },
      ],
      totals_by_model_feature: [
        {
          feature: 'agent_edit',
          model: 'claude-3.7',
          loc_added_sum: 20,
          loc_deleted_sum: 10,
        },
      ],
    },
  ];

  it('returns summary totals and daily graph rows', () => {
    const result = processAgentModeData(sampleData);

    expect(result.summaryCards.totalLinesAdded).toBe(120);
    expect(result.summaryCards.totalLinesDeleted).toBe(50);
    expect(result.dailyGraph).toEqual([
      {
        date: '2026-03-06',
        linesAdded: 100,
        linesDeleted: 40,
      },
      {
        date: '2026-03-07',
        linesAdded: 20,
        linesDeleted: 10,
      },
    ]);
  });

  it('excludes weekend rows when includeWeekendUsage is false', () => {
    const result = processAgentModeData(sampleData, {
      includeWeekendUsage: false,
    });

    expect(result.summaryCards.totalLinesAdded).toBe(100);
    expect(result.summaryCards.totalLinesDeleted).toBe(40);
    expect(result.dailyGraph).toEqual([
      {
        date: '2026-03-06',
        linesAdded: 100,
        linesDeleted: 40,
      },
    ]);
  });

  it('builds language and model pie data as percentages with { name, value } format', () => {
    const result = processAgentEditsData(sampleData);

    expect(result.languagePieChart.added).toEqual(
      expect.arrayContaining([
        { name: 'JavaScript', value: parseFloat(((70 / 120) * 100).toFixed(2)) },
        { name: 'Python', value: parseFloat(((30 / 120) * 100).toFixed(2)) },
        { name: 'Go', value: parseFloat(((20 / 120) * 100).toFixed(2)) },
      ])
    );

    expect(result.languagePieChart.deleted).toEqual(
      expect.arrayContaining([
        { name: 'JavaScript', value: parseFloat(((20 / 50) * 100).toFixed(2)) },
        { name: 'Python', value: parseFloat(((20 / 50) * 100).toFixed(2)) },
        { name: 'Go', value: parseFloat(((10 / 50) * 100).toFixed(2)) },
      ])
    );

    expect(result.modelPieChart.added).toEqual(
      expect.arrayContaining([
        { name: 'gpt-5', value: parseFloat(((80 / 120) * 100).toFixed(2)) },
        { name: 'GPT-4.1', value: parseFloat(((20 / 120) * 100).toFixed(2)) },
        { name: 'claude-3.7', value: parseFloat(((20 / 120) * 100).toFixed(2)) },
      ])
    );

    expect(result.modelPieChart.deleted).toEqual(
      expect.arrayContaining([
        { name: 'gpt-5', value: parseFloat(((30 / 50) * 100).toFixed(2)) },
        { name: 'GPT-4.1', value: parseFloat(((10 / 50) * 100).toFixed(2)) },
        { name: 'claude-3.7', value: parseFloat(((10 / 50) * 100).toFixed(2)) },
      ])
    );
  });
});
