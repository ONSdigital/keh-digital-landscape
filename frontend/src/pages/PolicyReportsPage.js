import React, { useEffect, useState } from 'react';
import PageBanner from '../components/PageBanner/PageBanner';
import Layout from '../components/Layout/Layout';
import CollapsibleReportSection from '../components/policyReports/CollapsibleReportSection/CollapsibleReportSection';
import SelectableEntityReport from '../components/policyReports/SelectableEntityReport/SelectableEntityReport';
import {
  fetchPolicyReportsConfig,
  fetchDatasetsByOrganisation,
} from '../utilities/getPolicyReportsConfig';
import {
  checkAuthStatus,
  handleAuthCallback,
  loginWithGitHub,
  logoutUser,
  fetchGitHubUserProfile,
  retrievePersistedFormState,
} from '../utilities/githubAuth';
import '../styles/PolicyReportsPage.css';

const PolicyReportsPage = () => {
  const [reportConfig, setReportConfig] = useState({
    organisationOptions: [],
  });

  const [organisation, setOrganisation] = useState('');
  const [datasets, setDatasets] = useState([]);
  const [isDatasetsLoading, setIsDatasetsLoading] = useState(false);
  const [sourceDataset, setSourceDataset] = useState('');
  const [comparisonDataset, setComparisonDataset] = useState('');
  const [isGitHubAuthenticated, setIsGitHubAuthenticated] = useState(false);
  const [isGitHubAuthLoading, setIsGitHubAuthLoading] = useState(true);
  const [githubUsername, setGithubUsername] = useState(null);
  const [repositorySearch, setRepositorySearch] = useState('');
  const [teamSearch, setTeamSearch] = useState('');
  const [selectedRepositories, setSelectedRepositories] = useState([]);
  const [selectedTeams, setSelectedTeams] = useState([]);
  const [persistedFormState, setPersistedFormState] = useState(null);

  // Track whether we're in the process of restoring form state
  const isRestoringFormState = persistedFormState !== null;

  const oauthRedirectPath = '/github-policy-reports';

  // Datasets older than the selected source are valid comparison targets
  const selectedSourceDataset = datasets.find(d => d.name === sourceDataset);
  const comparisonDatasetOptions = selectedSourceDataset
    ? datasets.filter(d => d.lastModified < selectedSourceDataset.lastModified)
    : [];

  const isStageTwoEnabled = Boolean(organisation && sourceDataset);

  useEffect(() => {
    const loadPolicyReportsConfig = async () => {
      const config = await fetchPolicyReportsConfig();
      if (!config) return;

      setReportConfig({
        organisationOptions: config.organisationOptions || [],
      });
    };

    loadPolicyReportsConfig();
  }, []);

  useEffect(() => {
    const initialiseGitHubAuth = async () => {
      setIsGitHubAuthLoading(true);

      await handleAuthCallback({ redirectPath: oauthRedirectPath });

      const authenticated = await checkAuthStatus();

      if (authenticated) {
        const profile = await fetchGitHubUserProfile();
        if (profile) {
          setGithubUsername(profile.login);
        }

        // Store form state for restoration after datasets load
        const formState = retrievePersistedFormState();
        if (formState.organisation) {
          setOrganisation(formState.organisation);
          setPersistedFormState(formState);
        }
      }

      setIsGitHubAuthenticated(authenticated);
      setIsGitHubAuthLoading(false);
    };

    initialiseGitHubAuth();
  }, []);

  useEffect(() => {
    if (!organisation) {
      setDatasets([]);
      setSourceDataset('');
      setComparisonDataset('');
      return;
    }

    const loadDatasets = async () => {
      setIsDatasetsLoading(true);
      setSourceDataset('');
      setComparisonDataset('');
      setSelectedRepositories([]);
      setSelectedTeams([]);
      const fetched = await fetchDatasetsByOrganisation(organisation);
      setDatasets(fetched);
      setIsDatasetsLoading(false);
    };

    loadDatasets();
  }, [organisation]);

  // Restore sourceDataset after datasets load for the restored organisation
  useEffect(() => {
    if (datasets.length > 0 && persistedFormState?.sourceDataset) {
      setSourceDataset(persistedFormState.sourceDataset);
      setPersistedFormState(null); // Clear after applying
    }
  }, [datasets, persistedFormState]);

  const [repositoryOptions, setRepositoryOptions] = useState([]);
  const [teamOptions, setTeamOptions] = useState([]);
  const [repositoryResultCap, setRepositoryResultCap] = useState(0);
  const [teamResultCap, setTeamResultCap] = useState(0);
  const [totalAccessibleRepositories, setTotalAccessibleRepositories] =
    useState(0);
  const [totalAccessibleTeams, setTotalAccessibleTeams] = useState(0);

  // Suppress unused-variable warnings until the setters are wired to a future fetch
  void setRepositoryOptions;
  void setTeamOptions;
  void setRepositoryResultCap;
  void setTeamResultCap;
  void setTotalAccessibleRepositories;
  void setTotalAccessibleTeams;

  const filteredRepositories = repositoryOptions
    .filter(repo =>
      repo.toLowerCase().includes(repositorySearch.trim().toLowerCase())
    )
    .slice(0, repositoryResultCap || repositoryOptions.length);

  const filteredTeams = teamOptions
    .filter(team =>
      team.toLowerCase().includes(teamSearch.trim().toLowerCase())
    )
    .slice(0, teamResultCap || teamOptions.length);

  const toggleRepositorySelection = repositoryName => {
    setSelectedRepositories(prev =>
      prev.includes(repositoryName)
        ? prev.filter(item => item !== repositoryName)
        : [...prev, repositoryName]
    );
  };

  const toggleTeamSelection = teamName => {
    setSelectedTeams(prev =>
      prev.includes(teamName)
        ? prev.filter(item => item !== teamName)
        : [...prev, teamName]
    );
  };

  const handleGitHubLogin = async () => {
    await loginWithGitHub({
      redirectPath: oauthRedirectPath,
      formState: {
        organisation,
        sourceDataset,
      },
    });
  };

  const handleGitHubLogout = async () => {
    const success = await logoutUser();
    if (success) {
      setIsGitHubAuthenticated(false);
      setGithubUsername(null);
    }
  };

  return (
    <Layout
      headerProps={{ hideSearch: true }}
      bannerProps={{ page: 'policyreports' }}
    >
      <PageBanner
        title="Policy Reports"
        description="Generate and view reports on GitHub Usage Policy compliance."
        tabs={[]}
      />

      <div className="policy-reports-page-shell">
        <main className="policy-reports-page-main">
          <section
            className="policy-reports-card"
            aria-labelledby="stage-global-context"
          >
            <div className="policy-reports-card-body">
              <div className="policy-reports-stage-header">
                <span className="policy-reports-stage-kicker">Stage 1</span>
                <h2
                  id="stage-global-context"
                  className="policy-reports-stage-title"
                >
                  Report Configuration
                </h2>
                <p className="policy-reports-hint policy-reports-no-margin">
                  Choose an organisation and source dataset to be used for all
                  report types.
                </p>
              </div>

              <div className="policy-reports-form-grid policy-reports-space-top-sm">
                <div className="policy-reports-field">
                  <label htmlFor="organisation">Organisation</label>
                  <select
                    id="organisation"
                    className="policy-reports-select-input"
                    name="organisation"
                    value={organisation}
                    disabled={isRestoringFormState}
                    onChange={event => setOrganisation(event.target.value)}
                  >
                    <option value="">Select organisation</option>
                    {reportConfig.organisationOptions.map(org => (
                      <option key={org} value={org}>
                        {org}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="policy-reports-field">
                  <label htmlFor="source-dataset">Source dataset</label>
                  <select
                    id="source-dataset"
                    className="policy-reports-select-input"
                    name="source-dataset"
                    value={sourceDataset}
                    disabled={
                      !organisation || isDatasetsLoading || isRestoringFormState
                    }
                    onChange={event => {
                      setSourceDataset(event.target.value);
                      setComparisonDataset('');
                      setSelectedRepositories([]);
                      setSelectedTeams([]);
                    }}
                  >
                    <option value="">
                      {isDatasetsLoading
                        ? 'Loading datasets…'
                        : 'Select source dataset'}
                    </option>
                    {datasets.map(dataset => (
                      <option key={dataset.name} value={dataset.name}>
                        {new Date(dataset.name).toLocaleString('en-GB', {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </section>

          <section
            className="policy-reports-card"
            aria-labelledby="stage-generate-reports"
          >
            <div className="policy-reports-card-body">
              <div className="policy-reports-stage-header">
                <span className="policy-reports-stage-kicker">Stage 2</span>
                <h2
                  id="stage-generate-reports"
                  className="policy-reports-stage-title"
                >
                  Generate Reports
                </h2>
                <p className="policy-reports-hint policy-reports-no-margin">
                  Fill in the inputs, choose a report type and click the
                  corresponding button to generate a report.
                </p>
              </div>

              {!isStageTwoEnabled ? (
                <div className="policy-reports-stage-hidden-note policy-reports-space-top-sm">
                  <p className="policy-reports-stage-gate-note">
                    Complete Stage 1 by selecting an organisation and source
                    dataset to reveal report generation options.
                  </p>
                </div>
              ) : (
                <div className="policy-reports-flow-grid policy-reports-space-top-sm">
                  <section
                    className="policy-reports-focus-card"
                    aria-labelledby="organisation-report-title"
                  >
                    <h3 id="organisation-report-title">Organisation Report</h3>
                    <div className="policy-reports-field policy-reports-space-top-xs">
                      <label htmlFor="comparison-dataset">
                        Comparison dataset
                      </label>
                      <select
                        id="comparison-dataset"
                        className="policy-reports-select-input"
                        name="comparison-dataset"
                        value={comparisonDataset}
                        onChange={event =>
                          setComparisonDataset(event.target.value)
                        }
                      >
                        <option value="">Select comparison dataset</option>
                        {comparisonDatasetOptions.map(dataset => (
                          <option key={dataset.name} value={dataset.name}>
                            {new Date(dataset.name).toLocaleString('en-GB', {
                              dateStyle: 'medium',
                              timeStyle: 'short',
                            })}
                          </option>
                        ))}
                      </select>
                      <p className="policy-reports-hint policy-reports-hint-tight">
                        This will be used to compare the selected source dataset
                        against the chosen comparison dataset to demonstrate
                        changes in compliance over time.
                      </p>
                    </div>
                    <div className="policy-reports-auth-row policy-reports-actions-row">
                      <button
                        className="policy-reports-btn policy-reports-btn-primary"
                        type="button"
                      >
                        Generate Organisation Report
                      </button>
                    </div>
                  </section>

                  <section
                    className="policy-reports-focus-card"
                    aria-labelledby="restricted-reports-title"
                  >
                    <div className="policy-reports-restricted-header">
                      <div className="policy-reports-restricted-title-block">
                        <h3 id="restricted-reports-title">
                          Restricted Reports
                        </h3>
                        <p className="policy-reports-hint policy-reports-restricted-hint">
                          Repository and team reports require GitHub
                          authentication.
                        </p>
                      </div>
                      {isGitHubAuthenticated && (
                        <div className="policy-reports-restricted-auth-actions">
                          <span className="policy-reports-signed-in-text">
                            Signed in as @{githubUsername || 'user'}
                          </span>
                          <button
                            className="policy-reports-btn"
                            type="button"
                            onClick={handleGitHubLogout}
                          >
                            Log out
                          </button>
                        </div>
                      )}
                    </div>

                    {!isGitHubAuthenticated ? (
                      <div className="policy-reports-access-block policy-reports-login-cta policy-reports-space-top-sm">
                        <div className="policy-reports-login-cta-inner">
                          <button
                            className="policy-reports-btn policy-reports-btn-primary"
                            type="button"
                            onClick={handleGitHubLogin}
                            disabled={isGitHubAuthLoading}
                          >
                            {isGitHubAuthLoading
                              ? 'Checking GitHub authentication...'
                              : 'Log in with GitHub'}
                          </button>
                        </div>
                        <p className="policy-reports-hint policy-reports-no-margin policy-reports-login-hint">
                          Sign in with GitHub to generate repository and team
                          reports.
                        </p>
                      </div>
                    ) : (
                      <>
                        <p className="policy-reports-hint policy-reports-no-margin policy-reports-space-top-sm">
                          Choose a report type to configure and generate.
                        </p>

                        <CollapsibleReportSection
                          title="Repository report"
                          className="policy-reports-space-top-xs"
                        >
                          <SelectableEntityReport
                            searchId="repository-search"
                            searchLabel="Search repositories"
                            searchPlaceholder="Type to filter accessible repositories"
                            searchValue={repositorySearch}
                            onSearchChange={setRepositorySearch}
                            resultCap={repositoryResultCap}
                            totalAccessible={totalAccessibleRepositories}
                            selectedItems={selectedRepositories}
                            filteredItems={filteredRepositories}
                            onClearSelection={() => setSelectedRepositories([])}
                            onToggleSelection={toggleRepositorySelection}
                            emptyStateMessage="No repositories match your search."
                            generateButtonLabel="Generate Repository Report"
                            singularLabel="repository"
                            pluralLabel="repositories"
                          />
                        </CollapsibleReportSection>

                        <CollapsibleReportSection
                          title="Team report"
                          className="policy-reports-space-top-sm"
                        >
                          <SelectableEntityReport
                            searchId="team-search"
                            searchLabel="Search teams"
                            searchPlaceholder="Type to filter accessible teams"
                            searchValue={teamSearch}
                            onSearchChange={setTeamSearch}
                            resultCap={teamResultCap}
                            totalAccessible={totalAccessibleTeams}
                            selectedItems={selectedTeams}
                            filteredItems={filteredTeams}
                            onClearSelection={() => setSelectedTeams([])}
                            onToggleSelection={toggleTeamSelection}
                            emptyStateMessage="No teams match your search."
                            generateButtonLabel="Generate Team Report"
                            singularLabel="team"
                            pluralLabel="teams"
                          />
                        </CollapsibleReportSection>
                      </>
                    )}
                  </section>
                </div>
              )}
            </div>
          </section>
        </main>
      </div>
    </Layout>
  );
};

export default PolicyReportsPage;
