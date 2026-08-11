import Layout from '../../components/Layout/Layout';
import PageBanner from '../../components/PageBanner/PageBanner';
import PageControls from '../../components/PageControls/PageControls';
import '../../styles/ReviewPage.css';
import '../../styles/Copilot/ReusableStyles.css';

function AgentsEditsPage() {
  return (
    <Layout headerProps={{ hideSearch: true }}>
      <div className="admin-page">
        <PageBanner
          title="GitHub Copilot Usage Dashboard"
          description="Agents Edits page"
          tabs={[]}
        />
        <div className="admin-container">
          <PageControls
            previousPage="/copilot/home"
            backAriaLabel="Back to Copilot Dashboard Homepage"
          />
        </div>
      </div>
    </Layout>
  );
}

export default AgentsEditsPage;
