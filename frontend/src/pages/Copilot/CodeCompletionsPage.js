import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout/Layout';
import PageBanner from '../../components/PageBanner/PageBanner';
import SuggestionsAcceptanceGraph from '../../components/Copilot/Breakdowns/SuggestionsAcceptanceGraph';
import '../../styles/ReviewPage.css';
import '../../styles/Copilot/CopilotUsagePage.css';
import '../../styles/components/Statistics.css';
import { MdOutlineArrowBackIosNew } from 'react-icons/md';

const sampleSuggestionsAcceptanceData = [
  {
    date: '2026-02-16',
    suggestions: 13048,
    acceptances: 3761,
    acceptanceRate: 28.82,
  },
  {
    date: '2026-02-23',
    suggestions: 19955,
    acceptances: 4971,
    acceptanceRate: 24.91,
  },
  {
    date: '2026-03-02',
    suggestions: 23986,
    acceptances: 6425,
    acceptanceRate: 26.79,
  },
  {
    date: '2026-03-10',
    suggestions: 19547,
    acceptances: 5347,
    acceptanceRate: 27.35,
  },
  {
    date: '2026-03-16',
    suggestions: 26763,
    acceptances: 6443,
    acceptanceRate: 24.07,
  },
  {
    date: '2026-03-24',
    suggestions: 26340,
    acceptances: 6392,
    acceptanceRate: 24.27,
  },
  {
    date: '2026-03-29',
    suggestions: 14255,
    acceptances: 3474,
    acceptanceRate: 24.37,
  },
  {
    date: '2026-04-05',
    suggestions: 10962,
    acceptances: 2486,
    acceptanceRate: 22.68,
  },
  {
    date: '2026-04-12',
    suggestions: 17714,
    acceptances: 3546,
    acceptanceRate: 20.02,
  },
  {
    date: '2026-04-19',
    suggestions: 19749,
    acceptances: 4680,
    acceptanceRate: 23.7,
  },
  {
    date: '2026-04-26',
    suggestions: 18892,
    acceptances: 4240,
    acceptanceRate: 22.44,
  },
  {
    date: '2026-05-03',
    suggestions: 17326,
    acceptances: 3552,
    acceptanceRate: 20.5,
  },
  {
    date: '2026-05-10',
    suggestions: 20299,
    acceptances: 4111,
    acceptanceRate: 20.25,
  },
  {
    date: '2026-05-17',
    suggestions: 15913,
    acceptances: 3033,
    acceptanceRate: 19.06,
  },
  {
    date: '2026-05-24',
    suggestions: 10570,
    acceptances: 2467,
    acceptanceRate: 23.34,
  },
  {
    date: '2026-05-31',
    suggestions: 17020,
    acceptances: 3833,
    acceptanceRate: 22.52,
  },
  {
    date: '2026-06-07',
    suggestions: 21228,
    acceptances: 4670,
    acceptanceRate: 22,
  },
  {
    date: '2026-06-14',
    suggestions: 19875,
    acceptances: 4509,
    acceptanceRate: 22.69,
  },
  {
    date: '2026-06-21',
    suggestions: 22992,
    acceptances: 4942,
    acceptanceRate: 21.49,
  },
];

function CodeCompletionsPage() {
  const navigate = useNavigate();

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
          <SuggestionsAcceptanceGraph data={sampleSuggestionsAcceptanceData} />
        </div>
      </div>
    </Layout>
  );
}

export default CodeCompletionsPage;
