# Adding New Pages

This guide walks through all the changes required to add a new page to the application, covering both the frontend and backend. The [GitHub Policy Reports page](../../frontend/src/pages/PolicyReportsPage.js) is used as a worked example throughout.

---

## Overview

Adding a new page involves five steps:

- [Adding New Pages](#adding-new-pages)
  - [Overview](#overview)
  - [1. Backend Route and Service](#1-backend-route-and-service)
    - [Service](#service)
    - [Route](#route)
  - [2. Register the Backend Route](#2-register-the-backend-route)
  - [3. Vite Dev Proxy](#3-vite-dev-proxy)
  - [4. Frontend Page Component](#4-frontend-page-component)
    - [Utility (data fetching)](#utility-data-fetching)
    - [Page component](#page-component)
    - [Stylesheet](#stylesheet)
  - [5. Router and Navigation](#5-router-and-navigation)
    - [Router (`App.js`)](#router-appjs)
    - [Navigation (`navigationConstants.js`)](#navigation-navigationconstantsjs)
  - [Checklist](#checklist)

---

## 1. Backend Route and Service

### Service

Create a service file at `backend/src/services/<featureName>Service.js`. The service is responsible for data fetching, transformation, or any business logic - keeping route handlers thin.

```js
// backend/src/services/policyReportsService.js

const getPolicyReportOrganisationOptions = async () => {
  return {
    organisationOptions: ['ONSdigital', 'ONS-Innovation'],
    // ...
  };
};

module.exports = { getPolicyReportOrganisationOptions };
```

### Route

Create a route file at `backend/src/routes/<featureName>.js`. Import the service and define your Express router. Always return `res.json(...)` for successful responses and `res.status(500).json({ error: 'Internal Server Error' })` on failure - never let raw error messages reach the client.

```js
// backend/src/routes/policyReports.js

const logger = require('../config/logger');
const express = require('express');
const {
  getPolicyReportOrganisationOptions,
} = require('../services/policyReportsService');

const router = express.Router();

// GET /config
router.get('/config', async (req, res) => {
  try {
    const config = await getPolicyReportOrganisationOptions();
    return res.status(200).json(config);
  } catch (error) {
    logger.error('Error fetching policy report configuration', {
      error: error.message,
    });
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
```

---

## 2. Register the Backend Route

In `backend/src/index.js`, import the new routes module and mount it under an appropriate path prefix using the relevant rate limiter.

Available rate limiters (defined in `backend/src/config/rateLimiter.js`):

| Limiter                   | Intended use                                 |
| ------------------------- | -------------------------------------------- |
| `generalApiLimiter`       | Public/unauthenticated endpoints             |
| `userApiLimiter`          | Authenticated user endpoints                 |
| `adminApiLimiter`         | Admin-only endpoints                         |
| `externalApiLimiter`      | Routes that call external APIs (e.g. GitHub) |
| `policyReportsApiLimiter` | High-throughput Policy Reports endpoints     |

```js
// backend/src/index.js

const policyReportsRoutes = require('./routes/policyReports');

// ...

app.use('/policy-reports/api', policyReportsApiLimiter, policyReportsRoutes);
```

The full URL for the example route above becomes `GET /policy-reports/api/organisations`.

---

## 3. Vite Dev Proxy

During local development, the Vite dev server runs on port `3000` and the backend on port `5001`. The Vite proxy forwards matching URL paths to the backend, so that `customFetch('/policy-reports/api/organisations')` resolves correctly without CORS issues.

Add the new path prefix to the proxy list in `frontend/vite.config.js`:

```js
// frontend/vite.config.js

server: {
  port: 3000,
  proxy: Object.fromEntries(
    [
      '/api',
      '/user/api',
      '/copilot/api',
      '/admin/api',
      '/review/api',
      '/addressbook/api',
      '/policy-reports/api', // add your new prefix here
    ].map(path => [
      path,
      {
        target: process.env.VITE_BACKEND_URL || 'http://localhost:5001',
        changeOrigin: true,
        secure: false,
      },
    ])
  ),
},
```

> **Important:** If this step is missed, the browser will receive an HTML error page from Vite instead of a JSON response, causing a `Unexpected token '<'` JSON parse error at runtime.

---

## 4. Frontend Page Component

### Utility (data fetching)

Create a utility at `frontend/src/utilities/get<FeatureName>.js` to encapsulate the API call. Use `customFetch` (which wraps `fetch`, handles non-`2xx` responses with a toast, and prefixes `VITE_BACKEND_URL` automatically) rather than calling `fetch` directly.

```js
// frontend/src/utilities/getPolicyReportsConfig.js

import { toast } from 'react-hot-toast';
import customFetch from './customFetch';

export const fetchPolicyReportsConfig = async () => {
  try {
    const response = await customFetch('/policy-reports/api/organisations');

    if (!response.ok) {
      throw new Error(
        `Failed to fetch policy report config: ${response.statusText}`
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    toast.error('Error loading policy report configuration.');
    return null;
  }
};
```

### Page component

Create the page at `frontend/src/pages/<FeatureName>Page.js`. Pages use the shared `Layout` component to get the sidebar and header, and `PageBanner` for the page title.

```js
// frontend/src/pages/PolicyReportsPage.js

import React, { useEffect, useState } from 'react';
import PageBanner from '../components/PageBanner/PageBanner';
import Layout from '../components/Layout/Layout';
import { fetchPolicyReportsConfig } from '../utilities/getPolicyReportsConfig';
import '../styles/PolicyReportsPage.css';

const PolicyReportsPage = () => {
  const [config, setConfig] = useState(null);

  useEffect(() => {
    const load = async () => {
      const data = await fetchPolicyReportsConfig();
      if (data) setConfig(data);
    };
    load();
  }, []);

  return (
    <Layout>
      <PageBanner title="GitHub Policy Reports" />
      {/* page content */}
    </Layout>
  );
};

export default PolicyReportsPage;
```

### Stylesheet

Add a co-located stylesheet at `frontend/src/styles/<FeatureName>Page.css` and import it in the page component. Scope all rules under a unique root class (e.g. `.policy-reports-page-shell`) to avoid collisions.

---

## 5. Router and Navigation

### Router (`App.js`)

Lazy-import the page and add a `<Route>` in `frontend/src/App.js`:

```js
// frontend/src/App.js

const PolicyReportsPage = lazy(() => import('./pages/PolicyReportsPage'));

// inside <Routes>:
<Route path="/github-policy-reports" element={<PolicyReportsPage />} />;
```

For protected pages (admin/reviewer roles only), wrap with `ProtectedRoute`:

```js
<Route
  path="/admin/dashboard"
  element={
    <ProtectedRoute requiredRoles={['admin']} pageName="Admin Dashboard">
      <AdminPage />
    </ProtectedRoute>
  }
/>
```

### Navigation (`navigationConstants.js`)

Add an entry to `baseNavigationItems` in `frontend/src/constants/navigationConstants.js`, then include it in the relevant export arrays.

```js
// frontend/src/constants/navigationConstants.js

import { TbReport } from 'react-icons/tb';

const baseNavigationItems = {
  // ...existing items
  policyReports: {
    path: '/github-policy-reports',
    label: 'GitHub Policy Reports',
    description: 'Generate and view reports on GitHub Usage Policy compliance.',
    icon: TbReport,
    isLink: true,
    homeUseAnchor: true, // renders as <a> on the home page card grid
  },
};

// Add to the relevant arrays:
export const generalNavigationItems = [
  // ...
  baseNavigationItems.policyReports,
];

export const homePageNavigationItems = [
  // ...
  baseNavigationItems.policyReports,
];
```

**Navigation item fields:**

| Field           | Type             | Description                                                                               |
| --------------- | ---------------- | ----------------------------------------------------------------------------------------- |
| `path`          | `string`         | React Router path                                                                         |
| `label`         | `string`         | Display name in sidebar and home page                                                     |
| `description`   | `string`         | Subtitle shown on the home page card                                                      |
| `icon`          | `ReactComponent` | Icon from `react-icons`                                                                   |
| `isLink`        | `boolean`        | `true` for public pages; `false` for protected pages (renders as `<a>` for auth redirect) |
| `homeUseAnchor` | `boolean`        | Use an `<a>` tag instead of `<Link>` on the home page (required for auth-gated pages)     |
| `hasChildren`   | `boolean`        | `true` if the page has sub-routes (e.g. Copilot)                                          |

Restricted pages (review, admin) should **not** be added to `generalNavigationItems` - they are included only in `restrictedNavigationItems` and `homePageNavigationItems`.

---

## Checklist

- [ ] `backend/src/services/<featureName>Service.js` created
- [ ] `backend/src/routes/<featureName>.js` created
- [ ] Route mounted in `backend/src/index.js`
- [ ] Path prefix added to Vite proxy in `frontend/vite.config.js`
- [ ] `frontend/src/utilities/get<FeatureName>.js` created
- [ ] `frontend/src/pages/<FeatureName>Page.js` created
- [ ] `frontend/src/styles/<FeatureName>Page.css` created
- [ ] Lazy import and `<Route>` added in `frontend/src/App.js`
- [ ] Navigation entry added in `frontend/src/constants/navigationConstants.js`
