import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  PlusCircle,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { standardsAPI } from '../services/api';
import { formatDateShort } from '../utils/formatters';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { useAuth } from '../context/AuthContext';

const StandardsPage = () => {
  const { isAdmin } = useAuth();

  const [standards, setStandards] = useState([]);
  const [authorityFilter, setAuthorityFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // New standard modal state
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    metalSymbol: '',
    metalName: '',
    limitValue: '',
    unit: 'mg/L',
    authority: 'CUSTOM',
    documentTitle: '',
    version: '1.0',
    sourceUrl: '',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchStandards = async () => {
    setLoading(true);
    setError('');
    try {
      const params = authorityFilter !== 'all' ? { authority: authorityFilter } : {};
      const res = await standardsAPI.getStandards(params);
      if (res.success) {
        setStandards(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load reference standards.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStandards();
  }, [authorityFilter]);

  const handleResetDefaults = async () => {
    if (!window.confirm('Restore official WHO and BIS reference standards?')) return;
    setLoading(true);
    try {
      const res = await standardsAPI.resetDefaults();
      if (res.success) {
        setSuccess('Official WHO and BIS standards restored successfully.');
        await fetchStandards();
      }
    } catch (err) {
      setError(err.message || 'Failed to restore defaults.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      const payload = {
        ...formData,
        limitValue: parseFloat(formData.limitValue),
      };
      const res = await standardsAPI.createStandard(payload);
      if (res.success) {
        setSuccess(`Standard for ${formData.metalSymbol} (${formData.authority}) created successfully!`);
        setShowModal(false);
        setFormData({
          metalSymbol: '',
          metalName: '',
          limitValue: '',
          unit: 'mg/L',
          authority: 'CUSTOM',
          documentTitle: '',
          version: '1.0',
          sourceUrl: '',
          notes: '',
        });
        await fetchStandards();
      }
    } catch (err) {
      setError(err.message || 'Failed to create standard.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '1150px', margin: '0 auto' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Reference Standards Management</h1>
          <p className="page-description">
            Authoritative maximum allowable concentrations and permissible limits from WHO, BIS, and regulatory environmental bodies.
          </p>
        </div>
        <div className="page-actions">
          {isAdmin ? (
            <>
              <button className="btn btn-secondary btn-sm" onClick={handleResetDefaults} title="Restore baseline standards">
                <RefreshCw size={14} /> Restore Official Defaults
              </button>
              <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>
                <PlusCircle size={14} /> Add Standard
              </button>
            </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-subtle)', fontSize: '0.8rem' }}>
              <Lock size={14} /> Admin Privileges Required to Modify
            </div>
          )}
        </div>
      </div>

      {error && (
        <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }}>
          {error}
        </div>
      )}

      {success && (
        <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#10b981', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle2 size={18} /> {success}
        </div>
      )}

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem', overflowX: 'auto', whiteSpace: 'nowrap', WebkitOverflowScrolling: 'touch' }}>
        {[
          { id: 'all', label: 'All Standards' },
          { id: 'WHO', label: 'WHO Guidelines (4th Ed)' },
          { id: 'BIS', label: 'Bureau of Indian Standards (IS 10500)' },
          { id: 'CUSTOM', label: 'Custom / Regional' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setAuthorityFilter(tab.id)}
            style={{
              padding: '0.4rem 0.9rem',
              fontSize: '0.85rem',
              borderRadius: 'var(--radius-md)',
              background: authorityFilter === tab.id ? 'rgba(6, 182, 212, 0.15)' : 'transparent',
              color: authorityFilter === tab.id ? 'var(--primary)' : 'var(--text-muted)',
              border: authorityFilter === tab.id ? '1px solid var(--primary)' : '1px solid transparent',
              fontWeight: authorityFilter === tab.id ? 600 : 400,
              cursor: 'pointer',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Standards Table */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <BookOpen size={18} style={{ color: 'var(--primary)' }} />
            <span>Permissible Threshold Matrix ({standards.length})</span>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '1.5rem' }}>
            <LoadingSkeleton height="45px" count={8} />
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Metal Chemical Symbol</th>
                  <th>Permissible Limit (MAC)</th>
                  <th>Unit</th>
                  <th>Authority</th>
                  <th>Document Citation / Title</th>
                  <th>Version</th>
                  <th>Effective Date</th>
                  <th>Official Citation</th>
                </tr>
              </thead>
              <tbody>
                {standards.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                      No reference standards found.
                    </td>
                  </tr>
                ) : (
                  standards.map((std) => (
                    <tr key={std._id}>
                      <td>
                        <strong>{std.metalName}</strong>{' '}
                        <span style={{ color: 'var(--text-subtle)', fontFamily: 'JetBrains Mono' }}>
                          ({std.metalSymbol})
                        </span>
                      </td>
                      <td style={{ fontFamily: 'JetBrains Mono', fontWeight: 600, color: 'var(--primary)' }}>
                        {std.limitValue}
                      </td>
                      <td>{std.unit}</td>
                      <td>
                        <span className={`badge ${std.authority === 'WHO' ? 'badge-success' : std.authority === 'BIS' ? 'badge-warning' : 'badge-neutral'}`}>
                          {std.authority}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)', maxWidth: '240px' }}>
                        {std.documentTitle}
                      </td>
                      <td style={{ fontFamily: 'JetBrains Mono', fontSize: '0.8rem' }}>{std.version}</td>
                      <td style={{ color: 'var(--text-subtle)', fontSize: '0.8rem' }}>{formatDateShort(std.effectiveDate)}</td>
                      <td>
                        {std.sourceUrl ? (
                          <a
                            href={std.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem', color: 'var(--primary)' }}
                          >
                            Source <ExternalLink size={12} />
                          </a>
                        ) : (
                          <span style={{ color: 'var(--text-subtle)' }}>—</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Standards Integrity Assurance Notice */}
      <div
        style={{
          marginTop: '1.5rem',
          padding: '1.25rem',
          borderRadius: 'var(--radius-md)',
          background: 'rgba(15, 23, 42, 0.7)',
          border: '1px solid var(--border-subtle)',
          fontSize: '0.82rem',
          color: 'var(--text-muted)',
          lineHeight: 1.5,
        }}
      >
        <strong style={{ color: 'var(--text-main)' }}>Historical Integrity Policy:</strong> When assessments are computed, the exact reference standards and version numbers in effect are permanently stored in the calculation snapshot record. Future standard updates or regulatory revisions will never alter or corrupt historical HPI or HEI scores.
      </div>

      {/* Admin Add Standard Modal */}
      {showModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1.5rem',
          }}
        >
          <div className="card" style={{ maxWidth: '520px', width: '100%', padding: '2rem' }}>
            <h2 style={{ fontSize: '1.3rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <PlusCircle size={20} style={{ color: 'var(--primary)' }} /> Add Reference Standard
            </h2>

            <form onSubmit={handleCreateSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))', gap: '0.85rem' }}>
                <div className="form-group">
                  <label className="form-label required">Metal Symbol</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. As"
                    value={formData.metalSymbol}
                    onChange={(e) => setFormData({ ...formData, metalSymbol: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label required">Metal Name</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Arsenic"
                    value={formData.metalName}
                    onChange={(e) => setFormData({ ...formData, metalName: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))', gap: '0.85rem' }}>
                <div className="form-group">
                  <label className="form-label required">Limit Value</label>
                  <input
                    type="number"
                    step="any"
                    min="0.000001"
                    className="form-input"
                    placeholder="e.g. 0.01"
                    value={formData.limitValue}
                    onChange={(e) => setFormData({ ...formData, limitValue: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label required">Unit</label>
                  <select
                    className="form-select"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  >
                    <option value="mg/L">mg/L</option>
                    <option value="µg/L">µg/L</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))', gap: '0.85rem' }}>
                <div className="form-group">
                  <label className="form-label required">Authority</label>
                  <select
                    className="form-select"
                    value={formData.authority}
                    onChange={(e) => setFormData({ ...formData, authority: e.target.value })}
                  >
                    <option value="WHO">WHO</option>
                    <option value="BIS">BIS</option>
                    <option value="USEPA">USEPA</option>
                    <option value="EU">EU</option>
                    <option value="CUSTOM">CUSTOM</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label required">Version</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. 2026.1"
                    value={formData.version}
                    onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label required">Document Citation / Title</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Regional Groundwater Quality Standard Order #14"
                  value={formData.documentTitle}
                  onChange={(e) => setFormData({ ...formData, documentTitle: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Source URL</label>
                <input
                  type="url"
                  className="form-input"
                  placeholder="https://..."
                  value={formData.sourceUrl}
                  onChange={(e) => setFormData({ ...formData, sourceUrl: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)} disabled={submitting}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Saving...' : 'Create Standard'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StandardsPage;
