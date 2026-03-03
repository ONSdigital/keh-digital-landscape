#!/bin/sh
set -eu

apk add --no-cache jq

# Check if GitHub Access Token is set (it should be set within ci.yml and passed as an environment variable)
if [ -z "${token:-}" ]; then
	echo "Error: Token is not set."
	echo "This is needed to clone repositories from other organisations."
	exit 1
fi

echo "DEBUG: Token is $token" # This is for debugging and will be removed once we confirm the token is being passed correctly.

aws_account_id=$(echo "$secrets" | jq -r .aws_account_id)
aws_access_key_id=$(echo "$secrets" | jq -r .aws_access_key_id)

if [ -z "${secrets:-}" ]; then
	echo "Error: secrets is not set."
	exit 1
fi
if [ -z "${github_access_token:-}" ]; then
	echo "Error: github_access_token is not set."
	exit 1
fi
if [ -z "${tag:-}" ]; then
	echo "Error: tag is not set."
	exit 1
fi
if [ -z "${env:-}" ]; then
	echo "Error: env is not set."
	exit 1
fi

aws_secret_access_key=$(echo "$secrets" | jq -r .aws_secret_access_key)
github_app_id=$(echo "$secrets" | jq -r .github_app_id)

github_app_client_id=$(echo "$secrets" | jq -r .github_app_client_id)
github_app_client_secret=$(echo "$secrets" | jq -r .github_app_client_secret)

service_memory=$(echo "$secrets" | jq -r .service_memory)
service_cpu=$(echo "$secrets" | jq -r .service_cpu)

service_subdomain=$(echo "$secrets" | jq -r .service_subdomain)
domain=$(echo "$secrets" | jq -r .domain)

aws_secret_name=$(echo "$secrets" | jq -r .aws_secret_name)
github_org=$(echo "$secrets" | jq -r .github_org)

s3_bucket_name=$(echo "$secrets" | jq -r .s3_bucket_name)
api_s3_bucket_name=$(echo "$secrets" | jq -r .api_s3_bucket_name)

container_image_frontend=$(echo "$secrets" | jq -r .container_image_frontend)
container_image_backend=$(echo "$secrets" | jq -r .container_image_backend)

copilot_bucket_name=$(echo "$secrets" | jq -r .copilot_bucket_name)

support_mail=$(echo "$secrets" | jq -r .support_mail)
alerts_channel_id=$(echo "$secrets" | jq -r .alerts_channel_id)

# Cognito variables for AzureAD SAML
domain_extension=$(echo "$secrets" | jq -r .domain_extension)
enable_azuread_saml=$(echo "$secrets" | jq -r .enable_azuread_saml)
azure_ad_metadata_url=$(echo "$secrets" | jq -r .azure_ad_metadata_url)
azuread_provider_name=$(echo "$secrets" | jq -r .azuread_provider_name)

export AWS_ACCESS_KEY_ID="$aws_access_key_id"
export AWS_SECRET_ACCESS_KEY="$aws_secret_access_key"

git config --global url."https://x-access-token:${github_access_token}@github.com/".insteadOf "https://github.com/"

if [ "$env" != "prod" ]; then
	env="dev"
fi

echo "$env"

echo "Setting the Auth service"
cd resource-repo/terraform/authentication
terraform init -backend-config=env/"${env}"/backend-"${env}".tfbackend -reconfigure

terraform apply \
	-var "aws_account_id=${aws_account_id}" \
	-var "aws_access_key_id=${aws_access_key_id}" \
	-var "aws_secret_access_key=${aws_secret_access_key}" \
	-var "domain=${domain}" \
	-var "service_subdomain=${service_subdomain}" \
	-var "domain_extension=${domain_extension}" \
	-var 'sign_out_urls=["https://'"${service_subdomain}"."${domain}"."${domain_extension}"'/"]' \
	-var "azuread_provider_name=${azuread_provider_name}" \
	-var "enable_azuread_saml=${enable_azuread_saml}" \
	-var "azure_ad_metadata_url=${azure_ad_metadata_url}" \
	-auto-approve

echo "Set the Digital Landscape service"
cd ../service

# Update git to use other GitHub Token
git config --global --unset url."https://x-access-token:${github_access_token}@github.com/".insteadOf
git config --global url."https://x-access-token:${token}@github.com/".insteadOf "https://github.com/"

terraform init -backend-config=env/"${env}"/backend-"${env}".tfbackend -reconfigure

# The following terraform-apply may need to change if the environment variables change

terraform apply \
	-var "aws_account_id=$aws_account_id" \
	-var "aws_access_key_id=$aws_access_key_id" \
	-var "aws_secret_access_key=$aws_secret_access_key" \
	-var "domain=$domain" \
	-var "service_subdomain=$service_subdomain" \
	-var "github_app_id=$github_app_id" \
	-var "github_app_client_id=$github_app_client_id" \
	-var "github_app_client_secret=$github_app_client_secret" \
	-var "aws_secret_name=$aws_secret_name" \
	-var "github_org=$github_org" \
	-var "service_memory=$service_memory" \
	-var "service_cpu=$service_cpu" \
	-var "s3_bucket_name=$s3_bucket_name" \
	-var "api_s3_bucket_name=$api_s3_bucket_name" \
	-var "container_ver=$tag" \
	-var "container_ver_backend=$tag" \
	-var "frontend_ecr_repo=$container_image_frontend" \
	-var "backend_ecr_repo=$container_image_backend" \
	-var "copilot_bucket_name=$copilot_bucket_name" \
	-var "support_mail=$support_mail" \
	-var "alerts_channel_id=$alerts_channel_id" \
	-auto-approve
