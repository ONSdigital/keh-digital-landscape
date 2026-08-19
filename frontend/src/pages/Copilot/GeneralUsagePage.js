import React, { useState, useEffect } from 'react';
import { useData } from '../../contexts/dataContext';
import Layout from '../../components/Layout/Layout';
import PageBanner from '../../components/PageBanner/PageBanner';
import PageControls from '../../components/PageControls/PageControls';
import GeneralUsageDashboard from '../../components/Copilot/Dashboards/GeneralUsage';
import { processGeneralUsageData } from '../../utilities/githubCopilot/generalUsageCopilotData/processGeneralUsageCopilotData';
import '../../styles/ReviewPage.css';
import '../../styles/Copilot/ReusableStyles.css';
import '../../styles/Copilot/GeneralUsagePage.css';
import '../../styles/components/Statistics.css';

function GeneralUsagePage() {
  const { historicUsageData, getHistoricUsageData } = useData();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      await getHistoricUsageData();
      setIsLoading(false);
    })();
  }, []);

  const data = historicUsageData
    ? processGeneralUsageData(historicUsageData)
    : null;

  return (
    <Layout headerProps={{ hideSearch: true }}>
      <div className="admin-page">
        <PageBanner
          title="GitHub Copilot Usage Dashboard"
          description="Analyse Copilot usage statistics organisation-wide"
          tabs={[]}
        />
        <div className="admin-container">
          <PageControls
            previousPage="/copilot/home"
            backAriaLabel="Back to Copilot Dashboard Homepage"
          />
          <GeneralUsageDashboard
            data={
              data
                ? {
                    chatUsers: data.userAdoption.chatUsers,
                    agentAdoption: data.userAdoption.agentAdoption,
                    engagedUsersOvertime: data.engagedUsersOvertime,
                    modelUsage: data.modelUsage,
                    ideUsage: data.ideUsage,
                    codeImpact: data.codeImpact,
                  }
                : null
            }
            isLoading={isLoading}
          />
        </div>
      </div>
    </Layout>
  );
}

export default GeneralUsagePage;
