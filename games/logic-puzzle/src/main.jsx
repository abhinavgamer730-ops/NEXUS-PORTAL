import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

let mounted = false;

function mountApp() {
  if (mounted) return;
  const rootElement = document.getElementById('root');
  if (rootElement) {
    mounted = true;
    console.log('🐾 Mounting You versus Animal App...');
    ReactDOM.createRoot(rootElement).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  }
}

mountApp();

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mountApp);
}
window.addEventListener('load', mountApp);

const interval = setInterval(() => {
  if (mounted) {
    clearInterval(interval);
  } else {
    mountApp();
  }
}, 50);
