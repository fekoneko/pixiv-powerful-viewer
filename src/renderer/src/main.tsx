import '@renderer/styles/main.css';

import ReactDOM from 'react-dom/client';
import App from '@renderer/App';
import { StrictMode } from 'react';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <App />,
  </StrictMode>,
);
