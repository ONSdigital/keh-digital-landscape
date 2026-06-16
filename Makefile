.DEFAULT_GOAL := help

# The spacing and comments in this Makefile are intentionally formatted to
# allow the `make` command to display a nicely formatted list of available
# targets and their descriptions.

# Single hash symbols (#) are used for comments that are not displayed in
# the `make` output, while double hash symbols (##) are used for comments
# that are displayed when running `make` without any arguments or with the
# `make help` command.

# To add breaks between sections in the `make` output, simply add a comment line with
# double hash symbols and some spacing, as shown below.

## 
## -----------------------------------------------
## Makefile for KEH Digital Landscape
## -----------------------------------------------
## 

.PHONY: help
help: 			## This help message.
	@sed -ne '/@sed/!s/## //p' $(MAKEFILE_LIST)

## 

.PHONY: dev
dev: 			## Run the application
	@echo "Starting frontend and backend in development mode..."
	@trap 'kill %1 %2' SIGINT; \
	make frontend & make backend & wait

.PHONY: dev-ci
dev-ci: 		## Run the application in CI mode (without traps)
	make frontend & make backend & wait

.PHONY: frontend
frontend: 		## Start the frontend development server
	cd frontend && npm start

.PHONY: sso-login
sso-login: 		## Log in to AWS SSO
	aws sso login

.PHONY: data
data: sso-login		## Download seed data from S3 dev buckets into backend/data/
	aws s3 cp s3://sdp-dev-digital-landscape/onsRadarSkeleton.json backend/data/main/
	aws s3 cp s3://sdp-dev-digital-landscape/repositories.json backend/data/main/
	aws s3 cp s3://sdp-dev-digital-landscape/messages.json backend/data/main/
	aws s3 cp s3://sdp-dev-digital-landscape/directorates.json backend/data/main/
	aws s3 cp s3://sdp-dev-digital-landscape/AddressBook/addressBookEmailKey.json backend/data/main/AddressBook/
	aws s3 cp s3://sdp-dev-digital-landscape/AddressBook/addressBookIDKey.json backend/data/main/AddressBook/
	aws s3 cp s3://sdp-dev-digital-landscape/AddressBook/addressBookUsernameKey.json backend/data/main/AddressBook/
	aws s3 cp s3://sdp-dev-tech-audit-tool-api/new_project_data.json backend/data/tat/
	aws s3 cp s3://sdp-dev-tech-audit-tool-api/array_data.json backend/data/tat/
	aws s3 cp s3://sdp-dev-copilot-usage-dashboard/admin_teams.json backend/data/copilot/
	aws s3 cp s3://sdp-dev-copilot-usage-dashboard/organisation_history.json backend/data/copilot/
	aws s3 cp s3://sdp-dev-copilot-usage-dashboard/archive/pre-feb25/historic_usage_data_feb25.json backend/data/copilot/archive/pre-feb25/
	aws s3 cp s3://sdp-dev-copilot-usage-dashboard/archive/pre-mar26/copilot_teams.json backend/data/copilot/archive/pre-mar26/
	aws s3 cp s3://sdp-dev-copilot-usage-dashboard/archive/pre-mar26/historic_usage_data_mar26.json backend/data/copilot/archive/pre-mar26/
	aws s3 cp s3://sdp-dev-copilot-usage-dashboard/archive/pre-mar26/teams_history.json backend/data/copilot/archive/pre-mar26/

.PHONY: backend
backend: data		## Download seed data then start the backend development server
	cd backend && export NODE_ENV=development && npm run dev

## 

.PHONY: install
install: 		## Install production dependencies for both frontend and backend
	@echo "Installing backend production dependencies..."
	cd backend && npm ci --only=production
	@echo "Installing frontend production dependencies..."
	cd frontend && npm ci --only=production

.PHONY: install-dev
install-dev: 		## Install all dependencies (including dev) for both frontend and backend
	@echo "Installing backend dependencies (including dev)..."
	cd backend && npm install
	@echo "Installing frontend dependencies (including dev)..."
	cd frontend && npm install

## 

