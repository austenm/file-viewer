import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './globals.css';
import App from './App.tsx';
import ActiveFileProvider from './state/ActiveFileProvider.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ActiveFileProvider>
      <App />
    </ActiveFileProvider>
  </StrictMode>,
);
