import React from 'react';
import '../../../styles/components/Statistics.css';
import '../../../styles/CopilotPage.css';
import SkeletonStatCard from '../../Statistics/Skeletons/SkeletonStatCard';
import CompletionsCards from '../Breakdowns/CompletionsCards';
import SuggestionsAcceptanceGraph from '../Breakdowns/SuggestionsAcceptanceGraph';
import AverageLOCSuggestionsAcceptance from '../Breakdowns/AverageLOCSuggestionsAcceptance';
import LanguageBreakdownChart from '../Breakdowns/LanguageBreakdownChart';

function mapSuggestionCardsToCompletionCards(suggestedCards) {
  if (!suggestedCards) {
    return {
      totalSuggestions: 0,
      totalAcceptances: 0,
      acceptanceRate: 0,
      totalLinesSuggested: 0,
      totalLinesAccepted: 0,
      lineAcceptanceRate: 0,
    };
  }

  return {
    totalSuggestions: suggestedCards.suggestions?.totalSuggestions ?? 0,
    totalAcceptances: suggestedCards.suggestions?.totalAcceptances ?? 0,
    acceptanceRate: suggestedCards.suggestions?.acceptanceRate ?? 0,
    totalLinesSuggested: suggestedCards.loc?.totalLOCSuggestions ?? 0,
    totalLinesAccepted: suggestedCards.loc?.totalLOCAcceptances ?? 0,
    lineAcceptanceRate: suggestedCards.loc?.acceptanceLOCRate ?? 0,
  };
}

function CodeCompletionsDashboard({ data, isLoading, chartDisplaySettings }) {
  const loading = isLoading || !data;

  const completionCards = mapSuggestionCardsToCompletionCards(
    data?.suggestedCards
  );

  return (
    <div className="copilot-dashboard">
      <h2>IDE Code Completions</h2>

      <div className="copilot-dashboard-section">
        <h3>Summary</h3>
        {loading ? (
          <div className="copilot-grid">
            <SkeletonStatCard />
            <SkeletonStatCard />
            <SkeletonStatCard />
            <SkeletonStatCard />
            <SkeletonStatCard />
            <SkeletonStatCard />
          </div>
        ) : (
          <CompletionsCards completions={completionCards} prefix="Total" />
        )}
      </div>

      <div className="copilot-dashboard-section">
        <h3>Suggestions, Acceptances and Acceptance Rate</h3>
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

      <div className="copilot-dashboard-section">
        <h3>Average LOC Per Suggestion and Acceptance</h3>
        {loading ? (
          <div className="copilot-graph-container skeleton" />
        ) : (
          <AverageLOCSuggestionsAcceptance
            data={data.averageSuggestedLOCGraph}
            includeWeekendUsage={chartDisplaySettings.includeWeekendUsage}
          />
        )}
      </div>

      {chartDisplaySettings.locUsage && (
        <div className="copilot-dashboard-section">
          <h3>LOC Suggestions, LOC Acceptances and LOC Acceptance Rate</h3>
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
