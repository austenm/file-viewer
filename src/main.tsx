import './lib/monaco/monacoSetup.ts';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './globals.css';
import App from './App.tsx';
import ActiveFileProvider from './state/ActiveFileProvider.tsx';

if (navigator.userAgent.toLowerCase().includes('firefox')) {
  document.documentElement.classList.add('is-firefox');
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ActiveFileProvider>
      <App />
    </ActiveFileProvider>
  </StrictMode>,
);
