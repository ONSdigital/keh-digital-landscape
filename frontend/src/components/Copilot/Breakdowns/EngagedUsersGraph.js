import React, { useContext } from 'react';
import { getChartPalette } from '../../../utilities/copilotChartColours';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { formatNumberWithCommas } from '../../../utilities/getCommaSeparated';
import { useTheme } from '../../../contexts/ThemeContext';

const EngagedUsersGraph = ({ data }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const palette = getChartPalette(3, isDark);
  const colours = {
    allActiveUsers: palette[0],
    chatUsers: palette[1],
    agentUsers: palette[2],
  };

  return (
    <div className="copilot-graph-container">
      <ResponsiveContainer height={600}>
        <LineChart
          data={data}
          margin={{ top: 32, right: 96, left: 32, bottom: 32 }}
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
            dataKey="allActiveUsers"
            stroke={colours.allActiveUsers}
            yAxisId="left"
            legendType="rect"
            name="All Active Users"
          />
          <Line
            dot={false}
            strokeWidth={4}
            strokeLinecap="round"
            type="monotone"
            dataKey="chatUsers"
            stroke={colours.chatUsers}
            yAxisId="left"
            legendType="rect"
            name="Chat Users"
          />
          <Line
            dot={false}
            strokeWidth={4}
            strokeLinecap="round"
            type="monotone"
            dataKey="agentUsers"
            stroke={colours.agentUsers}
            yAxisId="left"
            legendType="rect"
            name="Agent Users"
          />
          <YAxis
            tickLine={false}
            yAxisId="left"
            axisLine={{ stroke: 'hsl(var(--border))' }}
            domain={[0, 'dataMax + 10']}
            tickCount={5}
            tickFormatter={value => formatNumberWithCommas(value)}
          />
          <Tooltip
            wrapperStyle={{ color: 'hsl(var(--foreground))' }}
            formatter={(value, name) =>
              name === 'Acceptance Rate'
                ? `${value.toFixed(2)}%`
                : formatNumberWithCommas(value)
            }
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default EngagedUsersGraph;
