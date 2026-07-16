import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../contexts/dataContext';
import Layout from '../../components/Layout/Layout';
import PageBanner from '../../components/PageBanner/PageBanner';
import LegacyDataVisualisation from '../../components/Copilot/Dashboards/LegacyData';
import '../../styles/ReviewPage.css';
import '../../styles/Copilot/ReusableStyles.css';
import '../../styles/components/Statistics.css';
import { MdOutlineArrowBackIosNew } from 'react-icons/md';

function LegacyUsagePage() {
  const { legacyCopilotData, getLegacyUsageData } = useData();
  const [isLegacyLoading, setIsLegacyLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      setIsLegacyLoading(true);
      await getLegacyUsageData();
      setIsLegacyLoading(false);
    })();
  }, []);

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
          <LegacyDataVisualisation
            data={legacyCopilotData}
            isLoading={isLegacyLoading}
          />
        </div>
      </div>
    </Layout>
  );
}

export default LegacyUsagePage;
