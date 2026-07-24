import React, { useContext } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useTheme } from '../../../contexts/ThemeContext';
import { getChartPalette } from '../../../utilities/copilotChartColours';

function CodeImpactByLanguage({ data }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const colours = getChartPalette(data.length, isDark);

  return (
    <div className="usage-pie-chart-card">
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={90}
            innerRadius={50}
            labelLine={false}
            minAngle={3}
            paddingAngle={1}
            isAnimationActive
          >
            {data.map((entry, index) => (
              <Cell key={`lang-${index}`} fill={colours[index]} />
            ))}
          </Pie>
          <Tooltip
            separator=": "
            formatter={value => `${value}%`}
            contentStyle={{
              backgroundColor: isDark ? 'hsl(240, 10%, 8%)' : 'hsl(0, 0%, 100%)',
              border: `1px solid ${isDark ? 'hsl(240, 3.7%, 25.9%)' : 'hsl(240, 5.9%, 90%)'}`,
              borderRadius: '0.5rem',
              color: isDark ? 'hsl(0, 0%, 98%)' : 'hsl(240, 10%, 3.9%)',
            }}
            itemStyle={{ color: isDark ? 'hsl(0, 0%, 98%)' : 'hsl(240, 10%, 3.9%)' }}
          />
          <Legend iconType="circle" iconSize={10} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export default CodeImpactByLanguage;
