import React, { useEffect, useState } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { COPILOT_CHART_PALETTE } from '../../../constants/copilotConstants';
import useCountUp from '../../../hooks/useCountUp';

function PercentageCard({ title, numerator, denominator, paletteIndex }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const ratio = denominator > 0 ? numerator / denominator : 0;
  const animatedPercentage = useCountUp(ratio * 100);
  const [barWidth, setBarWidth] = useState(0);
  const description = `${numerator} out of ${denominator} active users this month`;

  const barColor = (
    isDark ? COPILOT_CHART_PALETTE.dark : COPILOT_CHART_PALETTE.light
  )[paletteIndex];

  useEffect(() => {
    const rafId = requestAnimationFrame(() => setBarWidth(ratio * 100));
    return () => cancelAnimationFrame(rafId);
  }, [ratio]);

  return (
    <div className="usage-card">
      <h4 className="usage-card-title">{title}</h4>
      <div className="usage-card-body">
        <p className="usage-card-percentage">
          {Math.round(animatedPercentage)}%
        </p>
        <p className="usage-card-description">{description}</p>
      </div>
      <div className="usage-card-bar">
        <div
          className="usage-card-bar-fill"
          style={{
            width: `${barWidth}%`,
            backgroundColor: barColor,
          }}
        />
      </div>
    </div>
  );
}

export default PercentageCard;
