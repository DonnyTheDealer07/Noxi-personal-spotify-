import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { App } from './app/App';
import './styles/globals.css';
import './styles/theme.css';
import './styles/layout-polish.css';
import './styles/themes.css';

createRoot(document.getElementById('root')!).render(<BrowserRouter><App /></BrowserRouter>);
