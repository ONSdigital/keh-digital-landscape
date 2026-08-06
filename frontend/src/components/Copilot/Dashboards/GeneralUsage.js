import { useState, useEffect, useContext } from 'react';
import { IoInformationCircleOutline } from 'react-icons/io5';
import useCountUp from '../../../hooks/useCountUp';
import { COPILOT_CHART_PALETTE } from '../../../constants/copilotConstants';
import Tooltip from '../../Tooltip/Tooltip';
import { useTheme } from '../../../contexts/ThemeContext';
import NewEngagedUsersGraph from '../Breakdowns/NewEngagedUsersGraph';
import ModelIdeUsagePieChart from '../Breakdowns/ModelIdeUsagePieChart';
import CodeImpactByLanguagePieChart from '../Breakdowns/CodeImpactByLanguagePieChart';
import PercentageCard from '../Breakdowns/PercentageCard';

function GeneralUsageDashboard({ data, isLoading }) {
  const loading = isLoading || !data;

  return (
    <div className="copilot-dashboard">
      <div className="copilot-dashboard-section">
        <h3>User Adoption</h3>
        <div className="usage-cards-grid">
          {loading ? (
            <>
              <div className="usage-card skeleton" />
              <div className="usage-card skeleton" />
            </>
          ) : (
            <>
              <PercentageCard
                title="Chat Mode Adoption"
                numerator={data.chatUsers.count}
                denominator={data.chatUsers.total}
                paletteIndex={1}
              />
              <PercentageCard
                title="Agent Mode Adoption"
                numerator={data.agentAdoption.count}
                denominator={data.agentAdoption.total}
                paletteIndex={2}
              />
            </>
          )}
        </div>
      </div>
      <div className="copilot-dashboard-section">
        <h3>
          Engaged Users Overtime
          {!loading && (
            <Tooltip
              title={
                <p className="copilot-tooltip-paragraph">
                  Monthly unique active users across all Copilot features. Chat
                  Users and Agent Users are subsets of All Active Users.
                  <br />
                  <br />
                  Counts are deduplicated by GitHub within each month.
                </p>
              }
            >
              <button
                type="button"
                className="info-icon info-icon-button"
                aria-label="About engaged users over time"
              >
                <IoInformationCircleOutline />
              </button>
            </Tooltip>
          )}
        </h3>
        {loading ? (
          <div className="copilot-graph-container skeleton" />
        ) : (
          <NewEngagedUsersGraph data={data.engagedUsersOvertime} />
        )}
      </div>
      <div className="copilot-dashboard-section">
        <h3>Model & IDE Usage Amongst Developers</h3>
        {loading ? (
          <div className="usage-pie-charts-grid">
            <div className="usage-pie-chart-card skeleton" />
            <div className="usage-pie-chart-card skeleton" />
          </div>
        ) : (
          <ModelIdeUsagePieChart
            modelData={data.modelUsage}
            ideData={data.ideUsage}
          />
        )}
      </div>
      <div className="copilot-dashboard-section-bottom">
        <h3>
          Code Impact By Language
          {!loading && (
            <Tooltip
              title={
                <p className="copilot-tooltip-paragraph">
                  Share of total lines added and deleted across all Copilot
                  features.
                </p>
              }
            >
              <button
                type="button"
                className="info-icon info-icon-button"
                aria-label="About code impact by language"
              >
                <IoInformationCircleOutline />
              </button>
            </Tooltip>
          )}
        </h3>
        {loading ? (
          <div className="usage-pie-chart-card skeleton" />
        ) : (
          <CodeImpactByLanguagePieChart data={data.codeImpact} />
        )}
      </div>
    </div>
  );
}

export default GeneralUsageDashboard;
