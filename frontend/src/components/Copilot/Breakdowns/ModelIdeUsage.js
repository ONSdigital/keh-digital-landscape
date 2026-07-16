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

function ModelIdeUsage({ modelData, ideData }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const modelColors = generateShades(modelData.length, isDark);
  const ideColors = generateShades(ideData.length, isDark);

  return (
    <div className="usage-pie-charts-grid">
      <div className="usage-pie-chart-card">
        <h4 className="usage-pie-chart-title">Model Usage</h4>
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie
              data={modelData}
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
              {modelData.map((entry, index) => (
                <Cell key={`model-${index}`} fill={modelColors[index]} />
              ))}
            </Pie>
            <Tooltip formatter={value => `${value}%`} />
            <Legend iconType="circle" iconSize={10} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="usage-pie-chart-card">
        <h4 className="usage-pie-chart-title">IDE Usage</h4>
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie
              data={ideData}
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
              {ideData.map((entry, index) => (
                <Cell key={`ide-${index}`} fill={ideColors[index]} />
              ))}
            </Pie>
            <Tooltip formatter={value => `${value}%`} />
            <Legend iconType="circle" iconSize={10} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default ModelIdeUsage;
