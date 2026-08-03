import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useData } from '../../contexts/dataContext';
import Layout from '../../components/Layout/Layout';
import PageBanner from '../../components/PageBanner/PageBanner';
import PageControls from '../../components/PageControls/PageControls';
import LegacyDataVisualisation from '../../components/Copilot/Dashboards/LegacyData';
import '../../styles/ReviewPage.css';
import '../../styles/Copilot/ReusableStyles.css';
import '../../styles/components/Statistics.css';

function LegacyUsagePage() {
  const { legacyCopilotData, getLegacyUsageData } = useData();
  const [isLegacyLoading, setIsLegacyLoading] = useState(false);

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
          <PageControls
            previousPage="/copilot/home"
            backAriaLabel="Back to Copilot Dashboard Homepage"
          />
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
