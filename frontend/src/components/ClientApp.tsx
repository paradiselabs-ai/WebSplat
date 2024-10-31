'use client';

import React from 'react';
import App from './App';
import { AppProvider } from '../context/AppContext';

const ClientApp = () => {
  return (
    <AppProvider>
      <App />
    </AppProvider>
  );
};

export default ClientApp;