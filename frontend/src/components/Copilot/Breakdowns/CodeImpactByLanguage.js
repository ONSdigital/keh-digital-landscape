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

const BLUE_PALETTE = ['#052962', '#0e58c5', '#4a8de8', '#90b6ef'];
const ORANGE_PALETTE = ['#ff6b00', '#ff8c33', '#ffad66', '#ffce99'];

function generateShades(count, isDark) {
  const palette = isDark ? ORANGE_PALETTE : BLUE_PALETTE;
  if (count <= palette.length) return palette.slice(0, count);
  const hue = isDark ? 30 : 218;
  return Array.from({ length: count }, (_, i) => {
    const lightness = 40 + (i / (count - 1)) * 35;
    return `hsl(${hue}, 85%, ${lightness}%)`;
  });
}

function CodeImpactByLanguage({ data }) {
  const { theme } = useTheme();
  const colors = generateShades(data.length, theme === 'dark');

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
              <Cell key={`lang-${index}`} fill={colors[index]} />
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
