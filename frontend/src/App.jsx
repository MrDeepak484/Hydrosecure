import { useContext, useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AuthContext } from './context/AuthContext';
import Login from './pages/Login';
import FieldPortal from './pages/FieldPortal';
import SupervisorDashboard from './pages/SupervisorDashboard';
import PublicDashboard from './pages/PublicDashboard';
import { useSync } from './hooks/useSync';
import { Wifi, WifiOff, Globe } from 'lucide-react';

function ProtectedRoute({ children, allowedRoles }) {
  const { user } = useContext(AuthContext);
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}

function MainLayout({ children }) {
  const { user, logout } = useContext(AuthContext);
  const { t, i18n } = useTranslation();
  const { isOnline, offlineQueueCount, isSyncing } = useSync();
  const location = useLocation();

  const toggleLang = () => {
    i18n.changeLanguage(i18n.language === 'en' ? 'ta' : 'en');
  };

  const getLangLabel = () => {
    return i18n.language === 'en' ? 'தமிழ்' : 'EN';
  };

  return (
    <div className="app-container">
      <div className="dam-bg-layer"></div>
      <div className="dam-bg-overlay"></div>

      <header className="app-header glass-panel">
        {/* Left: Brand */}
        <div className="header-left">
          <div style={{ background: 'rgba(255,255,255,0.05)', padding: '8px', borderRadius: '12px', flexShrink: 0 }}>
            <img src="/assets/logo.png" alt="Hydrosecure Logo" style={{ width: 38, height: 38, objectFit: 'contain' }} />
          </div>
          <div className="header-brand">
            <div className="header-brand-title">
              <h2>Hydrosecure</h2>
              <span className="badge" style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#cbd5e1' }}>V2.0</span>
            </div>
            {user ? (
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', letterSpacing: '0.5px' }}>{user.username} <span style={{ opacity: 0.5 }}>•</span> {i18n.t(user.role.toLowerCase() + '_portal') || user.role}</span>
            ) : (
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', letterSpacing: '0.5px' }}>Advanced Water Tracking System</span>
            )}
          </div>
        </div>

        {/* Right: Controls */}
        <div className="header-controls">
          {user && user.role === 'FIELD' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
              {isOnline ? (
                <span className="badge badge-success" style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                  <Wifi size={14} /> {t('online')}
                </span>
              ) : (
                <span className="badge badge-warning" style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(245, 158, 11, 0.15)', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                  <WifiOff size={14} /> {t('offline')} ({offlineQueueCount})
                </span>
              )}
              {isSyncing && <span className="badge badge-success animate-fade-in">{t('syncing')}</span>}
            </div>
          )}

          <button onClick={toggleLang} className="btn btn-text" style={{ padding: '8px', display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <Globe size={18} color="var(--primary)" /> <span style={{ fontSize: '0.85rem', fontWeight: 600, width: '40px', textAlign: 'center' }}>{getLangLabel()}</span>
          </button>

          {!user && location.pathname !== '/login' && (
            <Link to="/login" className="btn btn-primary" style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '0.85rem', textDecoration: 'none' }}>
              Portal Login
            </Link>
          )}

          {user && (
            <button onClick={logout} className="btn btn-text" style={{ border: '1px solid var(--glass-border)', borderRadius: '8px', letterSpacing: '0.5px' }}>
              {t('logout')}
            </button>
          )}
        </div>
      </header>
      <main className="animate-fade-in">
        {children}
      </main>
    </div>
  );
}

function App() {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>Loading...</div>;

  return (
    <BrowserRouter>
      <MainLayout>
        <Routes>
          <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />

          <Route path="/field" element={
            <ProtectedRoute allowedRoles={['FIELD', 'SUPERVISOR', 'ADMIN']}>
              <FieldPortal />
            </ProtectedRoute>
          } />

          <Route path="/dashboard" element={
            <ProtectedRoute allowedRoles={['SUPERVISOR', 'ADMIN']}>
              <SupervisorDashboard />
            </ProtectedRoute>
          } />

          <Route path="/" element={
            user ? (user.role === 'FIELD' ? <Navigate to="/field" /> : <Navigate to="/dashboard" />) : <PublicDashboard />
          } />
        </Routes>
      </MainLayout>

    </BrowserRouter>
  );
}

export default App;
