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

function ModelIdeUsagePieChart({ modelData, ideData }) {
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
            <button
              type="button"
              className="info-icon info-icon-button"
              aria-label="About model usage"
            >
              <IoInformationCircleOutline />
            </button>
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
              stroke={'hsl(var(--muted))'}
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
            <RechartsTooltip
              separator=": "
              formatter={value => `${value}%`}
              contentStyle={{
                backgroundColor: isDark
                  ? 'hsl(240, 10%, 8%)'
                  : 'hsl(0, 0%, 100%)',
                border: `1px solid ${isDark ? 'hsl(240, 3.7%, 25.9%)' : 'hsl(240, 5.9%, 90%)'}`,
                borderRadius: '0.5rem',
                color: isDark ? 'hsl(0, 0%, 98%)' : 'hsl(240, 10%, 3.9%)',
              }}
              itemStyle={{
                color: isDark ? 'hsl(0, 0%, 98%)' : 'hsl(240, 10%, 3.9%)',
              }}
            />
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
            <button
              type="button"
              className="info-icon info-icon-button"
              aria-label="About IDE usage"
            >
              <IoInformationCircleOutline />
            </button>
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
              stroke={'hsl(var(--muted))'}
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
            <RechartsTooltip
              separator=": "
              formatter={value => `${value}%`}
              contentStyle={{
                backgroundColor: isDark
                  ? 'hsl(240, 10%, 8%)'
                  : 'hsl(0, 0%, 100%)',
                border: `1px solid ${isDark ? 'hsl(240, 3.7%, 25.9%)' : 'hsl(240, 5.9%, 90%)'}`,
                borderRadius: '0.5rem',
                color: isDark ? 'hsl(0, 0%, 98%)' : 'hsl(240, 10%, 3.9%)',
              }}
              itemStyle={{
                color: isDark ? 'hsl(0, 0%, 98%)' : 'hsl(240, 10%, 3.9%)',
              }}
            />
            <Legend iconType="circle" iconSize={10} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default ModelIdeUsagePieChart;
