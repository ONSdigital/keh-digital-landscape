import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { useData } from '../../contexts/dataContext';
import Layout from '../../components/Layout/Layout';
import PageBanner from '../../components/PageBanner/PageBanner';
import PageControls from '../../components/PageControls/PageControls';
import CodeCompletionsDashboard from '../../components/Copilot/Dashboards/CodeCompletionsDashboard';
import { processCodeCompletionData } from '../../utilities/codeCompletionCopilotData/processCodeCompletionData';
import '../../styles/ReviewPage.css';
import '../../styles/Copilot/ReusableStyles.css';
import '../../styles/Copilot/CodeCompletionsPage.css';
import '../../styles/components/Statistics.css';

function CodeCompletionsPage() {
  const { historicUsageData, getHistoricUsageData } = useData();
  const [isLoading, setIsLoading] = useState(false);
  const [chartDisplaySettings, setChartDisplaySettings] = useState({
    includeWeekendUsage: true,
    locUsage: false,
  });

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      await getHistoricUsageData();
      setIsLoading(false);
    })();
  }, []);

  const settings = [
    {
      key: 'includeWeekendUsage',
      label: 'Include weekend usage',
      checked: chartDisplaySettings.includeWeekendUsage,
    },
    {
      key: 'locUsage',
      label: 'Include LoC usage',
      checked: chartDisplaySettings.locUsage,
    },
  ];

  const handleSettingChange = (key, checked) => {
    setChartDisplaySettings(prev => ({ ...prev, [key]: checked }));
  };

  const processedData = historicUsageData
    ? processCodeCompletionData(historicUsageData, {
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
          onSettingChange={handleSettingChange}
        />
        <CodeCompletionsDashboard
          data={processedData}
          isLoading={isLoading}
          chartDisplaySettings={chartDisplaySettings}
        />
      </div>
    </Layout>
  );
}

export default CodeCompletionsPage;
