import { describe, it, expect } from 'vitest';
import { processAgentEditsData } from './processAgentEditsData';

describe('processAgentEditsData', () => {
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
    const result = processAgentEditsData(sampleData);

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
    const result = processAgentEditsData(sampleData, {
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

  it('builds language and model pie data as fractions', () => {
    const result = processAgentEditsData(sampleData);

    expect(result.languagePieChart.added).toEqual(
      expect.arrayContaining([
        { javascript: 70 / 120 },
        { python: 30 / 120 },
        { go: 20 / 120 },
      ])
    );

    expect(result.languagePieChart.deleted).toEqual(
      expect.arrayContaining([
        { javascript: 20 / 50 },
        { python: 20 / 50 },
        { go: 10 / 50 },
      ])
    );

    expect(result.modelPieChart.added).toEqual(
      expect.arrayContaining([
        { 'gpt-5': 80 / 120 },
        { 'gpt-4.1': 20 / 120 },
        { 'claude-3.7': 20 / 120 },
      ])
    );

    expect(result.modelPieChart.deleted).toEqual(
      expect.arrayContaining([
        { 'gpt-5': 30 / 50 },
        { 'gpt-4.1': 10 / 50 },
        { 'claude-3.7': 10 / 50 },
      ])
    );
  });
});
