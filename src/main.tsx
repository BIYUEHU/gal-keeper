import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { FluentProvider, webLightTheme } from '@fluentui/react-components';
import { router } from './routes';
import 'virtual:uno.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <FluentProvider theme={webLightTheme}>
      <RouterProvider router={router} />
    </FluentProvider>
  </React.StrictMode>
);