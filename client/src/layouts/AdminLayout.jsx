import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation, NavLink } from 'react-router-dom';
import {
  ShieldAlert,
  Server,
  Users,
  History,
  BookOpen,
  Activity,
  ArrowLeft,
  Database,
  Waves,
  LogOut,
  Menu,
  X,
  Zap,
  CheckCircle2,
  AlertTriangle,
  LayoutDashboard,
  Droplets,
  Calculator,
  User,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { healthAPI } from '../services/api';

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dbHealthy, setDbHealthy] = useState(true);
  const [pingMs, setPingMs] = useState(null);
  const [pinging, setPinging] = useState(false);

  const queryParams = new URLSearchParams(location.search);
  const activeTab = queryParams.get('tab') || 'telemetry';

  useEffect(() => {
    healthAPI
      .check()
      .then((res) => {
        if (res?.database) {
          setDbHealthy(res.database.connected);
        }
      })
      .catch(() => setDbHealthy(false));
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handlePing = async () => {
    setPinging(true);
    const start = performance.now();
    try {
      const res = await healthAPI.check();
      const duration = Math.round(performance.now() - start);
      setPingMs(duration);
      if (res?.database) setDbHealthy(res.database.connected);
    } catch {
      setPingMs(null);
      setDbHealthy(false);
    } finally {
      setPinging(false);
    }
  };

  return (
    <div className="app-container" style={{ background: '#070b14' }}>
      {sidebarOpen && (
        <div
          className="sidebar-backdrop"
          onClick={() => setSidebarOpen(false)}
          style={{ zIndex: 999 }}
        />
      )}

      {/* DEDICATED ADMIN SIDEBAR */}
      <aside
        className={`app-sidebar ${sidebarOpen ? 'open' : ''}`}
        style={{
          background: 'linear-gradient(180deg, #0b1120 0%, #080d1a 100%)',
          borderRight: '1px solid rgba(6, 182, 212, 0.2)',
          boxShadow: '4px 0 30px rgba(0, 0, 0, 0.5)',
        }}
      >
        {/* Admin Brand Header */}
        <div
          className="sidebar-brand"
          style={{
            borderBottom: '1px solid rgba(6, 182, 212, 0.18)',
            background: 'rgba(6, 182, 212, 0.04)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              flex: 1,
            }}
          >
            <div
              className="brand-icon"
              style={{
                background: 'linear-gradient(135deg, #06b6d4, #0284c7)',
                boxShadow: '0 0 15px rgba(6, 182, 212, 0.45)',
              }}
            >
              <ShieldAlert size={22} color="#04121f" />
            </div>
            <div>
              <div className="brand-title" style={{ color: '#f8fafc', fontSize: '1.2rem' }}>
                AquaIndex
              </div>
              <div
                style={{
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  color: '#38bdf8',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                }}
              >
                <span>ADMIN PORTAL</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            className="sidebar-close-btn"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close admin menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Security Classification Badge */}
        <div style={{ padding: '0.85rem 1rem 0.35rem' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.45rem 0.75rem',
              borderRadius: '8px',
              background: 'rgba(6, 182, 212, 0.1)',
              border: '1px solid rgba(6, 182, 212, 0.25)',
              fontSize: '0.72rem',
              color: '#38bdf8',
              fontWeight: 700,
              letterSpacing: '0.04em',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span
                style={{
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  background: '#10b981',
                  boxShadow: '0 0 8px #10b981',
                }}
              />
              <span>RESTRICTED CONSOLE</span>
            </div>
            <span style={{ fontSize: '0.65rem', opacity: 0.8 }}>ENCLAVE</span>
          </div>
        </div>

        {/* Prominent Switch to Client Dashboard Button */}
        <div style={{ padding: '0.5rem 1rem 0.75rem' }}>
          <Link
            to="/dashboard"
            onClick={() => setSidebarOpen(false)}
            className="btn btn-outline"
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              padding: '0.55rem 0.85rem',
              borderRadius: '9px',
              background: 'rgba(20, 184, 166, 0.12)',
              border: '1px solid rgba(20, 184, 166, 0.4)',
              color: '#2dd4bf',
              fontSize: '0.8rem',
              fontWeight: 600,
              textDecoration: 'none',
              transition: 'all 0.2s',
            }}
            title="Switch to Client Water Quality Surveillance Dashboard"
          >
            <LayoutDashboard size={15} />
            <span>← Client Dashboard</span>
          </Link>
        </div>

        {/* Admin Navigation Sections */}
        <div className="sidebar-nav" style={{ padding: '0.5rem 0.75rem' }}>
          {/* Section 1: Administrative Control */}
          <div className="nav-section">
            <div className="nav-section-title" style={{ color: '#64748b', fontSize: '0.68rem', letterSpacing: '0.08em' }}>
              ADMINISTRATIVE SYSTEM
            </div>

            <Link
              to="/admin?tab=telemetry"
              onClick={() => setSidebarOpen(false)}
              className={`nav-item ${location.pathname === '/admin' && activeTab === 'telemetry' ? 'active' : ''}`}
            >
              <Server size={17} />
              <span>Command Center & Telemetry</span>
            </Link>

            <Link
              to="/admin?tab=users"
              onClick={() => setSidebarOpen(false)}
              className={`nav-item ${location.pathname === '/admin' && activeTab === 'users' ? 'active' : ''}`}
            >
              <Users size={17} />
              <span>User Accounts & Permissions</span>
            </Link>

            <Link
              to="/admin?tab=audit"
              onClick={() => setSidebarOpen(false)}
              className={`nav-item ${location.pathname === '/admin' && activeTab === 'audit' ? 'active' : ''}`}
            >
              <History size={17} />
              <span>Security & Audit Logs</span>
            </Link>

            <NavLink
              to="/standards"
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <BookOpen size={17} />
              <span>Standards (WHO/BIS)</span>
            </NavLink>
          </div>

          {/* Section 2: Quick Links to Client Surveillance Modules */}
          <div className="nav-section" style={{ marginTop: '0.85rem' }}>
            <div className="nav-section-title" style={{ color: '#64748b', fontSize: '0.68rem', letterSpacing: '0.08em' }}>
              CLIENT APP MODULES
            </div>

            <NavLink
              to="/dashboard"
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <LayoutDashboard size={17} />
              <span>Surveillance Dashboard</span>
            </NavLink>

            <NavLink
              to="/samples"
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <Droplets size={17} />
              <span>Water Samples</span>
            </NavLink>

            <NavLink
              to="/analysis"
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <Calculator size={17} />
              <span>HPI / HEI Engine</span>
            </NavLink>
          </div>
        </div>

        {/* Infrastructure Status Card */}
        <div style={{ padding: '0.75rem 1rem', marginTop: 'auto' }}>
          <div
            style={{
              padding: '0.75rem',
              borderRadius: '10px',
              background: 'rgba(15, 23, 42, 0.75)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              fontSize: '0.72rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.4rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8' }}>
              <span>API Gateway</span>
              <span style={{ color: '#10b981', fontWeight: 600 }}>Active (REST)</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8' }}>
              <span>MongoDB</span>
              <span style={{ color: dbHealthy ? '#10b981' : '#ef4444', fontWeight: 600 }}>
                {dbHealthy ? 'Connected' : 'Offline'}
              </span>
            </div>
          </div>
        </div>

        {/* Admin Footer & Logout */}
        <div
          className="sidebar-footer"
          style={{
            borderTop: '1px solid rgba(6, 182, 212, 0.18)',
            background: 'rgba(6, 182, 212, 0.03)',
          }}
        >
          <div className="user-mini-card">
            <div
              className="user-avatar"
              style={{
                background: 'rgba(6, 182, 212, 0.25)',
                color: '#38bdf8',
                border: '1px solid rgba(6, 182, 212, 0.4)',
              }}
            >
              {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
            </div>
            <div className="user-info">
              <div className="user-name" title={user?.name} style={{ color: '#f8fafc', fontWeight: 600 }}>
                {user?.name || 'Administrator'}
              </div>
              <div
                className="user-role"
                style={{
                  color: '#38bdf8',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  letterSpacing: '0.04em',
                }}
              >
                ADMIN ACCESS
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="btn-logout"
              title="Sign out of Admin Portal"
              style={{ color: '#94a3b8', padding: '0.4rem', cursor: 'pointer', borderRadius: '6px' }}
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* DEDICATED ADMIN MAIN CONTENT */}
      <div className="app-main">
        {/* Admin Header */}
        <header
          className="app-header"
          style={{
            background: 'rgba(11, 17, 32, 0.95)',
            borderBottom: '1px solid rgba(6, 182, 212, 0.2)',
            position: 'relative',
          }}
        >
          {/* Top Ambient Glow Line */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '2px',
              background: 'linear-gradient(90deg, transparent 5%, rgba(6, 182, 212, 0.9) 35%, rgba(14, 165, 233, 0.9) 65%, transparent 95%)',
            }}
          />

          <div className="header-left" style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <button
              className="mobile-toggle"
              onClick={() => setSidebarOpen((prev) => !prev)}
              aria-label="Toggle admin menu"
              style={{
                background: 'rgba(15, 23, 42, 0.85)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '8px',
                padding: '0.45rem',
                color: '#f8fafc',
                cursor: 'pointer',
              }}
            >
              <Menu size={19} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '8px',
                  background: 'rgba(6, 182, 212, 0.1)',
                  border: '1px solid rgba(6, 182, 212, 0.25)',
                }}
              >
                <ShieldAlert size={15} style={{ color: '#38bdf8' }} />
                <span
                  style={{
                    fontFamily: 'Outfit, sans-serif',
                    fontWeight: 700,
                    fontSize: '0.88rem',
                    color: '#f8fafc',
                  }}
                >
                  Admin Portal • System Command Center
                </span>
              </div>
            </div>
          </div>

          <div className="header-right" style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            {/* Quick Ping Test */}
            <button
              type="button"
              onClick={handlePing}
              disabled={pinging}
              className="btn btn-secondary btn-sm hide-on-mobile"
              style={{
                fontSize: '0.75rem',
                padding: '0.35rem 0.65rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                borderRadius: '8px',
              }}
              title="Ping backend API roundtrip latency"
            >
              <Zap size={13} style={{ color: '#06b6d4' }} />
              <span>{pinging ? 'Pinging...' : pingMs ? `${pingMs}ms` : 'Ping API'}</span>
            </button>

            {/* DB Health Pill */}
            <div
              className="hide-on-mobile"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.32rem 0.7rem',
                borderRadius: '9999px',
                background: dbHealthy ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                border: `1px solid ${dbHealthy ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                fontSize: '0.75rem',
                fontWeight: 600,
                color: dbHealthy ? '#10b981' : '#ef4444',
              }}
            >
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: dbHealthy ? '#10b981' : '#ef4444',
                  boxShadow: dbHealthy ? '0 0 6px #10b981' : '0 0 6px #ef4444',
                }}
              />
              <span>{dbHealthy ? 'Database Live' : 'Database Disconnected'}</span>
            </div>

            {/* Return to Client Dashboard button */}
            <Link
              to="/dashboard"
              className="btn btn-primary btn-sm"
              style={{
                padding: '0.35rem 0.75rem',
                fontSize: '0.76rem',
                fontWeight: 600,
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                boxShadow: '0 2px 10px rgba(6, 182, 212, 0.35)',
                textDecoration: 'none',
              }}
              title="Switch back to Client Surveillance Dashboard"
            >
              <LayoutDashboard size={14} />
              <span className="hide-on-mobile">Client Dashboard</span>
              <ArrowLeft size={13} style={{ transform: 'rotate(180deg)' }} />
            </Link>

            {/* User Mini Avatar */}
            <Link
              to="/profile"
              style={{
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
              title="Admin Profile"
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'rgba(6, 182, 212, 0.25)',
                  border: '1px solid rgba(6, 182, 212, 0.4)',
                  color: '#38bdf8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                }}
              >
                {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
              </div>
            </Link>
          </div>
        </header>

        {/* Page Content Outlet */}
        <main className="page-container" style={{ padding: '1.5rem', maxWidth: '1600px', margin: '0 auto', width: '100%' }}>
          <Outlet />
        </main>

        {/* Dedicated Admin Portal Footer */}
        <footer
          style={{
            marginTop: 'auto',
            borderTop: '1px solid rgba(6, 182, 212, 0.15)',
            background: 'rgba(9, 14, 26, 0.95)',
            padding: '1.2rem 2rem',
            color: '#64748b',
            fontSize: '0.78rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <ShieldAlert size={16} style={{ color: '#06b6d4' }} />
            <span>AquaIndex Administrative Command Gateway • Restricted Security Enclave</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Link to="/standards" style={{ color: '#38bdf8', textDecoration: 'none' }}>
              Reference Standards
            </Link>
            <span>•</span>
            <Link to="/dashboard" style={{ color: '#2dd4bf', textDecoration: 'none', fontWeight: 600 }}>
              Client Surveillance Dashboard →
            </Link>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default AdminLayout;
