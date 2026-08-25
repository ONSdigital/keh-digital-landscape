import React from 'react';
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
import { formatNumberWithCommas } from '../../../utilities/getCommaSeparated';
import { useTheme } from '../../../contexts/ThemeContext';

const AcceptanceGraph = ({ data }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className="copilot-graph-container">
      <ResponsiveContainer>
        <ComposedChart
          width={400}
          height={300}
          data={data}
          margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
        >
          <CartesianGrid stroke="hsl(var(--muted))" vertical={false} />
          <XAxis
            dataKey="date"
            interval={data.length - 2}
            tickLine={false}
            tick={{ fill: 'hsl(var(--muted-foreground))' }}
            axisLine={{ stroke: '' }}
          />
          <Legend verticalAlign="top" align="left" height={36} />
          <Bar
            radius={[10, 10, 0, 0]}
            dataKey="acceptances"
            barSize={20}
            fill="#70c4e6"
            yAxisId="left"
            legendType="rect"
            name="Acceptances"
          />
          <Line
            dot={false}
            strokeWidth={2}
            strokeLinecap="round"
            type="monotone"
            dataKey="acceptanceRate"
            stroke="#3B7AD9"
            yAxisId="right"
            legendType="rect"
            name="Acceptance Rate"
          />
          <YAxis
            tickLine={false}
            yAxisId="left"
            tick={{ fill: 'hsl(var(--muted-foreground))' }}
            axisLine={{ stroke: '' }}
            domain={[0, 'dataMax + 5']}
            tickCount={5}
            tickFormatter={value => formatNumberWithCommas(value)}
          />
          <YAxis
            tickLine={false}
            yAxisId="right"
            orientation="right"
            stroke="#3B7AD9"
            tick={{ fill: 'hsl(var(--muted-foreground))' }}
            axisLine={{ stroke: '' }}
            domain={[0, dataMax => Math.ceil(dataMax / 10) * 10]}
            tickFormatter={value => `${value.toFixed(0)}%`}
            tickCount={5}
          />
          <Tooltip
            wrapperStyle={{ color: 'hsl(var(--foreground))' }}
            contentStyle={{
              backgroundColor: isDark
                ? 'hsl(240, 10%, 8%)'
                : 'hsl(0, 0%, 100%)',
              border: `1px solid ${isDark ? 'hsl(240, 3.7%, 25.9%)' : 'hsl(240, 5.9%, 90%)'}`,
              borderRadius: '0.5rem',
              color: isDark ? 'hsl(0, 0%, 98%)' : 'hsl(240, 10%, 3.9%)',
            }}
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

export default AcceptanceGraph;
