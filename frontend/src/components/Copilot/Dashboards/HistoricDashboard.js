import React from 'react';
import '../../../styles/components/Statistics.css';
import SkeletonStatCard from '../../Statistics/Skeletons/SkeletonStatCard';
import '../../../styles/CopilotPage.css';
import AcceptanceGraph from '../Breakdowns/AcceptanceGraph';
import EngagedUsersGraph from '../Breakdowns/EngagedUsersGraph';
import CompletionsCards from '../Breakdowns/CompletionsCards';
import ChatCards from '../Breakdowns/ChatCards';

function HistoricDashboard({ scope, data, isLoading, viewDatesBy }) {
  let completions, chats;
  if (!isLoading) {
    completions = data.completions;
    chats = data.chat;
  }

  return (
    <div className="copilot-dashboard">
      {scope === 'organisation' && (
        <p className="disclaimer-banner">
          If grouping by day, the engaged users graph shows unique users on that
          day. If grouping by week, month or year, the graph shows unique users
          across that period (deduplicated by GitHub).
        </p>
      )}
      <h1 className="title">IDE Code Completions</h1>
      {isLoading ? (
        <div className="copilot-grid">
          <SkeletonStatCard />
          <SkeletonStatCard />
          <SkeletonStatCard />
          <SkeletonStatCard />
          <SkeletonStatCard />
          <SkeletonStatCard />
        </div>
      ) : (
        <div>
          <CompletionsCards completions={completions} prefix="Total" />
          {viewDatesBy !== 'Day' && (
            <div>
              <h3>Averages per {viewDatesBy}</h3>
              <CompletionsCards
                completions={completions}
                prefix="Average"
                divider={completions.perGroupedPeriod.length}
              />
            </div>
          )}
        </div>
      )}
      {isLoading ? (
        <h3>Loading historic data...</h3>
      ) : (
        <div>
          <h3>Acceptances and Acceptance Rate By {viewDatesBy}</h3>
          <AcceptanceGraph data={completions?.perGroupedPeriod ?? []} />
          <h3>Engaged Users By {viewDatesBy}</h3>
          <EngagedUsersGraph data={completions?.perGroupedPeriod ?? []} />
        </div>
      )}

      <h1 className="title">Copilot Chat</h1>
      {isLoading ? (
        <div className="copilot-chat-grid">
          <SkeletonStatCard />
          <SkeletonStatCard />
          <SkeletonStatCard />
          <SkeletonStatCard />
        </div>
      ) : (
        <div>
          <ChatCards chats={chats} prefix="Total" />
          {viewDatesBy !== 'Day' && (
            <div>
              <h3>Averages per {viewDatesBy}</h3>
              <ChatCards
                chats={chats}
                prefix="Average"
                divider={chats.perGroupedPeriod.length}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
export default HistoricDashboard;
