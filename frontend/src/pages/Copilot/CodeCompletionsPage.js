import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../contexts/dataContext';
import Layout from '../../components/Layout/Layout';
import PageBanner from '../../components/PageBanner/PageBanner';
import SuggestionsAcceptanceGraph from '../../components/Copilot/Breakdowns/SuggestionsAcceptanceGraph';
import { processCodeCompletionData } from '../../utilities/codeCompletionCopilotdata/processCodeCompletionData';
import '../../styles/ReviewPage.css';
import '../../styles/Copilot/CopilotUsagePage.css';
import '../../styles/components/Statistics.css';
import { MdOutlineArrowBackIosNew } from 'react-icons/md';

function CodeCompletionsPage() {
  const navigate = useNavigate();
  const { historicUsageData, getHistoricUsageData } = useData();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      await getHistoricUsageData();
      setIsLoading(false);
    })();
  }, []);

  const processedData = historicUsageData
    ? processCodeCompletionData(historicUsageData)
    : null;

  return (
    <Layout headerProps={{ hideSearch: true }}>
      <div className="admin-page">
        <PageBanner
          title="GitHub Copilot Code Completions Dashboard"
          description="Analyse Copilot Code Completion data statistics"
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
          {!isLoading && processedData && (
            <SuggestionsAcceptanceGraph data={processedData.suggestedGraph} />
          )}
        </div>
      </div>
    </Layout>
  );
}

export default CodeCompletionsPage;
