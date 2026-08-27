import React from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { getChartPalette } from '../../../utilities/copilotChartColours';
import { formatNumberWithCommas } from '../../../utilities/getCommaSeparated';
import { useTheme } from '../../../contexts/ThemeContext';

// showLines: false = suggestion/acceptance counts, true = line-of-code counts
const CumulativeAcceptanceGraph = ({ data, showLines = false }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const palette = getChartPalette(3, isDark);
  const colours = {
    suggestions: palette[0],
    acceptances: palette[1],
    rate: palette[2],
  };

  const suggestionsKey = showLines ? 'locSuggested' : 'suggestions';
  const acceptancesKey = showLines ? 'locAccepted' : 'acceptances';
  const rateKey = showLines ? 'lineAcceptanceRate' : 'acceptanceRate';
  const suggestionsLabel = showLines ? 'Line Suggestions' : 'Suggestions';
  const acceptancesLabel = showLines ? 'Line Acceptances' : 'Acceptances';
  const rateLabel = showLines ? 'Line Acceptance Rate' : 'Acceptance Rate';

  const tooltipStyle = {
    backgroundColor: isDark ? 'hsl(240, 10%, 8%)' : 'hsl(0, 0%, 100%)',
    border: `1px solid ${isDark ? 'hsl(240, 3.7%, 25.9%)' : 'hsl(240, 5.9%, 90%)'}`,
    borderRadius: '0.5rem',
    color: isDark ? 'hsl(0, 0%, 98%)' : 'hsl(240, 10%, 3.9%)',
  };

  return (
    <div className="copilot-graph-container">
      <ResponsiveContainer height={600}>
        <ComposedChart
          data={data}
          margin={{ top: 32, right: 32, left: 32, bottom: 32 }}
        >
          <CartesianGrid stroke="hsl(var(--muted))" vertical={false} />
          <XAxis
            dataKey="date"
            interval={data.length - 2}
            tickLine={false}
            axisLine={{ stroke: 'hsl(var(--border))' }}
          />
          <Legend verticalAlign="top" align="center" height={36} />
          <Line
            dot={false}
            strokeWidth={4}
            strokeLinecap="round"
            type="monotone"
            dataKey={suggestionsKey}
            stroke={colours.suggestions}
            yAxisId="left"
            legendType="rect"
            name={suggestionsLabel}
          />
          <Line
            dot={false}
            strokeWidth={4}
            strokeLinecap="round"
            type="monotone"
            dataKey={acceptancesKey}
            stroke={colours.acceptances}
            yAxisId="left"
            legendType="rect"
            name={acceptancesLabel}
          />
          <Line
            dot={false}
            strokeWidth={2}
            strokeLinecap="round"
            strokeDasharray="5 4"
            type="monotone"
            dataKey={rateKey}
            stroke={colours.rate}
            yAxisId="right"
            legendType="rect"
            name={rateLabel}
          />
          <YAxis
            tickLine={false}
            yAxisId="left"
            axisLine={{ stroke: 'hsl(var(--border))' }}
            domain={[0, 'dataMax + 10']}
            tickCount={5}
            tickFormatter={value => formatNumberWithCommas(value)}
          />
          <YAxis
            tickLine={false}
            yAxisId="right"
            orientation="right"
            axisLine={{ stroke: 'hsl(var(--border))' }}
            domain={[0, dataMax => Math.min(100, Math.ceil(dataMax / 10) * 10)]}
            tickCount={5}
            tickFormatter={value => `${value.toFixed(0)}%`}
          />
          <Tooltip
            wrapperStyle={{ color: 'hsl(var(--foreground))' }}
            contentStyle={tooltipStyle}
            formatter={(value, name) =>
              name === rateLabel
                ? `${value.toFixed(2)}%`
                : formatNumberWithCommas(value)
            }
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CumulativeAcceptanceGraph;
