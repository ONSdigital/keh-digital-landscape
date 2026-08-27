import React from 'react';
import SkeletonStatCard from '../../Statistics/Skeletons/SkeletonStatCard';
import LinesAddedVsDeletedBarChart from '../Breakdowns/LinesAddedVsDeletedBarChart';
import TogglePieChart from '../Breakdowns/TogglePieChart';
import DashboardStatCard from '../Breakdowns/DashboardStatCard';

function AgentModeDashboard({ data, isLoading, chartDisplaySettings }) {
  const loading = isLoading || !data;

  const totalLinesAdded = data?.summaryCards?.totalLinesAdded ?? 0;
  const totalLinesDeleted = data?.summaryCards?.totalLinesDeleted ?? 0;

  return (
    <div className="copilot-dashboard">
      <h2>Direct Edits</h2>
      <p className="disclaimer-banner">
        Tracks the volume of code that Copilot writes directly into your
        workspace files during agent and edit mode sessions, measured in lines
        added and deleted. This is distinct from acceptance metrics (tracked
        under <a href="/copilot/chat">Copilot Chat</a> and{' '}
        <a href="/copilot/completions">Code Completions</a>). Weekend data can
        be toggled in the settings menu (cogwheel).
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
            <DashboardStatCard
              title="Total Lines Added"
              value={totalLinesAdded}
              displayMode="count"
            />
            <DashboardStatCard
              title="Total Lines Deleted"
              value={totalLinesDeleted}
              displayMode="count"
            />
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
            <TogglePieChart
              title="Language Breakdown"
              pieData={data.languagePieChart}
            />
            <TogglePieChart
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
