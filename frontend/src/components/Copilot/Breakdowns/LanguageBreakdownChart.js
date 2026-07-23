import React, { useMemo, useState } from 'react';
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useTheme } from '../../../contexts/ThemeContext';
import GraphSelect from '../../GraphSelect/GraphSelect';

const LANGUAGE_MODE_OPTIONS = [
  { value: 'suggestions', label: 'Suggestions' },
  { value: 'acceptances', label: 'Acceptances' },
];

const MAX_LANGUAGE_SLICES = 7;

function formatLanguageName(name) {
  const lowerName = name.toLowerCase();
  return lowerName.charAt(0).toUpperCase() + lowerName.slice(1);
}

const LanguageBreakdownChart = ({ languageData }) => {
  const [selectedMode, setSelectedMode] = useState('suggestions');
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const colors = {
    primary: isDark ? '#ff6b00' : '#052962',
    secondary: isDark ? '#ff8c33' : '#0e58c5',
    tertiary: isDark ? '#ffce99' : '#90b6ef',
    text: isDark ? '#ffffff' : '#8c8c8c',
  };

  const colorPalette = [
    colors.primary,
    colors.secondary,
    colors.tertiary,
    isDark ? '#ffc080' : '#355f98',
    isDark ? '#ffb366' : '#4b78b2',
    isDark ? '#ffd7b3' : '#739fd9',
    isDark ? '#ffe9d6' : '#aac8f4',
  ];

  const pieData = useMemo(() => {
    const selectedRows = languageData?.[selectedMode] ?? [];

    const flattenedRows = selectedRows
      .map(item => {
        const [name, ratio] = Object.entries(item)[0] ?? [];

        if (!name || name.toLowerCase() === 'unknown') {
          return null;
        }

        return {
          name: formatLanguageName(name),
          value: typeof ratio === 'number' ? ratio * 100 : 0,
        };
      })
      .filter(Boolean)
      .sort((a, b) => b.value - a.value);

    const topRows = flattenedRows.slice(0, MAX_LANGUAGE_SLICES);
    const remainingRows = flattenedRows.slice(MAX_LANGUAGE_SLICES);
    const otherValue = remainingRows.reduce((sum, row) => sum + row.value, 0);

    const rowsWithColors = topRows.map((row, index) => ({
      ...row,
      color: colorPalette[index % colorPalette.length],
    }));

    if (otherValue > 0) {
      rowsWithColors.push({
        name: 'Other',
        value: otherValue,
        color: isDark ? '#d9d9d9' : '#708090',
      });
    }

    return rowsWithColors;
  }, [colorPalette, isDark, languageData, selectedMode]);

  return (
    <div
      className="copilot-graph-container copilot-graph-container--stacked"
      style={{ touchAction: 'pan-y' }}
    >
      <GraphSelect
        options={LANGUAGE_MODE_OPTIONS}
        value={selectedMode}
        onChange={setSelectedMode}
      />
      <ResponsiveContainer width="100%" height={380}>
        <RechartsPieChart>
          <Pie
            data={pieData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="54%"
            outerRadius={135}
            labelLine={false}
            isAnimationActive
            label={({ name, percent }) =>
              `${name} ${((percent ?? 0) * 100).toFixed(1)}%`
            }
          >
            {pieData.map((entry, index) => (
              <Cell
                key={`${entry.name}-${index}`}
                fill={entry.color}
                aria-label={`${entry.name}: ${entry.value.toFixed(1)} percent`}
              />
            ))}
          </Pie>
          <Legend iconType="circle" iconSize={10} />
          <Tooltip
            formatter={value => `${Number(value).toFixed(1)}%`}
            labelStyle={{ color: colors.text }}
          />
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LanguageBreakdownChart;
