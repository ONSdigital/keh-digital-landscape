import React, { useEffect, useState } from 'react';
import { IoInformationCircleOutline } from 'react-icons/io5';
import { useTheme } from '../../../contexts/ThemeContext';
import { COPILOT_CHART_PALETTE } from '../../../constants/copilotConstants';
import Tooltip from '../../Tooltip/Tooltip';
import useCountUp from '../../../hooks/useCountUp';

function PercentageCard({
  title,
  numerator,
  denominator,
  paletteIndex,
  tooltip,
}) {
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
      <div className="usage-card-header">
        <h4 className="usage-card-title">{title}</h4>
        {tooltip && (
          <Tooltip
            title={<p className="copilot-tooltip-paragraph">{tooltip}</p>}
          >
            <span className="info-icon">
              <IoInformationCircleOutline />
            </span>
          </Tooltip>
        )}
      </div>
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
