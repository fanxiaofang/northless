import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { initializeStorageIfNeeded } from './lib/storage.ts';
import './index.css';

initializeStorageIfNeeded();
createRoot(document.getElementById('root')!).render(<App />);
