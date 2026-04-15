import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { formatNumberWithCommas } from '../../utilities/getCommaSeparated';
import { getPercentage } from '../../utilities/getPercentage';

function LegacyDataVisualisation({ data, isLoading }) {
  if (isLoading) {
    return (
      <div>
        <h2>Legacy Copilot Data</h2>
        <p>Loading...</p>
      </div>
    );
  }

  // Process Feb 25 Data
  const rawFebData = data?.feb25 || {};

  let febDataTotals = {
    suggestions: 0,
    acceptances: 0,
    linesSuggested: 0,
    linesAccepted: 0,
    chats: 0,
    chatAcceptances: 0,
  };

  let febDataMonthly = {
    suggestions: [],
    acceptances: [],
    linesSuggested: [],
    linesAccepted: [],
    chats: [],
    chatAcceptances: [],
  };

  for (const index in rawFebData) {
    const day = rawFebData[index];

    // Aggregate totals

    febDataTotals.suggestions += day.total_suggestions_count || 0;
    febDataTotals.acceptances += day.total_acceptances_count || 0;
    febDataTotals.linesSuggested += day.total_lines_suggested || 0;
    febDataTotals.linesAccepted += day.total_lines_accepted || 0;
    febDataTotals.chats += day.total_chat_turns || 0;
    febDataTotals.chatAcceptances += day.total_chat_acceptances || 0;

    // Prepare monthly data for graphing

    febDataMonthly.suggestions.push({
      date: day.day,
      count: day.total_suggestions_count || 0,
    });
    febDataMonthly.acceptances.push({
      date: day.day,
      count: day.total_acceptances_count || 0,
    });
    febDataMonthly.linesSuggested.push({
      date: day.day,
      count: day.total_lines_suggested || 0,
    });
    febDataMonthly.linesAccepted.push({
      date: day.day,
      count: day.total_lines_accepted || 0,
    });
    febDataMonthly.chats.push({
      date: day.day,
      count: day.total_chat_turns || 0,
    });
    febDataMonthly.chatAcceptances.push({
      date: day.day,
      count: day.total_chat_acceptances || 0,
    });
  }

  // Process Mar 26 Data
  const rawMarData = data?.mar26 || {};

  let marDataTotals = {
    suggestions: 0,
    acceptances: 0,
    linesSuggested: 0,
    linesAccepted: 0,
    chats: 0,
    chatInsertions: 0,
    chatCopies: 0,
  };

  let marDataMonthly = {
    suggestions: [],
    acceptances: [],
    linesSuggested: [],
    linesAccepted: [],
    chats: [],
    chatInsertions: [],
    chatCopies: [],
  };

  for (const index in rawMarData) {
    const day = rawMarData[index];

    const ideChat = day.copilot_ide_chat || {};
    const ideCompletions = day.copilot_ide_code_completions || {};

    let dayTotals = {
      suggestions: 0,
      acceptances: 0,
      linesSuggested: 0,
      linesAccepted: 0,
      chats: 0,
      chatInsertions: 0,
      chatCopies: 0,
    };

    (ideChat.editors || []).forEach(editor => {
      (editor.models || []).forEach(model => {
        // Overall totals
        marDataTotals.chats += model.total_chats || 0;
        marDataTotals.chatInsertions += model.total_chat_insertion_events || 0;
        marDataTotals.chatCopies += model.total_chat_copy_events || 0;

        // Monthly data for graphing
        dayTotals.chats += model.total_chats || 0;
        dayTotals.chatInsertions += model.total_chat_insertion_events || 0;
        dayTotals.chatCopies += model.total_chat_copy_events || 0;
      });
    });

    (ideCompletions.editors || []).forEach(editor => {
      (editor.models || []).forEach(model => {
        (model.languages || []).forEach(language => {
          // Overall totals
          marDataTotals.suggestions += language.total_code_suggestions || 0;
          marDataTotals.acceptances += language.total_code_acceptances || 0;
          marDataTotals.linesSuggested +=
            language.total_code_lines_suggested || 0;
          marDataTotals.linesAccepted +=
            language.total_code_lines_accepted || 0;

          // Monthly data for graphing
          dayTotals.suggestions += language.total_code_suggestions || 0;
          dayTotals.acceptances += language.total_code_acceptances || 0;
          dayTotals.linesSuggested += language.total_code_lines_suggested || 0;
          dayTotals.linesAccepted += language.total_code_lines_accepted || 0;
        });
      });
    });

    marDataMonthly.suggestions.push({
      date: day.date,
      count: dayTotals.suggestions,
    });
    marDataMonthly.acceptances.push({
      date: day.date,
      count: dayTotals.acceptances,
    });
    marDataMonthly.linesSuggested.push({
      date: day.date,
      count: dayTotals.linesSuggested,
    });
    marDataMonthly.linesAccepted.push({
      date: day.date,
      count: dayTotals.linesAccepted,
    });
    marDataMonthly.chats.push({ date: day.date, count: dayTotals.chats });
    marDataMonthly.chatInsertions.push({
      date: day.date,
      count: dayTotals.chatInsertions,
    });
    marDataMonthly.chatCopies.push({
      date: day.date,
      count: dayTotals.chatCopies,
    });
  }

  // Get the start and end dates for both datasets
  const febStartDate =
    febDataMonthly.suggestions.length > 0
      ? febDataMonthly.suggestions[0].date
      : null;
  const febEndDate =
    febDataMonthly.suggestions.length > 0
      ? febDataMonthly.suggestions[febDataMonthly.suggestions.length - 1].date
      : null;
  const marStartDate =
    marDataMonthly.suggestions.length > 0
      ? marDataMonthly.suggestions[0].date
      : null;
  const marEndDate =
    marDataMonthly.suggestions.length > 0
      ? marDataMonthly.suggestions[marDataMonthly.suggestions.length - 1].date
      : null;

  // Format the dates for display
  const formatDate = dateStr => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleString('en-US', { month: 'long', year: 'numeric' });
  };

  const formattedFebStartDate = formatDate(febStartDate);
  const formattedFebEndDate = formatDate(febEndDate);
  const formattedMarStartDate = formatDate(marStartDate);
  const formattedMarEndDate = formatDate(marEndDate);

  return (
    <div>
      <h2>Legacy Copilot Data</h2>
      <p>
        This section visualises the legacy Copilot data for previous revisions
        of the dashboard. For each legacy dataset, the GitHub API endpoints were
        different, so the available metrics vary and may not be directly
        comparable. Each dataset is visualised separately, with the available
        metrics for that dataset shown in the cards and graphs.
      </p>

      <div>
        <h3>
          {formattedMarStartDate} - {formattedMarEndDate}
        </h3>

        <h4>IDE Code Completions</h4>

        <div className="copilot-chat-grid">
          <div className="stat-card" key="mar-code-suggestions">
            <h2>Total Suggestions</h2>
            <p>{formatNumberWithCommas(marDataTotals.suggestions)}</p>
          </div>
          <div className="stat-card" key="mar-code-acceptances">
            <h2>Total Acceptances</h2>
            <p>{formatNumberWithCommas(marDataTotals.acceptances)}</p>
          </div>
          <div className="stat-card" key="mar-acceptance-rate">
            <h2>Acceptance Rate</h2>
            <p>
              {getPercentage(
                marDataTotals.acceptances / marDataTotals.suggestions
              )}
            </p>
          </div>
        </div>
        <div className="copilot-chat-grid">
          <div className="stat-card" key="mar-lines-suggested">
            <h2>Total Lines Suggested</h2>
            <p>{formatNumberWithCommas(marDataTotals.linesSuggested)}</p>
          </div>
          <div className="stat-card" key="mar-lines-accepted">
            <h2>Total Lines Accepted</h2>
            <p>{formatNumberWithCommas(marDataTotals.linesAccepted)}</p>
          </div>
          <div className="stat-card" key="mar-line-acceptance-rate">
            <h2>Line Acceptance Rate</h2>
            <p>
              {getPercentage(
                marDataTotals.linesAccepted / marDataTotals.linesSuggested
              )}
            </p>
          </div>
        </div>

        {/* TODO: Add Graph */}

        <h4>IDE Chats</h4>
        <div className="copilot-chat-grid">
          <div className="stat-card" key="mar-chats">
            <h2>Total Chats</h2>
            <p>{formatNumberWithCommas(marDataTotals.chats)}</p>
          </div>
          <div className="stat-card" key="mar-chat-insertions">
            <h2>Total Chat Insertions</h2>
            <p>{formatNumberWithCommas(marDataTotals.chatInsertions)}</p>
          </div>
          <div className="stat-card" key="mar-chat-copies">
            <h2>Total Chat Copies</h2>
            <p>{formatNumberWithCommas(marDataTotals.chatCopies)}</p>
          </div>
        </div>
        <div className="copilot-chat-grid">
          <div className="stat-card" key="mar-chat-insertion-rate">
            <h2>Chat Insertion Rate</h2>
            <p>
              {getPercentage(
                marDataTotals.chatInsertions / marDataTotals.chats
              )}
            </p>
          </div>
          <div className="stat-card" key="mar-chat-copy-rate">
            <h2>Chat Copy Rate</h2>
            <p>
              {getPercentage(marDataTotals.chatCopies / marDataTotals.chats)}
            </p>
          </div>
        </div>

        {/* TODO: Add Graph */}
      </div>

      <div>
        <h3>
          {formattedFebStartDate} - {formattedFebEndDate}
        </h3>

        <h4>IDE Code Completions</h4>

        <div className="copilot-chat-grid">
          <div className="stat-card" key="feb-code-suggestions">
            <h2>Total Suggestions</h2>
            <p>{formatNumberWithCommas(febDataTotals.suggestions)}</p>
          </div>
          <div className="stat-card" key="feb-code-acceptances">
            <h2>Total Acceptances</h2>
            <p>{formatNumberWithCommas(febDataTotals.acceptances)}</p>
          </div>
          <div className="stat-card" key="feb-acceptance-rate">
            <h2>Acceptance Rate</h2>
            <p>
              {getPercentage(
                febDataTotals.acceptances / febDataTotals.suggestions
              )}
            </p>
          </div>
        </div>
        <div className="copilot-chat-grid">
          <div className="stat-card" key="feb-lines-suggested">
            <h2>Total Lines Suggested</h2>
            <p>{formatNumberWithCommas(febDataTotals.linesSuggested)}</p>
          </div>
          <div className="stat-card" key="feb-lines-accepted">
            <h2>Total Lines Accepted</h2>
            <p>{formatNumberWithCommas(febDataTotals.linesAccepted)}</p>
          </div>
          <div className="stat-card" key="feb-line-acceptance-rate">
            <h2>Line Acceptance Rate</h2>
            <p>
              {getPercentage(
                febDataTotals.linesAccepted / febDataTotals.linesSuggested
              )}
            </p>
          </div>
        </div>

        {/* TODO: Add Graph */}

        <h4>IDE Chats</h4>
        <div className="copilot-chat-grid">
          <div className="stat-card" key="feb-chats">
            <h2>Total Chats</h2>
            <p>{formatNumberWithCommas(febDataTotals.chats)}</p>
          </div>
          <div className="stat-card" key="feb-chat-acceptances">
            <h2>Total Chat Acceptances</h2>
            <p>{formatNumberWithCommas(febDataTotals.chatAcceptances)}</p>
          </div>
          <div className="stat-card" key="feb-chat-acceptance-rate">
            <h2>Chat Acceptance Rate</h2>
            <p>
              {getPercentage(
                febDataTotals.chatAcceptances / febDataTotals.chats
              )}
            </p>
          </div>
        </div>

        {/* TODO: Add Graph */}
      </div>
    </div>
  );
}

export default LegacyDataVisualisation;
