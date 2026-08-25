import React from 'react';
import { IoInformationCircleOutline } from 'react-icons/io5';
import SkeletonStatCard from '../../Statistics/Skeletons/SkeletonStatCard';
import SuggestionsAcceptancesBarChart from '../Breakdowns/SuggestionsAcceptancesBarChart';
import SuggestionsAcceptancesSizeComparisonGraph from '../Breakdowns/SuggestionsAcceptancesSizeComparisonGraph';
import TogglePieChart from '../Breakdowns/TogglePieChart';
import DashboardStatCard from '../Breakdowns/DashboardStatCard';
import Tooltip from '../../Tooltip/Tooltip';

const CHAT_PIE_MODES = [
  { value: 'suggestions', label: 'Suggestions' },
  { value: 'acceptances', label: 'Acceptances' },
];

function ChatModeDashboard({ data, isLoading, chartDisplaySettings }) {
  const loading = isLoading || !data;

  const cards = data?.suggestedCards ?? {};

  return (
    <div className="copilot-dashboard">
      <h2>Copilot Chat</h2>
      <p className="disclaimer-banner">
        Tracks code suggestions generated through Copilot Chat across all modes
        (Ask, Edit, Agent, and Plan). A suggestion is counted each time Copilot
        generates a code block, and an acceptance is counted when the code is
        applied to your workspace. This does not include the autonomous file
        writes made by agent mode, those are tracked separately under{' '}
        <a href="/copilot/agent">Agent Mode</a>. Weekend data and lines of code
        (LoC) can be toggled in the settings menu (cogwheel).
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
              value={cards.totalSuggestionInstances}
              displayMode="count"
            />
            <DashboardStatCard
              title="Total Acceptances"
              value={cards.totalAcceptances}
              displayMode="count"
            />
            <DashboardStatCard
              title="Overall Acceptance Rate"
              value={cards.overallAcceptanceRate}
              displayMode="percentage"
            />
          </div>
        )}

        {loading ? (
          <div className="copilot-graph-container skeleton" />
        ) : (
          <SuggestionsAcceptancesBarChart
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
                value={cards.totalLinesSuggested}
                displayMode="count"
              />
              <DashboardStatCard
                title="Total Lines Accepted"
                value={cards.totalLinesAccepted}
                displayMode="count"
              />
              <DashboardStatCard
                title="Overall Line Acceptance Rate"
                value={cards.overallLineAcceptanceRate}
                displayMode="percentage"
              />
            </div>
          )}

          {loading ? (
            <div className="copilot-graph-container skeleton" />
          ) : (
            <SuggestionsAcceptancesBarChart
              data={data.suggestedLOCGraph}
              includeWeekendUsage={chartDisplaySettings.includeWeekendUsage}
              LOC={true}
            />
          )}
        </div>
      )}

      <div className="copilot-dashboard-section">
        <h3>
          Suggestions vs Acceptance Sizes
          <Tooltip
            title={
              <p className="copilot-tooltip-paragraph">
                Tracks the average size of suggestions Copilot generates versus
                the average size of suggestions developers actually accept. When
                the acceptance line is higher, it means developers are
                selectively accepting the longer suggestions and rejecting
                shorter ones - indicating a preference for more substantial code
                blocks.
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
              value={cards.averageLocPerSuggestion}
              displayMode="fixed2"
            />
            <DashboardStatCard
              title="Average LoC per acceptance"
              value={cards.averageLocPerAcceptance}
              displayMode="fixed2"
            />
          </div>
        )}

        {loading ? (
          <div className="copilot-graph-container skeleton" />
        ) : (
          <SuggestionsAcceptancesSizeComparisonGraph
            data={data.averageSuggestedLOCGraph}
            includeWeekendUsage={chartDisplaySettings.includeWeekendUsage}
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
              modeOptions={CHAT_PIE_MODES}
            />
            <TogglePieChart
              title="Model Breakdown"
              pieData={data.modelPieChart}
              modeOptions={CHAT_PIE_MODES}
            />
          </div>
        )}
        {loading ? (
          <div className="usage-pie-chart-card skeleton" />
        ) : (
          <TogglePieChart
            title="Chat Mode Breakdown"
            pieData={data.chatModePieChart}
            modeOptions={CHAT_PIE_MODES}
          />
        )}
      </div>
    </div>
  );
}

export default ChatModeDashboard;
