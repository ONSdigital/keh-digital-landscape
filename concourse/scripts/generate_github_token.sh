#!/bin/sh

set -eu

# This script is used to generate a GitHub token for a given GitHub App
# It retrieves the App ID and Private Key from the environment and
# then uses them to generate a token which is printed to the console

# Get App ID from environment variable
if [ -z "${GITHUB_CLIENT_ID:-}" ]; then
	echo "GITHUB_CLIENT_ID environment variable is not set. Please set it and try again."
	exit 1
fi

# Get the Private Key name from environment variable
if [ -z "${GITHUB_APP_PRIVATE_KEY_SECRET_NAME:-}" ]; then
	echo "GITHUB_APP_PRIVATE_KEY_SECRET_NAME environment variable is not set. Please set it and try again."
	exit 1
fi

# Get the App Organisation from environment variable
if [ -z "${GITHUB_APP_ORG:-}" ]; then
	echo "GITHUB_APP_ORG environment variable is not set. Please set it and try again."
	exit 1
fi

client_id="${GITHUB_CLIENT_ID}"
private_key_secret_name="${GITHUB_APP_PRIVATE_KEY_SECRET_NAME}"
github_org="${GITHUB_APP_ORG}"

# Check the AWS credentials are set
if [ -z "${AWS_ACCESS_KEY_ID:-}" ] || [ -z "${AWS_SECRET_ACCESS_KEY:-}" ]; then
	echo "AWS credentials are not set. Please set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY environment variables and try again."
	exit 1
fi

# Get the private key from AWS Secrets Manager
private_key=$(aws secretsmanager get-secret-value --secret-id "${private_key_secret_name}" --query SecretString --output text)
pem=$(printf '%b' "${private_key}")

# Generate the GitHub token using the App ID and Private Key

# GitHub provide docs for this:
# https://docs.github.com/en/apps/creating-github-apps/authenticating-with-a-github-app/generating-an-installation-access-token-for-a-github-app#generating-an-installation-access-token

## 1. Make a JWT

now=$(date +%s)
iat=$((now - 60))  # Issues 60 seconds in the past
exp=$((now + 600)) # Expires 10 minutes in the future

b64enc() { openssl base64 | tr -d '=' | tr '/+' '_-' | tr -d '\n'; }

header_json='{
    "typ":"JWT",
    "alg":"RS256"
}'
# Header encode
header=$(printf '%s' "${header_json}" | b64enc)

payload_json="{
    \"iat\":${iat},
    \"exp\":${exp},
    \"iss\":\"${client_id}\"
}"
# Payload encode
payload=$(printf '%s' "${payload_json}" | b64enc)

# Signature
header_payload="${header}"."${payload}"
tmp_key="$(mktemp)"
trap 'rm -f "$tmp_key"' EXIT

printf '%s' "${pem}" >"${tmp_key}"

signature=$(printf '%s' "${header_payload}" | openssl dgst -sha256 -sign "${tmp_key}" | b64enc)

# Create JWT
JWT="${header_payload}"."${signature}"

## 2. Get Installation ID

installation_id_response=$(curl -L \
	-H "Accept: application/vnd.github+json" \
	-H "Authorization: Bearer ${JWT}" \
	-H "X-GitHub-Api-Version: 2022-11-28" \
	"https://api.github.com/orgs/${github_org}/installation")

installation_id=$(echo "${installation_id_response}" | jq -r '.id')

## 3. Get Access Token

token_response=$(curl --request POST \
	--url "https://api.github.com/app/installations/${installation_id}/access_tokens" \
	--header "Accept: application/vnd.github+json" \
	--header "Authorization: Bearer ${JWT}" \
	--header "X-GitHub-Api-Version: 2022-11-28")

token=$(echo "${token_response}" | jq -r '.token')

## 4. Output the token so it can be used by the Concourse pipeline

echo "${token}"
