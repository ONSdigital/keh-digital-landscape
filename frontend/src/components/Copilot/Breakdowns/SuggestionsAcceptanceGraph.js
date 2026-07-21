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
import { useTheme } from '../../../contexts/ThemeContext';
import { formatNumberWithCommas } from '../../../utilities/getCommaSeparated';

const SuggestionsAcceptanceGraph = ({ data }) => {
  const recentData = data?.slice(-6) ?? [];
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const colors = {
    primary: isDark ? '#ff6b00' : '#052962',
    secondary: isDark ? '#ff8c33' : '#0e58c5',
    tertiary: isDark ? '#ffce99' : '#90b6ef',
    text: isDark ? '#ffffff' : '#000000',
  };

  return (
    <div className='copilot-graph-container'>
      <ResponsiveContainer>
        <ComposedChart
          width={400}
          height={300}
          data={recentData}
          margin={{ top: 12, right: 0, left: 0, bottom: 0 }}
          barGap={6}
        >
          <CartesianGrid stroke={colors.text} vertical={false} />
          <XAxis
            dataKey='date'
            interval={0}
            tickLine={false}
            axisLine={{ stroke: colors.text }}
            tickFormatter={value =>
              new Date(value).toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
              })
            }
          />
          <Legend verticalAlign='top' align='left' height={36} />
          <Bar
            radius={[10, 10, 0, 0]}
            dataKey='suggestions'
            barSize={64}
            fill={colors.primary}
            yAxisId='left'
            legendType='rect'
            name='Suggestions'
          />
          <Bar
            radius={[10, 10, 0, 0]}
            dataKey='acceptances'
            barSize={64}
            fill={colors.secondary}
            yAxisId='left'
            legendType='rect'
            name='Acceptances'
          />
          <Line
            dot={false}
            strokeWidth={10}
            strokeLinecap='round'
            type='monotone'
            dataKey='acceptanceRate'
            stroke={colors.tertiary}
            yAxisId='right'
            legendType='line'
            name='Acceptance Rate'
          />
          <YAxis
            tickLine={false}
            yAxisId='left'
            axisLine={{ stroke: colors.text }}
            domain={[0, dataMax => Math.ceil(dataMax / 10) * 10]}
            tickCount={5}
            tickFormatter={value => formatNumberWithCommas(value)}
          />
          <YAxis
            tickLine={false}
            yAxisId='right'
            orientation='right'
            stroke={colors.text}
            axisLine={{ stroke: colors.text }}
            domain={[0, dataMax => Math.ceil(dataMax / 10) * 10]}
            tickCount={5}
            tickFormatter={value => `${value.toFixed(0)}%`}
          />
          <Tooltip
            wrapperStyle={{ color: 'black' }}
            labelFormatter={value =>
              new Date(value).toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
              })
            }
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