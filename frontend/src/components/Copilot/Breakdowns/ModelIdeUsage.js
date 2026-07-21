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

function ModelIdeUsage({ modelData, ideData }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const modelColours = getChartPalette(modelData.length, isDark);
  const ideColours = getChartPalette(ideData.length, isDark);

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
                <Cell key={`model-${index}`} fill={modelColours[index]} />
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
                <Cell key={`ide-${index}`} fill={ideColours[index]} />
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
