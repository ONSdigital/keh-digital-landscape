import { useState, useEffect, useContext } from 'react';
import { IoInformationCircleOutline } from 'react-icons/io5';
import useCountUp from '../../../hooks/useCountUp';
import Tooltip from '../../Tooltip/Tooltip';
import { useTheme } from '../../../contexts/ThemeContext';
import NewEngagedUsersGraph from '../Breakdowns/NewEngagedUsersGraph';
import ModelIdeUsage from '../Breakdowns/ModelIdeUsage';
import CodeImpactByLanguage from '../Breakdowns/CodeImpactByLanguage';

function Card({ title, numerator, denominator }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const ratio = denominator > 0 ? numerator / denominator : 0;
  const animatedPercentage = useCountUp(ratio * 100);
  const [barWidth, setBarWidth] = useState(0);
  const description = `${numerator} out of ${denominator} active users this month`;

  const barColor =
    title === 'Chat Users'
      ? isDark
        ? '#ff6b00'
        : '#0e58c5'
      : isDark
        ? '#ffad66'
        : '#90b6ef';

  useEffect(() => {
    const rafId = requestAnimationFrame(() => setBarWidth(ratio * 100));
    return () => cancelAnimationFrame(rafId);
  }, [ratio]);

  return (
    <div className="usage-card">
      <h4 className="usage-card-title">{title}</h4>
      <div className="usage-card-body">
        <p className="usage-card-percentage">
          {Math.round(animatedPercentage)}%
        </p>
        <p className="usage-card-description">{description}</p>
      </div>
      <div className="usage-card-bar">
        <div
          className="usage-card-bar-fill"
          style={{
            width: `${barWidth}%`,
            backgroundColor: barColor,
          }}
        />
      </div>
    </div>
  );
}

function GeneralUsageDashboard({ data, isLoading }) {
  const loading = isLoading || !data;

  return (
    <div className="copilot-dashboard">
      <h3>User Adoption</h3>
      <div className="usage-cards-grid">
        {loading ? (
          <>
            <div className="usage-card skeleton" />
            <div className="usage-card skeleton" />
          </>
        ) : (
          <>
            <Card
              title="Chat Users"
              numerator={data.chatUsers.count}
              denominator={data.chatUsers.total}
            />
            <Card
              title="Agent Adoption"
              numerator={data.agentAdoption.count}
              denominator={data.agentAdoption.total}
            />
          </>
        )}
      </div>
      <br></br>
      <h3>
        Engaged Users Overtime
        {!loading && (
          <Tooltip
            title={
              <span className="copilot-tooltip-paragraph">
                Monthly unique active users across all Copilot features. Chat
                Users and Agent Users are subsets of All Active Users.
                <br />
                <br />
                Counts are deduplicated by GitHub within each month.
              </span>
            }
          >
            <span className="info-icon">
              <IoInformationCircleOutline />
            </span>
          </Tooltip>
        )}
      </h3>
      {loading ? (
        <div className="copilot-graph-container skeleton" />
      ) : (
        <NewEngagedUsersGraph data={data.engagedUsersOvertime} />
      )}
      <br></br>
      <h3>
        Model & IDE Usage Amongst Developers
        {!loading && (
          <Tooltip
            title={
              <span className="copilot-tooltip-paragraph">
                Left: share of user-initiated interactions by model.
                <br />
                <br />
                Right: share of user-initiated interactions by development
                environments.
              </span>
            }
          >
            <span className="info-icon">
              <IoInformationCircleOutline />
            </span>
          </Tooltip>
        )}
      </h3>
      {loading ? (
        <div className="usage-pie-charts-grid">
          <div className="usage-pie-chart-card skeleton" />
          <div className="usage-pie-chart-card skeleton" />
        </div>
      ) : (
        <ModelIdeUsage modelData={data.modelUsage} ideData={data.ideUsage} />
      )}
      <br></br>
      <h3>
        Code Impact By Language
        {!loading && (
          <Tooltip
            title={
              <span className="copilot-tooltip-paragraph">
                Share of total lines added and deleted across all Copilot
                features.
              </span>
            }
          >
            <span className="info-icon">
              <IoInformationCircleOutline />
            </span>
          </Tooltip>
        )}
      </h3>
      {loading ? (
        <div className="usage-pie-chart-card skeleton" />
      ) : (
        <CodeImpactByLanguage data={data.codeImpact} />
      )}
    </div>
  );
}

export default GeneralUsageDashboard;
