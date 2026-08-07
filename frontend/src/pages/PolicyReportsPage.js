import React, { useCallback, useEffect, useState } from 'react';
import PageBanner from '../components/PageBanner/PageBanner';
import Layout from '../components/Layout/Layout';
import SelectableEntityReport from '../components/policyReports/SelectableEntityReport/SelectableEntityReport';
import { fetchPolicyReportOrganisationOptions } from '../utilities/policyReports/getOrganisations';
import { fetchDatasetsByOrganisation } from '../utilities/policyReports/getDatasets';
import {
  checkAuthStatus,
  handleAuthCallback,
  loginWithGitHub,
  logoutUser,
  fetchGitHubUserProfile,
  retrievePersistedFormState,
} from '../utilities/githubAuth';
import { fetchDatasetRepositoriesForUser } from '../utilities/policyReports/getRepositories';
import { fetchDatasetTeamsForUser } from '../utilities/policyReports/getTeams';
import { generatePolicyReport } from '../utilities/policyReports/generatePolicyReport';
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
  const [activeReportTab, setActiveReportTab] = useState('organisation');

  // Track whether we're in the process of restoring form state
  const isRestoringFormState = persistedFormState !== null;

  const oauthRedirectPath = '/github-policy-reports';

  const formatDatasetDisplayLabel = dataset =>
    new Date(dataset.displayName).toLocaleString('en-GB', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });

  const getDatasetDisplayLabelByName = datasetName => {
    const dataset = datasets.find(item => item.name === datasetName);

    if (!dataset) {
      return datasetName || 'Not provided';
    }

    return formatDatasetDisplayLabel(dataset);
  };

  const getDatasetTimeValue = dataset =>
    new Date(dataset.displayName).getTime();

  // Datasets older than the selected source are valid comparison targets
  const selectedSourceDataset = datasets.find(d => d.name === sourceDataset);
  const comparisonDatasetOptions = selectedSourceDataset
    ? datasets.filter(
        dataset =>
          getDatasetTimeValue(dataset) <
          getDatasetTimeValue(selectedSourceDataset)
      )
    : [];

  const getDefaultComparisonDatasetName = selectedSourceDatasetName => {
    if (!selectedSourceDatasetName) return '';

    const currentSourceDataset = datasets.find(
      dataset => dataset.name === selectedSourceDatasetName
    );
    if (!currentSourceDataset) return '';

    const olderDatasets = datasets
      .filter(
        dataset =>
          getDatasetTimeValue(dataset) <
          getDatasetTimeValue(currentSourceDataset)
      )
      .sort((a, b) => getDatasetTimeValue(b) - getDatasetTimeValue(a));

    return olderDatasets[0]?.name || selectedSourceDatasetName;
  };

  const isStageTwoEnabled = Boolean(organisation && sourceDataset);

  useEffect(() => {
    const loadPolicyReportsConfig = async () => {
      const config = await fetchPolicyReportOrganisationOptions();
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
        const validTabs = ['organisation', 'repository', 'team'];
        if (
          formState.activeReportTab &&
          validTabs.includes(formState.activeReportTab)
        ) {
          setActiveReportTab(formState.activeReportTab);
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

  useEffect(() => {
    if (!sourceDataset) {
      setComparisonDataset('');
      return;
    }

    const currentSourceDataset = datasets.find(
      dataset => dataset.name === sourceDataset
    );
    if (!currentSourceDataset) {
      setComparisonDataset('');
      return;
    }

    const validComparisonOptions = datasets.filter(
      dataset =>
        getDatasetTimeValue(dataset) < getDatasetTimeValue(currentSourceDataset)
    );

    if (validComparisonOptions.length === 0) {
      if (comparisonDataset !== sourceDataset) {
        setComparisonDataset(sourceDataset);
      }
      return;
    }

    const selectedComparisonStillValid = validComparisonOptions.some(
      dataset => dataset.name === comparisonDataset
    );

    if (!selectedComparisonStillValid) {
      setComparisonDataset(getDefaultComparisonDatasetName(sourceDataset));
    }
  }, [sourceDataset, datasets, comparisonDataset]);

  const [repositoryOptions, setRepositoryOptions] = useState([]);
  const [teamOptions, setTeamOptions] = useState([]);
  const [repositoryListPage, setRepositoryListPage] = useState(1);
  const [teamListPage, setTeamListPage] = useState(1);
  const [repositoryResultsPerPage, setRepositoryResultsPerPage] = useState(10);
  const [teamResultsPerPage, setTeamResultsPerPage] = useState(10);
  const [totalAccessibleRepositories, setTotalAccessibleRepositories] =
    useState(0);
  const [totalAccessibleTeams, setTotalAccessibleTeams] = useState(0);
  const [
    isLoadingAccessibleReposAndTeams,
    setIsLoadingAccessibleReposAndTeams,
  ] = useState(false);
  const [activeGenerationType, setActiveGenerationType] = useState(null);
  const [generationMessage, setGenerationMessage] = useState('');
  const [generationError, setGenerationError] = useState('');
  const [isRefreshingGitHubCache, setIsRefreshingGitHubCache] = useState(false);
  const [repositoryCacheInfo, setRepositoryCacheInfo] = useState({
    cacheUsed: false,
    cachedAt: null,
    ageLabel: 'just now',
  });
  const [teamCacheInfo, setTeamCacheInfo] = useState({
    cacheUsed: false,
    cachedAt: null,
    ageLabel: 'just now',
  });
  const [githubEntityLoadProgress, setGithubEntityLoadProgress] = useState({
    completed: 0,
    total: 2,
    phase: 'idle',
    currentPage: 0,
    totalPages: 0,
  });

  const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];
  const loadProgressPercent = Math.round(
    (githubEntityLoadProgress.completed / githubEntityLoadProgress.total) * 100
  );

  const getCacheAgeLabelFromTimestamp = cachedAt => {
    if (!cachedAt) {
      return 'just now';
    }

    const parsedCachedAt = Number(cachedAt);

    if (Number.isNaN(parsedCachedAt)) {
      return 'just now';
    }

    const elapsedMinutes = Math.floor((Date.now() - parsedCachedAt) / 60000);

    if (elapsedMinutes <= 0) {
      return 'just now';
    }

    if (elapsedMinutes === 1) {
      return '1 min ago';
    }

    return `${elapsedMinutes} mins ago`;
  };

  const loadDatasetReposAndTeams = useCallback(
    async ({ forceRefresh = false } = {}) => {
      if (!isGitHubAuthenticated || !organisation || !sourceDataset) {
        return;
      }

      setIsLoadingAccessibleReposAndTeams(true);
      setGithubEntityLoadProgress({
        completed: 0,
        total: 2,
        phase: 'repositories',
        currentPage: 0,
        totalPages: 0,
      });

      if (forceRefresh) {
        setIsRefreshingGitHubCache(true);
      } else {
        setRepositorySearch('');
        setTeamSearch('');
        setSelectedRepositories([]);
        setSelectedTeams([]);
        setRepositoryListPage(1);
        setTeamListPage(1);
        setRepositoryResultsPerPage(10);
        setTeamResultsPerPage(10);
      }

      const repositories = [];
      const teams = [];
      let repositoryCacheUsed = false;
      let repositoryCachedAt = null;
      let teamCacheUsed = false;
      let teamCachedAt = null;

      try {
        let repositoryPage = 1;
        let repositoryTotalPages = 1;

        while (repositoryPage <= repositoryTotalPages) {
          const repositoryResponse = await fetchDatasetRepositoriesForUser(
            organisation,
            sourceDataset,
            {
              includeCacheMetadata: true,
              refreshCache: forceRefresh,
              githubPage: repositoryPage,
              githubPerPage: 100,
            }
          );

          repositoryTotalPages =
            Number(repositoryResponse.githubTotalPages) || repositoryTotalPages;

          repositories.push(...(repositoryResponse.repositories || []));
          repositoryCacheUsed =
            repositoryCacheUsed || repositoryResponse.cacheUsed;
          repositoryCachedAt =
            repositoryResponse.cachedAt || repositoryCachedAt;

          setGithubEntityLoadProgress({
            completed: repositoryPage,
            total: Math.max(2, repositoryTotalPages + 1),
            phase: 'repositories',
            currentPage: repositoryPage,
            totalPages: repositoryTotalPages,
          });

          repositoryPage += 1;
        }

        setGithubEntityLoadProgress(prev => ({
          ...prev,
          phase: 'teams',
          currentPage: 0,
          totalPages: 0,
        }));

        let teamPage = 1;
        let teamTotalPages = 1;

        while (teamPage <= teamTotalPages) {
          const teamResponse = await fetchDatasetTeamsForUser(
            organisation,
            sourceDataset,
            {
              includeCacheMetadata: true,
              refreshCache: forceRefresh,
              githubPage: teamPage,
              githubPerPage: 100,
            }
          );

          teamTotalPages =
            Number(teamResponse.githubTotalPages) || teamTotalPages;

          teams.push(...(teamResponse.teams || []));
          teamCacheUsed = teamCacheUsed || teamResponse.cacheUsed;
          teamCachedAt = teamResponse.cachedAt || teamCachedAt;

          setGithubEntityLoadProgress({
            completed: repositoryTotalPages + teamPage,
            total: Math.max(2, repositoryTotalPages + teamTotalPages),
            phase: 'teams',
            currentPage: teamPage,
            totalPages: teamTotalPages,
          });

          teamPage += 1;
        }

        setRepositoryOptions(repositories);
        setTeamOptions(teams);
        setTotalAccessibleRepositories(repositories.length);
        setTotalAccessibleTeams(teams.length);
        setRepositoryCacheInfo({
          cacheUsed: repositoryCacheUsed,
          cachedAt: repositoryCachedAt,
          ageLabel: getCacheAgeLabelFromTimestamp(repositoryCachedAt),
        });
        setTeamCacheInfo({
          cacheUsed: teamCacheUsed,
          cachedAt: teamCachedAt,
          ageLabel: getCacheAgeLabelFromTimestamp(teamCachedAt),
        });
      } finally {
        setIsLoadingAccessibleReposAndTeams(false);
        setIsRefreshingGitHubCache(false);
      }
    },
    [isGitHubAuthenticated, organisation, sourceDataset]
  );

  // Load dataset repositories and teams the user has access to when dataset is selected
  useEffect(() => {
    if (!isGitHubAuthenticated || !organisation || !sourceDataset) {
      setRepositoryOptions([]);
      setTeamOptions([]);
      setTotalAccessibleRepositories(0);
      setTotalAccessibleTeams(0);
      setGithubEntityLoadProgress({
        completed: 0,
        total: 2,
        phase: 'idle',
        currentPage: 0,
        totalPages: 0,
      });
      setRepositoryCacheInfo({
        cacheUsed: false,
        cachedAt: null,
        ageLabel: 'just now',
      });
      setTeamCacheInfo({
        cacheUsed: false,
        cachedAt: null,
        ageLabel: 'just now',
      });
      return;
    }

    loadDatasetReposAndTeams();
  }, [
    isGitHubAuthenticated,
    organisation,
    sourceDataset,
    loadDatasetReposAndTeams,
  ]);

  const matchingRepositories = repositoryOptions.filter(repo =>
    repo.toLowerCase().includes(repositorySearch.trim().toLowerCase())
  );
  const totalRepositoryPages = Math.max(
    1,
    Math.ceil(matchingRepositories.length / repositoryResultsPerPage)
  );
  const filteredRepositories = matchingRepositories.slice(
    (repositoryListPage - 1) * repositoryResultsPerPage,
    repositoryListPage * repositoryResultsPerPage
  );

  const matchingTeams = teamOptions.filter(team =>
    team.toLowerCase().includes(teamSearch.trim().toLowerCase())
  );
  const totalTeamPages = Math.max(
    1,
    Math.ceil(matchingTeams.length / teamResultsPerPage)
  );
  const filteredTeams = matchingTeams.slice(
    (teamListPage - 1) * teamResultsPerPage,
    teamListPage * teamResultsPerPage
  );

  useEffect(() => {
    if (repositoryListPage > totalRepositoryPages) {
      setRepositoryListPage(totalRepositoryPages);
    }
  }, [repositoryListPage, totalRepositoryPages]);

  useEffect(() => {
    if (teamListPage > totalTeamPages) {
      setTeamListPage(totalTeamPages);
    }
  }, [teamListPage, totalTeamPages]);

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

  const handleClearConfiguration = () => {
    setOrganisation('');
    setDatasets([]);
    setSourceDataset('');
    setComparisonDataset('');
    setRepositoryOptions([]);
    setTeamOptions([]);
    setSelectedRepositories([]);
    setSelectedTeams([]);
    setTotalAccessibleRepositories(0);
    setTotalAccessibleTeams(0);
    setRepositorySearch('');
    setTeamSearch('');
    setRepositoryListPage(1);
    setTeamListPage(1);
    setRepositoryResultsPerPage(10);
    setTeamResultsPerPage(10);
    setGenerationMessage('');
    setGenerationError('');
  };

  const handleRepositorySearchChange = value => {
    setRepositorySearch(value);
    setRepositoryListPage(1);
  };

  const handleTeamSearchChange = value => {
    setTeamSearch(value);
    setTeamListPage(1);
  };

  const handleRepositoryResultsPerPageChange = value => {
    setRepositoryResultsPerPage(value);
    setRepositoryListPage(1);
  };

  const handleTeamResultsPerPageChange = value => {
    setTeamResultsPerPage(value);
    setTeamListPage(1);
  };

  const handleGitHubLogin = async () => {
    await loginWithGitHub({
      redirectPath: oauthRedirectPath,
      formState: {
        organisation,
        sourceDataset,
        activeReportTab,
      },
    });
  };

  const handleGitHubLogout = async () => {
    const success = await logoutUser();
    if (success) {
      setIsGitHubAuthenticated(false);
      setGithubUsername(null);
      setRepositoryCacheInfo({
        cacheUsed: false,
        cachedAt: null,
        ageLabel: 'just now',
      });
      setTeamCacheInfo({
        cacheUsed: false,
        cachedAt: null,
        ageLabel: 'just now',
      });
    }
  };

  const handleRefreshGitHubCache = async () => {
    await loadDatasetReposAndTeams({ forceRefresh: true });
  };

  const handleGeneratePolicyReport = async ({ reportType, inputs }) => {
    setActiveGenerationType(reportType);
    setGenerationError('');
    setGenerationMessage('');

    try {
      await generatePolicyReport({ reportType, inputs });
      setGenerationMessage(`${reportType} report downloaded successfully.`);
    } catch (error) {
      const reason = error?.message ? `: ${error.message}` : '';
      setGenerationError(
        `Unable to generate ${reportType.toLowerCase()} report${reason}. Please try again.`
      );
    } finally {
      setActiveGenerationType(null);
    }
  };

  const isAnyReportGenerating = activeGenerationType !== null;
  const hasOlderComparisonDatasets = comparisonDatasetOptions.length > 0;
  const isUsingSourceAsComparison =
    Boolean(sourceDataset) &&
    !hasOlderComparisonDatasets &&
    comparisonDataset === sourceDataset;
  const isOrganisationReportGenerateDisabled =
    isAnyReportGenerating || !comparisonDataset;

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
                    disabled={isRestoringFormState || Boolean(sourceDataset)}
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
                      !organisation ||
                      isDatasetsLoading ||
                      isRestoringFormState ||
                      isLoadingAccessibleReposAndTeams
                    }
                    onChange={event => {
                      const nextSourceDataset = event.target.value;
                      setSourceDataset(nextSourceDataset);
                      setComparisonDataset(
                        getDefaultComparisonDatasetName(nextSourceDataset)
                      );
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
                        {formatDatasetDisplayLabel(dataset)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              {sourceDataset && (
                <div
                  className="policy-reports-space-top-sm"
                  style={{ display: 'flex', justifyContent: 'flex-end' }}
                >
                  <button
                    className="policy-reports-btn"
                    type="button"
                    onClick={handleClearConfiguration}
                  >
                    Clear configuration
                  </button>
                </div>
              )}
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
                {generationMessage && (
                  <p
                    className="policy-reports-generation-success"
                    role="status"
                  >
                    {generationMessage}
                  </p>
                )}
                {generationError && (
                  <p className="policy-reports-generation-error" role="alert">
                    {generationError}
                  </p>
                )}
              </div>

              {!isStageTwoEnabled ? (
                <div className="policy-reports-stage-hidden-note policy-reports-space-top-sm">
                  <p className="policy-reports-stage-gate-note">
                    Complete Stage 1 by selecting an organisation and source
                    dataset to reveal report generation options.
                  </p>
                </div>
              ) : (
                <>
                  <div
                    className="policy-reports-tab-bar policy-reports-space-top-sm"
                    role="tablist"
                    aria-label="Report type"
                  >
                    <button
                      role="tab"
                      aria-selected={activeReportTab === 'organisation'}
                      aria-controls="panel-organisation"
                      id="tab-organisation"
                      className={`policy-reports-tab-btn${activeReportTab === 'organisation' ? ' policy-reports-tab-btn-active' : ''}`}
                      type="button"
                      onClick={() => setActiveReportTab('organisation')}
                    >
                      Organisation Report
                    </button>
                    <button
                      role="tab"
                      aria-selected={activeReportTab === 'repository'}
                      aria-controls="panel-repository"
                      id="tab-repository"
                      className={`policy-reports-tab-btn${activeReportTab === 'repository' ? ' policy-reports-tab-btn-active' : ''}`}
                      type="button"
                      onClick={() => setActiveReportTab('repository')}
                    >
                      Repository Report
                    </button>
                    <button
                      role="tab"
                      aria-selected={activeReportTab === 'team'}
                      aria-controls="panel-team"
                      id="tab-team"
                      className={`policy-reports-tab-btn${activeReportTab === 'team' ? ' policy-reports-tab-btn-active' : ''}`}
                      type="button"
                      onClick={() => setActiveReportTab('team')}
                    >
                      Team Report
                    </button>
                  </div>

                  <section
                    id="panel-organisation"
                    role="tabpanel"
                    aria-labelledby="organisation-report-title"
                    className="policy-reports-tab-panel"
                    hidden={activeReportTab !== 'organisation'}
                  >
                    <h3
                      id="organisation-report-title"
                      className="policy-reports-tab-panel-title"
                    >
                      Organisation Report
                    </h3>
                    <div className="policy-reports-field policy-reports-space-top-xs">
                      <label htmlFor="comparison-dataset">
                        Comparison dataset
                      </label>
                      <select
                        id="comparison-dataset"
                        className={`policy-reports-select-input ${isUsingSourceAsComparison ? 'policy-reports-select-input-highlight' : ''}`}
                        name="comparison-dataset"
                        value={comparisonDataset}
                        disabled={!hasOlderComparisonDatasets}
                        onChange={event =>
                          setComparisonDataset(event.target.value)
                        }
                      >
                        {!hasOlderComparisonDatasets && (
                          <option value={sourceDataset}>
                            No older datasets available
                          </option>
                        )}
                        {comparisonDatasetOptions.map(dataset => (
                          <option key={dataset.name} value={dataset.name}>
                            {formatDatasetDisplayLabel(dataset)}
                          </option>
                        ))}
                      </select>
                      <p className="policy-reports-hint policy-reports-hint-tight">
                        This will be used to compare the selected source dataset
                        against the chosen comparison dataset to demonstrate
                        changes in compliance over time.
                      </p>
                      {isUsingSourceAsComparison && (
                        <p className="policy-reports-hint policy-reports-hint-tight">
                          No older datasets are available for this source. The
                          source dataset will be used as the comparison for this
                          report.
                        </p>
                      )}
                    </div>
                    <div className="policy-reports-auth-row policy-reports-actions-row">
                      <button
                        className="policy-reports-btn policy-reports-btn-primary"
                        type="button"
                        disabled={isOrganisationReportGenerateDisabled}
                        onClick={() =>
                          handleGeneratePolicyReport({
                            reportType: 'Organisation',
                            inputs: {
                              organisation,
                              sourceDataset,
                              sourceDatasetDisplay:
                                getDatasetDisplayLabelByName(sourceDataset),
                              comparisonDataset,
                              comparisonDatasetDisplay:
                                getDatasetDisplayLabelByName(comparisonDataset),
                            },
                          })
                        }
                      >
                        {activeGenerationType === 'Organisation'
                          ? 'Generating Organisation Report...'
                          : 'Generate Organisation Report'}
                      </button>
                      {activeGenerationType === 'Organisation' && (
                        <span
                          className="policy-reports-generation-status"
                          role="status"
                        >
                          <span
                            className="policy-reports-inline-spinner"
                            aria-hidden="true"
                          />
                          Generating report...
                        </span>
                      )}
                      {!comparisonDataset && (
                        <span
                          className="policy-reports-generation-error"
                          role="alert"
                        >
                          A comparison dataset is required for organisation
                          reports.
                        </span>
                      )}
                    </div>
                  </section>

                  <section
                    id="panel-repository"
                    role="tabpanel"
                    aria-labelledby="tab-repository"
                    className="policy-reports-tab-panel"
                    hidden={activeReportTab !== 'repository'}
                  >
                    <div className="policy-reports-restricted-header">
                      <div className="policy-reports-restricted-title-block">
                        <h3 className="policy-reports-tab-panel-title">
                          Repository Report
                        </h3>
                        <p className="policy-reports-hint policy-reports-restricted-hint">
                          Repository reports require GitHub authentication.
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
                          Sign in with GitHub to generate repository reports.
                        </p>
                      </div>
                    ) : (
                      <>
                        {isLoadingAccessibleReposAndTeams ? (
                          <div className="policy-reports-stage-hidden-note policy-reports-space-top-sm">
                            <p className="policy-reports-stage-gate-note">
                              Loading your accessible repositories and teams…
                            </p>
                            <div
                              className="policy-reports-loading-progress"
                              role="status"
                              aria-live="polite"
                            >
                              <div className="policy-reports-loading-progress-meta">
                                <span>
                                  {githubEntityLoadProgress.phase ===
                                  'repositories'
                                    ? 'Collecting repositories'
                                    : 'Collecting teams'}{' '}
                                  {githubEntityLoadProgress.currentPage > 0 &&
                                  githubEntityLoadProgress.totalPages > 0
                                    ? `(page ${githubEntityLoadProgress.currentPage} of ${githubEntityLoadProgress.totalPages})`
                                    : ''}
                                </span>
                                <span>{loadProgressPercent}%</span>
                              </div>
                              <div
                                className="policy-reports-loading-progress-track"
                                aria-hidden="true"
                              >
                                <div
                                  className="policy-reports-loading-progress-fill"
                                  style={{ width: `${loadProgressPercent}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        ) : (
                          <>
                            <SelectableEntityReport
                              searchId="repository-search"
                              searchLabel="Search repositories"
                              searchPlaceholder="Type to filter accessible repositories"
                              searchValue={repositorySearch}
                              onSearchChange={handleRepositorySearchChange}
                              currentPage={repositoryListPage}
                              totalPages={totalRepositoryPages}
                              onPageChange={setRepositoryListPage}
                              resultsPerPage={repositoryResultsPerPage}
                              onResultsPerPageChange={
                                handleRepositoryResultsPerPageChange
                              }
                              pageSizeOptions={PAGE_SIZE_OPTIONS}
                              totalAccessible={totalAccessibleRepositories}
                              totalMatching={matchingRepositories.length}
                              selectedItems={selectedRepositories}
                              filteredItems={filteredRepositories}
                              onClearSelection={() =>
                                setSelectedRepositories([])
                              }
                              onToggleSelection={toggleRepositorySelection}
                              emptyStateMessage="No repositories match your search."
                              generateButtonLabel="Generate Repository Report"
                              generateButtonInProgressLabel="Generating Repository Report..."
                              onGenerateReport={() =>
                                handleGeneratePolicyReport({
                                  reportType: 'Repository',
                                  inputs: {
                                    organisation,
                                    sourceDataset,
                                    sourceDatasetDisplay:
                                      getDatasetDisplayLabelByName(
                                        sourceDataset
                                      ),
                                    selectedRepositories,
                                  },
                                })
                              }
                              isGenerating={
                                activeGenerationType === 'Repository'
                              }
                              isGenerateDisabled={
                                isAnyReportGenerating ||
                                selectedRepositories.length === 0
                              }
                              singularLabel="repository"
                              pluralLabel="repositories"
                            />
                            <div className="policy-reports-cache-status policy-reports-space-top-sm">
                              <p className="policy-reports-hint policy-reports-no-margin">
                                GitHub repositories collected{' '}
                                {repositoryCacheInfo.cacheUsed
                                  ? `from cache (${repositoryCacheInfo.ageLabel})`
                                  : `from GitHub API (${repositoryCacheInfo.ageLabel})`}
                                .
                              </p>
                              <button
                                className="policy-reports-btn policy-reports-btn-compact"
                                type="button"
                                onClick={handleRefreshGitHubCache}
                                disabled={
                                  isLoadingAccessibleReposAndTeams ||
                                  isRefreshingGitHubCache
                                }
                              >
                                {isRefreshingGitHubCache
                                  ? 'Refreshing GitHub cache...'
                                  : 'Refresh GitHub cache'}
                              </button>
                            </div>
                          </>
                        )}
                      </>
                    )}
                  </section>

                  <section
                    id="panel-team"
                    role="tabpanel"
                    aria-labelledby="tab-team"
                    className="policy-reports-tab-panel"
                    hidden={activeReportTab !== 'team'}
                  >
                    <div className="policy-reports-restricted-header">
                      <div className="policy-reports-restricted-title-block">
                        <h3 className="policy-reports-tab-panel-title">
                          Team Report
                        </h3>
                        <p className="policy-reports-hint policy-reports-restricted-hint">
                          Team reports require GitHub authentication.
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
                          Sign in with GitHub to generate team reports.
                        </p>
                      </div>
                    ) : (
                      <>
                        {isLoadingAccessibleReposAndTeams ? (
                          <div className="policy-reports-stage-hidden-note policy-reports-space-top-sm">
                            <p className="policy-reports-stage-gate-note">
                              Loading your accessible repositories and teams…
                            </p>
                            <div
                              className="policy-reports-loading-progress"
                              role="status"
                              aria-live="polite"
                            >
                              <div className="policy-reports-loading-progress-meta">
                                <span>
                                  {githubEntityLoadProgress.phase ===
                                  'repositories'
                                    ? 'Collecting repositories'
                                    : 'Collecting teams'}{' '}
                                  {githubEntityLoadProgress.currentPage > 0 &&
                                  githubEntityLoadProgress.totalPages > 0
                                    ? `(page ${githubEntityLoadProgress.currentPage} of ${githubEntityLoadProgress.totalPages})`
                                    : ''}
                                </span>
                                <span>{loadProgressPercent}%</span>
                              </div>
                              <div
                                className="policy-reports-loading-progress-track"
                                aria-hidden="true"
                              >
                                <div
                                  className="policy-reports-loading-progress-fill"
                                  style={{ width: `${loadProgressPercent}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        ) : (
                          <>
                            <SelectableEntityReport
                              searchId="team-search"
                              searchLabel="Search teams"
                              searchPlaceholder="Type to filter accessible teams"
                              searchValue={teamSearch}
                              onSearchChange={handleTeamSearchChange}
                              currentPage={teamListPage}
                              totalPages={totalTeamPages}
                              onPageChange={setTeamListPage}
                              resultsPerPage={teamResultsPerPage}
                              onResultsPerPageChange={
                                handleTeamResultsPerPageChange
                              }
                              pageSizeOptions={PAGE_SIZE_OPTIONS}
                              totalAccessible={totalAccessibleTeams}
                              totalMatching={matchingTeams.length}
                              selectedItems={selectedTeams}
                              filteredItems={filteredTeams}
                              onClearSelection={() => setSelectedTeams([])}
                              onToggleSelection={toggleTeamSelection}
                              emptyStateMessage="No teams match your search."
                              generateButtonLabel="Generate Team Report"
                              generateButtonInProgressLabel="Generating Team Report..."
                              onGenerateReport={() =>
                                handleGeneratePolicyReport({
                                  reportType: 'Team',
                                  inputs: {
                                    organisation,
                                    sourceDataset,
                                    sourceDatasetDisplay:
                                      getDatasetDisplayLabelByName(
                                        sourceDataset
                                      ),
                                    selectedTeams,
                                  },
                                })
                              }
                              isGenerating={activeGenerationType === 'Team'}
                              isGenerateDisabled={
                                isAnyReportGenerating ||
                                selectedTeams.length === 0
                              }
                              singularLabel="team"
                              pluralLabel="teams"
                            />
                            <div className="policy-reports-cache-status policy-reports-space-top-sm">
                              <p className="policy-reports-hint policy-reports-no-margin">
                                GitHub teams collected{' '}
                                {teamCacheInfo.cacheUsed
                                  ? `from cache (${teamCacheInfo.ageLabel})`
                                  : `from GitHub API (${teamCacheInfo.ageLabel})`}
                                .
                              </p>
                              <button
                                className="policy-reports-btn policy-reports-btn-compact"
                                type="button"
                                onClick={handleRefreshGitHubCache}
                                disabled={
                                  isLoadingAccessibleReposAndTeams ||
                                  isRefreshingGitHubCache
                                }
                              >
                                {isRefreshingGitHubCache
                                  ? 'Refreshing GitHub cache...'
                                  : 'Refresh GitHub cache'}
                              </button>
                            </div>
                          </>
                        )}
                      </>
                    )}
                  </section>
                </>
              )}
            </div>
          </section>
        </main>
      </div>
    </Layout>
  );
};

export default PolicyReportsPage;
