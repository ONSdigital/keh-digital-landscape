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
import { getChartPalette } from '../../../utilities/copilotChartColours';
import { LANGUAGE_NAMES } from '../../../constants/copilotConstants';
import '../../../styles/Copilot/ReusableStyles.css';

const LANGUAGE_MODE_OPTIONS = [
  { value: 'suggestions', label: 'Suggestions' },
  { value: 'acceptances', label: 'Acceptances' },
];

const MAX_LANGUAGE_SLICES = 7;

function formatLanguageName(name) {
  const normalizedName = name.toLowerCase();
  return LANGUAGE_NAMES[normalizedName] || normalizedName.toUpperCase();
}

const LanguageBreakdownChart = ({ languageData }) => {
  const [selectedMode, setSelectedMode] = useState('suggestions');
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const colorPalette = getChartPalette(MAX_LANGUAGE_SLICES, isDark);

  const pieData = useMemo(() => {
    const selectedRows = languageData?.[selectedMode] ?? [];

    const aggregatedByLanguage = selectedRows.reduce((acc, item) => {
      const [name, ratio] = Object.entries(item)[0] ?? [];

      if (!name || name.toLowerCase() === 'unknown') {
        return acc;
      }

      const formattedName = formatLanguageName(name);
      const value = typeof ratio === 'number' ? ratio * 100 : 0;

      acc[formattedName] = (acc[formattedName] || 0) + value;
      return acc;
    }, {});

    const flattenedRows = Object.entries(aggregatedByLanguage)
      .map(([name, value]) => ({ name, value }))
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
    <div className="usage-pie-chart-card" style={{ touchAction: 'pan-y' }}>
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
            stroke={'hsl(var(--muted))'}
            outerRadius={90}
            innerRadius={50}
            label={false}
            labelLine={false}
            isAnimationActive
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
            formatter={(value, _name, item) => [
              `${Number(value).toFixed(1)}%`,
              item?.payload?.name ?? '',
            ]}
            labelStyle={{ color: 'hsl(var(--muted-foreground))' }}
          />
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LanguageBreakdownChart;
