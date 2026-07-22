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
  const colours = getChartPalette(data.length, theme === 'dark');

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
          <Tooltip formatter={value => `${value}%`} />
          <Legend iconType="circle" iconSize={10} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export default CodeImpactByLanguage;
