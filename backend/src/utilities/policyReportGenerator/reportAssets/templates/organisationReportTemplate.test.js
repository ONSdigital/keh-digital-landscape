import { describe, expect, it } from 'vitest';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const { buildOrganisationReportHtml } = require('./organisationReportTemplate');

describe('organisationReportTemplate', () => {
  it('filters repository metrics and SLO alerts by selected visibility', () => {
    const buildDataset = (publicAlerts, privateAlerts) => ({
      summary: {
        total_repositories: 2,
        compliant_repositories: 1,
        total_teams: 1,
        compliant_teams: 1,
        repository_checks: { codeowners: { total: 2, compliant: 1 } },
        team_checks: { team_maintainer: { total: 1, compliant: 1 } },
        repository_ratings: { gold: 1, bronze: 1 },
      },
      repositories: {
        'public-repository': {
          visibility: 'public',
          rating: 'gold',
          is_compliant: true,
          checks: { codeowners: { result: 'pass' } },
        },
        'private-repository': {
          visibility: 'private',
          rating: 'bronze',
          is_compliant: false,
          checks: { codeowners: { result: 'fail' } },
        },
      },
      organisation_checks: {
        dependabot_slo: {
          result: 'fail',
          details: {
            failing_alerts: publicAlerts + privateAlerts,
            total_repositories_affected: 2,
            repositories: {
              'example/public-repository': { high: publicAlerts },
              'example/private-repository': { critical: privateAlerts },
            },
          },
        },
        secret_scanning_slo: { result: 'pass', details: { repositories: {} } },
      },
    });

    const html = buildOrganisationReportHtml({
      organisation: 'example',
      sourceDataset: 'source',
      sourceDatasetDisplay: 'Source',
      comparisonDataset: 'comparison',
      comparisonDatasetDisplay: 'Comparison',
      repositoryVisibility: ['public'],
      sourceDatasetData: buildDataset(5, 64),
      comparisonDatasetData: buildDataset(2, 4),
    });

    expect(html).toContain('>1<');
    expect(html).toContain('>100.0%<');
    expect(html).toContain('>5<');
    expect(html).toContain('<strong>1</strong> repositories affected by SLO');
    expect(html).toContain('+3 vs comparison dataset.');
    expect(html).not.toContain('>64<');
  });

  it('renders organisation metadata and organisation-specific sections', () => {
    const html = buildOrganisationReportHtml({
      organisation: 'ONS-Innovation',
      sourceDataset: '20260723T121307Z.json',
      sourceDatasetDisplay: '23 Jul 2026, 12:13',
      comparisonDataset: 's3/policy-audit/20260716T121307Z.json',
      comparisonDatasetDisplay: '16 Jul 2026, 12:13',
      sourceDatasetData: {
        summary: {
          total_repositories: 2,
          compliant_repositories: 1,
          total_teams: 2,
          compliant_teams: 1,
          repository_checks: {
            codeowners: { total: 2, compliant: 2 },
            external_pull_request: { total: 2, compliant: 1 },
            license: { total: 2, compliant: 1 },
          },
          team_checks: {
            team_maintainer: { total: 2, compliant: 1 },
          },
          repository_ratings: {
            platinum: 0,
            gold: 1,
            silver: 0,
            bronze: 1,
            unrated: 0,
          },
        },
        repositories: {
          'repo-a': {
            codeowners: { result: 'pass', message: 'CODEOWNERS present.' },
            external_pull_request: {
              result: 'error',
              message: '403 error while fetching pull requests.',
            },
            license: { result: 'fail', message: 'License missing.' },
            is_compliant: false,
          },
          'repo-b': {
            codeowners: { result: 'pass', message: 'CODEOWNERS present.' },
            license: { result: 'pass', message: 'License present.' },
            is_compliant: true,
          },
        },
        teams: {
          'team-a': { is_compliant: true },
          'team-b': { is_compliant: false },
        },
        organisation_checks: {
          dependabot_slo: {
            result: 'fail',
            check_name: 'dependabot_slo',
            message: '7 repositories currently exceed dependabot SLA windows.',
            details: {
              failing_alerts: 7,
              total_open_alerts: 20,
              total_repositories_affected: 2,
              number_exceeded_by_severity: {
                critical: 1,
                high: 3,
                medium: 3,
                low: 0,
              },
              repositories: {
                'ONS-Innovation/repo-a': {
                  critical: 1,
                  high: 0,
                  medium: 0,
                  low: 0,
                },
                'ONS-Innovation/repo-b': {
                  critical: 0,
                  high: 1,
                  medium: 0,
                  low: 0,
                },
              },
            },
          },
          secret_scanning_slo: {
            result: 'pass',
            check_name: 'secret_scanning_slo',
            message:
              '1 repository has unresolved secret-scanning SLA breaches.',
            details: {},
          },
        },
        scorecard_criteria: {
          platinum: {
            min_compliance: 100,
            required_checks: [],
          },
          gold: {
            min_compliance: 90,
            required_checks: [
              'codeowners',
              'dependabot',
              'license',
              'pirr',
              'readme',
              'repository_access',
              'security_scanning',
            ],
          },
          silver: {
            min_compliance: 70,
            required_checks: [
              'codeowners',
              'dependabot',
              'license',
              'pirr',
              'readme',
              'security_scanning',
            ],
          },
          bronze: {
            min_compliance: 50,
            required_checks: ['codeowners', 'dependabot', 'security_scanning'],
          },
        },
      },
      comparisonDatasetData: {
        summary: {
          total_repositories: 1,
          compliant_repositories: 1,
          total_teams: 1,
          compliant_teams: 1,
          repository_checks: {
            codeowners: { total: 1, compliant: 1 },
            external_pull_request: { total: 1, compliant: 1 },
            license: { total: 1, compliant: 1 },
          },
          team_checks: {
            team_maintainer: { total: 1, compliant: 1 },
          },
          repository_ratings: {
            platinum: 0,
            gold: 1,
            silver: 0,
            bronze: 0,
            unrated: 0,
          },
        },
        repositories: {
          'repo-a': {
            codeowners: { result: 'pass', message: 'CODEOWNERS present.' },
            license: { result: 'pass', message: 'License present.' },
            is_compliant: true,
          },
        },
        teams: {
          'team-a': { is_compliant: true },
        },
        organisation_checks: {
          dependabot_slo: {
            result: 'fail',
            check_name: 'dependabot_slo',
            message: '9 repositories exceeded dependabot SLA windows.',
            details: {
              failing_alerts: 9,
              total_open_alerts: 25,
              total_repositories_affected: 9,
            },
          },
          secret_scanning_slo: {
            result: 'pass',
            check_name: 'secret_scanning_slo',
            message: '3 repositories exceeded secret scanning SLA windows.',
            details: {},
          },
        },
      },
    });

    expect(html).toContain('Organisational GitHub Usage Policy Report');
    expect(html).toContain('ONS-Innovation');
    expect(html).toContain('23 Jul 2026, 12:13');
    expect(html).toContain('16 Jul 2026, 12:13');
    expect(html).toContain('Source dataset file: 20260723T121307Z.json');
    expect(html).toContain(
      'Comparison dataset file: s3/policy-audit/20260716T121307Z.json'
    );
    expect(html).toContain('>2<');
    expect(html).toContain('>1<');
    expect(html).toContain('50.0%');
    expect(html).toContain('Dependabot SLO');
    expect(html).toContain('Secret Scanning SLO');
    expect(html).toContain('Secret Scanning SLOs');
    expect(html).toContain('Dependabot SLOs');
    expect(html).not.toContain('<h3>Secret Scanning SLO</h3>');
    expect(html).not.toContain('<h3>Dependabot SLO</h3>');
    expect(html).toContain('Non-compliant');
    expect(html).toContain('External Pull Request');
    expect(html).toContain('+1 vs comparison dataset.');
    expect(html).toContain('-2 vs comparison dataset.');
    expect(html).toContain('-50.0pp vs comparison dataset.');
    expect(html).toContain('Codeowners');
    expect(html).toContain('License');
    expect(html).toContain('What do these ratings mean?');
    expect(html).toContain('Minimum compliance');
    expect(html).toContain('Required checks');
    expect(html).toContain('No mandatory checks');
    expect(html).toContain('Repository Rating Breakdown');
    expect(html).toContain('class="pill rating rating-tier-2"');
    expect(html).toContain('class="pill rating rating-tier-4"');
    expect(html).toContain(
      'class="rating-delta neutral">No change vs comparison dataset.</p>'
    );
    expect(html).toContain(
      'class="rating-delta neutral">+1 vs comparison dataset.</p>'
    );
    expect(html).toContain('>50.0%<');
    expect(html).toContain('Repository Check Breakdown');
    expect(html).toContain('Team Check Breakdown');
    expect(html).toContain('>7<');
    expect(html).toContain('>2<');
    expect(html).toContain('repositories affected by SLO');
    expect(html).toContain('-7 vs comparison dataset.');
    expect(html).toContain('Critical');
    expect(html).not.toContain(
      '7 repositories currently exceed dependabot SLA windows.'
    );
    expect(html).not.toContain('Affected repositories (2)');
    expect(html).not.toContain('See note');
  });

  it('prefers summary metrics when provided', () => {
    const html = buildOrganisationReportHtml({
      organisation: 'ONS-Innovation',
      sourceDataset: '20260723T121307Z.json',
      sourceDatasetDisplay: '23 Jul 2026, 12:13',
      comparisonDataset: '20260716T121307Z.json',
      comparisonDatasetDisplay: '16 Jul 2026, 12:13',
      sourceDatasetData: {
        summary: {
          total_repositories: 108,
          compliant_repositories: 5,
          total_teams: 16,
          compliant_teams: 15,
          repository_checks: {
            codeowners: { total: 108, compliant: 67 },
          },
          team_checks: {
            team_maintainer: { total: 16, compliant: 15 },
          },
          repository_ratings: {
            platinum: 2,
            gold: 3,
            silver: 10,
            bronze: 20,
            unrated: 73,
          },
        },
        repositories: {
          'repo-a': {
            codeowners: { result: 'pass', message: 'CODEOWNERS present.' },
            is_compliant: true,
          },
          'repo-b': {
            codeowners: { result: 'pass', message: 'CODEOWNERS present.' },
            is_compliant: true,
          },
        },
        teams: {
          'team-a': { is_compliant: false },
          'team-b': { is_compliant: false },
        },
        scorecard_criteria: {
          platinum: {
            min_compliance: 100,
            required_checks: [],
          },
          gold: {
            min_compliance: 90,
            required_checks: ['codeowners', 'dependabot', 'license'],
          },
          silver: {
            min_compliance: 70,
            required_checks: ['codeowners', 'dependabot'],
          },
          bronze: {
            min_compliance: 50,
            required_checks: ['codeowners'],
          },
        },
      },
      comparisonDatasetData: {
        summary: {
          total_repositories: 100,
          compliant_repositories: 4,
          total_teams: 10,
          compliant_teams: 7,
          repository_checks: {
            codeowners: { total: 100, compliant: 60 },
          },
          team_checks: {
            team_maintainer: { total: 10, compliant: 7 },
          },
          repository_ratings: {
            platinum: 1,
            gold: 1,
            silver: 8,
            bronze: 15,
            unrated: 75,
          },
        },
      },
    });

    expect(html).toContain('<dd>108</dd>');
    expect(html).toContain('<dd>5</dd>');
    expect(html).toContain('4.6%');
    expect(html).toContain('<dd>16</dd>');
    expect(html).toContain('<dd>15</dd>');
    expect(html).toContain('93.8%');
    expect(html).toContain('Codeowners');
    expect(html).toContain('>67<');
    expect(html).toContain('>108<');
    expect(html).toContain('Repository Rating Breakdown');
    expect(html).toContain('class="pill rating rating-tier-1"');
    expect(html).toContain('class="pill rating rating-unrated"');
    expect(html.indexOf('rating-tier-1')).toBeLessThan(
      html.indexOf('rating-tier-2')
    );
    expect(html.indexOf('rating-tier-2')).toBeLessThan(
      html.indexOf('rating-tier-3')
    );
    expect(html.indexOf('rating-tier-3')).toBeLessThan(
      html.indexOf('rating-tier-4')
    );
    expect(html.indexOf('rating-tier-4')).toBeLessThan(
      html.indexOf('rating-unrated')
    );
    expect(html).toContain(
      'class="rating-delta neutral">+1 vs comparison dataset.</p>'
    );
    expect(html).toContain(
      'class="rating-delta neutral">+2 vs comparison dataset.</p>'
    );
    expect(html).toContain(
      'class="rating-delta neutral">-2 vs comparison dataset.</p>'
    );
    expect(html).toContain('+8 vs comparison dataset.');
    expect(html).toContain('+1 vs comparison dataset.');
    expect(html).toContain('+0.6pp vs comparison dataset.');
  });

  it('throws clear error when required team check breakdown is missing', () => {
    expect(() =>
      buildOrganisationReportHtml({
        organisation: 'ONS-Innovation',
        sourceDataset: '20260723T121307Z.json',
        sourceDatasetDisplay: '23 Jul 2026, 12:13',
        sourceDatasetData: {
          summary: {
            total_repositories: 108,
            compliant_repositories: 5,
            total_teams: 16,
            compliant_teams: 15,
            repository_checks: {
              codeowners: { total: 108, compliant: 67 },
            },
            repository_ratings: {
              platinum: 2,
              gold: 3,
              silver: 10,
              bronze: 20,
              unrated: 73,
            },
          },
        },
      })
    ).toThrow(
      'Source dataset summary is missing required object field: team_checks'
    );
  });

  it('throws clear error when required source summary field is missing', () => {
    expect(() =>
      buildOrganisationReportHtml({
        organisation: 'ONS-Innovation',
        sourceDatasetData: {
          summary: {
            total_repositories: 108,
            compliant_repositories: 5,
            compliant_teams: 15,
            repository_checks: {
              codeowners: { total: 108, compliant: 67 },
            },
            repository_ratings: {
              platinum: 2,
              gold: 3,
              silver: 10,
              bronze: 20,
              unrated: 73,
            },
          },
        },
      })
    ).toThrow(
      'Source dataset summary is missing required numeric field: total_teams'
    );
  });

  it('throws clear error when repository ratings are missing', () => {
    expect(() =>
      buildOrganisationReportHtml({
        organisation: 'ONS-Innovation',
        sourceDatasetData: {
          summary: {
            total_repositories: 108,
            compliant_repositories: 5,
            total_teams: 16,
            compliant_teams: 15,
            repository_checks: {
              codeowners: { total: 108, compliant: 67 },
            },
            team_checks: {
              team_maintainer: { total: 16, compliant: 15 },
            },
          },
        },
      })
    ).toThrow(
      'Source dataset summary is missing required object field: repository_ratings'
    );
  });

  it('throws clear error when comparison summary is missing', () => {
    expect(() =>
      buildOrganisationReportHtml({
        organisation: 'ONS-Innovation',
        sourceDatasetData: {
          summary: {
            total_repositories: 108,
            compliant_repositories: 5,
            total_teams: 16,
            compliant_teams: 15,
            repository_checks: {
              codeowners: { total: 108, compliant: 67 },
            },
            repository_ratings: {
              platinum: 2,
              gold: 3,
              silver: 10,
              bronze: 20,
              unrated: 73,
            },
          },
        },
        comparisonDataset: '20260716T121307Z.json',
        comparisonDatasetData: {},
      })
    ).toThrow('Comparison dataset summary is missing or invalid.');
  });

  it('reads breach count from nested details object matching real dataset shape', () => {
    const html = buildOrganisationReportHtml({
      organisation: 'ONS-Innovation',
      sourceDataset: '20260723T121307Z.json',
      sourceDatasetDisplay: '23 Jul 2026, 12:13',
      sourceDatasetData: {
        summary: {
          total_repositories: 108,
          compliant_repositories: 5,
          total_teams: 16,
          compliant_teams: 15,
          repository_checks: {
            codeowners: { total: 108, compliant: 67 },
          },
          team_checks: {
            team_maintainer: { total: 16, compliant: 15 },
          },
          repository_ratings: {
            platinum: 2,
            gold: 3,
            silver: 10,
            bronze: 20,
            unrated: 73,
          },
        },
        organisation_checks: {
          dependabot_slo: {
            result: 'fail',
            message:
              'Found 318 open Dependabot security alerts exceeding the policy-defined SLO.',
            details: {
              total_open_alerts: 543,
              failing_alerts: 318,
            },
            check_name: 'dependabot_slo',
          },
          secret_scanning_slo: {
            result: 'pass',
            message:
              'No open Secret Scanning security alerts found exceeding SLO.',
            details: {},
            check_name: 'secret_scanning_slo',
          },
        },
        scorecard_criteria: {
          platinum: {
            min_compliance: 100,
            required_checks: [],
          },
          gold: {
            min_compliance: 90,
            required_checks: ['codeowners', 'dependabot', 'license'],
          },
          silver: {
            min_compliance: 70,
            required_checks: ['codeowners', 'dependabot'],
          },
          bronze: {
            min_compliance: 50,
            required_checks: ['codeowners'],
          },
        },
      },
    });

    expect(html).toContain('>318<');
    expect(html).not.toContain(
      'Found 318 open Dependabot security alerts exceeding the policy-defined SLO.'
    );
    expect(html).not.toContain('See note');
  });
});
