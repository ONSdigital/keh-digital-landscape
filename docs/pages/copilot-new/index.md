# GitHub Copilot Usage Dashboard

The GitHub Copilot Usage Dashboard provides an overview of how GitHub Copilot is being used across the organisation.

## Overview

The GitHub Copilot API exposes a rich dataset covering multiple features and usage dimensions:

- **Agent feature usage**: adoption and interaction data for agent-based Copilot modes

- **Multiple Copilot Chat modes**: usage broken down across distinct chat interaction types

- **Cross-feature language and model breakdowns**: lines of code and interactions attributed to specific programming languages and AI models, not constrained to any single feature

The dashboard is structured as a **landing page with individual pages per feature**, allowing users to navigate to the level of detail they need without being overwhelmed upfront.

The landing page is designed around **progressive disclosure**: users see just enough summary information on each navigation card to understand what a page contains, and reveal deeper insights only when they choose to engage.

## Structure

| Section              | Route                  |
| -------------------- | ---------------------- |
| Landing Page         | `/copilot/home`        |
| General Usage        | `/copilot/general`     |
| IDE Code Completions | `/copilot/completions` |
| Copilot Chat         | `/copilot/chat`        |
| Agent Edits          | `/copilot/edits`       |
| Legacy Usage         | `/copilot/legacy`      |

## Features

### Landing Page

A navigation hub linking to each feature page. Each card displays summary data to give users an upfront indication of what the page contains, then navigates to the full detail on click.

### General Usage

An organisation-wide summary of Copilot adoption and usage patterns, covering metrics that span all Copilot features rather than being tied to one specific feature.

**Sections:**

- **User Adoption**: two progress bar cards showing Chat Mode and Agent Mode adoption as a percentage of total monthly active users. Figures are derived from the most recent day in the dataset.

- **Engaged Users Over Time**: a line chart of monthly unique active users across three series: All Active Users, Chat Users, and Agent Users. Incomplete months are excluded.

- **Model & IDE Usage**: two donut charts showing the share of user-initiated interactions by AI model and by development environment. Not constrained to any one Copilot feature. Entries below threshold are grouped into **Other** (7% for models, 1% for IDEs).

- **Code Impact by Language**: a donut chart showing the share of total lines added and deleted across all Copilot features, broken down by language. Not constrained to any one feature. Entries below 1% are grouped into **Other**.

### IDE Code Completions

A feature-focused dashboard for IDE code completion activity. This page follows the same architecture pattern as General Usage:

- **Page responsibilities**: route-level layout, back navigation, chart settings state, and data fetch/transform.

- **Dashboard responsibilities**: presentational rendering of summary cards and charts from processed props.

**Sections:**

- **Overall Usage**: three summary cards for total suggestion instances, total acceptances, and overall acceptance rate.

- **Card Animation**: summary card values animate on render using `useCountUp`.

- **Suggestions, Acceptances and Acceptance Rate**: a combined chart with selectable day/week/month aggregation. The day view can optionally exclude weekends.

- **Optional LoC Usage View**: a toggleable LoC section from the settings menu. When enabled, this reveals LoC summary cards (total lines suggested, total lines accepted, overall line acceptance rate) and a LoC suggestions/acceptances/acceptance-rate chart.

- **Suggestions vs Acceptances Size**: cards for average LoC per suggestion and average LoC per acceptance, plus a trend chart with the same day/week/month controls.

- **Language Breakdown**: pie chart of language share with selectable mode for suggestions vs acceptances.

### Agent Edits

A feature-focused dashboard for Agent Edit sessions. This page follows the same architecture pattern as the other Copilot feature pages:

- **Page responsibilities**: route-level layout, back navigation, chart settings state, and data fetch/transform.

- **Dashboard responsibilities**: presentational rendering of summary cards and charts from processed props.

**Sections:**

- **Overall Usage**: two summary cards for total lines added and total lines deleted.

- **Lines Added vs Lines Deleted**: a stacked bar chart with selectable day/week/month aggregation. The day view can optionally exclude weekends.

- **Breakdowns**: two donut charts for Language Breakdown and Model Breakdown, each with selectable mode for lines added vs lines deleted.

### Navigation and Routing

- Entry point from landing page: **General Usage**, **IDE Code Completions**, and **Agent Edits** cards on `/copilot/home`.

- Code Completions route: `/copilot/completions`.

- Agent Edits route: `/copilot/edits`.

- Back button behavior: returns from each feature page to `/copilot/home`.

### Legacy Usage

Historic Copilot data visualised as two separate datasets, as the GitHub API schema changed between periods and the available metrics differ.

Each dataset is visualised separately as the metrics are not directly comparable across periods.

- **January 2025 - March 2026** (March schema): IDE Code Completions metrics (suggestions, acceptances, lines suggested, lines accepted, acceptance rate) and IDE Chat metrics (chat turns, insertions, copies, insertion rate, copy rate), plus user metrics over time.

- **May 2024 - January 2025** (February schema): IDE Code Completions metrics and IDE Chat metrics (chat turns and chat acceptances), plus user metrics over time.

## Data Processing

All data is fetched from the backend and processed on the frontend. See the processing utilities for full detail:

- **General Usage**: `utilities/generalUsageCopilotData/processGeneralUsageCopilotData.js`

- **IDE Code Completions**: `utilities/codeCompletionCopilotdata/processCodeCompletionData.js`

- **Agent Edits**: `utilities/agentEditsData/processAgentEditsData.js`

- **Legacy Usage**: `utilities/legacyCopilotData/processLegacyCopilotData.js`

## Colour System

All charts use `COPILOT_CHART_PALETTE` from `constants/copilotConstants.js`, accessed via `getChartPalette()` in `utilities/copilotChartColours.js`. Colours are assigned by palette index so the same series always gets the same colour across charts on the same page.

See the [Copilot Constants documentation](../../constants/copilotConstants.md) for the full palette, ONS rationale, and guidance on extending it.

## Use Cases

- Track overall Copilot adoption across the organisation month by month.

- Understand which AI models and IDEs developers are using most.

- Identify which languages are seeing the most code impact from Copilot.

- View historic data to understand long-term trends in completions, chat usage, and user engagement.
