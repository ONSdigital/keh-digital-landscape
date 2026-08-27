import { useNavigate } from 'react-router';
import { useEffect, useMemo } from 'react';
import {
  VscGraphLine,
  VscLightbulbEmpty,
  VscCommentDiscussionSparkle,
} from 'react-icons/vsc';
import { RiRobot2Line } from 'react-icons/ri';
import { BsArchive } from 'react-icons/bs';
import PageBanner from '../../components/PageBanner/PageBanner';
import Layout from '../../components/Layout/Layout';
import { useData } from '../../contexts/dataContext';
import { processPreviewCopilotData } from '../../utilities/githubCopilot/previewCopilotData/processPreviewCopilotData';
import '../../styles/Copilot/LandingPage.css';
import '../../styles/Copilot/ReusableStyles.css';
import '../../styles/ReviewPage.css';
import { RxDoubleArrowRight } from 'react-icons/rx';

function CopilotNavCard({ icon: Icon, title, previewStats, href }) {
  const navigate = useNavigate();

  return (
    <div
      className="copilot-nav-card"
      onClick={() => href && navigate(href)}
      tabIndex={0}
      role="button"
      aria-label={`Navigate to ${title}`}
    >
      <div className="copilot-nav-card-body">
        <div className="copilot-nav-card-title">
          <Icon />
          <p>{title}</p>
        </div>
        {previewStats && (
          <div className="copilot-nav-card-preview-stats">
            <p>
              {previewStats.label}:{' '}
              <span
                className={`copilot-preview-value ${
                  previewStats.increased
                    ? 'copilot-preview-up'
                    : 'copilot-preview-down'
                }`}
              >
                {previewStats.value?.toLocaleString()}{' '}
                {previewStats.increased ? '▲' : '▼'}
              </span>
            </p>
          </div>
        )}
      </div>
      <div className="copilot-nav-card-arrow">
        <RxDoubleArrowRight size={20} />
      </div>
    </div>
  );
}

function CopilotDashboardLandingPage() {
  const { historicUsageData, getHistoricUsageData } = useData();

  useEffect(() => {
    (async () => {
      await getHistoricUsageData();
    })();
  }, []);

  const data = historicUsageData
    ? processPreviewCopilotData(historicUsageData)
    : null;

  console.log('Processed Preview Copilot Data:', data);

  return (
    <Layout headerProps={{ hideSearch: true }}>
      <PageBanner
        title="GitHub Copilot Usage Dashboard"
        description="Analyse Copilot usage statistics organisation-wide"
        tabs={[]}
      />

      <div className="copilot-page">
        <div className="copilot-section">
          <p className="disclaimer-banner">
            Preview statistics show totals for the current calendar month to
            date, compared to the same period last month.
          </p>
          <h3 className="copilot-section-title">Summary</h3>
          <div className="copilot-nav-cards">
            <CopilotNavCard
              icon={VscGraphLine}
              title="General Usage"
              href="/copilot/general"
              previewStats={
                data
                  ? { label: 'Engaged Users (MTD)', ...data.engagedUsers }
                  : null
              }
            />
          </div>
        </div>

        <div className="copilot-section">
          <h3 className="copilot-section-title">Explore Usage by Feature</h3>
          <div className="copilot-nav-cards">
            <CopilotNavCard
              icon={VscLightbulbEmpty}
              title="IDE Code Completions"
              href="/copilot/completions"
              previewStats={
                data
                  ? { label: 'Lines Accepted (MTD)', ...data.linesAccepted }
                  : null
              }
            />
            <CopilotNavCard
              icon={VscCommentDiscussionSparkle}
              title="Copilot Chat"
              href="/copilot/chat"
              previewStats={
                data ? { label: 'Total Chats (MTD)', ...data.totalChats } : null
              }
            />
          </div>
        </div>

        <div className="copilot-section">
          <h3 className="copilot-section-title">Other</h3>
          <div className="copilot-nav-cards">
            <CopilotNavCard
              icon={RiRobot2Line}
              title="Direct Edits"
              href="/copilot/agent"
              previewStats={
                data
                  ? { label: 'Lines Added (MTD)', ...data.agentLinesAdded }
                  : null
              }
            />
            <CopilotNavCard
              icon={BsArchive}
              title="Legacy Usage"
              href="/copilot/legacy"
            />
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default CopilotDashboardLandingPage;
