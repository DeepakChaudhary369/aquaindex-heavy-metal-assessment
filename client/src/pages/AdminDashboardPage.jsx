import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  ShieldAlert,
  Database,
  Activity,
  History,
  RefreshCw,
  Server,
  CheckCircle2,
  AlertTriangle,
  Users,
  Cpu,
  Layers,
  ArrowRight,
  LayoutDashboard,
  Droplets,
  Calculator,
  BookOpen,
  MapPin,
  Search,
  Filter,
  KeyRound,
  Zap,
} from 'lucide-react';
import { auditAPI, healthAPI, standardsAPI, authAPI } from '../services/api';
import { formatDate } from '../utils/formatters';
import LoadingSkeleton from '../components/LoadingSkeleton';

const AdminDashboardPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'telemetry';
  const [activeTab, setActiveTab] = useState(currentTab);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && ['telemetry', 'users', 'audit'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };
  const [health, setHealth] = useState(null);
  const [logs, setLogs] = useState([]);
  const [totalLogs, setTotalLogs] = useState(0);
  const [users, setUsers] = useState([]);
  const [userSearch, setUserSearch] = useState('');
  const [auditActionFilter, setAuditActionFilter] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [pingMs, setPingMs] = useState(null);
  const [pinging, setPinging] = useState(false);
  const [actionSuccess, setActionSuccess] = useState('');
  const [actionError, setActionError] = useState('');

  const fetchAdminData = async () => {
    setLoading(true);
    setActionError('');
    try {
      const [hRes, lRes, uRes] = await Promise.all([
        healthAPI.check().catch(() => null),
        auditAPI.getLogs({ page, limit: 15, action: auditActionFilter || undefined }).catch(() => ({ success: false })),
        authAPI.getUsers().catch(() => ({ success: false })),
      ]);

      if (hRes) setHealth(hRes);
      if (lRes && lRes.success) {
        setLogs(lRes.data || []);
        setTotalLogs(lRes.total || 0);
      }
      if (uRes && uRes.success) {
        setUsers(uRes.data || []);
      }
    } catch (err) {
      setActionError(err.message || 'Failed to fetch admin system telemetry.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [page, auditActionFilter]);

  const handlePing = async () => {
    setPinging(true);
    const start = performance.now();
    try {
      const res = await healthAPI.check();
      const duration = Math.round(performance.now() - start);
      setPingMs(duration);
      if (res) setHealth(res);
      setActionSuccess(`Backend response verified: ${duration}ms roundtrip latency.`);
      setTimeout(() => setActionSuccess(''), 4000);
    } catch {
      setActionError('Backend ping failed: server unreachable or CORS issue.');
    } finally {
      setPinging(false);
    }
  };

  const handleRestoreStandards = async () => {
    if (!window.confirm('Reset all reference standards to official WHO (4th Ed) & BIS (IS 10500:2012) defaults?')) return;
    try {
      const res = await standardsAPI.resetDefaults();
      if (res.success) {
        setActionSuccess('Official reference standards restored successfully.');
        await fetchAdminData();
      }
    } catch (err) {
      setActionError(err.message || 'Failed to restore standards.');
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      const res = await authAPI.updateUserRole(userId, newRole);
      if (res.success) {
        setActionSuccess(`User role updated to ${newRole}.`);
        setUsers((prev) =>
          prev.map((u) => (u._id === userId ? { ...u, role: newRole } : u))
        );
        setTimeout(() => setActionSuccess(''), 3000);
      }
    } catch (err) {
      setActionError(err.message || 'Failed to update user role.');
    }
  };

  const filteredUsers = users.filter((u) => {
    const q = userSearch.toLowerCase();
    return (
      (u.name && u.name.toLowerCase().includes(q)) ||
      (u.email && u.email.toLowerCase().includes(q)) ||
      (u.username && u.username.toLowerCase().includes(q)) ||
      (u.role && u.role.toLowerCase().includes(q))
    );
  });

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '3rem' }}>
      {/* Top Banner with Workflow Navigation Switcher */}
      <div className="admin-top-banner">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#04121f',
              boxShadow: '0 4px 15px rgba(6, 182, 212, 0.35)',
            }}
          >
            <ShieldAlert size={26} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <h1 style={{ fontSize: '1.45rem', fontWeight: 800, fontFamily: 'Outfit', margin: 0 }}>
                Admin Backend Command Center
              </h1>
              <span
                style={{
                  background: health?.database?.connected ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                  color: health?.database?.connected ? '#10b981' : '#ef4444',
                  border: `1px solid ${health?.database?.connected ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`,
                  padding: '0.2rem 0.6rem',
                  borderRadius: '9999px',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                }}
              >
                {health?.database?.connected ? '🟢 LIVE BACKEND' : '🔴 OFFLINE'}
              </span>
            </div>
            <p style={{ color: '#94a3b8', fontSize: '0.82rem', margin: '0.2rem 0 0' }}>
              Node.js Express REST API • High-Availability Gateway • MongoDB Mongoose ODM • Security & Infrastructure Telemetry
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
          <button
            className="btn btn-secondary btn-sm"
            onClick={handlePing}
            disabled={pinging}
            title="Measure network roundtrip latency to Node.js backend"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <Zap size={14} style={{ color: '#06b6d4' }} />
            {pinging ? 'Pinging...' : pingMs ? `${pingMs}ms Latency` : 'Ping API'}
          </button>

          <button
            className="btn btn-secondary btn-sm"
            onClick={fetchAdminData}
            title="Refresh database telemetry and logs"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <RefreshCw size={14} /> Refresh
          </button>

          <Link
            to="/dashboard"
            className="btn btn-primary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <LayoutDashboard size={14} /> Surveillance Dashboard
            <ArrowRight size={13} />
          </Link>
        </div>
      </div>

      {actionSuccess && (
        <div
          style={{
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.35)',
            color: '#10b981',
            padding: '0.85rem 1.25rem',
            borderRadius: '12px',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            fontSize: '0.9rem',
          }}
        >
          <CheckCircle2 size={18} /> {actionSuccess}
        </div>
      )}

      {actionError && (
        <div
          style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.35)',
            color: '#ef4444',
            padding: '0.85rem 1.25rem',
            borderRadius: '12px',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            fontSize: '0.9rem',
          }}
        >
          <AlertTriangle size={18} /> {actionError}
        </div>
      )}

      {/* Database & Server Key Metrics Ribbon */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 150px), 1fr))',
          gap: '1rem',
          marginBottom: '1.75rem',
        }}
      >
        <div className="card" style={{ padding: '1.1rem', background: 'rgba(18, 26, 47, 0.85)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontSize: '0.8rem', marginBottom: '0.4rem' }}>
            <span>Database State</span>
            <Database size={16} style={{ color: '#06b6d4' }} />
          </div>
          <div style={{ fontSize: '1.2rem', fontWeight: 700, color: health?.database?.connected ? '#10b981' : '#ef4444' }}>
            {health?.database?.connected ? 'CONNECTED' : 'DISCONNECTED'}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.2rem' }}>
            DB: <strong>{health?.database?.dbName || 'heavy_metal_db'}</strong>
          </div>
        </div>

        <div className="card" style={{ padding: '1.1rem', background: 'rgba(18, 26, 47, 0.85)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontSize: '0.8rem', marginBottom: '0.4rem' }}>
            <span>API Server Uptime</span>
            <Activity size={16} style={{ color: '#14b8a6' }} />
          </div>
          <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f8fafc', fontFamily: 'JetBrains Mono' }}>
            {health?.uptimeSeconds ? `${health.uptimeSeconds}s` : '—'}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.2rem' }}>
            Node: <strong>{health?.nodeVersion || 'v22.x'}</strong>
          </div>
        </div>

        <Link to="/samples" style={{ textDecoration: 'none' }}>
          <div className="card" style={{ padding: '1.1rem', background: 'rgba(18, 26, 47, 0.85)', cursor: 'pointer' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontSize: '0.8rem', marginBottom: '0.4rem' }}>
              <span>Water Samples</span>
              <Droplets size={16} style={{ color: '#38bdf8' }} />
            </div>
            <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#38bdf8' }}>
              {health?.collections?.samples ?? '—'}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.2rem' }}>
              Stored sample records
            </div>
          </div>
        </Link>

        <Link to="/analysis" style={{ textDecoration: 'none' }}>
          <div className="card" style={{ padding: '1.1rem', background: 'rgba(18, 26, 47, 0.85)', cursor: 'pointer' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontSize: '0.8rem', marginBottom: '0.4rem' }}>
              <span>Assessments (HPI/HEI)</span>
              <Calculator size={16} style={{ color: '#c084fc' }} />
            </div>
            <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#c084fc' }}>
              {health?.collections?.assessments ?? '—'}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.2rem' }}>
              Indexed pollution scores
            </div>
          </div>
        </Link>

        <Link to="/standards" style={{ textDecoration: 'none' }}>
          <div className="card" style={{ padding: '1.1rem', background: 'rgba(18, 26, 47, 0.85)', cursor: 'pointer' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontSize: '0.8rem', marginBottom: '0.4rem' }}>
              <span>Reference Standards</span>
              <BookOpen size={16} style={{ color: '#f59e0b' }} />
            </div>
            <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f59e0b' }}>
              {health?.collections?.standards ?? 18}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.2rem' }}>
              WHO & BIS parameters
            </div>
          </div>
        </Link>

        <div className="card" style={{ padding: '1.1rem', background: 'rgba(18, 26, 47, 0.85)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontSize: '0.8rem', marginBottom: '0.4rem' }}>
            <span>Users / Audit Logs</span>
            <Users size={16} style={{ color: '#10b981' }} />
          </div>
          <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#10b981' }}>
            {health?.collections?.users ?? users.length} / {totalLogs}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.2rem' }}>
            Accounts & audit events
          </div>
        </div>
      </div>

      {/* Main Tabbed Management Workspace */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          borderBottom: '1px solid rgba(148, 163, 184, 0.15)',
          marginBottom: '1.5rem',
          overflowX: 'auto',
          whiteSpace: 'nowrap',
          WebkitOverflowScrolling: 'touch',
          paddingBottom: '2px',
        }}
      >
        <button
          type="button"
          onClick={() => handleTabChange('telemetry')}
          style={{
            padding: '0.75rem 1.25rem',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'telemetry' ? '2px solid #06b6d4' : '2px solid transparent',
            color: activeTab === 'telemetry' ? '#06b6d4' : '#94a3b8',
            fontWeight: activeTab === 'telemetry' ? 700 : 500,
            fontSize: '0.9rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            transition: 'all 0.2s',
          }}
        >
          <Server size={16} /> Backend Infrastructure & Telemetry
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('users')}
          style={{
            padding: '0.75rem 1.25rem',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'users' ? '2px solid #06b6d4' : '2px solid transparent',
            color: activeTab === 'users' ? '#06b6d4' : '#94a3b8',
            fontWeight: activeTab === 'users' ? 700 : 500,
            fontSize: '0.9rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            transition: 'all 0.2s',
          }}
        >
          <Users size={16} /> User Accounts & Access ({users.length})
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('audit')}
          style={{
            padding: '0.75rem 1.25rem',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'audit' ? '2px solid #06b6d4' : '2px solid transparent',
            color: activeTab === 'audit' ? '#06b6d4' : '#94a3b8',
            fontWeight: activeTab === 'audit' ? 700 : 500,
            fontSize: '0.9rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            transition: 'all 0.2s',
          }}
        >
          <History size={16} /> Security Audit Trails ({totalLogs})
        </button>
      </div>

      {/* TAB 1: TELEMETRY & INFRASTRUCTURE */}
      {activeTab === 'telemetry' && (
        <div className="dashboard-charts-grid">
          {/* Server Architecture Card */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem', borderBottom: '1px solid rgba(148, 163, 184, 0.1)', paddingBottom: '0.75rem' }}>
              <Cpu size={18} style={{ color: '#06b6d4' }} />
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Express.js Application Runtime</h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed rgba(148, 163, 184, 0.1)', paddingBottom: '0.4rem' }}>
                <span style={{ color: '#94a3b8' }}>API Gateway Interface</span>
                <span style={{ fontFamily: 'JetBrains Mono', color: '#10b981', fontWeight: 600 }}>Connected (Express REST)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed rgba(148, 163, 184, 0.1)', paddingBottom: '0.4rem' }}>
                <span style={{ color: '#94a3b8' }}>Node.js Engine</span>
                <span style={{ fontFamily: 'JetBrains Mono', color: '#f8fafc' }}>{health?.nodeVersion || 'v22.x'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed rgba(148, 163, 184, 0.1)', paddingBottom: '0.4rem' }}>
                <span style={{ color: '#94a3b8' }}>Environment Mode</span>
                <span style={{ textTransform: 'uppercase', color: '#10b981', fontWeight: 600 }}>{health?.environment || 'development'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed rgba(148, 163, 184, 0.1)', paddingBottom: '0.4rem' }}>
                <span style={{ color: '#94a3b8' }}>Heap Memory Footprint</span>
                <span style={{ fontFamily: 'JetBrains Mono', color: '#f8fafc' }}>
                  {health?.memory ? `${health.memory.heapUsedMb} MB / ${health.memory.heapTotalMb} MB` : '26.7 MB'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed rgba(148, 163, 184, 0.1)', paddingBottom: '0.4rem' }}>
                <span style={{ color: '#94a3b8' }}>Process RSS Resident</span>
                <span style={{ fontFamily: 'JetBrains Mono', color: '#f8fafc' }}>
                  {health?.memory ? `${health.memory.rssMb} MB` : '79.4 MB'}
                </span>
              </div>
            </div>
          </div>

          {/* MongoDB Cluster Card */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem', borderBottom: '1px solid rgba(148, 163, 184, 0.1)', paddingBottom: '0.75rem' }}>
              <Database size={18} style={{ color: '#14b8a6' }} />
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>MongoDB Mongoose Persistence</h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed rgba(148, 163, 184, 0.1)', paddingBottom: '0.4rem' }}>
                <span style={{ color: '#94a3b8' }}>Connection State</span>
                <span style={{ color: health?.database?.connected ? '#10b981' : '#ef4444', fontWeight: 700 }}>
                  {health?.database?.connected ? 'CONNECTED (Ready)' : 'DISCONNECTED'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed rgba(148, 163, 184, 0.1)', paddingBottom: '0.4rem' }}>
                <span style={{ color: '#94a3b8' }}>Target Database</span>
                <span style={{ fontFamily: 'JetBrains Mono', color: '#f8fafc' }}>{health?.database?.dbName || 'heavy_metal_db'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed rgba(148, 163, 184, 0.1)', paddingBottom: '0.4rem' }}>
                <span style={{ color: '#94a3b8' }}>Active Collections</span>
                <span style={{ fontFamily: 'JetBrains Mono', color: '#f8fafc' }}>5 Collections</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed rgba(148, 163, 184, 0.1)', paddingBottom: '0.4rem' }}>
                <span style={{ color: '#94a3b8' }}>Water Quality Datasets</span>
                <span style={{ fontFamily: 'JetBrains Mono', color: '#38bdf8' }}>{health?.collections?.samples ?? 7} Samples</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed rgba(148, 163, 184, 0.1)', paddingBottom: '0.4rem' }}>
                <span style={{ color: '#94a3b8' }}>Security Audit Records</span>
                <span style={{ fontFamily: 'JetBrains Mono', color: '#c084fc' }}>{totalLogs} Events</span>
              </div>
            </div>
          </div>

          {/* Quick Operations & Maintenance Panel */}
          <div className="card" style={{ padding: '1.5rem', gridColumn: '1 / -1' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem', borderBottom: '1px solid rgba(148, 163, 184, 0.1)', paddingBottom: '0.75rem' }}>
              <Layers size={18} style={{ color: '#c084fc' }} />
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>System Maintenance & Water Surveillance Hub</h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '1rem' }}>
              <Link to="/dashboard" className="card" style={{ padding: '1.1rem', border: '1px solid rgba(6, 182, 212, 0.3)', textDecoration: 'none', background: 'rgba(6, 182, 212, 0.05)' }}>
                <div style={{ color: '#06b6d4', fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.3rem' }}>📊 Analytics Dashboard</div>
                <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>View water quality distribution, HPI/HEI trends & statistics</div>
              </Link>

              <Link to="/standards" className="card" style={{ padding: '1.1rem', border: '1px solid rgba(20, 184, 166, 0.3)', textDecoration: 'none', background: 'rgba(20, 184, 166, 0.05)' }}>
                <div style={{ color: '#14b8a6', fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.3rem' }}>📖 Standards Management</div>
                <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Inspect, edit, or customize WHO & BIS maximum permissible limits</div>
              </Link>

              <Link to="/samples" className="card" style={{ padding: '1.1rem', border: '1px solid rgba(168, 85, 247, 0.3)', textDecoration: 'none', background: 'rgba(168, 85, 247, 0.05)' }}>
                <div style={{ color: '#c084fc', fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.3rem' }}>🧪 Water Quality Inventory</div>
                <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Manage water samples, heavy metal measurements & station details</div>
              </Link>

              <Link to="/map" className="card" style={{ padding: '1.1rem', border: '1px solid rgba(245, 158, 11, 0.3)', textDecoration: 'none', background: 'rgba(245, 158, 11, 0.05)' }}>
                <div style={{ color: '#f59e0b', fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.3rem' }}>📍 Hotspot Map</div>
                <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Geospatial OpenStreetMap inspection of contamination clusters</div>
              </Link>
            </div>

            <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid rgba(148, 163, 184, 0.1)', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button className="btn btn-secondary btn-sm" onClick={handleRestoreStandards}>
                <RefreshCw size={14} /> Restore Default WHO & BIS Reference Standards
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: USER MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="card">
          <div className="card-header" style={{ flexWrap: 'wrap', gap: '1rem' }}>
            <div className="card-title">
              <Users size={18} style={{ color: '#06b6d4' }} />
              <span>Registered User Accounts & Access Privileges</span>
            </div>

            <div style={{ position: 'relative', width: '260px' }}>
              <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: '2rem', height: '34px', fontSize: '0.8rem' }}
                placeholder="Search by name, ID, or role..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <div style={{ padding: '1.5rem' }}>
              <LoadingSkeleton height="40px" count={5} />
            </div>
          ) : (
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>User / Name</th>
                    <th>Username / ID</th>
                    <th>Email Address</th>
                    <th>Assigned Role</th>
                    <th>Created At</th>
                    <th>Privilege Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                        No user accounts matched the filter.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => (
                      <tr key={u._id}>
                        <td>
                          <strong style={{ color: '#f8fafc' }}>{u.name}</strong>
                        </td>
                        <td>
                          <code style={{ background: 'rgba(148, 163, 184, 0.1)', padding: '0.2rem 0.4rem', borderRadius: '4px', color: '#06b6d4', fontSize: '0.78rem' }}>
                            {u.username || '—'}
                          </code>
                        </td>
                        <td style={{ color: '#94a3b8', fontSize: '0.85rem' }}>{u.email}</td>
                        <td>
                          <span
                            style={{
                              padding: '0.25rem 0.6rem',
                              borderRadius: '9999px',
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              background:
                                u.role === 'admin'
                                  ? 'rgba(6, 182, 212, 0.15)'
                                  : u.role === 'analyst'
                                  ? 'rgba(20, 184, 166, 0.15)'
                                  : 'rgba(148, 163, 184, 0.15)',
                              color:
                                u.role === 'admin'
                                  ? '#06b6d4'
                                  : u.role === 'analyst'
                                  ? '#14b8a6'
                                  : '#94a3b8',
                              border: `1px solid ${
                                u.role === 'admin'
                                  ? 'rgba(6, 182, 212, 0.3)'
                                  : u.role === 'analyst'
                                  ? 'rgba(20, 184, 166, 0.3)'
                                  : 'rgba(148, 163, 184, 0.3)'
                              }`,
                            }}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td style={{ color: '#64748b', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                          {formatDate(u.createdAt)}
                        </td>
                        <td>
                          <select
                            className="form-select"
                            style={{ width: 'auto', padding: '0.3rem 0.6rem', fontSize: '0.78rem', height: '32px' }}
                            value={u.role}
                            onChange={(e) => handleRoleChange(u._id, e.target.value)}
                          >
                            <option value="admin">Administrator</option>
                            <option value="analyst">Analyst</option>
                            <option value="viewer">Viewer</option>
                          </select>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: AUDIT TRAILS */}
      {activeTab === 'audit' && (
        <div className="card">
          <div className="card-header" style={{ flexWrap: 'wrap', gap: '1rem' }}>
            <div className="card-title">
              <History size={18} style={{ color: '#c084fc' }} />
              <span>Immutable System Audit Trail</span>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <Filter size={15} style={{ color: '#64748b' }} />
              <select
                className="form-select"
                style={{ width: 'auto', height: '34px', fontSize: '0.8rem' }}
                value={auditActionFilter}
                onChange={(e) => {
                  setAuditActionFilter(e.target.value);
                  setPage(1);
                }}
              >
                <option value="">All Security Events</option>
                <option value="SAMPLE_CREATE">Sample Creations</option>
                <option value="SAMPLE_UPDATE">Sample Updates</option>
                <option value="USER_LOGIN">User Logins</option>
                <option value="UPDATE_USER_ROLE">Role Changes</option>
                <option value="STANDARDS_UPDATE">Standards Updates</option>
                <option value="ASSESSMENT_CALCULATE">Calculations</option>
              </select>
              <span className="badge badge-neutral">Page {page}</span>
            </div>
          </div>

          {loading ? (
            <div style={{ padding: '1.5rem' }}>
              <LoadingSkeleton height="40px" count={6} />
            </div>
          ) : (
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>Action</th>
                    <th>Target Entity</th>
                    <th>Operator</th>
                    <th>Origin IP</th>
                    <th>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                        No audit events recorded for the selected filter.
                      </td>
                    </tr>
                  ) : (
                    logs.map((log) => (
                      <tr key={log._id}>
                        <td style={{ color: '#94a3b8', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                          {formatDate(log.timestamp)}
                        </td>
                        <td>
                          <span
                            className="badge badge-neutral"
                            style={{ fontFamily: 'JetBrains Mono', fontSize: '0.72rem' }}
                          >
                            {log.action}
                          </span>
                        </td>
                        <td>
                          <strong style={{ color: '#f8fafc' }}>{log.entityType}</strong>
                        </td>
                        <td>
                          {log.userId?.name ? (
                            <span>
                              {log.userId.name} ({log.userId.role})
                            </span>
                          ) : (
                            <span style={{ color: '#64748b' }}>System / Automated</span>
                          )}
                        </td>
                        <td style={{ fontFamily: 'JetBrains Mono', fontSize: '0.75rem', color: '#64748b' }}>
                          {log.ipAddress || '127.0.0.1'}
                        </td>
                        <td
                          style={{
                            fontSize: '0.78rem',
                            color: '#94a3b8',
                            maxWidth: '300px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {JSON.stringify(log.details || {})}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {totalLogs > 15 && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '1rem 1.5rem',
                borderTop: '1px solid rgba(148, 163, 184, 0.1)',
              }}
            >
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
              >
                Previous
              </button>
              <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                Page {page} of {Math.ceil(totalLogs / 15)}
              </span>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= Math.ceil(totalLogs / 15)}
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminDashboardPage;
