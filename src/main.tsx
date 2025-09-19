import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { ThemeProvider } from './theme/ThemeProvider';
import './i18n/config'; // Initialize i18next

ReactDOM.createRoot(document.getElementById('root')!).render(
  <Suspense fallback={<div className="w-full min-h-screen grid place-items-center">Loading...</div>}>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </Suspense>
);