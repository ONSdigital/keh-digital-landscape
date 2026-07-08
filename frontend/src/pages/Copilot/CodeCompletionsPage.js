<<<<<<< HEAD
import { useEffect, useRef, useState } from 'react';
=======
import { useEffect, useState } from 'react';
>>>>>>> c8b9628 (feat: added the new page and linked it to the landing page)
import { useNavigate } from 'react-router-dom';
import { useData } from '../../contexts/dataContext';
import Layout from '../../components/Layout/Layout';
import PageBanner from '../../components/PageBanner/PageBanner';
<<<<<<< HEAD
import CodeCompletionsDashboard from '../../components/Copilot/Dashboards/CodeCompletionsDashboard';
import { processCodeCompletionData } from '../../utilities/codeCompletionCopilotdata/processCodeCompletionData';
import '../../styles/ReviewPage.css';
import '../../styles/Copilot/ReusableStyles.css';
import '../../styles/Copilot/CodeCompletionsPage.css';
import '../../styles/components/Statistics.css';
import { MdOutlineArrowBackIosNew } from 'react-icons/md';
import { IoSettingsOutline } from 'react-icons/io5';

function CodeCompletionsPage() {
  const navigate = useNavigate();
  const { historicUsageData, getHistoricUsageData } = useData();
  const [isLoading, setIsLoading] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [chartDisplaySettings, setChartDisplaySettings] = useState({
    includeWeekendUsage: false,
    locUsage: false,
  });
  const settingsRef = useRef(null);

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      await getHistoricUsageData();
      setIsLoading(false);
    })();
  }, []);

  useEffect(() => {
    const handleClickOutside = event => {
      if (settingsRef.current && !settingsRef.current.contains(event.target)) {
        setIsSettingsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const processedData = historicUsageData
    ? processCodeCompletionData(historicUsageData)
    : null;
  return (
    <Layout headerProps={{ hideSearch: true }}>
      <PageBanner
        title="GitHub Copilot Usage Dashboard"
        description="Analyse Copilot usage statistics organisation-wide"
        tabs={[]}
      />

      <div className="admin-container">
        <div className="copilot-page-controls">
=======
import LegacyDataVisualisation from '../../components/Copilot/Dashboards/LegacyData';
import '../../styles/ReviewPage.css';
import '../../styles/Copilot/CopilotUsagePage.css';
import '../../styles/components/Statistics.css';
import { MdOutlineArrowBackIosNew } from 'react-icons/md';

// TODO: Change to get code completions data
function CodeCompletionsPage() {
//   const { legacyCopilotData, getLegacyUsageData } = useData();
//   const [isLegacyLoading, setIsLegacyLoading] = useState(false);
  const navigate = useNavigate();

//   useEffect(() => {
//     (async () => {
//       setIsLegacyLoading(true);
//       await getLegacyUsageData();
//       setIsLegacyLoading(false);
//     })();
//   }, []);

  return (
    <Layout headerProps={{ hideSearch: true }}>
      <div className="admin-page">
        <PageBanner
          title="GitHub Copilot Code Completions Dashboard"
          description="Analyse Copilot Code Completion data statistics"
          tabs={[]}
        />
        <div className="admin-container">
>>>>>>> c8b9628 (feat: added the new page and linked it to the landing page)
          <button
            className="copilot-back-button"
            onClick={() => navigate('/copilot/home')}
            aria-label="Back to Copilot Dashboard Homepage"
          >
            <MdOutlineArrowBackIosNew size={12} />
            <span id="text">Back</span>
          </button>
<<<<<<< HEAD
          <div className="copilot-settings" ref={settingsRef}>
            <button
              className="copilot-settings-button"
              onClick={() => setIsSettingsOpen(prev => !prev)}
              aria-label="Open chart display settings"
              aria-expanded={isSettingsOpen}
              aria-controls="copilot-settings-menu"
            >
              <IoSettingsOutline size={18} />
            </button>
            {isSettingsOpen && (
              <div className="copilot-settings-menu" id="copilot-settings-menu">
                <label className="copilot-settings-checkbox-label">
                  <input
                    type="checkbox"
                    checked={chartDisplaySettings.includeWeekendUsage}
                    onChange={event =>
                      setChartDisplaySettings(prev => ({
                        ...prev,
                        includeWeekendUsage: event.target.checked,
                      }))
                    }
                  />
                  Include weekend usage
                </label>
                <label className="copilot-settings-checkbox-label">
                  <input
                    type="checkbox"
                    checked={chartDisplaySettings.locUsage}
                    onChange={event =>
                      setChartDisplaySettings(prev => ({
                        ...prev,
                        locUsage: event.target.checked,
                      }))
                    }
                  />
                  Include LoC usage
                </label>
              </div>
            )}
          </div>
        </div>
        <CodeCompletionsDashboard
          data={processedData}
          isLoading={isLoading}
          chartDisplaySettings={chartDisplaySettings}
        />
=======
          {/* TODO: CHANGE TO CODE COMPLETION COMPONENT */}
          {/* <LegacyDataVisualisation
            data={legacyCopilotData}
            isLoading={isLegacyLoading}
          /> */}
        </div>
>>>>>>> c8b9628 (feat: added the new page and linked it to the landing page)
      </div>
    </Layout>
  );
}

export default CodeCompletionsPage;
