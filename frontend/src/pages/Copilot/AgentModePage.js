import { useEffect, useState } from 'react';
import { useData } from '../../contexts/dataContext';
import Layout from '../../components/Layout/Layout';
import PageBanner from '../../components/PageBanner/PageBanner';
import PageControls from '../../components/PageControls/PageControls';
import AgentModeDashboard from '../../components/Copilot/Dashboards/AgentModeDashboard';
import { processAgentModeData } from '../../utilities/agentModeData/processAgentModeData';
import '../../styles/ReviewPage.css';
import '../../styles/Copilot/ReusableStyles.css';
import '../../styles/components/Statistics.css';

function AgentModePage() {
  const { historicUsageData, getHistoricUsageData } = useData();
  const [isLoading, setIsLoading] = useState(false);
  const [chartDisplaySettings, setChartDisplaySettings] = useState({
    includeWeekendUsage: true,
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
  ];

  const handleSettingChange = (key, checked) => {
    setChartDisplaySettings(prev => ({ ...prev, [key]: checked }));
  };

  const processedData = historicUsageData
    ? processAgentModeData(historicUsageData, {
        includeWeekendUsage: chartDisplaySettings.includeWeekendUsage,
      })
    : null;

  return (
    <Layout headerProps={{ hideSearch: true }}>
      <PageBanner
        title="GitHub Copilot Usage Dashboard"
        description="Analyse Copilot Agent Edit usage organisation-wide"
        tabs={[]}
      />
      <div className="admin-container">
        <PageControls
          previousPage="/copilot/home"
          backAriaLabel="Back to Copilot Dashboard Homepage"
          settings={settings}
          onSettingChange={handleSettingChange}
        />
        <AgentModeDashboard
          data={processedData}
          isLoading={isLoading}
          chartDisplaySettings={chartDisplaySettings}
        />
      </div>
    </Layout>
  );
}

export default AgentModePage;
