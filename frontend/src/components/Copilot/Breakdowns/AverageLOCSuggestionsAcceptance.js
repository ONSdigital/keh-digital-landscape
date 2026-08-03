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
  LineChart,
} from 'recharts';
import { useTheme } from '../../../contexts/ThemeContext';
import { formatNumberWithCommas } from '../../../utilities/getCommaSeparated';
import GraphSelect from '../../GraphSelect/GraphSelect';
import { getChartPalette } from '../../../utilities/copilotChartColours';

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
  if (!Array.isArray(rows)) {
    return [];
  }

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
        avgLOCSuggestedSum: 0,
        avgLOCAcceptedSum: 0,
        dayCount: 0,
      });
    }

    const current = grouped.get(key);
    current.avgLOCSuggestedSum += row.avgLOCSuggested ?? 0;
    current.avgLOCAcceptedSum += row.avgLOCAccepted ?? 0;
    current.dayCount += 1;
  }

  return Array.from(grouped.values()).map(entry => ({
    date: entry.date,
    avgLOCSuggested:
      entry.dayCount > 0 ? entry.avgLOCSuggestedSum / entry.dayCount : 0,
    avgLOCAccepted:
      entry.dayCount > 0 ? entry.avgLOCAcceptedSum / entry.dayCount : 0,
  }));
}

function removeWeekendData(rows) {
  if (!Array.isArray(rows)) {
    return [];
  }

  return rows.filter(row => {
    const date = new Date(`${row.date}T00:00:00`);
    const day = date.getDay();
    return day !== 0 && day !== 6;
  });
}

const AverageLOCSuggestionsAcceptance = ({
  data,
  includeWeekendUsage = false,
}) => {
  const [timeBreakdown, setTimeBreakdown] = useState('day');
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const recentData = useMemo(() => {
    if (!Array.isArray(data)) {
      return [];
    }

    const groupedData = aggregateByTimeBreakdown(data, timeBreakdown);
    const filtered =
      timeBreakdown === 'day' && !includeWeekendUsage
        ? removeWeekendData(groupedData)
        : groupedData;
    return filtered.slice(-7);
  }, [data, includeWeekendUsage, timeBreakdown]);

  const palette = getChartPalette(2, isDark);
  const colors = {
    primary: palette[0],
    secondary: palette[1],
    text: 'hsl(var(--muted-foreground))',
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
      <ResponsiveContainer width="100%" height={500}>
        <LineChart
          data={recentData}
          margin={{ top: 10, right: 50, left: 10, bottom: 0 }}
        >
          <CartesianGrid vertical={false} stroke="hsl(var(--muted))" />
          <XAxis
            dataKey="date"
            interval={0}
            stroke="hsl(var(--border))"
            tick={{ fill: colors.text }}
            tickLine={false}
            tickFormatter={formatXAxisDate}
            padding={{ left: 35, right: 35 }}
          />
          <Legend
            verticalAlign="top"
            align="center"
            height={36}
            wrapperStyle={{ paddingBottom: '10px' }}
          />
          <Line
            dot={false}
            strokeWidth={5}
            strokeLinecap="round"
            type="monotone"
            dataKey="avgLOCSuggested"
            stroke={colors.primary}
            yAxisId="left"
            legendType="line"
            name="Average LoC Per Suggestion"
          />
          <Line
            dot={false}
            strokeWidth={5}
            strokeLinecap="round"
            type="monotone"
            dataKey="avgLOCAccepted"
            stroke={colors.secondary}
            yAxisId="left"
            legendType="line"
            name="Average LoC Per Acceptance"
          />
          <YAxis
            tickLine={false}
            yAxisId="left"
            tick={{ fill: colors.text }}
            axisLine={{ stroke: '' }}
            domain={[0, dataMax => Math.ceil(dataMax / 10) * 3]}
            tickCount={5}
            tickFormatter={value => formatNumberWithCommas(value)}
          />
          <Tooltip
            labelFormatter={formatXAxisDate}
            formatter={value => value.toFixed(2)}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AverageLOCSuggestionsAcceptance;
