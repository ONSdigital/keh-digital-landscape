import React, { useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { useTheme } from '../../../contexts/ThemeContext';
import { formatNumberWithCommas } from '../../../utilities/getCommaSeparated';
import GraphSelect from '../../GraphSelect/GraphSelect';

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
  const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
  return monthStart.toISOString().split('T')[0];
}

function aggregateByTimeBreakdown(rows, breakdown) {
  if (breakdown === 'day') {
    return rows;
  }

  const grouped = new Map();

  for (const row of rows) {
    const key =
      breakdown === 'week' ? getWeekStart(row.date) : getMonthStart(row.date);

    if (!grouped.has(key)) {
      grouped.set(key, {
        date: key,
        suggestions: 0,
        acceptances: 0,
      });
    }

    const current = grouped.get(key);
    current.suggestions += row.suggestions ?? 0;
    current.acceptances += row.acceptances ?? 0;
  }

  return Array.from(grouped.values()).map(entry => ({
    ...entry,
    acceptanceRate:
      entry.suggestions > 0 ? (entry.acceptances / entry.suggestions) * 100 : 0,
  }));
}

const SuggestionsAcceptanceGraph = ({ data }) => {
  const [timeBreakdown, setTimeBreakdown] = useState('day');
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const recentData = useMemo(() => {
    const groupedData = aggregateByTimeBreakdown(data, timeBreakdown);
    return groupedData.slice(-7);
  }, [data, timeBreakdown]);

  const colors = {
    primary: isDark ? '#ff6b00' : '#052962',
    secondary: isDark ? '#ff8c33' : '#0e58c5',
    tertiary: isDark ? '#ffce99' : '#90b6ef',
    text: isDark ? '#ffffff' : '#8c8c8c',
  };

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
    });
  };

  return (
    <div className="copilot-graph-container">
      <GraphSelect
        options={TIME_BREAKDOWN_OPTIONS}
        value={timeBreakdown}
        onChange={setTimeBreakdown}
      />
      <ResponsiveContainer>
        <ComposedChart
          width={400}
          height={300}
          data={recentData}
          margin={{ top: 20, right: 10, left: 10, bottom: 0 }}
          barGap={6}
        >
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="date"
            interval={0}
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
            radius={[10, 10, 0, 0]}
            dataKey="suggestions"
            fill={colors.primary}
            yAxisId="left"
            legendType="rect"
            name="Suggestions"
          />
          <Bar
            radius={[10, 10, 0, 0]}
            dataKey="acceptances"
            fill={colors.secondary}
            yAxisId="left"
            legendType="rect"
            name="Acceptances"
          />
          <Line
            dot={false}
            strokeWidth={15}
            strokeLinecap="round"
            type="monotone"
            dataKey="acceptanceRate"
            stroke={colors.tertiary}
            yAxisId="right"
            legendType="line"
            name="Acceptance Rate"
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
          <YAxis
            tickLine={false}
            yAxisId="right"
            tick={{ fill: colors.text }}
            orientation="right"
            axisLine={{ stroke: '' }}
            domain={[0, dataMax => Math.ceil(dataMax / 10) * 10]}
            tickCount={5}
            tickFormatter={value => `${value.toFixed(0)}%`}
          />
          <Tooltip
            wrapperStyle={{ color: 'black' }}
            labelFormatter={value => formatXAxisDate(value)}
            formatter={(value, name) =>
              name === 'Acceptance Rate'
                ? `${value.toFixed(2)}%`
                : formatNumberWithCommas(value)
            }
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SuggestionsAcceptanceGraph;
