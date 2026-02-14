import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';

// Polyfill process for browser environments to prevent ReferenceErrors
if (typeof process === 'undefined') {
  (window as any).process = { env: {} };
}

// Global error handling to catch unhandled promise rejections or sync errors
window.addEventListener('error', (event) => {
  console.error('WealthFlow Global Error:', event.error || event.message);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('WealthFlow Unhandled Rejection:', event.reason);
});

const mountApp = () => {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    console.error("Could not find root element to mount to");
    return;
  }

  try {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </React.StrictMode>
    );
  } catch (err) {
    console.error("Fatal initialization error:", err);
    // Fallback if React fails to mount entirely
    rootElement.innerHTML = '<div style="padding:20px;font-family:sans-serif;"><h1>Fatal Error</h1><p>Application failed to initialize. Check console.</p></div>';
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mountApp);
} else {
  mountApp();
}