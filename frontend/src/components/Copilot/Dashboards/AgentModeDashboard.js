import React from 'react';
import SkeletonStatCard from '../../Statistics/Skeletons/SkeletonStatCard';
import StatCard from '../../StatCard/StatCard';
import LinesAddedVsDeletedBarChart from '../Breakdowns/LinesAddedVsDeletedBarChart';
import AddedDeletedPieChart from '../Breakdowns/AddedDeletedPieChart';
import '../../../styles/components/Statistics.css';
import '../../../styles/CopilotPage.css';
import '../../../styles/Copilot/ReusableStyles.css';
import '../../../styles/Copilot/GeneralUsagePage.css';

function AgentModeDashboard({ data, isLoading, chartDisplaySettings }) {
  const loading = isLoading || !data;

  const totalLinesAdded = data?.summaryCards?.totalLinesAdded ?? 0;
  const totalLinesDeleted = data?.summaryCards?.totalLinesDeleted ?? 0;

  return (
    <div className="copilot-dashboard">
      <h2>Agent Mode</h2>
      <p className="disclaimer-banner">
        Lines of code added or deleted are from agent sessions where Copilot
        autonomously writes changes directly into files as a part of a
        multi-step task. Weekend data can be toggled in the settings menu
        (cogwheel) on this page.
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
          <LinesAddedVsDeletedBarChart
            data={data.dailyGraph}
            includeWeekendUsage={
              chartDisplaySettings?.includeWeekendUsage ?? true
            }
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
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default AgentModeDashboard;