.PHONY: install-docs
install-docs: 		## Install documentation dependencies via Poetry
	@echo "Installing documentation dependencies via Poetry..."
	pip install poetry
	poetry install

.PHONY: serve-docs
serve-docs: 		## Serve the documentation locally via MkDocs
	@echo "Serving documentation locally via MkDocs..."
	poetry run mkdocs serve

.PHONY: lint-docs
lint-docs: 		## Lint the documentation Markdown files
	@echo "Linting documentation Markdown files..."
	npm install -g markdownlint-cli
	cd docs && markdownlint . --config ../.markdownlint.yaml

.PHONY: lint-docs-fix
lint-docs-fix: 		## Lint the documentation Markdown files and attempt to fix any issues
	@echo "Linting documentation Markdown files and attempting to fix any issues..."
	npm install -g markdownlint-cli
	cd docs && markdownlint . --fix --config ../.markdownlint.yaml

.PHONY: build-docs
build-docs: 		## Build the documentation site via MkDocs
	@echo "Building documentation site via MkDocs..."
	poetry run mkdocs build

## 

.PHONY: test-unit
test-unit:		## Run unit tests for both frontend and backend
	cd backend && npm test
	cd frontend && npm test

.PHONY: test-unit-frontend
test-unit-frontend:	## Run unit tests for the frontend only
	cd frontend && npm test

.PHONY: test-unit-backend
test-unit-backend:	## Run unit tests for the backend only
	cd backend && npm test

## 

.PHONY: test-ui
test-ui: 		## Run UI tests using Playwright
	cd testing/ui && make setup && make test-ui

.PHONY: test-accessibility
test-accessibility: 	## Run accessibility tests using Axe
	cd testing/accessibility && make setup && make test-accessibility

## 

.PHONY: lint
lint: 			## Run linters for both frontend and backend
	cd backend && npm run lint
	cd frontend && npm run lint

.PHONY: lint-fix
lint-fix: 		## Run linters with auto-fix for both frontend and backend
	cd backend && npm run lint:fix
	cd frontend && npm run lint:fix

.PHONY: format
format: 		## Run formatters for both frontend, backend and testing code
	cd backend && npm run format
	cd frontend && npm run format
	cd testing/accessibility && npm run format
	cd testing/ui && npm run format

.PHONY: format-check
format-check: 		## Run formatters to check for formatting issues across the repository without making any changes
	cd backend && npm run format:check
	cd frontend && npm run format:check
	cd testing/accessibility && npm run format:check
	cd testing/ui && npm run format:check
	
## 

.PHONY: terraform-fmt
terraform-fmt: 		## Run `terraform fmt` to format Terraform code in the `terraform` directory
	cd terraform && terraform fmt -recursive

.PHONY: terraform-fmt-check
terraform-fmt-check: 	## Run `terraform fmt` in check mode to identify any formatting issues in the Terraform code without making changes
	cd terraform && terraform fmt -recursive -check

.PHONY: terraform-validate
terraform-validate: 	## Run `terraform validate` to validate the Terraform configuration files in the `terraform` directory
	cd terraform/authentication && terraform init -backend=false && terraform validate
	cd terraform/service && terraform init -backend=false && terraform validate
	cd terraform/storage && terraform init -backend=false && terraform validate

## 

.PHONY: megalint-check
megalint-check: assert-docker 	## Run MegaLinter to check for linting and formatting issues across the repository without making any changes
	npx mega-linter-runner --env APPLY_FIXES=none

.PHONY: megalint-fix
megalint-fix: assert-docker 	## Run MegaLinter to attempt to fix any linting and formatting issues across the repository where possible
	npx mega-linter-runner --env APPLY_FIXES=all

# This target is uncommented so it stays hidden from the default `make` output.
# It is used to check that docker is installed and accessible before running the Megalinter commands above
# which rely on Docker to run the MegaLinter container. This'll provide a clearer error message if Docker is not available.
.PHONY: asset-docker
assert-docker:
	@docker --version > /dev/null 2>&1 || (echo "Docker is not installed or not accessible. Please install Docker and ensure it's running before using the megalint targets." && exit 1)
