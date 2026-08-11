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
import '../../../styles/Copilot/ReusableStyles.css';

const MODE_OPTIONS = [
  { value: 'added', label: 'Lines Added' },
  { value: 'deleted', label: 'Lines Deleted' },
];

const MAX_SLICES = 7;

/**
 * Generic donut pie chart for data keyed by 'added' / 'deleted'.
 * Expects pre-formatted display-name keys as produced by processAgentEditsData.
 * The optional `formatLabel` prop can override label rendering if needed.
 *
 * @param {{ added: Array, deleted: Array }} pieData
 * @param {(name: string) => string} [formatLabel]
 */
const AddedDeletedPieChart = ({ pieData, formatLabel, title }) => {
  const [mode, setMode] = useState('added');
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const colorPalette = getChartPalette(MAX_SLICES, isDark);

  const labelFn = formatLabel ?? (name => name);

  const chartData = useMemo(() => {
    const rows = pieData?.[mode] ?? [];

    const aggregated = {};
    for (const item of rows) {
      const [name, fraction] = Object.entries(item)[0] ?? [];
      if (!name || name.toLowerCase() === 'unknown') continue;

      const label = labelFn(name);
      aggregated[label] = (aggregated[label] ?? 0) + (fraction ?? 0) * 100;
    }

    const sorted = Object.entries(aggregated)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    const top = sorted.slice(0, MAX_SLICES);
    const otherValue = sorted
      .slice(MAX_SLICES)
      .reduce((s, r) => s + r.value, 0);

    const result = top.map((row, i) => ({
      ...row,
      color: colorPalette[i % colorPalette.length],
    }));

    if (otherValue > 0) {
      result.push({
        name: 'Other',
        value: otherValue,
        color: isDark ? '#d9d9d9' : '#708090',
      });
    }

    return result;
  }, [colorPalette, isDark, labelFn, pieData, mode]);

  return (
    <div className="usage-pie-chart-card" style={{ touchAction: 'pan-y' }}>
      <div className="usage-pie-chart-header">
        {title ? <h4 className="usage-pie-chart-title">{title}</h4> : <span />}
        <GraphSelect options={MODE_OPTIONS} value={mode} onChange={setMode} />
      </div>
      <ResponsiveContainer width="100%" height={380}>
        <RechartsPieChart>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="54%"
            outerRadius={90}
            innerRadius={50}
            stroke="hsl(var(--muted))"
            label={false}
            labelLine={false}
            isAnimationActive
          >
            {chartData.map((entry, i) => (
              <Cell
                key={`${entry.name}-${i}`}
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
          />
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AddedDeletedPieChart;
