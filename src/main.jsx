import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ErrorBoundary from './components/ErrorBoundary';
import App from './App';
import './assets/css/bootstrap.min.css';
import './assets/css/animate.css';
import './assets/css/LineIcons.2.0.css';
import './assets/css/main.css';
import './styles/theme.css';
import './styles/customization.css';

// TEMPORARY DEBUG — remove after diagnosing the tab-switch scroll reset.
// Traces every call to window.scrollTo, including the caller's stack, so we
// can see exactly what's resetting scroll to the top in production.
const __originalScrollTo = window.scrollTo;
window.scrollTo = (...args) => {
  console.trace('[SCROLL-DEBUG] window.scrollTo', args);
  return __originalScrollTo.apply(window, args);
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
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
