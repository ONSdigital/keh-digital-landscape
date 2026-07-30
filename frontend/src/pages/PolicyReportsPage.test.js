import React from 'react';
import { render, screen, waitFor, within, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Module mocks ──────────────────────────────────────────────────────────────

vi.mock('../components/Layout/Layout', () => ({
  default: ({ children }) => <div data-testid="layout">{children}</div>,
}));

vi.mock('../components/PageBanner/PageBanner', () => ({
  default: ({ title }) => <h1>{title}</h1>,
}));

vi.mock(
  '../components/policyReports/CollapsibleReportSection/CollapsibleReportSection',
  () => ({
    default: ({ title, children }) => (
      <section>
        <span>{title}</span>
        {children}
      </section>
    ),
  })
);

vi.mock(
  '../components/policyReports/SelectableEntityReport/SelectableEntityReport',
  () => ({
    default: ({
      searchId,
      searchLabel,
      searchValue,
      onSearchChange,
      filteredItems,
      selectedItems,
      onToggleSelection,
      onClearSelection,
      onLoadMore,
      generateButtonLabel,
      onGenerateReport,
      isGenerateDisabled,
    }) => (
      <div data-testid={`selectable-entity-${searchId}`}>
        <label htmlFor={searchId}>{searchLabel}</label>
        <input
          id={searchId}
          value={searchValue}
          onChange={e => onSearchChange(e.target.value)}
        />
        <ul>
          {filteredItems.map(item => (
            <li key={item}>
              <button type="button" onClick={() => onToggleSelection(item)}>
                {item}
              </button>
            </li>
          ))}
        </ul>
        <button type="button" onClick={onClearSelection}>
          Clear selection
        </button>
        <button type="button" onClick={onLoadMore}>
          Load more
        </button>
        <button
          type="button"
          onClick={onGenerateReport}
          disabled={isGenerateDisabled}
        >
          {generateButtonLabel}
        </button>
      </div>
    ),
  })
);

vi.mock('../utilities/policyReports/getOrganisations', () => ({
  fetchPolicyReportOrganisationOptions: vi.fn(),
}));

vi.mock('../utilities/policyReports/getDatasets', () => ({
  fetchDatasetsByOrganisation: vi.fn(),
}));

vi.mock('../utilities/policyReports/getRepositories', () => ({
  fetchDatasetRepositoriesForUser: vi.fn(),
}));

vi.mock('../utilities/policyReports/getTeams', () => ({
  fetchDatasetTeamsForUser: vi.fn(),
}));

vi.mock('../utilities/githubAuth', () => ({
  checkAuthStatus: vi.fn(),
  handleAuthCallback: vi.fn(),
  loginWithGitHub: vi.fn(),
  logoutUser: vi.fn(),
  fetchGitHubUserProfile: vi.fn(),
  retrievePersistedFormState: vi.fn(),
}));

vi.mock('../utilities/policyReports/generatePolicyReport', () => ({
  generatePolicyReport: vi.fn(),
}));

vi.mock('react-hot-toast', () => ({
  default: { error: vi.fn() },
  Toaster: () => null,
}));

// ── Imports after mocks ───────────────────────────────────────────────────────

import PolicyReportsPage from './PolicyReportsPage';
import { fetchPolicyReportOrganisationOptions } from '../utilities/policyReports/getOrganisations';
import { fetchDatasetsByOrganisation } from '../utilities/policyReports/getDatasets';
import { fetchDatasetRepositoriesForUser } from '../utilities/policyReports/getRepositories';
import { fetchDatasetTeamsForUser } from '../utilities/policyReports/getTeams';
import {
  checkAuthStatus,
  handleAuthCallback,
  loginWithGitHub,
  logoutUser,
  fetchGitHubUserProfile,
  retrievePersistedFormState,
} from '../utilities/githubAuth';
import { generatePolicyReport } from '../utilities/policyReports/generatePolicyReport';

// ── Helpers ───────────────────────────────────────────────────────────────────

const DATASETS = [
  { name: '2024-02-01T10:00:00Z', displayName: '2024-02-01T10:00:00Z' },
  { name: '2024-01-01T10:00:00Z', displayName: '2024-01-01T10:00:00Z' },
];

const formatDatasetLabel = displayName =>
  new Date(displayName).toLocaleString('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

const setupDefaultMocks = ({
  orgOptions = ['ONS-Innovation'],
  datasets = DATASETS,
  authenticated = false,
  username = null,
  repositories = [],
  teams = [],
} = {}) => {
  fetchPolicyReportOrganisationOptions.mockResolvedValue({
    organisationOptions: orgOptions,
  });
  fetchDatasetsByOrganisation.mockResolvedValue(datasets);
  fetchDatasetRepositoriesForUser.mockResolvedValue(repositories);
  fetchDatasetTeamsForUser.mockResolvedValue(teams);
  handleAuthCallback.mockResolvedValue(undefined);
  checkAuthStatus.mockResolvedValue(authenticated);
  fetchGitHubUserProfile.mockResolvedValue(
    username ? { login: username } : null
  );
  retrievePersistedFormState.mockReturnValue({});
  generatePolicyReport.mockResolvedValue(undefined);
};

const renderPage = async () => {
  let result;
  await act(async () => {
    result = render(<PolicyReportsPage />);
  });
  return result;
};

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('PolicyReportsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Initial render ──────────────────────────────────────────────────────────

  describe('initial render', () => {
    it('renders the page title', async () => {
      setupDefaultMocks();
      await renderPage();
      expect(
        screen.getByRole('heading', { name: /policy reports/i })
      ).toBeInTheDocument();
    });

    it('renders Stage 1 and Stage 2 section headings', async () => {
      setupDefaultMocks();
      await renderPage();
      expect(screen.getAllByText(/stage 1/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/stage 2/i).length).toBeGreaterThan(0);
    });

    it('loads and populates the organisation dropdown', async () => {
      setupDefaultMocks({ orgOptions: ['ONS-Innovation', 'ONS-Dev'] });
      await renderPage();

      const select = screen.getByLabelText(/organisation/i);
      expect(
        within(select).getByRole('option', { name: 'ONS-Innovation' })
      ).toBeInTheDocument();
      expect(
        within(select).getByRole('option', { name: 'ONS-Dev' })
      ).toBeInTheDocument();
    });

    it('shows Stage 2 gate note when no dataset is selected', async () => {
      setupDefaultMocks();
      await renderPage();
      expect(screen.getByText(/complete stage 1/i)).toBeInTheDocument();
    });

    it('shows the GitHub login button when unauthenticated', async () => {
      setupDefaultMocks({ authenticated: false });
      await renderPage();

      // Select an org and dataset to reveal Stage 2
      const orgSelect = screen.getByLabelText(/organisation/i);
      await userEvent.selectOptions(orgSelect, 'ONS-Innovation');
      await waitFor(() =>
        expect(fetchDatasetsByOrganisation).toHaveBeenCalledWith(
          'ONS-Innovation'
        )
      );

      const datasetSelect = screen.getByLabelText(/source dataset/i);
      await userEvent.selectOptions(datasetSelect, DATASETS[0].name);

      expect(
        screen.getByRole('button', { name: /log in with github/i })
      ).toBeInTheDocument();
    });
  });

  // ── Stage 1 – organisation & dataset selection ──────────────────────────────

  describe('Stage 1 – organisation and dataset selection', () => {
    it('fetches datasets when an organisation is selected', async () => {
      setupDefaultMocks();
      await renderPage();

      const select = screen.getByLabelText(/organisation/i);
      await userEvent.selectOptions(select, 'ONS-Innovation');

      await waitFor(() =>
        expect(fetchDatasetsByOrganisation).toHaveBeenCalledWith(
          'ONS-Innovation'
        )
      );
    });

    it('populates source dataset dropdown after fetching datasets', async () => {
      setupDefaultMocks();
      await renderPage();

      const orgSelect = screen.getByLabelText(/organisation/i);
      await userEvent.selectOptions(orgSelect, 'ONS-Innovation');

      await waitFor(() =>
        expect(fetchDatasetsByOrganisation).toHaveBeenCalled()
      );

      const datasetSelect = screen.getByLabelText(/source dataset/i);
      expect(datasetSelect.options.length).toBeGreaterThan(1);
    });

    it('resets datasets when organisation is cleared', async () => {
      setupDefaultMocks();
      await renderPage();

      const orgSelect = screen.getByLabelText(/organisation/i);
      await userEvent.selectOptions(orgSelect, 'ONS-Innovation');
      await waitFor(() =>
        expect(fetchDatasetsByOrganisation).toHaveBeenCalled()
      );

      // Select a dataset to enable Stage 2
      const datasetSelect = screen.getByLabelText(/source dataset/i);
      await userEvent.selectOptions(datasetSelect, DATASETS[0].name);

      // Clear configuration
      const clearBtn = screen.getByRole('button', {
        name: /clear configuration/i,
      });
      await userEvent.click(clearBtn);

      expect(screen.getByText(/complete stage 1/i)).toBeInTheDocument();
    });

    it('shows "Clear configuration" button once a source dataset is selected', async () => {
      setupDefaultMocks();
      await renderPage();

      const orgSelect = screen.getByLabelText(/organisation/i);
      await userEvent.selectOptions(orgSelect, 'ONS-Innovation');
      await waitFor(() =>
        expect(fetchDatasetsByOrganisation).toHaveBeenCalled()
      );

      const datasetSelect = screen.getByLabelText(/source dataset/i);
      await userEvent.selectOptions(datasetSelect, DATASETS[0].name);

      expect(
        screen.getByRole('button', { name: /clear configuration/i })
      ).toBeInTheDocument();
    });
  });

  // ── Stage 2 – Organisation Report ──────────────────────────────────────────

  describe('Stage 2 – Organisation Report', () => {
    const selectOrgAndDataset = async () => {
      const orgSelect = screen.getByLabelText(/organisation/i);
      await userEvent.selectOptions(orgSelect, 'ONS-Innovation');
      await waitFor(() =>
        expect(fetchDatasetsByOrganisation).toHaveBeenCalled()
      );

      const datasetSelect = screen.getByLabelText(/source dataset/i);
      await userEvent.selectOptions(datasetSelect, DATASETS[0].name);
    };

    it('shows the organisation report section after Stage 1 is completed', async () => {
      setupDefaultMocks();
      await renderPage();
      await selectOrgAndDataset();

      expect(
        screen.getByRole('heading', { name: /organisation report/i })
      ).toBeInTheDocument();
    });

    it('populates the comparison dataset with older datasets', async () => {
      setupDefaultMocks();
      await renderPage();
      await selectOrgAndDataset();

      const comparisonSelect = screen.getByLabelText(/comparison dataset/i);
      // DATASETS[1] is older than DATASETS[0] and should appear as an option
      expect(comparisonSelect.options.length).toBeGreaterThan(0);
      expect(comparisonSelect.options[0].value).toBe(DATASETS[1].name);
    });

    it('defaults comparison dataset to the oldest valid option', async () => {
      setupDefaultMocks();
      await renderPage();
      await selectOrgAndDataset();

      const comparisonSelect = screen.getByLabelText(/comparison dataset/i);
      // Should have pre-selected the older dataset
      expect(comparisonSelect.value).toBe(DATASETS[1].name);
    });

    it('calls generatePolicyReport with Organisation type when Generate button is clicked', async () => {
      setupDefaultMocks();
      await renderPage();
      await selectOrgAndDataset();

      const generateBtn = screen.getByRole('button', {
        name: /generate organisation report/i,
      });
      await userEvent.click(generateBtn);

      expect(generatePolicyReport).toHaveBeenCalledWith(
        expect.objectContaining({
          reportType: 'Organisation',
          inputs: expect.objectContaining({
            sourceDataset: DATASETS[0].name,
            sourceDatasetDisplay: formatDatasetLabel(DATASETS[0].displayName),
            comparisonDataset: DATASETS[1].name,
            comparisonDatasetDisplay: formatDatasetLabel(
              DATASETS[1].displayName
            ),
          }),
        })
      );
    });

    it('shows a success message after successful generation', async () => {
      setupDefaultMocks();
      await renderPage();
      await selectOrgAndDataset();

      const generateBtn = screen.getByRole('button', {
        name: /generate organisation report/i,
      });
      await userEvent.click(generateBtn);

      await waitFor(() =>
        expect(
          screen.getByText(/organisation.*report downloaded/i)
        ).toBeInTheDocument()
      );
    });

    it('shows an error message when generation fails', async () => {
      setupDefaultMocks();
      generatePolicyReport.mockRejectedValue(new Error('fail'));
      await renderPage();
      await selectOrgAndDataset();

      const generateBtn = screen.getByRole('button', {
        name: /generate organisation report/i,
      });
      await userEvent.click(generateBtn);

      await waitFor(() =>
        expect(screen.getByRole('alert')).toBeInTheDocument()
      );
    });

    it('shows "no older datasets available" message when source is the only dataset', async () => {
      setupDefaultMocks({ datasets: [DATASETS[0]] });
      await renderPage();
      await selectOrgAndDataset();

      expect(
        screen.getByText(/no older datasets available/i)
      ).toBeInTheDocument();
    });
  });

  // ── Stage 2 – GitHub authentication ────────────────────────────────────────

  describe('Stage 2 – GitHub authentication', () => {
    const selectOrgAndDataset = async () => {
      const orgSelect = screen.getByLabelText(/organisation/i);
      await userEvent.selectOptions(orgSelect, 'ONS-Innovation');
      await waitFor(() =>
        expect(fetchDatasetsByOrganisation).toHaveBeenCalled()
      );

      const datasetSelect = screen.getByLabelText(/source dataset/i);
      await userEvent.selectOptions(datasetSelect, DATASETS[0].name);
    };

    it('calls loginWithGitHub when "Log in with GitHub" button is clicked', async () => {
      setupDefaultMocks({ authenticated: false });
      await renderPage();
      await selectOrgAndDataset();

      await userEvent.click(
        screen.getByRole('button', { name: /log in with github/i })
      );

      expect(loginWithGitHub).toHaveBeenCalled();
    });

    it('shows the username and logout button when authenticated', async () => {
      setupDefaultMocks({
        authenticated: true,
        username: 'octocat',
        repositories: ['repo-a'],
        teams: ['team-x'],
      });
      await renderPage();
      await selectOrgAndDataset();

      await waitFor(() =>
        expect(screen.getByText(/@octocat/i)).toBeInTheDocument()
      );
      expect(
        screen.getByRole('button', { name: /log out/i })
      ).toBeInTheDocument();
    });

    it('calls logoutUser when "Log out" is clicked and hides the username', async () => {
      setupDefaultMocks({
        authenticated: true,
        username: 'octocat',
        repositories: [],
        teams: [],
      });
      logoutUser.mockResolvedValue(true);
      await renderPage();
      await selectOrgAndDataset();

      await waitFor(() =>
        expect(
          screen.getByRole('button', { name: /log out/i })
        ).toBeInTheDocument()
      );

      await userEvent.click(screen.getByRole('button', { name: /log out/i }));

      expect(logoutUser).toHaveBeenCalled();
      await waitFor(() =>
        expect(screen.queryByText(/@octocat/i)).not.toBeInTheDocument()
      );
    });

    it('loads repositories and teams when authenticated and dataset is selected', async () => {
      setupDefaultMocks({
        authenticated: true,
        username: 'octocat',
        repositories: ['repo-a', 'repo-b'],
        teams: ['team-x'],
      });
      await renderPage();
      await selectOrgAndDataset();

      await waitFor(() =>
        expect(fetchDatasetRepositoriesForUser).toHaveBeenCalledWith(
          'ONS-Innovation',
          DATASETS[0].name
        )
      );
      await waitFor(() =>
        expect(fetchDatasetTeamsForUser).toHaveBeenCalledWith(
          'ONS-Innovation',
          DATASETS[0].name
        )
      );
    });
  });

  // ── Stage 2 – Repository and Team reports ──────────────────────────────────

  describe('Stage 2 – Repository and Team reports', () => {
    const setupAuthenticatedWithData = async () => {
      setupDefaultMocks({
        authenticated: true,
        username: 'octocat',
        repositories: ['repo-a', 'repo-b', 'repo-c'],
        teams: ['team-alpha', 'team-beta'],
      });
      await renderPage();

      const orgSelect = screen.getByLabelText(/organisation/i);
      await userEvent.selectOptions(orgSelect, 'ONS-Innovation');
      await waitFor(() =>
        expect(fetchDatasetsByOrganisation).toHaveBeenCalled()
      );

      const datasetSelect = screen.getByLabelText(/source dataset/i);
      await userEvent.selectOptions(datasetSelect, DATASETS[0].name);

      await waitFor(() =>
        expect(fetchDatasetRepositoriesForUser).toHaveBeenCalled()
      );
    };

    it('renders the repository search input', async () => {
      await setupAuthenticatedWithData();
      expect(screen.getByLabelText(/search repositories/i)).toBeInTheDocument();
    });

    it('renders the team search input', async () => {
      await setupAuthenticatedWithData();
      expect(screen.getByLabelText(/search teams/i)).toBeInTheDocument();
    });

    it('calls generatePolicyReport with Repository type', async () => {
      await setupAuthenticatedWithData();

      // Toggle a repository selection via the mocked SelectableEntityReport
      const repoToggleBtn = screen.getByRole('button', { name: 'repo-a' });
      await userEvent.click(repoToggleBtn);

      const generateRepoBtn = screen.getByRole('button', {
        name: /generate repository report/i,
      });
      await userEvent.click(generateRepoBtn);

      expect(generatePolicyReport).toHaveBeenCalledWith(
        expect.objectContaining({
          reportType: 'Repository',
          inputs: expect.objectContaining({
            sourceDataset: DATASETS[0].name,
            sourceDatasetDisplay: formatDatasetLabel(DATASETS[0].displayName),
          }),
        })
      );
    });

    it('calls generatePolicyReport with Team type', async () => {
      await setupAuthenticatedWithData();

      const teamToggleBtn = screen.getByRole('button', { name: 'team-alpha' });
      await userEvent.click(teamToggleBtn);

      const generateTeamBtn = screen.getByRole('button', {
        name: /generate team report/i,
      });
      await userEvent.click(generateTeamBtn);

      expect(generatePolicyReport).toHaveBeenCalledWith(
        expect.objectContaining({
          reportType: 'Team',
          inputs: expect.objectContaining({
            sourceDataset: DATASETS[0].name,
            sourceDatasetDisplay: formatDatasetLabel(DATASETS[0].displayName),
          }),
        })
      );
    });
  });
});
