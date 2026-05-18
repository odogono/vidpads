import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { App } from './App';
import './app/styles/globals.css';
import './app/styles/crt.css';

const root = document.getElementById('root');

if (!root) {
  throw new Error('Missing #root element');
}

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>
);
