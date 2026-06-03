import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App.tsx';

// Handle GitHub Pages SPA redirect
const spaRedirect = sessionStorage.getItem('spa_redirect');
if (spaRedirect) {
  sessionStorage.removeItem('spa_redirect');
  window.history.replaceState(null, '', spaRedirect);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter basename="/FamilyPlanner">
      <App />
    </BrowserRouter>
  </StrictMode>,
);
