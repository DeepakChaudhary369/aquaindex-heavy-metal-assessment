import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Droplets,
  Search,
  Filter,
  PlusCircle,
  Eye,
  Trash2,
  Calculator,
  RefreshCw,
  FileSpreadsheet,
  AlertTriangle,
  MapPin,
} from 'lucide-react';
import { samplesAPI, assessmentsAPI } from '../services/api';
import { formatDateShort, getHpiBadge, getReviewBadge } from '../utils/formatters';
import LoadingSkeleton from '../components/LoadingSkeleton';
import DemoDataBanner from '../components/DemoDataBanner';
import { useAuth } from '../context/AuthContext';

const SamplesListPage = () => {
  const { isAnalyst } = useAuth();

  const [samples, setSamples] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Enhanced Filters
  const [search, setSearch] = useState('');
  const [district, setDistrict] = useState('all');
  const [waterSource, setWaterSource] = useState('all');
  const [selectedMetal, setSelectedMetal] = useState('all');
  const [metalExceeding, setMetalExceeding] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortBy, setSortBy] = useState('collectionDate');
  const [sortOrder, setSortOrder] = useState('desc');
  const [hasCoordinates, setHasCoordinates] = useState('all');
  const [limit, setLimit] = useState(25);

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Quick calculate state
  const [calculatingId, setCalculatingId] = useState(null);

  const fetchSamples = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {
        page,
        limit,
        search: search.trim() || undefined,
        district: district !== 'all' ? district : undefined,
        waterSource: waterSource !== 'all' ? waterSource : undefined,
        metal: selectedMetal !== 'all' ? selectedMetal : undefined,
        metalExceeding: metalExceeding ? 'true' : undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        sortBy,
        sortOrder,
        hasCoordinates: hasCoordinates === 'true' ? 'true' : undefined,
      };

      const res = await samplesAPI.getSamples(params);
      if (res.success) {
        setSamples(res.data);
        setTotal(res.total);
        setTotalPages(res.totalPages);
      }
    } catch (err) {
      setError(err.message || 'Failed to retrieve water samples.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSamples();
  }, [page, limit, district, waterSource, selectedMetal, metalExceeding, startDate, endDate, sortBy, sortOrder, hasCoordinates]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchSamples();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await samplesAPI.deleteSample(deleteTarget._id);
      setDeleteTarget(null);
      fetchSamples();
    } catch (err) {
      alert(err.message || 'Failed to delete sample.');
    } finally {
      setDeleting(false);
    }
  };

  const handleQuickCalculate = async (sample) => {
    setCalculatingId(sample._id);
    try {
      await assessmentsAPI.calculate(sample._id, { authority: 'WHO' });
      await fetchSamples();
    } catch (err) {
      alert(err.message || 'Calculation error.');
    } finally {
      setCalculatingId(null);
    }
  };

  const hasDemo = samples.some((s) => s.isDemoData);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Water Quality Inventory</h1>
          <p className="page-description">
            Complete database of surface, groundwater, and estuarine water samples monitored for heavy metal pollution.
          </p>
        </div>
        <div className="page-actions">
          <Link to="/reports" className="btn btn-secondary btn-sm">
            <FileSpreadsheet size={15} /> Export CSV
          </Link>
          {isAnalyst && (
            <Link to="/samples/new" className="btn btn-primary btn-sm">
              <PlusCircle size={15} /> New Sample
            </Link>
          )}
        </div>
      </div>

      <DemoDataBanner visible={hasDemo} />

      {error && (
        <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }}>
          {error}
        </div>
      )}

      {/* Comprehensive Filter Toolbar */}
      <div className="card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
          {/* Top Row: Search, District, Source Type */}
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ flex: '1 1 220px', position: 'relative' }}>
              <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }} />
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: '2.1rem', paddingBottom: '0.45rem', paddingTop: '0.45rem', fontSize: '0.84rem' }}
                placeholder="Search ID, location, district, state..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* District Filter */}
            <div style={{ flex: '1 1 150px' }}>
              <select
                className="form-select"
                style={{ paddingBottom: '0.45rem', paddingTop: '0.45rem', fontSize: '0.84rem' }}
                value={district}
                onChange={(e) => {
                  setDistrict(e.target.value);
                  setPage(1);
                }}
              >
                <option value="all">All Districts</option>
                <option value="Amritsar">Amritsar (Punjab)</option>
                <option value="Delhi">Delhi (NCT)</option>
                <option value="Jaipur">Jaipur (Rajasthan)</option>
                <option value="Jalandhar">Jalandhar (Punjab)</option>
                <option value="Kanpur">Kanpur (Uttar Pradesh)</option>
                <option value="Kota">Kota (Rajasthan)</option>
                <option value="Ludhiana">Ludhiana (Punjab)</option>
                <option value="Panipat">Panipat (Haryana)</option>
                <option value="Sonipat">Sonipat (Haryana)</option>
                <option value="Varanasi">Varanasi (Uttar Pradesh)</option>
              </select>
            </div>

            {/* Water Source Filter */}
            <div style={{ flex: '1 1 150px' }}>
              <select
                className="form-select"
                style={{ paddingBottom: '0.45rem', paddingTop: '0.45rem', fontSize: '0.84rem' }}
                value={waterSource}
                onChange={(e) => {
                  setWaterSource(e.target.value);
                  setPage(1);
                }}
              >
                <option value="all">All Source Types</option>
                <option value="Groundwater">Groundwater</option>
                <option value="Hand pump">Hand Pump</option>
                <option value="Surface water">Surface Water</option>
                <option value="Municipal supply">Municipal Supply</option>
                <option value="river">River</option>
                <option value="lake">Lake</option>
                <option value="pond">Pond</option>
              </select>
            </div>

            {/* Heavy Metal Filter */}
            <div style={{ flex: '1 1 150px' }}>
              <select
                className="form-select"
                style={{ paddingBottom: '0.45rem', paddingTop: '0.45rem', fontSize: '0.84rem' }}
                value={selectedMetal}
                onChange={(e) => {
                  setSelectedMetal(e.target.value);
                  setPage(1);
                }}
              >
                <option value="all">All Heavy Metals</option>
                <option value="Pb">Lead (Pb) - WHO: 0.01 mg/L</option>
                <option value="Cd">Cadmium (Cd) - WHO: 0.003 mg/L</option>
                <option value="Cr">Chromium (Cr) - WHO: 0.05 mg/L</option>
                <option value="Cu">Copper (Cu) - WHO: 2.0 mg/L</option>
                <option value="Zn">Zinc (Zn) - WHO: 3.0 mg/L</option>
                <option value="Ni">Nickel (Ni) - WHO: 0.07 mg/L</option>
                <option value="Fe">Iron (Fe) - WHO: 0.3 mg/L</option>
                <option value="As">Arsenic (As) - WHO: 0.01 mg/L</option>
                <option value="Hg">Mercury (Hg) - WHO: 0.001 mg/L</option>
              </select>
            </div>
          </div>

          {/* Bottom Row: Metal Exceedance, Dates, Sorting, Actions */}
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
              {selectedMetal !== 'all' && (
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', color: '#f8fafc', cursor: 'pointer', background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '0.35rem 0.65rem', borderRadius: '6px' }}>
                  <input
                    type="checkbox"
                    checked={metalExceeding}
                    onChange={(e) => {
                      setMetalExceeding(e.target.checked);
                      setPage(1);
                    }}
                  />
                  <span>Show Only Exceeding WHO Limits</span>
                </label>
              )}

              {/* Date Filters */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                <span>From:</span>
                <input
                  type="date"
                  className="form-input"
                  style={{ padding: '0.3rem 0.5rem', fontSize: '0.76rem', width: 'auto' }}
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    setPage(1);
                  }}
                />
                <span>To:</span>
                <input
                  type="date"
                  className="form-input"
                  style={{ padding: '0.3rem 0.5rem', fontSize: '0.76rem', width: 'auto' }}
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    setPage(1);
                  }}
                />
              </div>

              {/* Sort By */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <select
                  className="form-select"
                  style={{ padding: '0.35rem 0.6rem', fontSize: '0.78rem' }}
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="collectionDate">Sort by Date</option>
                  <option value="sampleId">Sort by Sample ID</option>
                  <option value="hpi">Sort by HPI Score</option>
                  <option value="district">Sort by District</option>
                </select>

                <select
                  className="form-select"
                  style={{ padding: '0.35rem 0.6rem', fontSize: '0.78rem' }}
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                >
                  <option value="desc">Descending</option>
                  <option value="asc">Ascending</option>
                </select>

                <select
                  className="form-select"
                  style={{ padding: '0.35rem 0.6rem', fontSize: '0.78rem' }}
                  value={limit}
                  onChange={(e) => {
                    setLimit(Number(e.target.value));
                    setPage(1);
                  }}
                  title="Number of samples to display per page"
                >
                  <option value={15}>15 / page</option>
                  <option value={25}>25 / page</option>
                  <option value={50}>50 / page</option>
                  <option value={100}>100 / page</option>
                  <option value={250}>250 / page</option>
                  <option value={500}>All 500 records</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button type="submit" className="btn btn-secondary btn-sm" style={{ padding: '0.45rem 0.9rem' }}>
                <Filter size={13} /> Apply
              </button>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => {
                  setSearch('');
                  setDistrict('all');
                  setWaterSource('all');
                  setSelectedMetal('all');
                  setMetalExceeding(false);
                  setStartDate('');
                  setEndDate('');
                  setSortBy('collectionDate');
                  setSortOrder('desc');
                  setHasCoordinates('all');
                  setPage(1);
                  fetchSamples();
                }}
              >
                Reset Filters
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Samples Table */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <Droplets size={18} style={{ color: 'var(--primary)' }} />
            <span>Monitored Samples ({total})</span>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={fetchSamples} title="Reload table">
            <RefreshCw size={14} />
          </button>
        </div>

        {loading ? (
          <div style={{ padding: '1.5rem' }}>
            <LoadingSkeleton height="45px" count={8} />
          </div>
        ) : (
          <>
            {/* Mobile Cards View (Visible <= 768px) */}
            <div className="dashboard-mobile-samples">
              {samples.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  No water samples found matching current filter parameters.
                </div>
              ) : (
                samples.map((sample) => {
                  const latest = sample.latestAssessment;
                  const hpiBadge = getHpiBadge(latest?.hpiValue);
                  const reviewBadge = getReviewBadge(latest?.classification?.overallReview);
                  const metalSymbols = (sample.measurements || []).map((m) => m.metalSymbol).join(', ');

                  return (
                    <div key={sample._id} className="sample-mobile-card">
                      <div className="sample-mobile-card-top">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', minWidth: 0 }}>
                          <Link to={`/samples/${sample._id}`} className="sample-mobile-id">
                            {sample.sampleId}
                          </Link>
                          {sample.isDemoData && (
                            <span className="badge badge-demo" style={{ fontSize: '0.62rem', padding: '0.12rem 0.35rem' }}>
                              Demo
                            </span>
                          )}
                        </div>
                        {latest ? (
                          <span className={`badge ${hpiBadge.className}`} style={{ fontSize: '0.74rem', fontWeight: 700 }}>
                            HPI: {latest.hpiValue}
                          </span>
                        ) : (
                          <span className="badge badge-neutral" style={{ fontSize: '0.72rem' }}>
                            Unassessed
                          </span>
                        )}
                      </div>

                      <div className="sample-mobile-loc">
                        <MapPin size={14} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                        <span>{sample.location}</span>
                      </div>

                      <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                        Metals: <span style={{ color: 'var(--text-main)', fontFamily: 'JetBrains Mono' }}>{metalSymbols || '—'}</span>
                      </div>

                      <div className="sample-mobile-footer">
                        <div className="sample-mobile-meta">
                          <span style={{ textTransform: 'capitalize' }}>💧 {sample.waterSource}</span>
                          <span>📅 {formatDateShort(sample.collectionDate)}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <Link
                            to={`/samples/${sample._id}`}
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '0.2rem 0.5rem', fontSize: '0.72rem' }}
                          >
                            <Eye size={12} /> Details
                          </Link>
                          {!latest && isAnalyst && (
                            <button
                              className="btn btn-outline btn-sm"
                              onClick={() => handleQuickCalculate(sample)}
                              disabled={calculatingId === sample._id}
                              style={{ padding: '0.2rem 0.5rem', fontSize: '0.72rem' }}
                            >
                              <Calculator size={12} /> Compute
                            </button>
                          )}
                          {isAnalyst && (
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => setDeleteTarget(sample)}
                              style={{ padding: '0.2rem 0.45rem', fontSize: '0.72rem' }}
                            >
                              <Trash2 size={12} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Desktop Table View (Visible > 768px) */}
            <div className="table-responsive dashboard-desktop-table">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Sample ID</th>
                    <th>Location Name</th>
                    <th>Source</th>
                    <th>Collection Date</th>
                    <th>Metals Tested</th>
                    <th>HPI Score</th>
                    <th>Screening Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {samples.length === 0 ? (
                    <tr>
                      <td colSpan={8} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                        No water samples found matching current filter parameters.
                      </td>
                    </tr>
                  ) : (
                    samples.map((sample) => {
                      const latest = sample.latestAssessment;
                      const hpiBadge = getHpiBadge(latest?.hpiValue);
                      const reviewBadge = getReviewBadge(latest?.classification?.overallReview);
                      const metalSymbols = (sample.measurements || []).map((m) => m.metalSymbol).join(', ');

                      return (
                        <tr key={sample._id}>
                          <td style={{ fontWeight: 600, fontFamily: 'JetBrains Mono', fontSize: '0.82rem' }}>
                            <Link to={`/samples/${sample._id}`} style={{ color: 'var(--primary)' }}>
                              {sample.sampleId}
                            </Link>
                            {sample.isDemoData && (
                              <span className="badge badge-demo" style={{ marginLeft: '0.4rem', fontSize: '0.62rem' }}>
                                Demo
                              </span>
                            )}
                          </td>
                          <td>
                            <div style={{ fontWeight: 500 }}>{sample.location}</div>
                            {sample.coordinates?.latitude && (
                              <div style={{ fontSize: '0.72rem', color: 'var(--text-subtle)' }}>
                                {sample.coordinates.latitude.toFixed(4)}°N, {sample.coordinates.longitude.toFixed(4)}°E
                              </div>
                            )}
                          </td>
                          <td style={{ textTransform: 'capitalize' }}>
                            <span className="badge badge-neutral">{sample.waterSource}</span>
                          </td>
                          <td style={{ color: 'var(--text-muted)' }}>{formatDateShort(sample.collectionDate)}</td>
                          <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {metalSymbols || '—'}
                          </td>
                          <td>
                            {latest ? (
                              <span className={`badge ${hpiBadge.className}`}>
                                {latest.hpiValue}
                              </span>
                            ) : (
                              <span className="badge badge-neutral">Unassessed</span>
                            )}
                          </td>
                          <td>
                            <span
                              className="badge"
                              style={{ backgroundColor: reviewBadge.bg, color: reviewBadge.text, border: `1px solid ${reviewBadge.text}40` }}
                            >
                              {reviewBadge.label}
                            </span>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                              <Link
                                to={`/samples/${sample._id}`}
                                className="btn btn-secondary btn-sm"
                                title="View details and measurements"
                              >
                                <Eye size={13} /> Details
                              </Link>
                              {!latest && isAnalyst && (
                                <button
                                  className="btn btn-outline btn-sm"
                                  onClick={() => handleQuickCalculate(sample)}
                                  disabled={calculatingId === sample._id}
                                  title="Run HPI/HEI calculation"
                                >
                                  <Calculator size={13} /> {calculatingId === sample._id ? '...' : 'Compute'}
                                </button>
                              )}
                              {isAnalyst && (
                                <button
                                  className="btn btn-danger btn-sm"
                                  onClick={() => setDeleteTarget(sample)}
                                  title="Delete sample"
                                >
                                  <Trash2 size={13} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Pagination controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', padding: '1rem 1.5rem', borderTop: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            <span>
              Showing <strong style={{ color: 'var(--text-primary)' }}>{samples.length}</strong> of <strong style={{ color: 'var(--text-primary)' }}>{total}</strong> samples {totalPages > 1 ? `(Page ${page} of ${totalPages})` : ''}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ fontSize: '0.78rem' }}>Per page:</span>
              <select
                className="form-select"
                style={{ padding: '0.2rem 0.5rem', fontSize: '0.78rem', width: 'auto' }}
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setPage(1);
                }}
              >
                <option value={15}>15</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value={250}>250</option>
                <option value={500}>500 (All)</option>
              </select>
            </div>
          </div>
          {totalPages > 1 && (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
              >
                Previous
              </button>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1.5rem',
          }}
        >
          <div className="card" style={{ maxWidth: '440px', width: '100%', padding: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#ef4444', marginBottom: '1rem' }}>
              <AlertTriangle size={24} />
              <h2 style={{ fontSize: '1.3rem' }}>Confirm Deletion</h2>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '1.5rem' }}>
              Are you sure you want to delete water sample <strong>{deleteTarget.sampleId}</strong> ({deleteTarget.location})? All associated HPI and HEI calculation assessment records will also be permanently purged.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button className="btn btn-secondary" onClick={() => setDeleteTarget(null)} disabled={deleting}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={handleDelete} disabled={deleting}>
                {deleting ? 'Deleting...' : 'Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SamplesListPage;
