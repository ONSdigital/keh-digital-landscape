# Cognito Login

The application uses AWS Cognito for user authentication in deployed environments. This ensures secure access to the application and its features. Two authentication options are available:

1. **Cognito User Login**: Users authenticate directly using their Cognito credentials.
2. **Azure SSO Login**: Azure Single Sign-On (SSO) is integrated for seamless authentication. This feature is currently available in the dev environment, with plans to extend it to production.

## Login Screen

The login screen provides users with the option to authenticate using either Cognito credentials or Azure SSO. Dev environment allows for both methods while Prod environment is exclusively through the Azure Idp SSO. Upon successful login, users are redirected to the application, and their session is securely managed.

## Running Locally

When running the application locally, Cognito authentication is bypassed. Instead, the backend uses a developer user for authentication.

By default, the developer user is set to:

- **Email**: `dev@ons.gov.uk`
- **Groups**: `admin`, `reviewer`

The application will run without requiring Cognito login.

## Notes

- Ensure the Cognito User Pool is configured with the necessary users and groups for deployed environments.
- Azure SSO integration is available in the development environment and production. (See playbook for more information).
- The application uses Cognito tokens to manage sessions and permissions in production.
