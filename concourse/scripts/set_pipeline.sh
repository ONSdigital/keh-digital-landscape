#!/bin/bash
set -eo pipefail
# Usage: ./set_pipeline.sh

# Define repository name
repo_name="digital-landscape"
# Always use the current branch
branch=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || {
	echo "Failed to get branch name"
	exit 1
})

if ! git rev-parse --verify "${branch}" >/dev/null 2>&1; then
	echo "Branch \"${branch}\" does not exist. Cannot set a pipeline without a valid branch."
	exit 1
fi

# Name the pipeline based on the branch
if [[ ${branch} == "main" || ${branch} == "master" ]]; then
	pipeline_name=${repo_name}
else
	# Remove non-alphanumeric characters and take the first 7 characters
	sanitized_branch=$(echo "${branch}" | tr -cd '[:alnum:]' | cut -c1-7)
	pipeline_name=${repo_name}-${sanitized_branch}
fi

# Get GitHub App stuff

## Get Client ID from environment variable

if [[ -z "${GITHUB_CLIENT_ID}" ]]; then
	echo "GITHUB_CLIENT_ID environment variable is not set. Please set it and try again."
	exit 1
fi
github_client_id="${GITHUB_CLIENT_ID}"

## Get the Private Key from AWS Secrets Manager

### Check if the environment variable for the secret name is set

if [[ -z "${GITHUB_APP_PRIVATE_KEY_SECRET_NAME}" ]]; then
	echo "GITHUB_APP_PRIVATE_KEY_SECRET_NAME environment variable is not set. Please set it and try again."
	exit 1
fi
private_key_secret_name="${GITHUB_APP_PRIVATE_KEY_SECRET_NAME}"

fly -t aws-sdp set-pipeline -c concourse/ci.yml -p "${pipeline_name}" -v branch="${branch}" -v repo_name="${repo_name}" -v env=dev -v github_client_id="${github_client_id}" -v github_app_private_key_secret_name="${private_key_secret_name}" -v github_app_org="ONSdigital"

echo "Pipeline \"${pipeline_name}\" set successfully."
