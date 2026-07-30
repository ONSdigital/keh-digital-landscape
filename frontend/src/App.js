import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';

const Home = lazy(() => import('./pages/HomePage'));
const Radar = lazy(() => import('./pages/RadarPage'));
const Statistics = lazy(() => import('./pages/StatisticsPage'));
const Projects = lazy(() => import('./pages/ProjectsPage'));
const ReviewDashboard = lazy(() => import('./pages/ReviewPage'));
const AdminPage = lazy(() => import('./pages/AdminPage'));
const AddressBookPage = lazy(() => import('./pages/AddressBookPage'));
const CopilotDashboard = lazy(() => import('./pages/CopilotPage'));
const CopilotDashboardLandingPage = lazy(
  () => import('./pages/Copilot/LandingPage')
);
const CopilotDashboardLegacyUsagePage = lazy(
  () => import('./pages/Copilot/LegacyUsagePage')
);
const CopilotDashboardGeneralUsagePage = lazy(
  () => import('./pages/Copilot/GeneralUsagePage')
);
const CopilotCodeCompletionsPage = lazy(
  () => import('./pages/Copilot/CodeCompletionsPage')
);

import { getDirectorates } from './utilities/getDirectorates';

// Get the default directorate from the directorates data
const directorates = await getDirectorates();
const defaultDirectorate = directorates.find(d => d.default);

// Set the default directorate in localStorage so it can be used across the app (namely in utilities/getTechnologyStatus)
if (defaultDirectorate) {
  localStorage.setItem(
    'defaultDirectorate',
    JSON.stringify(defaultDirectorate)
  );
  localStorage.setItem('defaultDirectorateId', defaultDirectorate.id);
}

const App = () => {
  return (
    <Suspense fallback={<div />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/radar" element={<Radar />} />
        <Route path="/statistics" element={<Statistics />} />
        <Route path="/projects" element={<Projects />} />
        <Route
          path="/copilot/team"
          element={<Navigate to="/copilot/org/historic" replace />}
        />
        <Route path="/addressbook" element={<AddressBookPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
        <Route
          path="/review/dashboard"
          element={
            <ProtectedRoute
              requiredRoles={['reviewer']}
              pageName="Review Dashboard"
            >
              <ReviewDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute
              requiredRoles={['admin']}
              pageName="Admin Dashboard"
            >
              <AdminPage />
            </ProtectedRoute>
          }
        />
        <Route path="/copilot" element={<CopilotDashboard />} />
        <Route path="/copilot/org/:view" element={<CopilotDashboard />} />
        <Route path="/copilot/team/:teamSlug" element={<CopilotDashboard />} />
        <Route path="/copilot/:scope" element={<CopilotDashboard />} />
        <Route path="/copilot/home" element={<CopilotDashboardLandingPage />} />
        <Route
          path="/copilot/legacy"
          element={<CopilotDashboardLegacyUsagePage />}
        />
        <Route
          path="/copilot/code-completions"
          element={<CopilotCodeCompletionsPage />}
        />
        <Route
          path="/copilot/general"
          element={<CopilotDashboardGeneralUsagePage />}
        />
      </Routes>
    </Suspense>
  );
};

export default App;
