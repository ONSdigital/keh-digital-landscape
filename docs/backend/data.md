# Local Development Data

The `backend/data` directory contains seed data files used by the backend when running in **local development** (`NODE_ENV=development`).

Instead of connecting to AWS S3, the backend reads from and writes to this
directory. This keeps all local work fully isolated from the deployed Dev
environment on AWS.

## Structure

```text
backend/data/
├── main/                                # Mirrors the Digital Landscape S3 bucket
│   ├── directorates.json
│   ├── bannerMessages.json
│   ├── techRadarEntries.json
│   ├── repositoryStatistics.json
│   └── AddressBook/
│       ├── addressBookEmailKey.json
│       ├── addressBookIDKey.json
│       └── addressBookUsernameKey.json
├── tat/                                 # Mirrors the TAT API S3 bucket
│   ├── array_data.json
│   └── new_project_data.json
└── copilot/                             # Mirrors the Copilot Usage Dashboard S3 bucket
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
buckets and place them into `backend/data`.

1. Log in with AWS SSO:

```bash
aws sso login
```

1. Copy the files into the correct folders:

```bash
aws s3 cp s3://<S3 Object Path> backend/data/<path>
```

Full commands on doing this are available within KEH's Confluence. There is a `Digital Landscape Local Data` playbook that contains commands to copy and paste into your terminal to download the data. ***(Internal only)***

## Notes

- Keep downloaded data local and avoid committing real environment data.
- For application runtime details, see [Running the Project](../index.md#running-the-project).
