import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import Layout from '../../components/Layout/Layout';
import PageBanner from '../../components/PageBanner/PageBanner';
import PageControls from '../../components/PageControls/PageControls';
import GeneralUsageDashboard from '../../components/Copilot/Dashboards/GeneralUsage';
import { processGeneralUsageData } from '../../utilities/generalUsageCopilotData/processGeneralUsageCopilotData';
import { getOrgHistoryData } from '../../utilities/getOrgHistoryData';
import '../../styles/ReviewPage.css';
import '../../styles/Copilot/ReusableStyles.css';
import '../../styles/Copilot/GeneralUsagePage.css';
import '../../styles/components/Statistics.css';

function GeneralUsagePage() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      const rawData = await getOrgHistoryData();
      if (rawData) {
        setData(processGeneralUsageData(rawData));
      }
      setIsLoading(false);
    })();
  }, []);

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
