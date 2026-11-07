import React, { useState, useEffect } from 'react';
import {
  Menu,
  Activity,
  Home,
  Database,
  ShieldAlert,
  FlaskConical,
  LayoutDashboard,
  User,
  Plus,
  Sparkles,
  MapPin,
  TrendingUp,
  Layers,
  FileText,
  ShieldCheck,
} from 'lucide-react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { healthAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const routeTitles = {
  '/dashboard': 'Water Quality Surveillance Dashboard',
  '/samples/new': 'Register Water Sample',
  '/samples': 'Water Quality Inventory',
  '/analysis': 'HPI & HEI Calculation Engine',
  '/map': 'Pollution Hotspot Map',
  '/trends': 'Parameter Trends & Analytics',
  '/comparison': 'Multi-Location Comparison',
  '/reports': 'Assessment Reports & CSV Exports',
  '/standards': 'Reference Standards Management',
  '/profile': 'User Profile & Settings',
  '/admin': 'Admin System Command Center & Audit',
};

const routeIcons = {
  '/dashboard': LayoutDashboard,
  '/samples/new': Plus,
  '/samples': FlaskConical,
  '/analysis': Activity,
  '/map': MapPin,
  '/trends': TrendingUp,
  '/comparison': Layers,
  '/reports': FileText,
  '/standards': ShieldCheck,
  '/profile': User,
  '/admin': ShieldAlert,
};

const Navbar = ({ onToggleSidebar }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const [dbHealthy, setDbHealthy] = useState(true);

  useEffect(() => {
    healthAPI
      .check()
      .then((res) => {
        if (res && res.database) {
          setDbHealthy(res.database.connected);
        }
      })
      .catch(() => setDbHealthy(false));
  }, [location.pathname]);

  const currentTitle = routeTitles[location.pathname] || 'Environmental Analytics';
  const RouteIcon = routeIcons[location.pathname] || Activity;

  return (
    <header className="app-header" style={{ position: 'relative' }}>
      {/* Top Ambient Cyan Glow Line */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '2px',
          background: 'linear-gradient(90deg, transparent 5%, rgba(6, 182, 212, 0.85) 35%, rgba(20, 184, 166, 0.85) 65%, transparent 95%)',
        }}
      />

      {/* Left: Mobile Toggle & Futuristic Breadcrumb Island */}
      <div className="header-left" style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', minWidth: 0 }}>
        <button
          className="mobile-toggle"
          onClick={onToggleSidebar}
          aria-label="Toggle navigation menu"
          style={{
            background: 'rgba(15, 23, 42, 0.85)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '9px',
            padding: '0.45rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-main)',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          <Menu size={19} />
        </button>

        <div className="header-breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
          <Link
            to="/"
            title="Return to Public Landing Page"
            className="header-home-btn"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '9px',
              background: 'rgba(15, 23, 42, 0.85)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textDecoration: 'none',
              flexShrink: 0,
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            <Home size={15} />
          </Link>

          <span style={{ color: 'var(--text-subtle)', fontSize: '0.85rem' }}>/</span>

          {/* Current Route Island Capsule */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.22rem 0.65rem',
              borderRadius: '8px',
              background: 'rgba(15, 23, 42, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.07)',
              minWidth: 0,
            }}
          >
            <RouteIcon size={14} style={{ color: 'var(--primary)', flexShrink: 0 }} />
            <span
              className="current"
              style={{
                fontFamily: 'Outfit, sans-serif',
                fontWeight: 600,
                fontSize: '0.88rem',
                color: '#f8fafc',
                letterSpacing: '-0.01em',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {currentTitle}
            </span>
          </div>
        </div>
      </div>

      {/* Right: Quick Action, Admin Console Switch, Status Pill, User Widget */}
      <div className="header-right" style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
        {/* Quick Sample Registration Button */}
        <Link
          to="/samples/new"
          className="btn btn-primary btn-sm hide-on-mobile"
          style={{
            padding: '0.32rem 0.75rem',
            fontSize: '0.76rem',
            fontWeight: 600,
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            boxShadow: '0 2px 12px rgba(6, 182, 212, 0.35)',
            whiteSpace: 'nowrap',
            textDecoration: 'none',
          }}
          title="Register New Water Sample"
        >
          <Plus size={14} />
          <span>New Sample</span>
        </Link>

        {/* Discrete Admin Portal bridge (Only if user has administrator role) */}
        {isAdmin && (
          <Link
            to="/admin"
            className="btn btn-outline btn-sm hide-on-mobile"
            style={{
              padding: '0.32rem 0.75rem',
              fontSize: '0.74rem',
              whiteSpace: 'nowrap',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              border: '1px solid rgba(6, 182, 212, 0.4)',
              background: 'rgba(6, 182, 212, 0.1)',
              color: '#38bdf8',
              fontWeight: 600,
              textDecoration: 'none',
            }}
            title="Switch to Separate Admin Portal"
          >
            <ShieldAlert size={14} />
            <span>Admin Portal →</span>
          </Link>
        )}

        {/* Live System Telemetry Status (No raw ports) */}
        <div
          className="sys-status-badge"
          style={{
            color: dbHealthy ? '#10b981' : '#ef4444',
            background: dbHealthy ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            border: dbHealthy ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
            padding: '0.3rem 0.65rem',
            fontSize: '0.74rem',
            fontWeight: 600,
            borderRadius: '9999px',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            boxShadow: dbHealthy ? '0 0 10px rgba(16, 185, 129, 0.15)' : '0 0 10px rgba(239, 68, 68, 0.15)',
          }}
          title={dbHealthy ? 'Database Active & Surveillance Engine Online' : 'Database Disconnected'}
        >
          <span
            className="status-dot"
            style={{
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              backgroundColor: dbHealthy ? '#10b981' : '#ef4444',
              boxShadow: dbHealthy ? '0 0 8px #10b981' : '0 0 8px #ef4444',
            }}
          />
          <Database size={12} />
          <span className="sys-status-text hide-on-mobile">{dbHealthy ? 'System Online' : 'Offline'}</span>
        </div>

        {/* Executive User Profile Capsule */}
        {user && (
          <Link
            to="/profile"
            className="header-user-pill"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.55rem',
              padding: '0.22rem 0.65rem 0.22rem 0.22rem',
              borderRadius: '9999px',
              background: 'rgba(15, 23, 42, 0.85)',
              border: '1px solid var(--border-subtle)',
              textDecoration: 'none',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
            }}
            title={`Signed in as ${user.name} (${user.role}) - Open User Profile`}
          >
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.75rem',
                color: '#ffffff',
                boxShadow: '0 0 10px rgba(6, 182, 212, 0.35)',
                border: '1.5px solid rgba(255, 255, 255, 0.2)',
                flexShrink: 0,
              }}
            >
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="hide-on-mobile" style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.15 }}>
              <span style={{ fontSize: '0.76rem', fontWeight: 600, color: '#f8fafc', whiteSpace: 'nowrap' }}>
                {user.name || 'User'}
              </span>
              <span
                style={{
                  fontSize: '0.64rem',
                  fontWeight: 600,
                  color: isAdmin ? '#06b6d4' : '#14b8a6',
                  textTransform: 'capitalize',
                }}
              >
                {user.role}
              </span>
            </div>
          </Link>
        )}
      </div>
    </header>
  );
};

export default Navbar;
