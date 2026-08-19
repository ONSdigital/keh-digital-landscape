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
      <h2>Agent Mode</h2>
      <p className="disclaimer-banner">
        Tracks lines of code that Copilot writes directly into your workspace
        files during agent mode sessions, without you clicking Apply on each
        change. These are the autonomous multi-file edits that appear as inline
        diffs in the editor. This does not include code blocks shown in the chat
        panel (tracked under <a href="/copilot/chat">Copilot Chat</a>) or inline
        ghost-text completions (tracked under{' '}
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
