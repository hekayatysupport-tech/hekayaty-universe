import { API_BASE_URL } from '@/lib/api';
import { createRoot } from 'react-dom/client';
import { setBaseUrl } from '@workspace/api-client-react';

import App from './App';
import './index.css';

// Point all generated API hooks at the backend server
setBaseUrl(import.meta.env.VITE_API_BASE_URL ?? `${API_BASE_URL}`);

createRoot(document.getElementById('root')!).render(<App />);

