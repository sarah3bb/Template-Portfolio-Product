import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import ErrorBoundary from './components/ErrorBoundary';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import App from './App';

// Vendor + third-party stylesheets
import './assets/css/bootstrap.min.css';
import './assets/css/animate.css';
import './assets/css/LineIcons.2.0.css';

// App-owned stylesheets
import './assets/css/main.css';
import './styles/theme.css';
import './styles/customization.css';

// TEMPORARY DEBUG — remove after diagnosing the tab-switch scroll reset.
// Traces every call to window.scrollTo, including the caller's stack, so we
// can see exactly what's resetting scroll to the top in production.
const originalScrollTo = window.scrollTo.bind(window);
window.scrollTo = (...args) => {
  console.trace('[SCROLL-DEBUG] window.scrollTo', args);
  return originalScrollTo(...args);
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <ThemeProvider>
        <BrowserRouter>
          <AuthProvider>
            <App />
          </AuthProvider>
        </BrowserRouter>
      </ThemeProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
