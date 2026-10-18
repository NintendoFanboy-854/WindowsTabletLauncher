import React from 'react';
import { createRoot } from 'react-dom/client';
import { FluentProvider, webDarkTheme } from '@fluentui/react-components';
import App from './host/App';
import './styles.css';

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <FluentProvider theme={webDarkTheme} style={{ height: '100%' }}>
      <App />
    </FluentProvider>
  </React.StrictMode>,
);
