# Local Development Data

The backend/data directory contains seed data files used by the backend when running in
**local development** (`NODE_ENV=development`).

Instead of connecting to AWS S3, the backend reads from and writes to this
directory. This keeps all local work fully isolated from the deployed Dev
environment on AWS.

## Structure

```
data/
├── main/                            # Mirrors the sdp-dev-digital-landscape S3 bucket
│   ├── directorates.json
│   ├── messages.json
│   ├── onsRadarSkeleton.json
│   ├── repositories.json
│   └── AddressBook/
│       ├── addressBookEmailKey.json
│       ├── addressBookIDKey.json
│       └── addressBookUsernameKey.json
├── tat/                             # Mirrors the sdp-dev-tech-audit-tool-api S3 bucket
│   ├── array_data.json
│   └── new_project_data.json
└── copilot/                         # Mirrors the sdp-dev-copilot-usage-dashboard S3 bucket
    ├── admin_teams.json
    ├── organisation_history.json
    └── archive/
        ├── pre-feb25/
        │   └── historic_usage_data_feb25.json
        └── pre-mar26/
            ├── copilot_teams.json
            ├── historic_usage_data_mar26.json
            └── teams_history.json
```

## Populating with real data

If you need realistic data locally, you can download files from the Dev S3
buckets (using the AWS CLI with appropriate permissions) and place them here:

login with sso
`aws sso login`

```sh
aws s3 cp s3://sdp-dev-digital-landscape/onsRadarSkeleton.json backend/data/main/
aws s3 cp s3://sdp-dev-digital-landscape/repositories.json     backend/data/main/
aws s3 cp s3://sdp-dev-digital-landscape/messages.json         backend/data/main/
aws s3 cp s3://sdp-dev-digital-landscape/directorates.json         backend/data/main/
aws s3 cp s3://sdp-dev-digital-landscape/AddressBook/addressBookEmailKey.json         backend/data/main/AddressBook/
aws s3 cp s3://sdp-dev-digital-landscape/AddressBook/addressBookIDKey.json         backend/data/main/AddressBook/
aws s3 cp s3://sdp-dev-digital-landscape/AddressBook/addressBookUsernameKey.json         backend/data/main/AddressBook/

aws s3 cp s3://sdp-dev-tech-audit-tool-api/new_project_data.json backend/data/tat/
aws s3 cp s3://sdp-dev-tech-audit-tool-api/array_data.json backend/data/tat/

aws s3 cp s3://sdp-dev-copilot-usage-dashboard/admin_teams.json       backend/data/copilot/
aws s3 cp s3://sdp-dev-copilot-usage-dashboard/organisation_history.json        backend/data/copilot/
aws s3 cp s3://sdp-dev-copilot-usage-dashboard/archive/pre-feb25/historic_usage_data_feb25.json        backend/data/copilot/archive/pre-feb25/
aws s3 cp s3://sdp-dev-copilot-usage-dashboard/archive/pre-mar26/copilot_teams.json        backend/data/copilot/archive/pre-mar26/
aws s3 cp s3://sdp-dev-copilot-usage-dashboard/archive/pre-mar26/historic_usage_data_mar26.json        backend/data/copilot/archive/pre-mar26/
aws s3 cp s3://sdp-dev-copilot-usage-dashboard/archive/pre-mar26/teams_history.json        backend/data/copilot/archive/pre-mar26/

```
