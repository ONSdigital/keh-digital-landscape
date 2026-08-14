# Google Analytics

The Digital Landscape application integrates Google Analytics to track user behaviour and engagement metrics across the platform.

## Overview

Google Analytics provides insights into:

- **User engagement** - Page views, session duration, bounce rates
- **User demographics** - Geographic location, device type, browser information
- **Technical performance** - Page load times and responsiveness

## Setup

### Environment Configuration

Set `VITE_GA_MEASUREMENT_ID` in your `.env` file with your Google Analytics Measurement ID (format: `G-XXXXXXXXXX`).

**Deployment Environments:**

- **Development**: Google Analytics can be disabled or configured with a separate Measurement ID
- **Production**: Uses the primary production Measurement ID

### Key Files

- **`frontend/index.html`** - Google Analytics script tag

## Monitoring

Access the Google Analytics dashboard to view:

- Real-time visitor data
- User demographics and locations
- Top performing pages
- Session duration and bounce rates

