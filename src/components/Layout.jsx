import React from 'react';
import { useApp } from '../contexts/AppContext';

const tabs = [
  { id: 'dashboard', icon: '🏠', label: 'Início' },
  { id: 'calendar', icon: '📅', label: 'Calendário' },
  { id: 'log', icon: '✏️', label: 'Registrar' },
  { id: 'fertility', icon: '🌸', label: 'Fertilidade' },
  { id: 'reports', icon: '📊', label: 'Relatórios' },
  { id: 'profile', icon: '👤', label: 'Perfil' },
];

export default function Layout({ children }) {
  const { activeTab, setActiveTab } = useApp();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      {/* Header */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border)',
        padding: '0 20px',
      }} className="[data-theme='dark'] dark-header">
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 60 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 28 }}>🌸</span>
            <div>
              <h1 style={{ fontSize: 20, fontWeight: 700, background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1 }}>
                FloraFem
              </h1>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>Ciclo & Fertilidade</p>
            </div>
          </div>
          <HeaderActions />
        </div>
      </header>

      {/* Main Content */}
      <main style={{ flex: 1, maxWidth: 900, margin: '0 auto', width: '100%', padding: '0 16px 100px' }}>
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid var(--border)',
        zIndex: 50,
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', alignItems: 'center' }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 2,
                padding: '10px 4px',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                transition: 'all 0.2s',
                position: 'relative',
              }}
            >
              {activeTab === tab.id && (
                <span style={{
                  position: 'absolute',
                  top: 0, left: '50%',
                  transform: 'translateX(-50%)',
                  width: 32, height: 3,
                  background: 'var(--gradient-primary)',
                  borderRadius: '0 0 4px 4px',
                }} />
              )}
              <span style={{
                fontSize: 22,
                filter: activeTab === tab.id ? 'none' : 'grayscale(100%) opacity(0.5)',
                transform: activeTab === tab.id ? 'scale(1.15)' : 'scale(1)',
                transition: 'all 0.2s',
              }}>{tab.icon}</span>
              <span style={{
                fontSize: 10,
                fontWeight: activeTab === tab.id ? 700 : 400,
                color: activeTab === tab.id ? 'var(--primary)' : 'var(--text-muted)',
                transition: 'all 0.2s',
              }}>{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}

function HeaderActions() {
  const { toggleTheme, theme, setShowDailyPopup } = useApp();
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <button
        onClick={() => setShowDailyPopup(true)}
        style={{
          width: 38, height: 38,
          border: 'none',
          background: 'var(--primary-soft)',
          borderRadius: 12,
          cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 18,
        }}
        title="Registrar hoje"
      >✏️</button>
      <button
        onClick={toggleTheme}
        style={{
          width: 38, height: 38,
          border: 'none',
          background: 'var(--primary-soft)',
          borderRadius: 12,
          cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 18,
        }}
        title="Alternar tema"
      >{theme === 'dark' ? '☀️' : '🌙'}</button>
    </div>
  );
}
