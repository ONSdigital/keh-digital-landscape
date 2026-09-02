import { useEffect, useState } from 'react';
import { useData } from '../../contexts/dataContext';
import Layout from '../../components/Layout/Layout';
import PageBanner from '../../components/PageBanner/PageBanner';
import PageControls from '../../components/PageControls/PageControls';
import DirectEditsDashboard from '../../components/Copilot/Dashboards/DirectEditsDashboard';
import { processDirectEditsCopilotData } from '../../utilities/githubCopilot/directEditsData/processDirectEditsCopilotData';
import {
  filterByYear,
  getAvailableYears,
} from '../../utilities/githubCopilot/filterByYear';
import '../../styles/ReviewPage.css';
import '../../styles/Copilot/ReusableStyles.css';
import '../../styles/components/Statistics.css';

function DirectEditsPage() {
  const { historicUsageData, getHistoricUsageData } = useData();
  const [isLoading, setIsLoading] = useState(false);
  const [chartDisplaySettings, setChartDisplaySettings] = useState({
    includeWeekendUsage: true,
    selectedYear: 'all',
  });

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

  const yearSelect = {
    value: chartDisplaySettings.selectedYear,
    options: yearOptions,
  };

  const settings = [
    {
      key: 'includeWeekendUsage',
      label: 'Include weekend usage',
      checked: chartDisplaySettings.includeWeekendUsage,
    },
  ];

  const handleSettingChange = (key, value) => {
    setChartDisplaySettings(prev => ({ ...prev, [key]: value }));
  };

  const filteredData = filterByYear(
    historicUsageData,
    chartDisplaySettings.selectedYear
  );
  const processedData = filteredData
    ? processDirectEditsCopilotData(filteredData, {
        includeWeekendUsage: chartDisplaySettings.includeWeekendUsage,
      })
    : null;

  return (
    <Layout headerProps={{ hideSearch: true }}>
      <PageBanner
        title="GitHub Copilot Usage Dashboard"
        description="Analyse Copilot usage statistics organisation-wide"
        tabs={[]}
      />
      <div className="admin-container">
        <PageControls
          previousPage="/copilot/home"
          backAriaLabel="Back to Copilot Dashboard Homepage"
          settings={settings}
          yearSelect={yearSelect}
          onSettingChange={handleSettingChange}
        />
        <DirectEditsDashboard
          data={processedData}
          isLoading={isLoading}
          chartDisplaySettings={chartDisplaySettings}
        />
      </div>
    </Layout>
  );
}

export default DirectEditsPage;
