import React, { useContext } from 'react';
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

const NewEngagedUsersGraph = ({ data }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const colors = {
    allActiveUsers: isDark ? '#ff6b00' : '#052962',
    chatUsers: isDark ? '#ff8c33' : '#0e58c5',
    agentUsers: isDark ? '#ffce99' : '#90b6ef',
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
          <Legend verticalAlign="top" align="left" height={36} />
          <Line
            dot={false}
            strokeWidth={4}
            strokeLinecap="round"
            type="monotone"
            dataKey="allActiveUsers"
            stroke={colors.allActiveUsers}
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
            stroke={colors.chatUsers}
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
            stroke={colors.agentUsers}
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
            wrapperStyle={{ color: 'black' }}
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

export default NewEngagedUsersGraph;
