# Legacy Copilot Data

## Overview

This documentation provides information about the legacy GitHub Copilot usage data available in the Digital Landscape.
This data includes information for periods before March 2026 and February 2025, which follow different GitHub API structures and may have different data fields compared to the historic data available from March 2026 onwards.

At each instance, GitHub made breaking changes to the API, which resulted in differences in the data structure and fields available for the legacy data compared to the current historic data. The legacy data may have missing fields or different field names, and may not include all the same metrics as the current data. Because of these differences, the legacy data is stored separately and accessed through a different API endpoint (`/copilot/api/org/legacy`) to ensure that applications consuming this data can handle the differences appropriately. Due to the data gaps and differences in structure, the team chose to maintain the legacy data separately to avoid confusion and ensure that users are aware of the limitations and differences when accessing this older data.

## Storage on S3

All legacy Copilot data is stored in the `archive/` folder within the GitHub Copilot S3 bucket. The data is then organised into subfolders based on the time period it covers (i.e. `pre-feb25/` and `pre-mar26/`).

```bash
copilot-data-bucket/
├── archive/
│   ├── pre-feb25/
│   │   └── ...
│   └── pre-mar26/
│       └── ...
└── ...
```

## Data Flow

The legacy data is collected from S3 via the backend API route `/copilot/api/org/legacy`, which retrieves the relevant data files from the `archive/` folder in the S3 bucket and serves it to the frontend (This can be found within `/backend/src/routes/copilot.js`).

In the frontend, the legacy data gets consumed and visualised within the GitHub Copilot dashboard. A few utilities are needed to present the data:

- `/frontend/src`:
  - `/utilities/legacyCopilotData`:
    - `getLegacyCopilotData.js`: Fetches the legacy data from the backend API.
    - `processLegacyCopilotData.js`: Contains a range of functions to process and transform the legacy data into a format suitable for visualisation, including calculating top level aggregates, simplifying the nested structure, and formatting the data to be shown within graphs on the frontend.
- `/components/Copilot`:
  - `LegacyData.js`: Contains the React component responsible for rendering the legacy data visualisations on the GitHub Copilot dashboard, using the processed data from the utilities.

To summarise the full flow:

```bash
S3 Bucket (archive/pre-feb25/ and archive/pre-mar26/)
        │
        │
Backend API Route (/copilot/api/org/legacy)
        │
        │
Frontend Collection (DataContext -> getLegacyUsageData)
        │
        │
Frontend Processing (processLegacyCopilotData.js)
        │
        │
Frontend Visualisation (LegacyData.js)
```

The frontend collection is managed by the DataContext (`/frontend/src/contexts/dataContext.js`) via `getLegacyUsageData`, which uses `getLegacyCopilotData.js` internally.
The Copilot Page (`/pages/CopilotPage.js`) consumes `legacyCopilotData` through `useData()` and passes it when rendering the `LegacyData` component.
The `LegacyData` component uses the processing utilities to transform the data and then renders visualisations.

## Pre-March 2026 Legacy Data

### Structure (Mar 26)

The structure of the legacy data for periods before March 2026 contains a list of daily usage records, where each record includes top-level usage totals and nested IDE Chat / IDE Code Completions breakdowns. The fields included in each record are as follows:

- `date`: The date of the record in YYYY-MM-DD format.
- `total_active_users`: The total number of active users for the day.
- `total_engaged_users`: The total number of engaged users across Copilot features.
- `copilot_ide_chat`: IDE Chat usage data.
  - `total_engaged_users`: Total engaged users in IDE Chat.
  - `editors`: A list of editor-level chat breakdowns.
    - `name`: The editor name (for example, VS Code or JetBrains).
    - `total_engaged_users`: Total engaged users for that editor.
    - `models`: A list of model-level chat breakdowns.
      - `name`: The model name.
      - `is_custom_model`: Whether the model is custom.
      - `total_engaged_users`: Total engaged users for the model.
      - `total_chats`: Total chat turns for the model.
      - `total_chat_copy_events`: Total copy events from chat responses.
      - `total_chat_insertion_events`: Total insertion events from chat responses.
- `copilot_ide_code_completions`: IDE code completion usage data.
  - `total_engaged_users`: Total engaged users in IDE completions.
  - `editors`: A list of editor-level completion breakdowns.
    - `name`: The editor name.
    - `total_engaged_users`: Total engaged users for that editor.
    - `models`: A list of model-level completion breakdowns.
      - `name`: The model name.
      - `is_custom_model`: Whether the model is custom.
      - `total_engaged_users`: Total engaged users for the model.
      - `languages`: A list of language-level completion metrics.
        - `name`: The programming language.
        - `total_engaged_users`: Total engaged users for that language.
        - `total_code_suggestions`: Total code suggestions.
        - `total_code_acceptances`: Total code acceptances.
        - `total_code_lines_suggested`: Total lines suggested.
        - `total_code_lines_accepted`: Total lines accepted.
  - `languages`: Optional top-level language summary for engaged users.
