import React, { useContext } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { IoInformationCircleOutline } from 'react-icons/io5';
import { useTheme } from '../../../contexts/ThemeContext';
import { getChartPalette } from '../../../utilities/copilotChartColours';
import Tooltip from '../../Tooltip/Tooltip';

function ModelIdeUsage({ modelData, ideData }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const modelColours = getChartPalette(modelData.length, isDark);
  const ideColours = getChartPalette(ideData.length, isDark);

  return (
    <div className="usage-pie-charts-grid">
      <div className="usage-pie-chart-card">
        <div className="usage-pie-chart-header">
          <h4 className="usage-pie-chart-title">Model Usage</h4>
          <Tooltip
            title={
              <span className="copilot-tooltip-paragraph">
                Share of user-initiated interactions by AI model.
              </span>
            }
          >
            <div className="info-icon">
              <IoInformationCircleOutline />
            </div>
          </Tooltip>
        </div>
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
            <RechartsTooltip formatter={value => `${value}%`} />
            <Legend iconType="circle" iconSize={10} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="usage-pie-chart-card">
        <div className="usage-pie-chart-header">
          <h4 className="usage-pie-chart-title">IDE Usage</h4>
          <Tooltip
            title={
              <span className="copilot-tooltip-paragraph">
                Share of user-initiated interactions by development environment.
              </span>
            }
          >
            <div className="info-icon">
              <IoInformationCircleOutline />
            </div>
          </Tooltip>
        </div>
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
            <RechartsTooltip formatter={value => `${value}%`} />
            <Legend iconType="circle" iconSize={10} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default ModelIdeUsage;
