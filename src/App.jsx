import React from 'react';
import { AppProvider, useApp } from './contexts/AppContext';
import Layout from './components/Layout';
import DailyPopup from './components/DailyPopup';
import Dashboard from './pages/Dashboard';
import Calendar from './pages/Calendar';
import LogPage from './pages/LogPage';
import Fertility from './pages/Fertility';
import Reports from './pages/Reports';
import Profile from './pages/Profile';
import './index.css';

function AppContent() {
  const { activeTab } = useApp();

  const renderPage = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'calendar':  return <Calendar />;
      case 'log':       return <LogPage />;
      case 'fertility': return <Fertility />;
      case 'reports':   return <Reports />;
      case 'profile':   return <Profile />;
      default:          return <Dashboard />;
    }
  };

  return (
    <Layout>
      {renderPage()}
      <DailyPopup />
    </Layout>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
