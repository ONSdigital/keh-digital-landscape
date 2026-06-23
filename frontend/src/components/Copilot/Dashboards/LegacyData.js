import {
  processFebruaryCopilotData,
  processMarchCopilotData,
  prepareCompletionGraphData,
  prepareFebruaryChatGraphData,
  prepareMarchChatGraphData,
  prepareUserMetricsGraphData,
} from '../../../utilities/legacyCopilotData/processLegacyCopilotData';
import AcceptanceGraph from '../Breakdowns/AcceptanceGraph';
import { formatNumberWithCommas } from '../../../utilities/getCommaSeparated';
import { getPercentage } from '../../../utilities/getPercentage';
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
import SkeletonStatCard from '../../Statistics/Skeletons/SkeletonStatCard';

function LegacyDataVisualisation({ data, isLoading }) {
  if (isLoading) {
    return (
      <div>
        <h2>Legacy Copilot Data</h2>
        <p>
          This section visualises the legacy Copilot data for previous revisions
          of the dashboard. For each legacy dataset, the GitHub API endpoints
          were different, so the available metrics vary and may not be directly
          comparable. Each dataset is visualised separately, with the available
          metrics for that dataset shown in the cards and graphs.
        </p>

        <div>
          <h3>January 2025 - March 2026</h3>

          <h4>IDE Code Completions</h4>

          <div className="copilot-chat-grid">
            <SkeletonStatCard />
            <SkeletonStatCard />
            <SkeletonStatCard />
          </div>
          <div className="copilot-chat-grid">
            <SkeletonStatCard />
            <SkeletonStatCard />
            <SkeletonStatCard />
          </div>

          <div
            className="skeleton"
            style={{ height: 300, borderRadius: 8, marginBottom: 16 }}
          />

          <h4>IDE Chats</h4>
          <div className="copilot-chat-grid">
            <SkeletonStatCard />
            <SkeletonStatCard />
            <SkeletonStatCard />
          </div>
          <div className="copilot-chat-grid">
            <SkeletonStatCard />
            <SkeletonStatCard />
          </div>
        </div>

        <div className="copilot-graph-container copilot-graph-container--stacked">
          <div
            className="skeleton"
            style={{ height: 300, borderRadius: 8, marginBottom: 16 }}
          />

          <h4>User Metrics</h4>

          <div className="skeleton" style={{ height: 300, borderRadius: 8 }} />
        </div>

        <div>
          <h3>May 2024 - January 2025</h3>

          <h4>IDE Code Completions</h4>

          <div className="copilot-chat-grid">
            <SkeletonStatCard />
            <SkeletonStatCard />
            <SkeletonStatCard />
          </div>
          <div className="copilot-chat-grid">
            <SkeletonStatCard />
            <SkeletonStatCard />
            <SkeletonStatCard />
          </div>

          <div
            className="skeleton"
            style={{ height: 300, borderRadius: 8, marginBottom: 16 }}
          />

          <h4>IDE Chats</h4>
          <div className="copilot-chat-grid">
            <SkeletonStatCard />
            <SkeletonStatCard />
            <SkeletonStatCard />
          </div>

          <div className="copilot-graph-container copilot-graph-container--stacked">
            <div
              className="skeleton"
              style={{ height: 300, borderRadius: 8, marginBottom: 16 }}
            />

            <h4>User Metrics</h4>

            <div
              className="skeleton"
              style={{ height: 300, borderRadius: 8 }}
            />
          </div>
        </div>
      </div>
    );
  }

  // Process Feb 25 Data
  const preFeb25Data = data?.feb25 || {};
  const febData = processFebruaryCopilotData(preFeb25Data);

  // Process Mar 26 Data
  const preMar26Data = data?.mar26 || {};
  const marData = processMarchCopilotData(preMar26Data);

  // Prepare data for Feb and Mar datasets
  const {
    totals: febDataTotals,
    monthly: febDataMonthly,
    users: userMetricsFeb,
  } = febData;

  const {
    totals: marDataTotals,
    monthly: marDataMonthly,
    users: userMetricsMar,
  } = marData;

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

  // Prepare graph data for Feb and Mar datasets

  // Completion Data
  const febCompletionGraphData = prepareCompletionGraphData(febDataMonthly);
  const marCompletionGraphData = prepareCompletionGraphData(marDataMonthly);

  // Chat Data
  const febChatGraphData = prepareFebruaryChatGraphData(febDataMonthly);
  const marChatGraphData = prepareMarchChatGraphData(marDataMonthly);

  // User Metrics Data
  const febUserMetricsGraphData = prepareUserMetricsGraphData(userMetricsFeb);
  const marUserMetricsGraphData = prepareUserMetricsGraphData(userMetricsMar);

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

      <div data-testid="mar-dataset">
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
      </div>

      <div data-testid="feb-dataset">
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
