'use client';

import React from 'react';
import App from './App';
import { AppProvider } from '../context/AppContext';

const ClientApp = () => {
  return (
    <div className="min-h-screen bg-[#1E2128]">
      <AppProvider>
        <App />
      </AppProvider>
    </div>
  );
};

export default ClientApp;
