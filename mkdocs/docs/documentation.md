# Documentation

This site uses MkDocs to build its documentation and GitHub Pages for hosting.

## Format

Documentation within this project follows the following pattern:

- A `README.md` for each component
- A `/docs` folder for the project

Each `README.md` should contain:

- A description of what the component is/does
- A list of any prerequisites
- Setup instructions
- Execution instructions
- Deployment instructions

The `/docs` folder should contain:

- A description of what the project is
- An overview of how the everything fits together in the project
- An explanation of the tech stack
- Details of the underlying dataset

A majority of the information should reside within the `/docs` directory over the `README`. The `README`s in this project should be kept for concise instructions on how to use each component. Any detailed explanation should be kept within `/docs`.

## Getting MkDocs Setup

In order to build an MkDocs deployment or serve the documentation locally, we need to install MkDocs and its dependencies.

1. Navigate into the mkdocs directory.

2. Activate the virtual environment.

   ```bash
   source venv/bin/activate
   ```

3. Install MkDocs and its dependencies.

   ```bash
   pip install -r mkdocs_requirements.txt
   ```

4. You can now use MkDocs. To see a list of commands run the following:

   ```bash
   mkdocs --help
   ```

**Please Note:** Python's package manager, PIP, is required to install MkDocs. Please make sure you have Python installed beforehand.

## Updating MkDocs Deployment

### GitHub Action to Deploy Documentation

A GitHub Action is set up to automatically deploy the documentation to GitHub Pages whenever a commit is made to the `main` branch. This action is triggered by a push event to the `main` branch and runs the `mkdocs gh-deploy` command to build and deploy the documentation.

## Cognito Login

The application uses AWS Cognito for user authentication in deployed environments. This ensures secure access to the application and its features. Two authentication options are available:

1. **Cognito User Login**: Users authenticate directly using their Cognito credentials.
2. **Azure SSO Login**: Azure Single Sign-On (SSO) is integrated for seamless authentication. This feature is currently available in the dev environment, with plans to extend it to production.

### Login Screen

The login screen provides users with the option to authenticate using either Cognito credentials or Azure SSO. Upon successful login, users are redirected to the application, and their session is securely managed.

### Running Locally

When running the application locally, Cognito authentication is bypassed. Instead, the backend uses a developer user for authentication.

By default, the developer user is set to:

- **Email**: `dev@ons.gov.uk`
- **Groups**: `admin`, `reviewer`

The application will run without requiring Cognito login.

### Notes

- Ensure the Cognito User Pool is configured with the necessary users and groups for deployed environments.
- Azure SSO integration is currently available in the development environment and will be extended to production in future updates.
- The application uses Cognito tokens to manage sessions and permissions in production.