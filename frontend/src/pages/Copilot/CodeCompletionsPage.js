import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../contexts/dataContext';
import Layout from '../../components/Layout/Layout';
import PageBanner from '../../components/PageBanner/PageBanner';
import CodeCompletionsDashboard from '../../components/Copilot/Dashboards/CodeCompletionsDashboard';
import { processCodeCompletionData } from '../../utilities/codeCompletionCopilotdata/processCodeCompletionData';
import '../../styles/ReviewPage.css';
import '../../styles/Copilot/CopilotUsagePage.css';
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
        title="GitHub Copilot Code Completions Dashboard"
        description="Analyse Copilot Code Completion data statistics"
        tabs={[]}
      />

      <div className="admin-container">
        <div className="copilot-page-controls">
          <button
            className="copilot-back-button"
            onClick={() => navigate('/copilot/home')}
            aria-label="Back to Copilot Dashboard Homepage"
          >
            <MdOutlineArrowBackIosNew size={12} />
            <span id="text">Back</span>
          </button>
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
                  Include LOC usage
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
      </div>
    </Layout>
  );
}

export default CodeCompletionsPage;
