import { getPercentage } from '../../../utilities/getPercentage';
import { formatNumberWithCommas } from '../../../utilities/getCommaSeparated';
import useCountUp from '../../../hooks/useCountUp';

function DashboardStatCard({ title, value, displayMode = 'count' }) {
  const numericValue = Number.isFinite(value) ? value : 0;
  const animatedValue = useCountUp(numericValue);

  const formattedValue =
    displayMode === 'percentage'
      ? getPercentage(animatedValue)
      : displayMode === 'fixed2'
        ? animatedValue.toFixed(2)
        : formatNumberWithCommas(Math.round(animatedValue));

  return (
    <div className="stat-card">
      <h2>{title}</h2>
      <p>{formattedValue}</p>
    </div>
  );
}

export default DashboardStatCard;
