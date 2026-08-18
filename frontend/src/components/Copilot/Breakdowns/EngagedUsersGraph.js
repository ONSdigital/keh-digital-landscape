import React from 'react';
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
import { formatNumberWithCommas } from '../../../utilities/getCommaSeparated';

const EngagedUsersGraph = ({ data }) => {
  return (
    <div className="copilot-graph-container">
      <ResponsiveContainer>
        <ComposedChart
          width={400}
          height={300}
          data={data}
          margin={{ top: 0, right: 64, left: 0, bottom: 0 }}
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
            dataKey="engagedUsers"
            barSize={20}
            fill="#3B7AD9"
            yAxisId="left"
            legendType="rect"
            name="Engaged Users"
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
          <Tooltip
            wrapperStyle={{ color: 'hsl(var(--foreground))' }}
            formatter={value => formatNumberWithCommas(value)}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export default EngagedUsersGraph;
