import React, { useState } from 'react';
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useTheme } from '../../../contexts/ThemeContext';
import GraphSelect from '../../GraphSelect/GraphSelect';
import { getChartPalette } from '../../../utilities/copilotChartColours';
import '../../../styles/Copilot/ReusableStyles.css';

const TogglePieChart = ({ pieData, title, sectionTitle, modeOptions }) => {
  const modes = modeOptions ?? [
    { value: 'added', label: 'Lines Added' },
    { value: 'deleted', label: 'Lines Deleted' },
  ];
  const [mode, setMode] = useState(modes[0].value);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const data = pieData?.[mode] ?? [];
  const colours = getChartPalette(data.length, isDark);

  const heading = sectionTitle ? (
    <h3>{sectionTitle}</h3>
  ) : title ? (
    <h4 className="usage-pie-chart-title">{title}</h4>
  ) : null;

  return (
    <div className="usage-pie-chart-card" style={{ touchAction: 'pan-y' }}>
      <div className="usage-pie-chart-header">
        {heading}
        <GraphSelect options={modes} value={mode} onChange={setMode} />
      </div>
      <ResponsiveContainer width="100%" height={380}>
        <RechartsPieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="54%"
            outerRadius={90}
            innerRadius={50}
            stroke="hsl(var(--muted))"
            labelLine={false}
            minAngle={3}
            paddingAngle={1}
            isAnimationActive
          >
            {data.map((entry, i) => (
              <Cell key={`${entry.name}-${i}`} fill={colours[i]} />
            ))}
          </Pie>
          <Legend iconType="circle" iconSize={10} />
          <Tooltip
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
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TogglePieChart;
