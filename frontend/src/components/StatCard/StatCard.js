import React from 'react';
import { formatNumberWithCommas } from '../../utilities/getCommaSeparated';
import useCountUp from '../../hooks/useCountUp';

function StatCard({ title, value }) {
  const animated = useCountUp(Number.isFinite(value) ? value : 0);
  return (
    <div className="stat-card">
      <h2>{title}</h2>
      <p>{formatNumberWithCommas(Math.round(animated))}</p>
    </div>
  );
}

export default StatCard;
