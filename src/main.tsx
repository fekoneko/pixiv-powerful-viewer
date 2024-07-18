import ReactDOM from 'react-dom/client';
import { StrictMode } from 'react';
import { App } from '@/App';
import '@/styles/main.css';
import { invoke } from '@tauri-apps/api';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <App />,
  </StrictMode>,
);

// TODO: Remove
invoke('read_collection', { collectionPath: 'C:\\Andrew\\Other\\For PPV Test' }).then((works) =>
  console.log(works),
);
