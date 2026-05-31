import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './styles/globals.css';

// Count user visits for PWA installation prompt
const visits = parseInt(localStorage.getItem('visit_count') || '0', 10);
localStorage.setItem('visit_count', String(visits + 1));

// Register global PWA Install prompt listener
window.addEventListener('beforeinstallprompt', (e) => {
  // Prevent automatic popup from showing
  e.preventDefault();
  // Save event for later execution
  window.deferredPrompt = e;
  // Notify components that prompt is ready
  window.dispatchEvent(new CustomEvent('pwa-install-ready'));
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
