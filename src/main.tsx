import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { NhostProvider, NhostClient } from '@nhost/react';
import App from './App.tsx';
import './index.css';

const nhost = new NhostClient({
  subdomain: 'btfjbftqfejkwrldrgoo',
  region: 'ap-south-1'
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <NhostProvider nhost={nhost}>
      <App />
    </NhostProvider>
  </StrictMode>
);