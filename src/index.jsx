import { lazy } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import 'simplebar-react/dist/simplebar.min.css';
import EnvironmentError from './utils/EnvironmentError';

const requiredEnvVars = [
  'VITE_ARCHIVE_API_BASE',
  'VITE_TWITCH_ID',
  'VITE_CHANNEL',
  'VITE_DEFAULT_DELAY',
  'VITE_DOMAIN',
  'VITE_CDN',
];

const missingVars = requiredEnvVars.filter((varName) => !import.meta.env[varName]);

const container = document.getElementById('root');
const root = createRoot(container);

const App = lazy(() => import('./App'));

if (missingVars.length === 0) {
  root.render(<App />);
} else {
  root.render(<EnvironmentError missingVars={missingVars} />);
}
