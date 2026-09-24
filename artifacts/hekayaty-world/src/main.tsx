import { createRoot } from 'react-dom/client';
import { setBaseUrl } from '@workspace/api-client-react';

import App from './App';
import './index.css';

// In production: use VITE_API_BASE_URL if set, otherwise use relative paths (empty string)
// In development: fall back to localhost:5000
const apiBase =
  import.meta.env.VITE_API_BASE_URL ??
  (import.meta.env.PROD ? '' : 'http://localhost:5000');

setBaseUrl(apiBase);

createRoot(document.getElementById('root')!).render(<App />);

