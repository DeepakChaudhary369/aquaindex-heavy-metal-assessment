import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Droplets,
  MapPin,
  AlertTriangle,
  Calendar,
  Activity,
  PlusCircle,
  FileSpreadsheet,
  ArrowRight,
  TrendingUp,
  BarChart2,
  PieChart as PieIcon,
  RefreshCw,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ReferenceLine,
} from 'recharts';
import { dashboardAPI, samplesAPI } from '../services/api';
import MetricCard from '../components/MetricCard';
import DemoDataBanner from '../components/DemoDataBanner';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { formatDateShort, getHpiBadge, getHeiBadge, getReviewBadge } from '../utils/formatters';

const PIE_COLORS = {
  withinThreshold: '#10b981',
  requiresReview: '#f59e0b',
  exceedsThreshold: '#ef4444',
};

const DashboardPage = () => {
  const [summary, setSummary] = useState(null);
  const [trends, setTrends] = useState(null);
  const [recentSamples, setRecentSamples] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [sumRes, trendRes, samplesRes] = await Promise.all([
        dashboardAPI.getSummary(),
        dashboardAPI.getTrends(),
        samplesAPI.getSamples({ limit: 6, sortBy: 'collectionDate', sortOrder: 'desc' }),
      ]);

      if (sumRes.success) setSummary(sumRes.data);
      if (trendRes.success) setTrends(trendRes.data);
      if (samplesRes.success) setRecentSamples(samplesRes.data);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard data from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const classificationPieData = summary
    ? [
        { name: 'Within Threshold (<50)', value: summary.classificationCounts?.withinThreshold || 0, color: PIE_COLORS.withinThreshold },
        { name: 'Requires Review (50-100)', value: summary.classificationCounts?.requiresReview || 0, color: PIE_COLORS.requiresReview },
        { name: 'Exceeds Threshold (>100)', value: summary.classificationCounts?.exceedsThreshold || 0, color: PIE_COLORS.exceedsThreshold },
      ].filter((d) => d.value > 0)
    : [];

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Environmental Quality Dashboard</h1>
          <p className="page-description">
            Continuous surveillance and index scoring of heavy metals across surface and groundwater monitoring stations.
          </p>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary btn-sm" onClick={fetchData} title="Refresh dataset">
            <RefreshCw size={15} /> Refresh
          </button>
          <Link to="/reports" className="btn btn-secondary btn-sm">
            <FileSpreadsheet size={15} /> Export Reports
          </Link>
          <Link to="/samples/new" className="btn btn-primary btn-sm">
            <PlusCircle size={15} /> Add Sample
          </Link>
        </div>
      </div>

      {/* Demo dataset warning if synthetic demo data is seeded */}
      <DemoDataBanner visible={summary?.hasDemoData} />

      {error && (
        <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }}>
          {error}
        </div>
      )}

      {/* Primary KPI Metrics Grid */}
      {loading ? (
        <div className="metric-grid">
          <LoadingSkeleton height="110px" count={6} />
        </div>
      ) : (
        <div className="metric-grid">
          <MetricCard
            title="Total Water Samples"
            value={summary?.totalSamples ?? 0}
            subtitle="Analyzed samples"
            icon={Droplets}
          />
          <MetricCard
            title="Locations Monitored"
            value={summary?.locationsMonitored ?? 0}
            subtitle="Active river, lake & groundwater basins"
            icon={MapPin}
          />
          <MetricCard
            title="Requires Attention"
            value={summary?.samplesRequiringAttention ?? 0}
            subtitle="HPI ≥ 50 or HEI ≥ 10"
            icon={AlertTriangle}
            variant={summary?.samplesRequiringAttention > 0 ? 'warning' : 'success'}
          />
          <MetricCard
            title="Latest Recorded Sample"
            value={summary?.latestSampleDate ? formatDateShort(summary.latestSampleDate) : 'None'}
            subtitle="Most recent field collection"
            icon={Calendar}
          />
          <MetricCard
            title="Average HPI"
            value={summary?.averageHpi !== null ? summary.averageHpi : 'N/A'}
            subtitle="Threshold: 100 (Prasad & Bose)"
            icon={Activity}
            variant={summary?.averageHpi > 100 ? 'danger' : summary?.averageHpi >= 50 ? 'warning' : 'success'}
          />
          <MetricCard
            title="Average HEI"
            value={summary?.averageHei !== null ? summary.averageHei : 'N/A'}
            subtitle="Threshold: 20 (Edet & Offiong)"
            icon={Activity}
            variant={summary?.averageHei > 20 ? 'danger' : summary?.averageHei >= 10 ? 'warning' : 'success'}
          />
        </div>
      )}

      {/* Charts Grid */}
      <div className="dashboard-charts-grid">
        {/* HPI & HEI Trend Timeline */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">
                <TrendingUp size={18} style={{ color: 'var(--primary)' }} />
                <span>Pollution Index Timeline Trend</span>
              </div>
              <div className="card-subtitle">Calculated HPI and HEI score trajectories across sample collection events</div>
            </div>
            <Link to="/trends" className="btn btn-outline btn-sm">Deep Dive</Link>
          </div>

          <div style={{ width: '100%', height: '300px' }}>
            {trends && trends.timelineData?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trends.timelineData} margin={{ top: 10, right: 10, left: -15, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.15)" />
                  <XAxis dataKey="sampleId" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(148, 163, 184, 0.2)', borderRadius: '8px', color: '#f8fafc', fontSize: '12px' }}
                  />
                  <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '12px' }} />
                  <ReferenceLine y={100} label={{ value: 'HPI Critical (100)', fill: '#ef4444', fontSize: 10 }} stroke="#ef4444" strokeDasharray="3 3" />
                  <ReferenceLine y={50} label={{ value: 'HPI Threshold (50)', fill: '#f59e0b', fontSize: 10 }} stroke="#f59e0b" strokeDasharray="3 3" />
                  <Line type="monotone" dataKey="hpi" name="HPI (Pollution Index)" stroke="#06b6d4" strokeWidth={2.5} dot={{ r: 4, fill: '#06b6d4' }} />
                  <Line type="monotone" dataKey="hei" name="HEI (Evaluation Index)" stroke="#10b981" strokeWidth={2} dot={{ r: 4, fill: '#10b981' }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
                No trend trajectory data available.
              </div>
            )}
          </div>
        </div>

        {/* Metal Concentrations Average Bar Chart */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">
                <BarChart2 size={18} style={{ color: 'var(--accent)' }} />
                <span>Heavy Metal Mean Concentrations</span>
              </div>
              <div className="card-subtitle">Average normalized concentration (mg/L) across all monitoring samples</div>
            </div>
            <Link to="/analysis" className="btn btn-outline btn-sm">Analysis</Link>
          </div>

          <div style={{ width: '100%', height: '300px' }}>
            {trends && trends.metalAverages?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trends.metalAverages} margin={{ top: 10, right: 10, left: -15, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.15)" />
                  <XAxis dataKey="symbol" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(148, 163, 184, 0.2)', borderRadius: '8px', color: '#f8fafc', fontSize: '12px' }}
                    formatter={(val) => [`${val} mg/L`, 'Mean Concentration']}
                  />
                  <Bar dataKey="averageMgL" name="Concentration (mg/L)" fill="#14b8a6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
                No metal concentration data available.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Two Column Section: Recent Samples Table & Classification Distribution */}
      <div className="dashboard-split-grid" style={{ marginBottom: '1.5rem' }}>
        {/* Recent Samples Table */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Recent Water Quality Measurements</div>
              <div className="card-subtitle">Latest samples registered in MongoDB database</div>
            </div>
            <Link to="/samples" className="btn btn-outline btn-sm">
              View All ({summary?.totalSamples || 0}) <ArrowRight size={14} />
            </Link>
          </div>

          {/* Mobile Card-Based List View (Visible <= 768px) */}
          <div className="dashboard-mobile-samples">
            {recentSamples.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)' }}>
                No water samples recorded yet.
              </div>
            ) : (
              recentSamples.map((sample) => {
                const latest = sample.latestAssessment;
                const hpiBadge = getHpiBadge(latest?.hpiValue);
                const reviewBadge = getReviewBadge(latest?.classification?.overallReview);

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
                          Uncalculated
                        </span>
                      )}
                    </div>

                    <div className="sample-mobile-loc">
                      <MapPin size={14} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                      <span>{sample.location}</span>
                    </div>

                    <div className="sample-mobile-footer">
                      <div className="sample-mobile-meta">
                        <span style={{ textTransform: 'capitalize' }}>💧 {sample.waterSource}</span>
                        <span>📅 {formatDateShort(sample.collectionDate)}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <span
                          className="badge"
                          style={{
                            backgroundColor: reviewBadge.bg,
                            color: reviewBadge.text,
                            border: `1px solid ${reviewBadge.text}40`,
                            fontSize: '0.68rem',
                            padding: '0.15rem 0.4rem',
                          }}
                        >
                          {reviewBadge.label}
                        </span>
                        <Link
                          to={`/samples/${sample._id}`}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '0.2rem 0.55rem', fontSize: '0.72rem' }}
                        >
                          View &rarr;
                        </Link>
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
                  <th>Location</th>
                  <th>Source</th>
                  <th>Date</th>
                  <th>HPI Score</th>
                  <th>Review Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {recentSamples.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                      No water samples recorded yet.
                    </td>
                  </tr>
                ) : (
                  recentSamples.map((sample) => {
                    const latest = sample.latestAssessment;
                    const hpiBadge = getHpiBadge(latest?.hpiValue);
                    const reviewBadge = getReviewBadge(latest?.classification?.overallReview);

                    return (
                      <tr key={sample._id}>
                        <td style={{ fontWeight: 600, fontFamily: 'JetBrains Mono', fontSize: '0.82rem' }}>
                          <Link to={`/samples/${sample._id}`} style={{ color: 'var(--primary)' }}>
                            {sample.sampleId}
                          </Link>
                          {sample.isDemoData && (
                            <span className="badge badge-demo" style={{ marginLeft: '0.4rem', fontSize: '0.65rem' }}>
                              Demo
                            </span>
                          )}
                        </td>
                        <td>{sample.location}</td>
                        <td style={{ textTransform: 'capitalize' }}>{sample.waterSource}</td>
                        <td style={{ color: 'var(--text-muted)' }}>{formatDateShort(sample.collectionDate)}</td>
                        <td>
                          {latest ? (
                            <span className={`badge ${hpiBadge.className}`}>
                              {latest.hpiValue}
                            </span>
                          ) : (
                            <span className="badge badge-neutral">Uncalculated</span>
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
                        <td>
                          <Link to={`/samples/${sample._id}`} className="btn btn-secondary btn-sm" style={{ padding: '0.25rem 0.6rem' }}>
                            View
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pollution Classification Distribution Pie */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">
                <PieIcon size={18} style={{ color: 'var(--primary)' }} />
                <span>Classification Mix</span>
              </div>
              <div className="card-subtitle">Screening breakdown per Prasad & Bose (2001)</div>
            </div>
          </div>

          <div style={{ width: '100%', height: '220px' }}>
            {classificationPieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={classificationPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {classificationPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(148, 163, 184, 0.2)', borderRadius: '8px', color: '#f8fafc', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
                No assessments calculated yet.
              </div>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.75rem', fontSize: '0.8rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: PIE_COLORS.withinThreshold }} />
                Low Pollution (&lt;50)
              </span>
              <strong style={{ color: PIE_COLORS.withinThreshold }}>{summary?.classificationCounts?.withinThreshold || 0}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: PIE_COLORS.requiresReview }} />
                Requires Review (50-100)
              </span>
              <strong style={{ color: PIE_COLORS.requiresReview }}>{summary?.classificationCounts?.requiresReview || 0}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: PIE_COLORS.exceedsThreshold }} />
                Exceeds Threshold (&gt;100)
              </span>
              <strong style={{ color: PIE_COLORS.exceedsThreshold }}>{summary?.classificationCounts?.exceedsThreshold || 0}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
