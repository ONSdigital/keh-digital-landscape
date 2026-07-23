import React from 'react';
import '../../../styles/components/Statistics.css';
import '../../../styles/CopilotPage.css';
import SkeletonStatCard from '../../Statistics/Skeletons/SkeletonStatCard';
import SuggestionsAcceptanceGraph from '../Breakdowns/SuggestionsAcceptanceGraph';
import AverageLOCSuggestionsAcceptance from '../Breakdowns/AverageLOCSuggestionsAcceptance';
import LanguageBreakdownChart from '../Breakdowns/LanguageBreakdownChart';
import { getPercentage } from '../../../utilities/getPercentage';
import { formatNumberWithCommas } from '../../../utilities/getCommaSeparated';

function mapSuggestionCardsToDashboardCards(suggestedCards) {
  if (!suggestedCards) {
    return {
      totalSuggestionInstances: 0,
      totalAcceptances: 0,
      overallAcceptanceRate: 0,
      totalLinesSuggested: 0,
      totalLinesAccepted: 0,
      overallLineAcceptanceRate: 0,
      averageLocPerSuggestion: 0,
      averageLocPerAcceptance: 0,
    };
  }

  return {
    totalSuggestionInstances: suggestedCards.suggestions?.totalSuggestions ?? 0,
    totalAcceptances: suggestedCards.suggestions?.totalAcceptances ?? 0,
    overallAcceptanceRate: suggestedCards.suggestions?.acceptanceRate ?? 0,
    totalLinesSuggested: suggestedCards.loc?.totalLOCSuggestions ?? 0,
    totalLinesAccepted: suggestedCards.loc?.totalLOCAcceptances ?? 0,
    overallLineAcceptanceRate: suggestedCards.loc?.acceptanceLOCRate ?? 0,
    averageLocPerSuggestion:
      suggestedCards.average?.averageLOCSuggestions ?? 0,
    averageLocPerAcceptance: suggestedCards.average?.averageLOCAccepted ?? 0,
  };
}

function DashboardStatCard({ title, value }) {
  return (
    <div className="stat-card">
      <h2>{title}</h2>
      <p>{value}</p>
    </div>
  );
}

function CodeCompletionsDashboard({ data, isLoading, chartDisplaySettings }) {
  const loading = isLoading || !data;

  const dashboardCards = mapSuggestionCardsToDashboardCards(
    data?.suggestedCards
  );

  return (
    <div className="copilot-dashboard">
      <h2>IDE Code Completions</h2>

      <div className="copilot-dashboard-section">
        <h3>Overall Usage</h3>
        {loading ? (
          <div className="copilot-grid">
            <SkeletonStatCard />
            <SkeletonStatCard />
            <SkeletonStatCard />
          </div>
        ) : (
          <div className="copilot-grid">
            <DashboardStatCard
              title="Total Suggestion Instances"
              value={formatNumberWithCommas(
                Math.round(dashboardCards.totalSuggestionInstances)
              )}
            />
            <DashboardStatCard
              title="Total Acceptances"
              value={formatNumberWithCommas(
                Math.round(dashboardCards.totalAcceptances)
              )}
            />
            <DashboardStatCard
              title="Overall Acceptance Rate"
              value={getPercentage(dashboardCards.overallAcceptanceRate)}
            />
          </div>
        )}

        {loading ? (
          <div className="copilot-graph-container skeleton" />
        ) : (
          <SuggestionsAcceptanceGraph
            data={data.suggestedGraph}
            includeWeekendUsage={chartDisplaySettings.includeWeekendUsage}
            LOC={false}
          />
        )}
      </div>

      {chartDisplaySettings.locUsage && (
        <div className="copilot-dashboard-section">
          <h3>LOC Suggestions, LOC Acceptances and LOC Acceptance Rate</h3>
          {loading ? (
            <div className="copilot-grid">
              <SkeletonStatCard />
              <SkeletonStatCard />
              <SkeletonStatCard />
            </div>
          ) : (
            <div className="copilot-grid">
              <DashboardStatCard
                title="Total Lines Suggested"
                value={formatNumberWithCommas(
                  Math.round(dashboardCards.totalLinesSuggested)
                )}
              />
              <DashboardStatCard
                title="Total Lines Accepted"
                value={formatNumberWithCommas(
                  Math.round(dashboardCards.totalLinesAccepted)
                )}
              />
              <DashboardStatCard
                title="Overall Line Acceptance Rate"
                value={getPercentage(dashboardCards.overallLineAcceptanceRate)}
              />
            </div>
          )}

          {loading ? (
            <div className="copilot-graph-container skeleton" />
          ) : (
            <SuggestionsAcceptanceGraph
              data={data.suggestedLOCGraph}
              includeWeekendUsage={chartDisplaySettings.includeWeekendUsage}
              LOC={true}
            />
          )}
        </div>
      )}

      <div className="copilot-dashboard-section">
        <h3>Suggestion vs Acceptance Size</h3>
        {loading ? (
          <div className="copilot-grid-average">
            <SkeletonStatCard />
            <SkeletonStatCard />
          </div>
        ) : (
          <div className="copilot-grid-average">
            <DashboardStatCard
              title="Average LoC per suggestion"
              value={dashboardCards.averageLocPerSuggestion.toFixed(2)}
            />
            <DashboardStatCard
              title="Average LoC per acceptance"
              value={dashboardCards.averageLocPerAcceptance.toFixed(2)}
            />
          </div>
        )}

        {loading ? (
          <div className="copilot-graph-container skeleton" />
        ) : (
          <AverageLOCSuggestionsAcceptance
            data={data.averageSuggestedLOCGraph}
            includeWeekendUsage={chartDisplaySettings.includeWeekendUsage}
          />
        )}
      </div>

      <div className="copilot-dashboard-section-bottom">
        <h3>Language Breakdown</h3>
        {loading ? (
          <div className="copilot-graph-container skeleton" />
        ) : (
          <LanguageBreakdownChart languageData={data.languagesUsedPieChart} />
        )}
      </div>
    </div>
  );
}

export default CodeCompletionsDashboard;
