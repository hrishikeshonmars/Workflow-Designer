import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import 'reactflow/dist/style.css'; // Import React Flow styles
import './index.css'; // Import Tailwind styles

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);