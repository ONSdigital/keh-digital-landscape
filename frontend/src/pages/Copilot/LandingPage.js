import { useNavigate } from 'react-router';
import {
  VscGraphLine,
  VscLightbulbEmpty,
  VscCommentDiscussionSparkle,
} from 'react-icons/vsc';
import { RiRobot2Line } from 'react-icons/ri';
import { BsArchive } from 'react-icons/bs';
import PageBanner from '../../components/PageBanner/PageBanner';
import Layout from '../../components/Layout/Layout';
import '../../styles/Copilot/LandingPage.css';
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
        <div className="copilot-nav-card-stats">{previewStats}</div>
      </div>
      <div className="copilot-nav-card-arrow">
        <RxDoubleArrowRight size={20} />
      </div>
    </div>
  );
}

function CopilotDashboardLandingPage() {
  return (
    <Layout headerProps={{ hideSearch: true }}>
      <PageBanner
        title="GitHub Copilot Usage Dashboard"
        description="Analyse usage statistics organisation-wide and by team"
        tabs={[]}
      />

      <div className="copilot-page">
        <div className="copilot-section">
          <h3 className="copilot-section-title">Summary</h3>
          <div className="copilot-nav-cards">
            <CopilotNavCard
              icon={VscGraphLine}
              title="General Usage"
              href="/copilot/general"
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
            />
            <CopilotNavCard
              icon={VscCommentDiscussionSparkle}
              title="Copilot Chat"
              href="/copilot/chat"
            />
            <CopilotNavCard
              icon={RiRobot2Line}
              title="Agent Mode"
              href="/copilot/agent"
            />
          </div>
        </div>

        <div className="copilot-section">
          <h3 className="copilot-section-title">Other</h3>
          <div className="copilot-nav-cards">
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
