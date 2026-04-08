.DEFAULT_GOAL := help

## 
## -----------------------------------------------
## Makefile for Accessibility Testing
## -----------------------------------------------
## 

.PHONY: help
help: 			## This help message.
	@sed -ne '/@sed/!s/## //p' $(MAKEFILE_LIST)

## 

.PHONY: setup
setup: 			## Install dependencies and browsers for Playwright tests.
	PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 npm install && npx playwright install chromium

.PHONY: test-accessibility
test-accessibility: 	## Run the Playwright accessibility tests.
	npx playwright test

## 
