import React from 'react';
import { IoInformationCircleOutline } from 'react-icons/io5';
import '../../../styles/components/Statistics.css';
import '../../../styles/CopilotPage.css';
import SkeletonStatCard from '../../Statistics/Skeletons/SkeletonStatCard';
import SuggestionsAcceptanceGraph from '../Breakdowns/SuggestionsAcceptanceGraph';
import AverageLOCSuggestionsAcceptance from '../Breakdowns/AverageLOCSuggestionsAcceptance';
import LanguageBreakdownChart from '../Breakdowns/LanguageBreakdownChart';
import Tooltip from '../../Tooltip/Tooltip';
import { getPercentage } from '../../../utilities/getPercentage';
import { formatNumberWithCommas } from '../../../utilities/getCommaSeparated';
import useCountUp from '../../../hooks/useCountUp';

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
    averageLocPerSuggestion: suggestedCards.average?.averageLOCSuggestions ?? 0,
    averageLocPerAcceptance: suggestedCards.average?.averageLOCAccepted ?? 0,
  };
}

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

function CodeCompletionsDashboard({ data, isLoading, chartDisplaySettings }) {
  const loading = isLoading || !data;

  const dashboardCards = mapSuggestionCardsToDashboardCards(
    data?.suggestedCards
  );

  return (
    <div className="copilot-dashboard">
      <h2>IDE Code Completions</h2>
      <p className="disclaimer-banner">
          Usage data in the form of lines of code (LoC), and the inclusion of weekend data can be toggled in the settings menu (cogwheel) on this page
        </p>

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
              value={dashboardCards.totalSuggestionInstances}
              displayMode="count"
            />
            <DashboardStatCard
              title="Total Acceptances"
              value={dashboardCards.totalAcceptances}
              displayMode="count"
            />
            <DashboardStatCard
              title="Overall Acceptance Rate"
              value={dashboardCards.overallAcceptanceRate}
              displayMode="percentage"
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
                value={dashboardCards.totalLinesSuggested}
                displayMode="count"
              />
              <DashboardStatCard
                title="Total Lines Accepted"
                value={dashboardCards.totalLinesAccepted}
                displayMode="count"
              />
              <DashboardStatCard
                title="Overall Line Acceptance Rate"
                value={dashboardCards.overallLineAcceptanceRate}
                displayMode="percentage"
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
        <h3>
          Suggestion vs Acceptance Size
          <Tooltip
            title={
              <p
                className="copilot-tooltip-paragraph"
              >
                Tracks the average size of suggestions Copilot generates versus
                the average size of suggestions developers actually accept. A
                growing gap means developers are consistently accepting smaller
                (or larger) suggestions than what Copilot offers, indicating a
                size preference signal.
              </p>
            }
          >
            <span className="info-icon">
              <IoInformationCircleOutline />
            </span>
          </Tooltip>
        </h3>
        {loading ? (
          <div className="copilot-grid-average">
            <SkeletonStatCard />
            <SkeletonStatCard />
          </div>
        ) : (
          <div className="copilot-grid-average">
            <DashboardStatCard
              title="Average LoC per suggestion"
              value={dashboardCards.averageLocPerSuggestion}
              displayMode="fixed2"
            />
            <DashboardStatCard
              title="Average LoC per acceptance"
              value={dashboardCards.averageLocPerAcceptance}
              displayMode="fixed2"
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
