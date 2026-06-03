import React, { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';

const tabs = [
  { id: 'dashboard', icon: '🏠', label: 'Início' },
  { id: 'calendar',  icon: '📅', label: 'Calendário' },
  { id: 'log',       icon: '✏️', label: 'Registrar' },
  { id: 'fertility', icon: '🌸', label: 'Fertilidade' },
  { id: 'reports',   icon: '📊', label: 'Relatórios' },
  { id: 'profile',   icon: '👤', label: 'Perfil' },
];

export default function Layout({ children }) {
  const { activeTab, setActiveTab } = useApp();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      {/* Header */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: scrolled ? 'var(--bg-glass)' : 'transparent',
        backdropFilter: scrolled ? 'blur(24px)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(24px)' : 'none',
        borderBottom: scrolled ? '1.5px solid var(--border)' : '1.5px solid transparent',
        transition: 'all 0.3s ease',
        padding: '0 20px',
      }}>
        <div style={{
          maxWidth: 900, margin: '0 auto',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          height: 62,
        }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 12,
              background: 'var(--grad-primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 20, boxShadow: 'var(--shadow-pink)',
              flexShrink: 0,
            }}>🌸</div>
            <div>
              <div style={{
                fontSize: 19, fontWeight: 800, letterSpacing: '-0.03em',
                background: 'var(--grad-primary)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                backgroundClip: 'text', lineHeight: 1,
              }}>FloraFem</div>
              <div style={{ fontSize: 10, color: 'var(--text-3)', letterSpacing: '0.05em', textTransform: 'uppercase', marginTop: 1 }}>
                Ciclo & Fertilidade
              </div>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 8 }}>
            <HeaderBtn onClick={() => {}} icon="🔔" />
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Content */}
      <main style={{
        flex: 1, maxWidth: 900, margin: '0 auto',
        width: '100%', padding: '0 16px 96px',
      }}>
        {children}
      </main>

      {/* Bottom Nav */}
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}

function HeaderBtn({ onClick, icon }) {
  return (
    <button onClick={onClick} className="btn-icon" style={{
      background: 'var(--bg-secondary)',
      border: '1.5px solid var(--border)',
    }}>{icon}</button>
  );
}

function ThemeToggle() {
  const { toggleTheme, theme } = useApp();
  return (
    <button onClick={toggleTheme} className="btn-icon" style={{
      background: theme === 'dark'
        ? 'linear-gradient(135deg, #FFB300, #FF7B54)'
        : 'linear-gradient(135deg, #8B2FC9, #1A0A2E)',
      border: 'none',
      boxShadow: theme === 'dark' ? '0 4px 16px rgba(255,179,0,0.4)' : '0 4px 16px rgba(139,47,201,0.4)',
    }}>
      {theme === 'dark' ? '☀️' : '🌙'}
    </button>
  );
}

function BottomNav({ activeTab, setActiveTab }) {
  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
      background: 'var(--bg-glass)',
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
      borderTop: '1.5px solid var(--border)',
      paddingBottom: 'env(safe-area-inset-bottom)',
    }}>
      <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex' }}>
        {tabs.map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: 1, border: 'none', background: 'transparent',
                cursor: 'pointer', padding: '10px 4px',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                position: 'relative', transition: 'all var(--t)',
                fontFamily: 'inherit',
              }}
            >
              {/* Active indicator */}
              {isActive && (
                <span style={{
                  position: 'absolute', top: 0, left: '50%',
                  transform: 'translateX(-50%)',
                  width: 28, height: 3,
                  background: 'var(--grad-primary)',
                  borderRadius: '0 0 4px 4px',
                  boxShadow: '0 2px 8px var(--pink-glow)',
                }} />
              )}

              {/* Icon bubble */}
              <div style={{
                width: isActive ? 38 : 32, height: isActive ? 38 : 32,
                borderRadius: isActive ? 12 : 10,
                background: isActive ? 'var(--grad-primary)' : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: isActive ? 19 : 20,
                filter: isActive ? 'none' : 'grayscale(60%) opacity(0.6)',
                transition: 'all var(--t-spring)',
                boxShadow: isActive ? 'var(--shadow-pink)' : 'none',
              }}>
                {tab.icon}
              </div>

              <span style={{
                fontSize: 10, fontWeight: isActive ? 800 : 500,
                color: isActive ? 'var(--pink)' : 'var(--text-3)',
                transition: 'all var(--t)',
                letterSpacing: isActive ? '-0.01em' : '0',
              }}>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