- `copilot_dotcom_chat`: Dotcom Chat usage summary (for example, `total_engaged_users`).
- `copilot_dotcom_pull_requests`: Dotcom Pull Request usage summary (for example, `total_engaged_users`).

```json
[
    {
        "date": "2025-01-25",
        "total_active_users": 0,
        "total_engaged_users": 0,
        "copilot_ide_chat": {
            "total_engaged_users": 0,
            "editors": [
                {
                    "name": "vscode",
                    "total_engaged_users": 0,
                    "models": [
                        {
                            "name": "default",
                            "is_custom_model": false,
                            "total_engaged_users": 0,
                            "total_chats": 0,
                            "total_chat_copy_events": 0,
                            "total_chat_insertion_events": 0
                        }
                    ]
                }
            ]
        },
        "copilot_ide_code_completions": {
            "total_engaged_users": 0,
            "editors": [
                {
                    "name": "JetBrains",
                    "total_engaged_users": 0,
                    "models": [
                        {
                            "name": "default",
                            "is_custom_model": false,
                            "total_engaged_users": 0,
                            "languages": [
                                {
                                    "name": "python",
                                    "total_engaged_users": 0,
                                    "total_code_suggestions": 0,
                                    "total_code_acceptances": 0,
                                    "total_code_lines_suggested": 0,
                                    "total_code_lines_accepted": 0
                                }
                            ]
                        }
                    ]
                }
            ],
            "languages": [
                {
                    "name": "python",
                    "total_engaged_users": 0
                }
            ]
        },
        // Note: Dotcom features were never implemented in ONS. These will always be 0.
        "copilot_dotcom_chat": {
            "total_engaged_users": 0
        },
        "copilot_dotcom_pull_requests": {
            "total_engaged_users": 0
        }
    },
    ...
]
```

## Pre-February 2025 Legacy Data

### Structure (Feb 25)

The structure of the legacy data for periods before February 2025 contains a list of daily usage records, where each record includes aggregated metrics for that day. The fields included in each record are as follows:

- `day`: The date of the record in YYYY-MM-DD format.
- `total_suggestions_count`: The total number of suggestions made by GitHub Copilot on that day (IDE Code Completions).
- `total_acceptances_count`: The total number of suggestions accepted by users on that day (IDE Code Completions).
- `total_lines_suggested`: The total number of lines of code suggested by GitHub Copilot on that day (IDE Code Completions).
- `total_lines_accepted`: The total number of lines of code accepted by users on that day (IDE Code Completions).
- `total_active_users`: The total number of unique users who received suggestions from GitHub Copilot on that day (IDE Code Completions).
- `total_chat_acceptances`: The total number of chat suggestions accepted by users on that day (IDE Chat).
- `total_chat_turns`: The total number of chat turns (sessions) initiated by users on that day (IDE Chat).
- `total_active_chat_users`: The total number of unique users who initiated chat sessions with GitHub Copilot on that day (IDE Chat).
- `breakdown`: A list of breakdowns
  - `language`: The programming language for which the metrics are recorded.
  - `editor`: The code editor or IDE used by the users (e.g., VSCode, JetBrains).
  - `suggestions_count`: The number of suggestions made for that specific language and editor combination.
  - `acceptances_count`: The number of suggestions accepted for that specific language and editor combination.
  - `lines_suggested`: The number of lines of code suggested for that specific language and editor combination.
  - `lines_accepted`: The number of lines of code accepted for that specific language and editor combination.
  - `active_users`: The number of unique users who received suggestions for that specific language and editor combination.

```json
[
    {
        "day": "2024-05-15",
        "total_suggestions_count": 0,
        "total_acceptances_count": 0,
        "total_lines_suggested": 0,
        "total_lines_accepted": 0,
        "total_active_users": 0,
        "total_chat_acceptances": 0,
        "total_chat_turns": 0,
        "total_active_chat_users": 0,
        "breakdown": [
            {
                "language": "python",
                "editor": "vscode",
                "suggestions_count": 0,
                "acceptances_count": 0,
                "lines_suggested": 0,
                "lines_accepted": 0,
                "active_users": 0
            },
        ]
    },
    ...
]
```
