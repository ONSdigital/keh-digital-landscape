.DEFAULT_GOAL := help

## 
## -----------------------------------------------
## Makefile for UI Testing
## -----------------------------------------------
## 

.PHONY: help
help: 			## This help message.
	@sed -ne '/@sed/!s/## //p' $(MAKEFILE_LIST)

## 

.PHONY: setup
setup: 			## Install dependencies and browsers for Playwright tests.
	PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 npm install && npx playwright install chromium

.PHONY: test-ui
test-ui: 		## Run the Playwright UI tests.
	npx playwright test

## 
