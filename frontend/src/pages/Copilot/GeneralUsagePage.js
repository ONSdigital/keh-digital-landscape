import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout/Layout';
import PageBanner from '../../components/PageBanner/PageBanner';
import GeneralUsageDashboard from '../../components/Copilot/Dashboards/GeneralUsage';
import '../../styles/ReviewPage.css';
import '../../styles/Copilot/ReusableStyles.css';
import '../../styles/Copilot/GeneralUsagePage.css';
import '../../styles/components/Statistics.css';
import { MdOutlineArrowBackIosNew } from 'react-icons/md';

function GeneralUsagePage() {
  const navigate = useNavigate();

  return (
    <Layout headerProps={{ hideSearch: true }}>
      <div className="admin-page">
        <PageBanner
          title="GitHub Copilot Usage Dashboard"
          description="Analyse Copilot usage statistics organisation-wide and by team"
          tabs={[]}
        />
        <div className="admin-container">
          <button
            className="copilot-back-button"
            onClick={() => navigate('/copilot/home')}
            aria-label="Back to Copilot Dashboard Homepage"
          >
            <MdOutlineArrowBackIosNew size={12} />
            <span id="text">Back</span>
          </button>
          <GeneralUsageDashboard
            data={{
              chatUsers: { count: 177, total: 203 },
              agentAdoption: { count: 162, total: 203 },
            }}
            isLoading={false}
          />
        </div>
      </div>
    </Layout>
  );
}

export default GeneralUsagePage;