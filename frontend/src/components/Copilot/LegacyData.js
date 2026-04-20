import AcceptanceGraph from './Breakdowns/AcceptanceGraph';
import { formatNumberWithCommas } from '../../utilities/getCommaSeparated';
import { getPercentage } from '../../utilities/getPercentage';
import {
  ComposedChart,
  Line,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

function LegacyDataVisualisation({ data, isLoading }) {
  if (isLoading) {
    return (
      <div>
        <h2>Legacy Copilot Data</h2>
        <p>Loading...</p>
      </div>
    );
  }

  // Process user metrics for Feb 25 and Mar 26 datasets
  // Note: the separation of users in the Feb dataset is not as clear as in the Mar dataset. Because of this, we will keep the Feb and Mar datasets separate.

  const userMetricsFeb = {
    totalUsers: [],
    completionUsers: [],
    chatUsers: [],
  };

  for (const index in data?.feb25 || {}) {
    const day = data.feb25[index];
    userMetricsFeb.totalUsers.push({
      date: day.day,
      count: (day.total_active_users || 0) + (day.total_active_chat_users || 0),
    });
    userMetricsFeb.completionUsers.push({
      date: day.day,
      count: day.total_active_users || 0,
    });
    userMetricsFeb.chatUsers.push({
      date: day.day,
      count: day.total_active_chat_users || 0,
    });
  }

  const userMetricsMar = {
    totalUsers: [],
    completionUsers: [],
    chatUsers: [],
  };

  for (const index in data?.mar26 || {}) {
    const day = data.mar26[index];
    userMetricsMar.totalUsers.push({
      date: day.date,
      count: day.total_active_users || 0,
    });
    userMetricsMar.completionUsers.push({
      date: day.date,
      count: day.copilot_ide_code_completions?.total_engaged_users || 0,
    });
    userMetricsMar.chatUsers.push({
      date: day.date,
      count: day.copilot_ide_chat?.total_engaged_users || 0,
    });
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

  // Prepare graph data with acceptance rates for Mar dataset
  const marCompletionGraphData = marDataMonthly.suggestions.map(
    (item, index) => ({
      date: item.date,
      suggestions: item.count,
      acceptances: marDataMonthly.acceptances[index]
        ? marDataMonthly.acceptances[index].count
        : 0,
      acceptanceRate:
        (item.count
          ? marDataMonthly.acceptances[index]
            ? marDataMonthly.acceptances[index].count / item.count
            : 0
          : 0) * 100,
    })
  );

  // Prepare graph data with insertion and copy rates for Mar chats
  const marChatGraphData = marDataMonthly.chats.map((item, index) => {
    const chatInsertions = marDataMonthly.chatInsertions[index]
      ? marDataMonthly.chatInsertions[index].count
      : 0;
    const chatCopies = marDataMonthly.chatCopies[index]
      ? marDataMonthly.chatCopies[index].count
      : 0;

    return {
      date: item.date,
      chats: item.count,
      chatInsertions,
      chatCopies,
      chatInsertionRate: item.count ? (chatInsertions / item.count) * 100 : 0,
      chatCopyRate: item.count ? (chatCopies / item.count) * 100 : 0,
    };
  });

  // Prepare graph data with acceptance rates for Feb dataset
  const febCompletionGraphData = febDataMonthly.suggestions.map(
    (item, index) => ({
      date: item.date,
      suggestions: item.count,
      acceptances: febDataMonthly.acceptances[index]
        ? febDataMonthly.acceptances[index].count
        : 0,
      acceptanceRate:
        (item.count
          ? febDataMonthly.acceptances[index]
            ? febDataMonthly.acceptances[index].count / item.count
            : 0
          : 0) * 100,
    })
  );

  // Prepare graph data with acceptance rates for Feb chats
  const febChatGraphData = febDataMonthly.chats.map((item, index) => {
    const chatAcceptances = febDataMonthly.chatAcceptances[index]
      ? febDataMonthly.chatAcceptances[index].count
      : 0;

    return {
      date: item.date,
      chats: item.count,
      chatAcceptances,
      chatAcceptanceRate: item.count ? (chatAcceptances / item.count) * 100 : 0,
    };
  });

  // Prepare user metrics graph data for Mar and Feb datasets
  const marUserMetricsGraphData = userMetricsMar.totalUsers.map(
    (item, index) => ({
      date: item.date,
      totalUsers: item.count,
      completionUsers: userMetricsMar.completionUsers[index]
        ? userMetricsMar.completionUsers[index].count
        : 0,
      chatUsers: userMetricsMar.chatUsers[index]
        ? userMetricsMar.chatUsers[index].count
        : 0,
    })
  );

  const febUserMetricsGraphData = userMetricsFeb.totalUsers.map(
    (item, index) => ({
      date: item.date,
      totalUsers: item.count,
      completionUsers: userMetricsFeb.completionUsers[index]
        ? userMetricsFeb.completionUsers[index].count
        : 0,
      chatUsers: userMetricsFeb.chatUsers[index]
        ? userMetricsFeb.chatUsers[index].count
        : 0,
    })
  );

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

        <AcceptanceGraph data={marCompletionGraphData} />

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
      </div>

      <div className="copilot-graph-container copilot-graph-container--stacked">
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart
            width={400}
            height={300}
            data={marChatGraphData}
            margin={{ top: 0, right: 64, left: 0, bottom: 0 }}
          >
            <CartesianGrid stroke="#f5f5f5" vertical={false} />
            <XAxis
              dataKey="date"
              interval={marChatGraphData.length - 2}
              tickLine={false}
              axisLine={{ stroke: '#f5f5f5' }}
            />
            <Legend verticalAlign="top" align="left" height={36} />
            <Bar
              radius={[10, 10, 0, 0]}
              dataKey="chats"
              barSize={20}
              fill="#70c4e6"
              yAxisId="left"
              legendType="rect"
              name="Chats"
            />
            <Line
              dot={false}
              strokeWidth={2}
              strokeLinecap="round"
              type="monotone"
              dataKey="chatInsertionRate"
              stroke="#3B7AD9"
              yAxisId="right"
              legendType="rect"
              name="Insertion Rate"
            />
            <Line
              dot={false}
              strokeWidth={2}
              strokeLinecap="round"
              type="monotone"
              dataKey="chatCopyRate"
              stroke="#0f766e"
              yAxisId="right"
              legendType="rect"
              name="Copy Rate"
            />
            <YAxis
              tickLine={false}
              yAxisId="left"
              axisLine={{ stroke: '#f5f5f5' }}
              domain={[0, 'dataMax + 5']}
              tickCount={5}
              tickFormatter={value => formatNumberWithCommas(value)}
            />
            <YAxis
              tickLine={false}
              yAxisId="right"
              orientation="right"
              axisLine={{ stroke: '#f5f5f5' }}
              domain={[0, dataMax => Math.ceil(dataMax / 10) * 10]}
              tickFormatter={value => `${value.toFixed(0)}%`}
              tickCount={5}
            />
            <Tooltip
              wrapperStyle={{ color: 'black' }}
              formatter={(value, name) =>
                name === 'Chats'
                  ? formatNumberWithCommas(value)
                  : `${value.toFixed(2)}%`
              }
            />
          </ComposedChart>
        </ResponsiveContainer>

        <h4>User Metrics</h4>

        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart
            width={400}
            height={300}
            data={marUserMetricsGraphData}
            margin={{ top: 0, right: 64, left: 0, bottom: 0 }}
          >
            <CartesianGrid stroke="#f5f5f5" vertical={false} />
            <XAxis
              dataKey="date"
              interval={marUserMetricsGraphData.length - 2}
              tickLine={false}
              axisLine={{ stroke: '#f5f5f5' }}
            />
            <Legend verticalAlign="top" align="left" height={36} />
            <Bar
              radius={[10, 10, 0, 0]}
              dataKey="totalUsers"
              barSize={20}
              fill="#70c4e6"
              yAxisId="left"
              legendType="rect"
              name="Total Users"
            />
            <Line
              dot={false}
              strokeWidth={2}
              strokeLinecap="round"
              type="monotone"
              dataKey="completionUsers"
              stroke="#3B7AD9"
              yAxisId="left"
              legendType="rect"
              name="Completion Users"
            />
            <Line
              dot={false}
              strokeWidth={2}
              strokeLinecap="round"
              type="monotone"
              dataKey="chatUsers"
              stroke="#0f766e"
              yAxisId="left"
              legendType="rect"
              name="Chat Users"
            />
            <YAxis
              tickLine={false}
              yAxisId="left"
              axisLine={{ stroke: '#f5f5f5' }}
              domain={[0, 'dataMax + 5']}
              tickCount={5}
              tickFormatter={value => formatNumberWithCommas(value)}
            />
            <Tooltip
              wrapperStyle={{ color: 'black' }}
              formatter={value => formatNumberWithCommas(value)}
            />
          </ComposedChart>
        </ResponsiveContainer>

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

        <AcceptanceGraph data={febCompletionGraphData} />

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

        <div className="copilot-graph-container copilot-graph-container--stacked">
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart
              width={400}
              height={300}
              data={febChatGraphData}
              margin={{ top: 0, right: 64, left: 0, bottom: 0 }}
            >
              <CartesianGrid stroke="#f5f5f5" vertical={false} />
              <XAxis
                dataKey="date"
                interval={febChatGraphData.length - 2}
                tickLine={false}
                axisLine={{ stroke: '#f5f5f5' }}
              />
              <Legend verticalAlign="top" align="left" height={36} />
              <Bar
                radius={[10, 10, 0, 0]}
                dataKey="chats"
                barSize={20}
                fill="#70c4e6"
                yAxisId="left"
                legendType="rect"
                name="Chats"
              />
              <Line
                dot={false}
                strokeWidth={2}
                strokeLinecap="round"
                type="monotone"
                dataKey="chatAcceptanceRate"
                stroke="#3B7AD9"
                yAxisId="right"
                legendType="rect"
                name="Acceptance Rate"
              />
              <YAxis
                tickLine={false}
                yAxisId="left"
                axisLine={{ stroke: '#f5f5f5' }}
                domain={[0, 'dataMax + 5']}
                tickCount={5}
                tickFormatter={value => formatNumberWithCommas(value)}
              />
              <YAxis
                tickLine={false}
                yAxisId="right"
                orientation="right"
                axisLine={{ stroke: '#f5f5f5' }}
                domain={[0, dataMax => Math.ceil(dataMax / 10) * 10]}
                tickFormatter={value => `${value.toFixed(0)}%`}
                tickCount={5}
              />
              <Tooltip
                wrapperStyle={{ color: 'black' }}
                formatter={(value, name) =>
                  name === 'Chats'
                    ? formatNumberWithCommas(value)
                    : `${value.toFixed(2)}%`
                }
              />
            </ComposedChart>
          </ResponsiveContainer>

          <h4>User Metrics</h4>

          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart
              width={400}
              height={300}
              data={febUserMetricsGraphData}
              margin={{ top: 0, right: 64, left: 0, bottom: 0 }}
            >
              <CartesianGrid stroke="#f5f5f5" vertical={false} />
              <XAxis
                dataKey="date"
                interval={febUserMetricsGraphData.length - 2}
                tickLine={false}
                axisLine={{ stroke: '#f5f5f5' }}
              />
              <Legend verticalAlign="top" align="left" height={36} />
              <Bar
                radius={[10, 10, 0, 0]}
                dataKey="totalUsers"
                barSize={20}
                fill="#70c4e6"
                yAxisId="left"
                legendType="rect"
                name="Total Users"
              />
              <Line
                dot={false}
                strokeWidth={2}
                strokeLinecap="round"
                type="monotone"
                dataKey="completionUsers"
                stroke="#3B7AD9"
                yAxisId="left"
                legendType="rect"
                name="Completion Users"
              />
              <Line
                dot={false}
                strokeWidth={2}
                strokeLinecap="round"
                type="monotone"
                dataKey="chatUsers"
                stroke="#0f766e"
                yAxisId="left"
                legendType="rect"
                name="Chat Users"
              />
              <YAxis
                tickLine={false}
                yAxisId="left"
                axisLine={{ stroke: '#f5f5f5' }}
                domain={[0, 'dataMax + 5']}
                tickCount={5}
                tickFormatter={value => formatNumberWithCommas(value)}
              />
              <Tooltip
                wrapperStyle={{ color: 'black' }}
                formatter={value => formatNumberWithCommas(value)}
              />
            </ComposedChart>
          </ResponsiveContainer>

        </div>
      </div>
    </div>
  );
}

export default LegacyDataVisualisation;
