import React, { useState, useEffect } from 'react';
import { useData } from '../../contexts/dataContext';
import Layout from '../../components/Layout/Layout';
import PageBanner from '../../components/PageBanner/PageBanner';
import PageControls from '../../components/PageControls/PageControls';
import GeneralUsageDashboard from '../../components/Copilot/Dashboards/GeneralUsage';
import { processGeneralUsageData } from '../../utilities/githubCopilot/generalUsageCopilotData/processGeneralUsageCopilotData';
import { filterByYear, getAvailableYears } from '../../utilities/githubCopilot/filterByYear';
import '../../styles/ReviewPage.css';
import '../../styles/Copilot/ReusableStyles.css';
import '../../styles/Copilot/GeneralUsagePage.css';
import '../../styles/components/Statistics.css';

function GeneralUsagePage() {
  const { historicUsageData, getHistoricUsageData } = useData();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedYear, setSelectedYear] = useState('all');

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      await getHistoricUsageData();
      setIsLoading(false);
    })();
  }, []);

  const yearOptions = [
    { label: 'All time', value: 'all' },
    ...getAvailableYears(historicUsageData).map(y => ({ label: y, value: y })),
  ];

  const yearSelect = { value: selectedYear, options: yearOptions };

  const filteredData = filterByYear(historicUsageData, selectedYear);
  const data = filteredData ? processGeneralUsageData(filteredData) : null;

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
            yearSelect={yearSelect}
            onSettingChange={(key, value) => setSelectedYear(value)}
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
