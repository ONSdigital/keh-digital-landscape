# Digital Landscape

![Digital Landscape Thumbnail](./assets/readme-thumbnail.png)

![GitHub License](https://img.shields.io/github/license/ONSdigital/keh-digital-landscape)
![GitHub Release](https://img.shields.io/github/v/release/ONSdigital/keh-digital-landscape)

[![Testing](https://github.com/ONSdigital/keh-digital-landscape/actions/workflows/ci-test.yml/badge.svg)](https://github.com/ONSdigital/keh-digital-landscape/actions/workflows/ci-test.yml)
[![Linting and Formatting](https://github.com/ONSdigital/keh-digital-landscape/actions/workflows/ci-fmt.yml/badge.svg)](https://github.com/ONSdigital/keh-digital-landscape/actions/workflows/ci-fmt.yml)
[![MegaLinter](https://github.com/ONSdigital/keh-digital-landscape/actions/workflows/mega-linter.yml/badge.svg)](https://github.com/ONSdigital/keh-digital-landscape/actions/workflows/mega-linter.yml)

[![Documentation CI](https://github.com/ONSdigital/keh-digital-landscape/actions/workflows/ci-docs.yml/badge.svg)](https://github.com/ONSdigital/keh-digital-landscape/actions/workflows/ci-docs.yml)
[![Deploy Documentation](https://github.com/ONSdigital/keh-digital-landscape/actions/workflows/deploy-docs.yml/badge.svg)](https://github.com/ONSdigital/keh-digital-landscape/actions/workflows/deploy-docs.yml)

[![CodeQL](https://github.com/ONSdigital/keh-digital-landscape/actions/workflows/github-code-scanning/codeql/badge.svg)](https://github.com/ONSdigital/keh-digital-landscape/actions/workflows/github-code-scanning/codeql)
![Dependabot](https://github.com/ONSdigital/keh-digital-landscape/actions/workflows/dependabot/dependabot-updates/badge.svg)

## Overview

The Digital Landscape is a tool that provides insights into the technologies used across ONS to help make informed decisions about technology adoption and usage.
The Landscape provides a range of utilities including:

- **Tech Radar:** A visual representation of the technologies used across ONS, categorised into Adopt, Trial, Assess or Hold based on their maturity and suitability for use within ONS.
- **Projects:** A list of projects within ONS and the technologies they use, allowing for better visibility and the ability to identify potential areas for technology consolidation or standardisation.
- **Statistics:** A collection of statistics about the language breakdown within the ONSDigital GitHub Organisation, providing insights into the most commonly used languages and their usage trends.
- **GitHub Copilot Usage Metrics:** Provides insights into the usage of GitHub Copilot across ONS, including organisation-wide statistics.
- **GitHub Address Book:** A mechanism to find the ONS staff members based on their GitHub username and vice versa, to facilitate communication and collaboration within ONS.

For more information about the project, please refer to our documentation site: [Digital Landscape Documentation](https://onsdigital.github.io/keh-digital-landscape/).

## Tech Radar Submissions

To submit a technology to be changed or added to the Tech Radar, please visit the [Tech Radar Submissions](https://github.com/ONSdigital/keh-tech-radar-submissions) repository (_internal only_).

## Contents

- [Digital Landscape](#digital-landscape)
  - [Overview](#overview)
  - [Tech Radar Submissions](#tech-radar-submissions)
  - [Contents](#contents)
  - [Prerequisites](#prerequisites)
  - [Makefile](#makefile)
  - [Running the Project](#running-the-project)
      - [Local Development Data](#local-development-data)
      - [Local Authentication](#local-authentication)
      - [Alerts (Azure Webhook) _(Optional)_](#alerts-azure-webhook-optional)
         - [Backend endpoint](#backend-endpoint)
         - [Backend configuration (environment variables)](#backend-configuration-environment-variables)
         - [Frontend configuration (environment variables)](#frontend-configuration-environment-variables)
         - [Frontend usage](#frontend-usage)
  - [Deployment](#deployment)
    - [Deployment with Concourse](#deployment-with-concourse)
      - [Allowlisting your IP](#allowlisting-your-ip)
      - [Setting up a pipeline](#setting-up-a-pipeline)
      - [Prod deployment](#prod-deployment)
      - [Triggering a pipeline](#triggering-a-pipeline)
      - [Destroying a pipeline](#destroying-a-pipeline)
    - [Manual Deployment](#manual-deployment)
      - [Terraform Structure](#terraform-structure)
      - [Deploying the Service (`terraform/service`)](#deploying-the-service-terraformservice)
        - [Updating the ECR image](#updating-the-ecr-image)
        - [Applying the Terraform configuration](#applying-the-terraform-configuration)
  - [Documentation](#documentation)
    - [GitHub Actions for Documentation](#github-actions-for-documentation)
    - [Local Development of Documentation](#local-development-of-documentation)
  - [Linting and Testing](#linting-and-testing)
    - [GitHub Actions](#github-actions)
    - [Running Tests and Linters Locally](#running-tests-and-linters-locally)
      - [Application Tests](#application-tests)
        - [Unit Tests](#unit-tests)
          - [Unit Test Structure](#unit-test-structure)
        - [UI and Accessibility Tests](#ui-and-accessibility-tests)
      - [Application Linting and Formatting](#application-linting-and-formatting)
      - [MegaLinter](#megalinter)
      - [Documentation Linting and Building](#documentation-linting-and-building)

## Prerequisites

- Node.js (v24.1.0 recommended)
  - It is recommended to use Node Version Manager (nvm) to manage Node.js versions
- Python (v3.10 or higher recommended)
  - It is recommended to use Python's built-in venv module to manage virtual environments alongside Poetry for dependency management
- Fly CLI (for Concourse deployments)
- Make (for using the Makefile commands)

## Makefile

This repository uses a Makefile to simplify common tasks. To see the available commands, run the following command:

```bash
make help
```

## Running the Project

To run the project locally, do the following:

1. Install frontend and backend dependencies:

   ```bash
   make install-dev
   ```

2. Sign in with AWS SSO, and export the correct profile for this service:

   ```bash
   aws sso login

   export AWS_PROFILE=keh-digital-landscape
   ```

   This allows you to assume the AWS IAM role for the service, enabling the most secure development experience. This also means you will have limited permissions until you exit out of the profile.

   **Note:** See the Developer Onboarding Guide on the "Using AWS SSO for Local Development" page on Confluence to set up service profile selection on your local machine.

   Alternatively, you can use the `.env.example` files. Copy the `.env.example` files to `.env` in both the frontend and backend directories and fill in the values.

   **Security reminder to not commit secrets. Do not put the secrets in the `.env.example` files.**

3. Run the project:

   ```bash
   make dev
   ```

   This starts the frontend and backend in parallel. As part of the backend
   startup flow, `make dev` also runs AWS SSO login, downloads the latest seed
   data into `backend/data`, sets `NODE_ENV=development`, and then starts the
   backend locally. The frontend and backend run on ports 3000 and 5001
   respectively.

   Sometimes it can be useful to run the frontend and backend separately (i.e. to separate the logs). This can be done with the following commands (each in their own terminal):

   ```bash
   make frontend # runs the frontend only

   make backend # runs the backend only
   ```

   **Note:** If running in separate terminals, ensure the environment variables are exported in both terminals.

4. To exit the profile:

   ```bash
   unset AWS_PROFILE
   ```

### Local Development Data

When the backend runs in local development (`NODE_ENV=development`), it reads seed data from `backend/data` instead of the deployed AWS S3 buckets.

The local data is grouped into the following directories:

- `backend/data/main`: Digital Landscape data such as `directorates.json`, `messages.json`, `onsRadarSkeleton.json`, `repositories.json`, and the `AddressBook` lookup files.
- `backend/data/tat`: Tech Audit Tool data including `new_project_data.json` and `array_data.json`.
- `backend/data/copilot`: Copilot usage data including `admin_teams.json`, `organisation_history.json`, and archived historic usage snapshots.

If you want to refresh the local seed data without starting the application, run the following command:

```bash
make data
```

### Local Authentication

When running the backend locally, it bypasses the Application Load Balance (ALB) authentication which is applied within AWS. Instead, the backend makes use of a `developer` user that is found in the `backend/src/services/cognitoService.js` file with the helper function `getDevUser()`.

This defaults the dev user to `dev@ons.gov.uk` with both `admin` and `reviewer` groups for respective access to each page on the frontend. Should you want to run locally with the dev user having different groups, you can use for following environment variable:

```bash
export DEV_USER_GROUPS=group1,group2
```

### Alerts (Azure Webhook) _(Optional)_

The application supports sending alerts from the frontend to the backend, which then authenticates to Azure and forwards the alert payload to an Azure webhook.
Additional information can be found in the alerts documentation: [Alerts Documentation](./docs/functionality/alerts.md).

**Note:** These are _optional_ to setup when running the project locally.

#### Backend endpoint

**POST** `/alerts/api/alert`

- **Content-Type:** `application/json`
- **Body:** JSON object. The backend forwards this object to the Azure webhook as JSON.

Example request:

```bash
curl -X POST http://localhost:5001/alerts/api/alert \
  -H "Content-Type: application/json" \
  -d '{"channel":"<channel-id>","message":"Radar page failed to load"}'
```

#### Backend configuration (environment variables)

The backend needs Azure credentials and the webhook target.

The required variables:

- `AZURE_TENANT_ID`
- `AZURE_CLIENT_ID`
- `AZURE_CLIENT_SECRET`
- `WEBHOOK_SCOPE`
- `WEBHOOK_URL` (the URL of the Azure webhook endpoint)

Set these in `backend/.env` (see `backend/.env.example`). **Security reminder to not commit secrets.**

#### Frontend configuration (environment variables)

The frontend needs to know which channel to send the alert to, and the URL of the backend to send the alert to.

The required variables:

- `VITE_BACKEND_URL` (i.e. `http://localhost:5001` for local development)
- `VITE_ALERTS_CHANNEL_ID` (the channel identifier used by the Azure webhook to route the alert to the correct channel)

Set these in `frontend/.env` (see `frontend/.env.example`). **Security reminder to not commit secrets.**

#### Frontend usage

Frontend pages call the alert endpoint using the helper:

`frontend/src/components/Alerts/Alerts.js`

Example:

```js
import sendAlert from '../components/Alerts/Alerts';

// ...
try {
  // ...
} catch (err) {
  await sendAlert(
    'Error 🚨',
    err?.message || String(err),
    'Failed to fetch data for the Radar page'
  );
}
```

## Deployment

### Deployment with Concourse

#### Allowlisting your IP

To setup the deployment pipeline with concourse, you must first allowlist your IP address on the Concourse server. IP addresses are flushed everyday at 00:00 so this must be done at the beginning of every working day whenever the deployment pipeline needs to be used.

Instructions on this are available within **KEH's Confluence Space**.

All pipelines run within the `sdp-pipeline-prod` AWS account, whereas `sdp-pipeline-dev` is the account used for testing changes to the Concourse instance itself (i.e. configuration changes, not pipeline changes).

#### Setting up a pipeline

Our pipelines use the `ecs-infra-user` IAM user within AWS to interact with our infrastructure.
Credentials/secrets for pipelines are stored within AWS Secrets Manager on the `sdp-pipeline-prod` account, so you do not need to set up anything yourself.

To set the pipeline, run the following script:

```bash
chmod u+x ./concourse/scripts/set_pipeline.sh
./concourse/scripts/set_pipeline.sh
```

**Note:** You only have to run `chmod` the first time running the script in order to give permissions.

This script will set the branch and pipeline name to whatever branch you are currently on.
It will also set the image tag on ECR to 7 characters of the current branch name if running on a branch other than `main`.
For `main`, the ECR tag will be the latest release tag on the repository that has semantic versioning(vX.Y.Z).

The pipeline name itself will usually follow a pattern as follows:

- `digital-landscape-<branch-name>` for any non-main branch.
  - When following our branching strategy, pipelines are normally postfixed with the Jira ticket number, e.g. `digital-landscape-KEH-1234`.
- `digital-landscape` for the main/master branch.

#### Prod deployment

To deploy to prod, it is required that a Github Release is made on Github. The release is required to follow semantic versioning of vX.Y.Z.

A manual trigger is to be made on the pipeline name `digital-landscape > deploy-after-github-release` job through the Concourse CI UI. This will create a `github-create-tag` resource that is required on the `digital-landscape > build-and-push-prod` job. Then the prod deployment job is also through a manual trigger ensuring that prod is only deployed using the latest GitHub release tag in the form of vX.Y.Z and is manually controlled.

More information on our typical deployment patterns in Concourse can be found in our Confluence space.

#### Triggering a pipeline

Once the pipeline has been set, you can manually trigger a dev build on the Concourse UI, or run the following command for non-main branch deployment:

```bash
fly -t aws-sdp trigger-job -j digital-landscape-<branch-name>/build-and-push-dev
```

and for main branch deployment:

```bash
fly -t aws-sdp trigger-job -j digital-landscape/build-and-push-dev
```

#### Destroying a pipeline

To destroy the pipeline, run the following command:

```bash
fly -t aws-sdp destroy-pipeline -p digital-landscape-<branch-name>
```

**It is unlikely that you will need to destroy a pipeline, but the command is here if needed.**

**Note:** This will not destroy any resources created by Terraform. You must manually destroy these resources using Terraform.

### Manual Deployment

**Note:** All deployments of the Digital Landscape should be done through Concourse. Manual deployments should only be done in exceptional circumstances.

#### Terraform Structure

There are 3 Terraform configurations that need to be applied in order to deploy the service:

1. `terraform/storage`: This creates the S3 bucket for storing the frontend assets and the Terraform state file.
2. `terraform/authentication`: This creates the Cognito User Pool for user authentication.
3. `terraform/service`: This creates the backend and frontend services, as well as the necessary AWS resources for the service to run (e.g. ECS cluster, ALB, etc).

When deploying the new service and its resources, it must be deployed in the above order (storage, authentication, service).

#### Deploying the Service (`terraform/service`)

There are 2 main steps to deploying the service:

1. Updating the ECR image.
2. Applying the Terraform configuration.

For other modules (i.e. storage, authentication), only step 2 is required.

##### Updating the ECR image

When changes are made within the codebase, the code needs to be containerised and pushed to ECR for the Terraform configuration to pull the latest image and deploy it.

Dockerfiles for both the frontend and backend are located in the root of each respective directory (`/frontend/Dockerfile` and `/backend/Dockerfile`).

All of the push commands below are available for your environment within the AWS Console. Navigate to ECR > `repository-name` > View push commands.

**Note:** Before running the push commands from ECR, ensure that you have exported the AWS credentials:

```bash
export AWS_ACCESS_KEY_ID=<your_access_key>
export AWS_SECRET_ACCESS_KEY=<your_secret_key>
```

##### Applying the Terraform configuration

With the image updated in ECR, the Terraform configuration can be applied. Navigate to the `terraform/service` directory and do the following:

1. Fill out `.tfvars` files.
   - `env/dev/dev.tfvars` for dev environment.
   - `env/prod/prod.tfvars` for prod environment.

   These files can be created based on the respective `example_tfvars.txt` files in the same directories.

   **Note:** Do not commit the `.tfvars` files to the repository and do not put the secrets in the `example_tfvars.txt` files.

2. Initialise Terraform:

   ```bash
   terraform init -backend-config=env/<environment>/backend-<environment>.tfbackend -reconfigure
   ```

3. Refresh Terraform state:

   ```bash
   terraform refresh -var-file=env/<environment>/<environment>.tfvars
   ```

4. Apply the Terraform configuration:

   ```bash
   terraform apply -var-file=env/<environment>/<environment>.tfvars
   ```

**Note:** Replace `<environment>` with either `dev` or `prod` depending on which environment you are deploying to.

**Manual production deployments should only be done via Concourse, unless absolutely necessary.**

## Documentation

This repository uses [MkDocs](https://www.mkdocs.org/) for documentation. The documentation source files are located in the `docs` directory.

### GitHub Actions for Documentation

MkDocs gets deployed to GitHub Pages using GitHub Actions. The workflow for this is located at `.github/workflows/deploy-docs.yml`.
Before deployment, another GitHub Action workflow runs to check that the documentation builds correctly and has no linting or formatting issues.
This workflow is located at `.github/workflows/ci-docs.yml`.

### Local Development of Documentation

To run the documentation locally:

1. Create and activate a Python virtual environment **(optional but recommended)**:

   ```bash
   python -m venv venv
   source venv/bin/activate
   ```

2. Install the required dependencies:

   ```bash
   make install-docs
   ```

   **Note:** This will install the dependencies for MkDocs and any MkDocs plugins we use. If a virtual environment is not activated, poetry will configure its own virtual environment.

3. Run the MkDocs development server.

   ```bash
   make serve-docs
   ```

## Linting and Testing

### GitHub Actions

This repository has GitHub Actions workflows setup for linting, testing and other CI jobs. The workflows are located at:

- `.github/workflows/ci-docs.yml`: For documentation linting and build checks.
- `.github/workflows/ci-fmt.yml`: For code formatting checks using Prettier (and `terraform fmt` for Terraform).
- `.github/workflows/ci-lint.yml`: For code linting checks using ESLint.
- `.github/workflows/deploy-docs.yml`: For deploying the documentation to GitHub Pages.
- `.github/workflows/mega-linter.yml`: For running MegaLinter checks across the repository.

### Running Tests and Linters Locally

#### Application Tests

The application has the following tests:

- Unit tests for both the frontend and backend (Vitest).
- UI tests for the frontend (Playwright).
- Accessibility tests for the frontend (Playwright / axe-core).

##### Unit Tests

Unit tests for both the frontend and backend are written using Vitest. To run the unit tests, do the following:

1. Ensure you have installed the development dependencies:

   ```bash
   make install-dev
   ```

2. Run the unit tests:

   ```bash
   make test-unit
   ```

This will run all unit tests for both the frontend and backend. If you want to run the unit tests separately, you can use the following commands:

```bash
make test-unit-frontend # runs frontend unit tests only
make test-unit-backend # runs backend unit tests only
```

###### Unit Test Structure

Within the frontend/backend directories, the tests are located in the `src` directory alongside the code they are testing.

This helps ensure tests are easily discoverable and maintainable, as they are co-located with the code they are testing. It also helps to encourage writing tests for new code, as the test files are right there when creating new code files.

For example:

```
frontend/
├── src/
│   ├── components/
│   │   ├── MyComponent.js
│   │   └── MyComponent.test.js
│   ├── pages/
│   │   ├── MyPage.js
│   │   └── MyPage.test.js
│   ├── App.js
│   └── App.test.js

etc...

backend/
├── src/
│   ├── routes/
│   │   ├── myRoute.js
│   │   └── myRoute.test.js
│   ├── services/
│   │   ├── myService.js
│   │   └── myService.test.js
│   ├── index.js
│   └── index.test.js
```

##### UI and Accessibility Tests

Further information on how to run the UI and Accessibility tests can be found in the README files within the respective directories:

- UI Tests: [`./testing/ui/README.md`](./testing/ui/README.md)
- Accessibility Tests: [`./testing/accessibility/README.md`](./testing/accessibility/README.md)

Both can be run from the root of the repository with the following commands:

```bash
make test-ui
make test-accessibility
```

This will simply run the setup and test commands for both UI and Accessibility tests respectively, as defined in their own Makefiles.

#### Application Linting and Formatting

The application uses ESLint for linting and Prettier for formatting. To run the linters and formatters, do the following:

1. Ensure you have installed the development dependencies:

   ```bash
   make install-dev
   ```

2. Run the linters and formatters:

   ESLint:

   ```bash
   make lint      # This will only check for linting issues and not fix them.
   make lint-fix  # This will check for linting issues and fix them where possible.
   ```

   Prettier:

   ```bash
   make format       # This will automatically format the code using Prettier.
   make format-check # This will check if the code is formatted correctly without making any changes.
   ```

#### MegaLinter

This repository uses MegaLinter for comprehensive linting across multiple languages and file types.
We use this so that all additional assets in the repository (e.g. YAML files, Markdown files, etc.) are also linted and checked for formatting issues, without having to set up specific linters for each file type.

To run MegaLinter, do the following:

```bash
make megalint-check # This will run MegaLinter and check for any linting or formatting issues without making any changes.
make megalint-fix   # This will run MegaLinter and attempt to fix any linting or formatting issues where possible.
```

**Note:** MegaLinter can be quite slow to run, especially the `fix` command, as it runs multiple linters and formatters under the hood. It is recommended to let Megalinter run via GitHub Actions and address any issues that arise there, rather than running it locally.

#### Documentation Linting and Building

This repository uses Markdownlint for linting the documentation. To run the Markdownlint, do the following:

1. Install Markdownlint:

   ```bash
   npm install -g markdownlint-cli
   ```

2. Run Markdownlint:

   ```bash
   make lint-docs      # This will only check for linting issues and not fix them.
   make lint-docs-fix  # This will check for linting issues and fix them where possible.
   ```

To test that the documentation builds correctly with MkDocs, run the following command:

```bash
make build-docs
```

**Note:** This depends on MkDocs being set up for the repository. Instructions for setting up MkDocs can be found in the [Documentation](#documentation) section of this README.
