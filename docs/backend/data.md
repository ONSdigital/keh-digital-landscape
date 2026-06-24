# Local Development Data

The backend/data directory contains seed data files used by the backend when running in
**local development** (`NODE_ENV=development`).

Instead of connecting to AWS S3, the backend reads from and writes to this
directory. This keeps all local work fully isolated from the deployed Dev
environment on AWS.

## Structure

 ```bash
    data/
    ├── main/                            # Mirrors the Digital Landscape S3 bucket
    │   ├── directorates.json
    │   ├── messages.json
    │   ├── onsRadarSkeleton.json
    │   ├── repositories.json
    │   └── AddressBook/
    │       ├── addressBookEmailKey.json
    │       ├── addressBookIDKey.json
    │       └── addressBookUsernameKey.json
    ├── tat/                             # Mirrors the TAT API S3 bucket
    │   ├── array_data.json
    │   └── new_project_data.json
    └── copilot/                         # Mirrors the Copilot Usage Dashboard S3 bucket
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
buckets and use them locally.
