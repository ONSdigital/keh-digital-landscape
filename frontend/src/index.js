import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/index.css';
import App from './App';
import { BrowserRouter } from 'react-router';
import { ThemeProvider } from './contexts/ThemeContext';
import { DataProvider } from './contexts/dataContext';
import { BugReportProvider } from './contexts/BugReportContext';

// Initialize Google Analytics with environment variable
const gaContainerId = import.meta.env.VITE_GA_CONTAINER_ID;
if (gaContainerId) {
  // Load Google Analytics script dynamically
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${gaContainerId}`;
  document.head.appendChild(script);

  // Initialize gtag
  window.dataLayer = window.dataLayer || [];
  function gtag() {
    window.dataLayer.push(arguments);
  }
  window.gtag = gtag;
  gtag('js', new Date());
  gtag('config', gaContainerId);
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
    <DataProvider>
      <BugReportProvider>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </BugReportProvider>
    </DataProvider>
  </BrowserRouter>
);
