import React, { useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { useTheme } from '../../../contexts/ThemeContext';
import GraphSelect from '../../GraphSelect/GraphSelect';
import { getChartPalette } from '../../../utilities/copilotChartColours';
import { formatNumberWithCommas } from '../../../utilities/getCommaSeparated';

const TIME_BREAKDOWN_OPTIONS = [
  { value: 'day', label: 'Days' },
  { value: 'week', label: 'Weeks' },
  { value: 'month', label: 'Months' },
];

function getWeekStart(dateString) {
  const date = new Date(dateString);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(date);
  monday.setDate(diff);
  return monday.toISOString().split('T')[0];
}

function getMonthStart(dateString) {
  const date = new Date(dateString);
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  return start.toISOString().split('T')[0];
}

function aggregateByPeriod(rows, breakdown) {
  if (!Array.isArray(rows) || breakdown === 'day') return rows ?? [];

  const grouped = new Map();
  for (const row of rows) {
    const key =
      breakdown === 'week' ? getWeekStart(row.date) : getMonthStart(row.date);
    if (!grouped.has(key)) {
      grouped.set(key, { date: key, linesAdded: 0, linesDeleted: 0 });
    }
    const entry = grouped.get(key);
    entry.linesAdded += row.linesAdded ?? 0;
    entry.linesDeleted += row.linesDeleted ?? 0;
  }
  return Array.from(grouped.values());
}

/**
 * Bar chart showing lines added vs lines deleted over time.
 * Expects data in the shape: [{ date: 'YYYY-MM-DD', linesAdded: number, linesDeleted: number }]
 *
 * @param {Array}   data
 * @param {boolean} includeWeekendUsage
 */
const LinesAddedVsDeletedBarChart = ({ data, includeWeekendUsage = true }) => {
  const [timeBreakdown, setTimeBreakdown] = useState('day');
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const palette = getChartPalette(2, isDark);
  const colors = {
    primary: palette[0],
    secondary: palette[1],
    text: 'hsl(var(--muted-foreground))',
    grid: 'hsl(var(--muted))',
  };

  const chartData = useMemo(() => {
    if (!Array.isArray(data)) return [];
    const filtered = includeWeekendUsage
      ? data
      : data.filter(row => {
          const d = new Date(`${row.date}T00:00:00`);
          return d.getDay() !== 0 && d.getDay() !== 6;
        });
    return aggregateByPeriod(filtered, timeBreakdown);
  }, [data, includeWeekendUsage, timeBreakdown]);

  const formatXAxisDate = value => {
    const date = new Date(value);
    if (timeBreakdown === 'month') {
      return date.toLocaleDateString('en-GB', {
        month: 'short',
        year: '2-digit',
      });
    }
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: '2-digit',
    });
  };

  return (
    <div className="copilot-graph-container">
      <GraphSelect
        options={TIME_BREAKDOWN_OPTIONS}
        value={timeBreakdown}
        onChange={setTimeBreakdown}
      />
      <ResponsiveContainer width="100%" height={500}>
        <ComposedChart
          data={chartData}
          margin={{ top: 20, right: 10, left: 10, bottom: 0 }}
          barGap={6}
        >
          <CartesianGrid vertical={false} stroke={colors.grid} />
          <XAxis
            dataKey="date"
            interval={chartData.length - 2}
            tick={{ fill: colors.text }}
            tickLine={false}
            tickFormatter={formatXAxisDate}
          />
          <Legend
            verticalAlign="top"
            align="center"
            height={36}
            wrapperStyle={{ paddingBottom: '10px' }}
          />
          <Bar
            stackId="lines"
            dataKey="linesDeleted"
            name="Lines Deleted"
            fill={colors.secondary}
            barSize={60}
            radius={[0, 0, 0, 0]}
            yAxisId="left"
            legendType="rect"
          />
          <Bar
            stackId="lines"
            dataKey="linesAdded"
            name="Lines Added"
            fill={colors.primary}
            barSize={60}
            radius={[10, 10, 0, 0]}
            yAxisId="left"
            legendType="rect"
          />
          <YAxis
            tickLine={false}
            yAxisId="left"
            tick={{ fill: colors.text }}
            axisLine={{ stroke: '' }}
            domain={[0, dataMax => Math.ceil(dataMax / 10) * 10]}
            tickCount={5}
            tickFormatter={value => formatNumberWithCommas(value)}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: isDark
                ? 'hsl(240, 10%, 8%)'
                : 'hsl(0, 0%, 100%)',
              border: `1px solid ${isDark ? 'hsl(240, 3.7%, 25.9%)' : 'hsl(240, 5.9%, 90%)'}`,
              borderRadius: '0.5rem',
              color: isDark ? 'hsl(0, 0%, 98%)' : 'hsl(240, 10%, 3.9%)',
            }}
            labelFormatter={value => formatXAxisDate(value)}
            formatter={(value, name) => [formatNumberWithCommas(value), name]}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LinesAddedVsDeletedBarChart;
