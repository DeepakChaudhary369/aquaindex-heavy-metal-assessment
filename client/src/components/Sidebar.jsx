import React from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  PlusCircle,
  Droplets,
  Calculator,
  GitCompare,
  MapPin,
  TrendingUp,
  FileSpreadsheet,
  BookOpen,
  User,
  ShieldAlert,
  LogOut,
  Waves,
  FlaskConical,
  Database,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navSections = [
    {
      title: 'Water Quality Surveillance',
      items: [
        { to: '/dashboard', label: 'Surveillance Dashboard', icon: LayoutDashboard },
        { to: '/samples', label: 'Samples Inventory', icon: Droplets },
        { to: '/samples/new', label: 'Register New Sample', icon: PlusCircle },
        { to: '/analysis', label: 'HPI/HEI Math Engine', icon: Calculator },
      ],
    },
    {
      title: 'Spatial & Reports',
      items: [
        { to: '/map', label: 'Contamination Hotspots', icon: MapPin },
        { to: '/trends', label: 'Trends & Completeness', icon: TrendingUp },
        { to: '/comparison', label: 'Location Benchmarking', icon: GitCompare },
        { to: '/reports', label: 'PDF Reports & CSV', icon: FileSpreadsheet },
      ],
    },
    {
      title: 'Standards & Account',
      items: [
        { to: '/standards', label: 'Standards (WHO/BIS)', icon: BookOpen },
        { to: '/profile', label: 'User Profile & Settings', icon: User },
      ],
    },
  ];

  return (
    <>
      {isOpen && <div className="sidebar-backdrop" onClick={onClose} />}
      <aside className={`app-sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <Link
            to="/"
            onClick={onClose}
            className="sidebar-brand-link"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              flex: 1,
              minWidth: 0,
              textDecoration: 'none',
              color: 'inherit',
              cursor: 'pointer',
              userSelect: 'none',
              WebkitTapHighlightColor: 'transparent',
            }}
            title="AquaIndex - Return to Home"
          >
            <div className="brand-icon">
              <Waves size={22} />
            </div>
            <div>
              <div className="brand-title">AquaIndex</div>
              <div className="brand-subtitle">Water Surveillance</div>
            </div>
          </Link>
          <button
            type="button"
            className="sidebar-close-btn"
            onClick={onClose}
            aria-label="Close navigation sidebar"
          >
            <X size={20} />
          </button>
        </div>

        {/* Client Portal Indicator Pill */}
        {user && (
          <div style={{ padding: '0.65rem 1rem 0.25rem' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.35rem 0.75rem',
                borderRadius: '8px',
                background: 'rgba(20, 184, 166, 0.12)',
                border: '1px solid rgba(20, 184, 166, 0.25)',
                fontSize: '0.73rem',
                color: '#14b8a6',
                fontWeight: 600,
                letterSpacing: '0.02em',
              }}
            >
              <FlaskConical size={14} />
              <span>CLIENT SURVEILLANCE</span>
            </div>
          </div>
        )}

        <div className="sidebar-nav">
          {navSections.map((section, idx) => (
            <div key={idx} className="nav-section">
              <div className="nav-section-title">{section.title}</div>
              {section.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={onClose}
                    className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                  >
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </div>
          ))}
        </div>

        {user && (
          <div className="sidebar-footer">
            {/* If logged-in user is an administrator, provide a discrete switch to separate Admin Portal */}
            {isAdmin && (
              <div style={{ marginBottom: '0.75rem' }}>
                <Link
                  to="/admin"
                  onClick={onClose}
                  className="btn btn-outline btn-sm"
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.45rem',
                    fontSize: '0.74rem',
                    padding: '0.45rem',
                    borderRadius: '8px',
                    border: '1px solid rgba(6, 182, 212, 0.35)',
                    background: 'rgba(6, 182, 212, 0.08)',
                    color: '#38bdf8',
                    textDecoration: 'none',
                    fontWeight: 600,
                  }}
                  title="Switch to Separate Admin Portal"
                >
                  <ShieldAlert size={14} />
                  <span>Switch to Admin Portal →</span>
                </Link>
              </div>
            )}
            <div className="user-mini-card">
              <div
                className="user-avatar"
                style={{
                  background: isAdmin ? 'rgba(6, 182, 212, 0.2)' : 'var(--bg-elevated)',
                  color: isAdmin ? '#06b6d4' : 'var(--primary)',
                }}
              >
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="user-info">
                <div className="user-name" title={user.name}>{user.name}</div>
                <div className="user-role" style={{ color: isAdmin ? '#06b6d4' : '#94a3b8', fontWeight: isAdmin ? 600 : 400 }}>
                  {user.role}
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="btn-logout"
                title="Sign out"
                style={{ color: 'var(--text-muted)', padding: '0.4rem', cursor: 'pointer', borderRadius: '6px' }}
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        )}
      </aside>
    </>
  );
};

export default Sidebar;
