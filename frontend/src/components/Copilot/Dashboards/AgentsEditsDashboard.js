import React from 'react';
import SkeletonStatCard from '../../Statistics/Skeletons/SkeletonStatCard';
import LinesAddedDeletedBarChart from '../Breakdowns/LinesAddedDeletedBarChart';
import AddedDeletedPieChart from '../Breakdowns/AddedDeletedPieChart';
import { formatNumberWithCommas } from '../../../utilities/getCommaSeparated';
import useCountUp from '../../../hooks/useCountUp';
import '../../../styles/components/Statistics.css';
import '../../../styles/CopilotPage.css';
import '../../../styles/Copilot/ReusableStyles.css';
import '../../../styles/Copilot/GeneralUsagePage.css';

function StatCard({ title, value }) {
  const animated = useCountUp(Number.isFinite(value) ? value : 0);
  return (
    <div className="stat-card">
      <h2>{title}</h2>
      <p>{formatNumberWithCommas(Math.round(animated))}</p>
    </div>
  );
}

function AgentsEditsDashboard({ data, isLoading, chartDisplaySettings }) {
  const loading = isLoading || !data;

  const totalLinesAdded = data?.summaryCards?.totalLinesAdded ?? 0;
  const totalLinesDeleted = data?.summaryCards?.totalLinesDeleted ?? 0;

  return (
    <div className="copilot-dashboard">
      <h2>Agent Edits</h2>
      <p className="disclaimer-banner">
        Lines of code added or deleted is from Agent Edit sessions. Weekend data
        can be toggled in the settings menu (cogwheel) on this page.
      </p>

      <div className="copilot-dashboard-section">
        <h3>Overall Usage</h3>
        {loading ? (
          <div className="copilot-grid">
            <SkeletonStatCard />
            <SkeletonStatCard />
          </div>
        ) : (
          <div className="copilot-grid-average">
            <StatCard title="Total Lines Added" value={totalLinesAdded} />
            <StatCard title="Total Lines Deleted" value={totalLinesDeleted} />
          </div>
        )}

        {loading ? (
          <div className="copilot-graph-container skeleton" />
        ) : (
          <LinesAddedDeletedBarChart
            data={data.dailyGraph}
            includeWeekendUsage={chartDisplaySettings?.includeWeekendUsage ?? true}
          />
        )}
      </div>

      <div className="copilot-dashboard-section-bottom">
        <h3>Breakdowns</h3>
        {loading ? (
          <div className="usage-pie-charts-grid">
            <div className="usage-pie-chart-card skeleton" />
            <div className="usage-pie-chart-card skeleton" />
          </div>
        ) : (
          <div className="usage-pie-charts-grid">
            <AddedDeletedPieChart
              title="Language Breakdown"
              pieData={data.languagePieChart}
            />
            <AddedDeletedPieChart
              title="Model Breakdown"
              pieData={data.modelPieChart}
              formatLabel={name =>
                name
                  .split(/[-_\s]+/)
                  .map(w => w.charAt(0).toUpperCase() + w.slice(1))
                  .join(' ')
              }
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default AgentsEditsDashboard;
