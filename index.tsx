
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

// PWA Registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // Wait for the app to be ready
    navigator.serviceWorker.ready.then(() => {
      console.log('PWA: Service Worker ready');
    });

    // Check for updates
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      window.location.reload();
    });
  });
}

// Remove loading screen if it exists
window.addEventListener('load', () => {
  const loadingScreen = document.getElementById('loading-screen');
  if (loadingScreen) {
    setTimeout(() => {
      loadingScreen.classList.add('fade-out');
      setTimeout(() => loadingScreen.remove(), 500);
    }, 100);
  }
});

const rootElement = document.getElementById('root');

if (!rootElement) {
  console.error("Could not find root element to mount to");
} else {
  const root = createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
