import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Droplets,
  Calendar,
  MapPin,
  Calculator,
  AlertTriangle,
  CheckCircle2,
  BookOpen,
  FlaskConical,
  RefreshCw,
  BarChart3,
  PieChart as PieIcon,
  Activity,
  Sparkles,
  ShieldAlert,
  ShieldCheck,
  TrendingUp,
  Layers,
  Info,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  Cell,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  PieChart,
  Pie,
  ReferenceLine,
} from 'recharts';
import { samplesAPI, assessmentsAPI } from '../services/api';
import { formatDate, getHpiBadge, getHeiBadge, getReviewBadge } from '../utils/formatters';
import LoadingSkeleton from '../components/LoadingSkeleton';
import DemoDataBanner from '../components/DemoDataBanner';
import { useAuth } from '../context/AuthContext';

const METAL_COLORS = {
  PB: '#ef4444', // Lead (Red)
  CD: '#f97316', // Cadmium (Orange)
  CR: '#f59e0b', // Chromium (Amber)
  CU: '#10b981', // Copper (Emerald)
  ZN: '#06b6d4', // Zinc (Cyan)
  NI: '#3b82f6', // Nickel (Blue)
  FE: '#8b5cf6', // Iron (Purple)
  AS: '#ec4899', // Arsenic (Pink)
  HG: '#e11d48', // Mercury (Rose)
};

// Custom Glowing SVG Speedometer / Gauge Meter Component
const GaugeMeter = ({ value, min = 0, max = 200, safeLimit = 50, criticalLimit = 100, title, subtitle, unit = '', colorScheme = 'hpi' }) => {
  const numericVal = typeof value === 'number' ? value : parseFloat(value) || 0;
  const clampedVal = Math.min(Math.max(numericVal, min), max);
  const percent = (clampedVal - min) / (max - min);
  const angle = -180 + percent * 180; // Arc from -180 deg to 0 deg

  const isExceeded = numericVal > criticalLimit;
  const isModerate = numericVal >= safeLimit && numericVal <= criticalLimit;
  const activeColor = isExceeded ? '#ef4444' : isModerate ? '#f59e0b' : '#10b981';
  const glowColor = isExceeded ? 'rgba(239, 68, 68, 0.45)' : isModerate ? 'rgba(245, 158, 11, 0.45)' : 'rgba(16, 185, 129, 0.45)';

  const cx = 110;
  const cy = 95;
  const r = 68;
  const strokeWidth = 14;

  const polarToCartesian = (centerX, centerY, radius, angleInDegrees) => {
    const angleInRadians = ((angleInDegrees - 180) * Math.PI) / 180.0;
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians),
    };
  };

  const describeArc = (x, y, radius, startAngle, endAngle) => {
    const start = polarToCartesian(x, y, radius, endAngle);
    const end = polarToCartesian(x, y, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
    return ['M', start.x, start.y, 'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y].join(' ');
  };

  const needleAngleRad = (angle * Math.PI) / 180;
  const needleLength = r - 12;
  const nx = cx + needleLength * Math.cos(needleAngleRad);
  const ny = cy + needleLength * Math.sin(needleAngleRad);

  return (
    <div
      style={{
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.85) 0%, rgba(11, 19, 38, 0.98) 100%)',
        borderRadius: 'var(--radius-lg)',
        padding: '1.25rem',
        border: `1px solid ${activeColor}40`,
        boxShadow: `0 8px 30px -4px ${glowColor}`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: '-30px',
          width: '130px',
          height: '130px',
          borderRadius: '50%',
          background: glowColor,
          filter: 'blur(45px)',
          pointerEvents: 'none',
        }}
      />

      <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.2rem', zIndex: 1 }}>
        {title}
      </div>

      <div style={{ position: 'relative', width: '220px', height: '115px', zIndex: 1 }}>
        <svg width="220" height="115" viewBox="0 0 220 115">
          <defs>
            <linearGradient id={`gauge-track-${colorScheme}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="45%" stopColor="#10b981" />
              <stop offset="50%" stopColor="#f59e0b" />
              <stop offset="70%" stopColor="#f59e0b" />
              <stop offset="75%" stopColor="#ef4444" />
              <stop offset="100%" stopColor="#ef4444" />
            </linearGradient>
            <filter id={`needle-glow-${colorScheme}`}>
              <feDropShadow dx="0" dy="0" stdDeviation="2.5" floodColor={activeColor} floodOpacity="0.85" />
            </filter>
          </defs>

          {/* Background Track */}
          <path
            d={describeArc(cx, cy, r, 0, 180)}
            fill="none"
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />

          {/* Gradient Track */}
          <path
            d={describeArc(cx, cy, r, 0, 180)}
            fill="none"
            stroke={`url(#gauge-track-${colorScheme})`}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            opacity="0.85"
          />

          {/* Needle Center Pivot */}
          <circle cx={cx} cy={cy} r="6" fill="#0f172a" stroke={activeColor} strokeWidth="3" filter={`url(#needle-glow-${colorScheme})`} />

          {/* Needle Line */}
          <line
            x1={cx}
            y1={cy}
            x2={nx}
            y2={ny}
            stroke={activeColor}
            strokeWidth="3.5"
            strokeLinecap="round"
            filter={`url(#needle-glow-${colorScheme})`}
          />

          {/* Glowing Needle Tip Dot */}
          <circle cx={nx} cy={ny} r="3" fill="#ffffff" filter={`url(#needle-glow-${colorScheme})`} />
        </svg>
      </div>

      <div style={{ textAlign: 'center', marginTop: '-12px', zIndex: 1 }}>
        <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: '2.3rem', fontWeight: 800, color: activeColor, textShadow: `0 0 16px ${glowColor}`, lineHeight: 1 }}>
          {value !== null && value !== undefined ? numericVal.toFixed(2) : '—'}
          {unit && <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginLeft: '0.2rem' }}>{unit}</span>}
        </div>
        <div style={{ marginTop: '0.45rem' }}>
          <span
            className="badge"
            style={{
              background: `${activeColor}22`,
              color: activeColor,
              border: `1px solid ${activeColor}55`,
              fontSize: '0.72rem',
              fontWeight: 700,
              padding: '0.2rem 0.6rem',
              letterSpacing: '0.04em',
            }}
          >
            {isExceeded ? 'CRITICAL POLLUTION' : isModerate ? 'MODERATE / THRESHOLD' : 'LOW POLLUTION'}
          </span>
        </div>
        <div style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', marginTop: '0.35rem' }}>
          {subtitle || `Safe: <${safeLimit} | Critical: >${criticalLimit}`}
        </div>
      </div>
    </div>
  );
};

// Custom Chart Tooltips
const CustomBarTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div
        style={{
          background: 'rgba(15, 23, 42, 0.95)',
          border: `1px solid ${data.exceeds ? '#ef4444' : '#06b6d4'}`,
          padding: '0.75rem 1rem',
          borderRadius: '8px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
          fontSize: '0.82rem',
          color: '#f8fafc',
        }}
      >
        <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.35rem', color: '#38bdf8' }}>
          {data.name} ({data.symbol})
        </div>
        <div>
          Measured: <strong style={{ color: data.exceeds ? '#ef4444' : '#10b981' }}>{data.measured} mg/L</strong>
        </div>
        <div style={{ color: '#94a3b8' }}>
          Standard Limit: <strong>{data.standard} mg/L</strong>
        </div>
        <div style={{ marginTop: '0.3rem', fontSize: '0.75rem' }}>
          Ratio to Limit: <strong style={{ color: data.exceeds ? '#ef4444' : '#10b981' }}>{data.ratio}x</strong>
          {data.exceeds && <span style={{ marginLeft: '0.4rem', color: '#ef4444' }}>⚠️ Exceeds Standard</span>}
        </div>
      </div>
    );
  }
  return null;
};

const CustomPieTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div
        style={{
          background: 'rgba(15, 23, 42, 0.95)',
          border: '1px solid rgba(6, 182, 212, 0.4)',
          padding: '0.65rem 0.9rem',
          borderRadius: '8px',
          fontSize: '0.82rem',
          color: '#f8fafc',
          boxShadow: '0 6px 20px rgba(0,0,0,0.4)',
        }}
      >
        <div style={{ fontWeight: 700, color: data.fill, marginBottom: '0.2rem' }}>
          {data.name} ({data.symbol})
        </div>
        <div>
          Contribution: <strong>{data.value.toFixed(1)}%</strong> of HPI
        </div>
        <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Wi × Qi Product: {data.product.toFixed(4)}</div>
      </div>
    );
  }
  return null;
};

const SampleDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAnalyst } = useAuth();

  const [sample, setSample] = useState(null);
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Location selector & list
  const [allSamples, setAllSamples] = useState([]);
  const [loadingSamplesList, setLoadingSamplesList] = useState(false);

  // Recalculation state
  const [selectedAuthority, setSelectedAuthority] = useState('WHO');
  const [calculating, setCalculating] = useState(false);
  const [calcSuccess, setCalcSuccess] = useState('');

  // Graph system visual active tab
  const [activeGraphTab, setActiveGraphTab] = useState('bars'); // 'bars' | 'radar' | 'donut' | 'subindex' | 'table'

  // Load list of all samples for location switcher
  useEffect(() => {
    let mounted = true;
    setLoadingSamplesList(true);
    samplesAPI
      .getSamples({ limit: 1000, sortBy: 'collectionDate', sortOrder: 'desc' })
      .then((res) => {
        if (mounted && res && res.data) {
          setAllSamples(res.data);
        }
      })
      .catch((err) => console.warn('Failed to fetch samples list for selector:', err.message))
      .finally(() => {
        if (mounted) setLoadingSamplesList(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const fetchSampleData = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await samplesAPI.getSampleById(id);
      if (res.success && res.data) {
        setSample(res.data);
        setAssessments(res.data.assessments || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to load water sample details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSampleData();
  }, [id]);

  const handleLocationChange = (e) => {
    const targetId = e.target.value;
    if (targetId && targetId !== id) {
      navigate(`/samples/${targetId}`);
    }
  };

  const handleCalculate = async () => {
    if (!sample) return;
    setCalculating(true);
    setCalcSuccess('');
    setError('');
    try {
      const res = await assessmentsAPI.calculate(sample._id, { authority: selectedAuthority });
      if (res.success) {
        setCalcSuccess(`Assessment calculated successfully using ${selectedAuthority} standard! Graphs updated.`);
        await fetchSampleData();
      }
    } catch (err) {
      setError(err.message || 'Calculation error occurred.');
    } finally {
      setCalculating(false);
    }
  };

  if (loading) {
    return (
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <LoadingSkeleton height="50px" count={1} />
        <div style={{ marginTop: '1.5rem' }}>
          <LoadingSkeleton height="180px" count={2} />
        </div>
      </div>
    );
  }

  if (error || !sample) {
    return (
      <div style={{ maxWidth: '800px', margin: '2rem auto' }}>
        <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444', padding: '1.5rem', borderRadius: 'var(--radius-md)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem', fontWeight: 600 }}>
            <AlertTriangle size={20} /> Error Loading Sample
          </div>
          <p>{error || 'Sample record not found.'}</p>
          <button className="btn btn-secondary btn-sm" style={{ marginTop: '1rem' }} onClick={() => navigate('/samples')}>
            Back to Samples List
          </button>
        </div>
      </div>
    );
  }

  const latest = assessments[0] || null;
  const hpiBadge = getHpiBadge(latest?.hpiValue);
  const heiBadge = getHeiBadge(latest?.heiValue);
  const reviewBadge = getReviewBadge(latest?.classification?.overallReview);

  // Prepare Data for the Graph System
  const metalChartData =
    latest?.intermediateResults?.hpi?.details?.map((d) => {
      const measured = Number(d.measuredMgL || 0);
      const standard = Number(d.standardLimitMgL || 0.01);
      const ratio = Number(d.ratioToLimit || (measured / standard).toFixed(3));
      const exceeds = d.exceedsLimit ?? measured > standard;
      const product = Number(d.productWiQi || 0);
      const subIndexQi = Number(d.subIndexQi || 0);

      return {
        symbol: d.metalSymbol,
        name: d.metalName || d.metalSymbol,
        measured,
        standard,
        ratio,
        exceeds,
        product,
        subIndexQi,
        fill: exceeds ? '#ef4444' : '#06b6d4',
      };
    }) || [];

  const totalProduct = metalChartData.reduce((acc, curr) => acc + (curr.product > 0 ? curr.product : 0), 0) || 1;
  const pieData = metalChartData
    .filter((d) => d.product > 0)
    .map((d) => ({
      name: d.name,
      symbol: d.symbol,
      product: d.product,
      value: Number(((d.product / totalProduct) * 100).toFixed(1)),
      fill: METAL_COLORS[d.symbol.toUpperCase()] || '#06b6d4',
    }))
    .sort((a, b) => b.value - a.value);

  const radarData = metalChartData.map((d) => ({
    symbol: d.symbol,
    name: d.name,
    ratio: Math.min(Number(d.ratio.toFixed(2)), 12),
    safeBaseline: 1.0,
  }));

  const exceededCount = metalChartData.filter((m) => m.exceeds).length;
  const topContributor = pieData.length > 0 ? pieData[0] : null;

  return (
    <div style={{ maxWidth: '1150px', margin: '0 auto', paddingBottom: '3.5rem' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <button
            onClick={() => navigate('/samples')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              color: 'var(--text-muted)',
              fontSize: '0.85rem',
              marginBottom: '0.4rem',
              cursor: 'pointer',
              background: 'transparent',
              border: 'none',
              padding: 0,
            }}
          >
            <ArrowLeft size={16} /> Back to water samples
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <h1 className="page-title">{sample.location}</h1>
            <span style={{ fontFamily: 'JetBrains Mono', color: 'var(--primary)', fontWeight: 600, fontSize: '1.1rem' }}>
              [{sample.sampleId}]
            </span>
            {sample.isDemoData && <span className="badge badge-demo">Demo Data</span>}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-secondary btn-sm" onClick={fetchSampleData}>
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
      </div>

      <DemoDataBanner visible={sample.isDemoData} />

      {calcSuccess && (
        <div
          style={{
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.35)',
            color: '#10b981',
            padding: '0.85rem 1rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            boxShadow: '0 4px 16px rgba(16, 185, 129, 0.12)',
          }}
        >
          <CheckCircle2 size={18} /> {calcSuccess}
        </div>
      )}

      {/* Interactive Location Selection & Calculate Action Bar */}
      <div
        className="card"
        style={{
          marginBottom: '1.5rem',
          background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.08) 0%, rgba(15, 23, 42, 0.8) 100%)',
          borderColor: 'rgba(6, 182, 212, 0.3)',
          boxShadow: '0 6px 24px -4px rgba(6, 182, 212, 0.15)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          {/* Location Selector */}
          <div style={{ flex: '1 1 320px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600, marginBottom: '0.35rem' }}>
              <MapPin size={15} /> Select Monitoring Location:
            </label>
            <select
              className="form-select"
              style={{ fontSize: '0.88rem', background: 'rgba(11, 19, 38, 0.9)', borderColor: 'rgba(6, 182, 212, 0.35)' }}
              value={sample._id}
              onChange={handleLocationChange}
            >
              {allSamples.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.location} [{s.sampleId}] {s.district ? `— ${s.district}, ${s.state}` : ''} ({s.waterSource})
                </option>
              ))}
            </select>
          </div>

          {/* Standard Authority */}
          <div style={{ flex: '0 1 180px' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '0.35rem' }}>
              Standard Authority:
            </label>
            <select
              className="form-select"
              style={{ fontSize: '0.88rem', background: 'rgba(11, 19, 38, 0.9)' }}
              value={selectedAuthority}
              onChange={(e) => setSelectedAuthority(e.target.value)}
            >
              <option value="WHO">WHO (4th Edition)</option>
              <option value="BIS">BIS (IS 10500:2012)</option>
            </select>
          </div>

          {/* Prominent Calculate Button */}
          <div style={{ alignSelf: 'flex-end' }}>
            <button
              className="btn btn-primary"
              onClick={handleCalculate}
              disabled={calculating}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.65rem 1.4rem',
                fontSize: '0.92rem',
                fontWeight: 700,
                boxShadow: '0 0 20px rgba(6, 182, 212, 0.4)',
                letterSpacing: '0.02em',
              }}
            >
              <Calculator size={18} />
              <span>{calculating ? 'Computing HPI/HEI...' : 'Calculate Indices'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metadata Overview Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 170px), 1fr))', gap: '0.9rem', marginBottom: '1.5rem' }}>
        <div className="card" style={{ padding: '0.9rem 1.15rem' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Water Source</div>
          <div style={{ fontSize: '1.05rem', fontWeight: 600, textTransform: 'capitalize', color: 'var(--text-main)' }}>
            {sample.waterSource}
          </div>
        </div>

        {(sample.district || sample.state) && (
          <div className="card" style={{ padding: '0.9rem 1.15rem' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>District & State</div>
            <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)' }}>
              {sample.district ? `${sample.district}${sample.state ? `, ${sample.state}` : ''}` : sample.state}
            </div>
          </div>
        )}

        <div className="card" style={{ padding: '0.9rem 1.15rem' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Collection Timestamp</div>
          <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)' }}>
            {formatDate(sample.collectionDate)}
          </div>
        </div>

        <div className="card" style={{ padding: '0.9rem 1.15rem' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>GPS Coordinates</div>
          <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-main)', fontFamily: 'JetBrains Mono' }}>
            {sample.coordinates?.latitude ? `${sample.coordinates.latitude}°N, ${sample.coordinates.longitude}°E` : 'Not recorded'}
          </div>
        </div>

        {sample.pH !== null && sample.pH !== undefined && (
          <div className="card" style={{ padding: '0.9rem 1.15rem' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>pH Level</div>
            <div style={{ fontSize: '1.05rem', fontWeight: 600, color: sample.pH < 6.5 || sample.pH > 8.5 ? 'var(--status-critical)' : 'var(--text-main)', fontFamily: 'JetBrains Mono' }}>
              {sample.pH}
            </div>
          </div>
        )}

        {sample.tdsMgL !== null && sample.tdsMgL !== undefined && (
          <div className="card" style={{ padding: '0.9rem 1.15rem' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>TDS</div>
            <div style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-main)', fontFamily: 'JetBrains Mono' }}>
              {sample.tdsMgL} <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>mg/L</span>
            </div>
          </div>
        )}

        {sample.turbidityNtu !== null && sample.turbidityNtu !== undefined && (
          <div className="card" style={{ padding: '0.9rem 1.15rem' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Turbidity</div>
            <div style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-main)', fontFamily: 'JetBrains Mono' }}>
              {sample.turbidityNtu} <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>NTU</span>
            </div>
          </div>
        )}

        <div className="card" style={{ padding: '0.9rem 1.15rem' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Screening Conclusion</div>
          <div>
            <span className="badge" style={{ backgroundColor: reviewBadge.bg, color: reviewBadge.text, border: `1px solid ${reviewBadge.text}40` }}>
              {reviewBadge.label}
            </span>
          </div>
        </div>
      </div>

      {sample.notes && (
        <div className="card" style={{ padding: '0.9rem 1.25rem', marginBottom: '1.5rem', background: 'rgba(15, 23, 42, 0.4)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', textTransform: 'uppercase', marginBottom: '0.2rem' }}>Field Observations</div>
          <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{sample.notes}</div>
        </div>
      )}

      {/* =========================================================================
          IMPRESSIVE GRAPH OUTPUT SYSTEM
          ========================================================================= */}
      {latest ? (
        <div style={{ marginBottom: '2rem' }}>
          {/* Dual Speedometer Gauge Meters */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
            <GaugeMeter
              value={latest.hpiValue}
              min={0}
              max={220}
              safeLimit={50}
              criticalLimit={100}
              title="Heavy Metal Pollution Index (HPI)"
              subtitle="Prasad & Bose (2001) Standard Scale"
              colorScheme="hpi"
            />

            <GaugeMeter
              value={latest.heiValue}
              min={0}
              max={40}
              safeLimit={10}
              criticalLimit={20}
              title="Heavy Metal Evaluation Index (HEI)"
              subtitle="Edet & Offiong (2002) Multi-Metal Evaluation"
              colorScheme="hei"
            />
          </div>

          {/* Contamination Alert Highlights Card */}
          <div
            className="card"
            style={{
              marginBottom: '1.5rem',
              background: exceededCount > 0 ? 'rgba(239, 68, 68, 0.08)' : 'rgba(16, 185, 129, 0.08)',
              borderColor: exceededCount > 0 ? 'rgba(239, 68, 68, 0.28)' : 'rgba(16, 185, 129, 0.28)',
              padding: '1rem 1.25rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                {exceededCount > 0 ? (
                  <ShieldAlert size={22} style={{ color: '#ef4444' }} />
                ) : (
                  <ShieldCheck size={22} style={{ color: '#10b981' }} />
                )}
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: exceededCount > 0 ? '#fca5a5' : '#6ee7b7' }}>
                    {exceededCount > 0
                      ? `⚠️ ${exceededCount} Heavy Metal${exceededCount > 1 ? 's' : ''} Exceed Standard Permissible Limits`
                      : '✓ All Analyzed Trace Metals Within Safe Regulatory Limits'}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {topContributor
                      ? `Primary Contamination Driver: ${topContributor.name} (${topContributor.symbol}) contributing ${topContributor.value}% of HPI.`
                      : `Standard baseline: ${latest.standardReferences?.[0]?.authority || 'WHO Guidelines'}.`}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <span className="badge badge-neutral" style={{ fontSize: '0.75rem' }}>
                  Standard: {latest.standardReferences?.[0]?.authority || 'WHO'}
                </span>
                <span
                  className="badge"
                  style={{
                    backgroundColor: reviewBadge.bg,
                    color: reviewBadge.text,
                    border: `1px solid ${reviewBadge.text}40`,
                    fontSize: '0.75rem',
                  }}
                >
                  {reviewBadge.label}
                </span>
              </div>
            </div>
          </div>

          {/* Interactive Multi-Graph Visualizer Card */}
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <BarChart3 size={19} style={{ color: 'var(--primary)' }} />
                  <span>Pollution Indices Visual Analytics Suite</span>
                </div>
                <div className="card-subtitle">
                  Interactive multi-dimensional graphical outputs computed from measured concentrations.
                </div>
              </div>

              {/* Graph Navigation Tabs */}
              <div style={{ display: 'flex', gap: '0.35rem', background: 'rgba(15, 23, 42, 0.6)', padding: '0.25rem', borderRadius: '8px', border: '1px solid var(--border-subtle)', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => setActiveGraphTab('bars')}
                  className={`btn btn-sm ${activeGraphTab === 'bars' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ fontSize: '0.75rem', padding: '0.3rem 0.65rem' }}
                >
                  <BarChart3 size={13} />
                  <span>Measured vs Limits</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveGraphTab('radar')}
                  className={`btn btn-sm ${activeGraphTab === 'radar' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ fontSize: '0.75rem', padding: '0.3rem 0.65rem' }}
                >
                  <Activity size={13} />
                  <span>Contamination Fingerprint</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveGraphTab('donut')}
                  className={`btn btn-sm ${activeGraphTab === 'donut' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ fontSize: '0.75rem', padding: '0.3rem 0.65rem' }}
                >
                  <PieIcon size={13} />
                  <span>Pollution Drivers Share</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveGraphTab('subindex')}
                  className={`btn btn-sm ${activeGraphTab === 'subindex' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ fontSize: '0.75rem', padding: '0.3rem 0.65rem' }}
                >
                  <TrendingUp size={13} />
                  <span>Sub-Index (Qi)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveGraphTab('table')}
                  className={`btn btn-sm ${activeGraphTab === 'table' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ fontSize: '0.75rem', padding: '0.3rem 0.65rem' }}
                >
                  <BookOpen size={13} />
                  <span>Math Derivation Table</span>
                </button>
              </div>
            </div>

            {/* TAB 1: Measured vs Permissible Limits Bar Chart */}
            {activeGraphTab === 'bars' && (
              <div style={{ padding: '1rem 0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', padding: '0 0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    Comparative analytical concentrations (Mi) against standard regulatory limits (Si in mg/L).
                  </div>
                  <div style={{ display: 'flex', gap: '1rem', fontSize: '0.78rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#06b6d4' }}>
                      <span style={{ width: '10px', height: '10px', background: '#06b6d4', borderRadius: '2px' }} /> Within Limit
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#ef4444' }}>
                      <span style={{ width: '10px', height: '10px', background: '#ef4444', borderRadius: '2px' }} /> Exceeds Regulatory Limit
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#64748b' }}>
                      <span style={{ width: '10px', height: '10px', background: '#64748b', borderRadius: '2px' }} /> Permissible Standard
                    </span>
                  </div>
                </div>

                <div style={{ width: '100%', height: '320px', minHeight: '320px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={metalChartData} margin={{ top: 20, right: 20, left: 10, bottom: 25 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.12)" />
                      <XAxis dataKey="symbol" stroke="#94a3b8" fontSize={12} tickLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} label={{ value: 'mg/L', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 10 }} />
                      <Tooltip content={<CustomBarTooltip />} />
                      <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '0.82rem' }} />
                      <Bar dataKey="measured" name="Measured Concentration (mg/L)" radius={[4, 4, 0, 0]}>
                        {metalChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.exceeds ? '#ef4444' : '#06b6d4'} />
                        ))}
                      </Bar>
                      <Bar dataKey="standard" name="Permissible Standard Limit (mg/L)" fill="#64748b" opacity={0.65} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* TAB 2: Multi-Metal Contamination Fingerprint (Spider Radar) */}
            {activeGraphTab === 'radar' && (
              <div style={{ padding: '1rem 0.5rem' }}>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1rem', padding: '0 0.5rem' }}>
                  Multi-axial contamination footprint. Values represent ratio to permissible limit (1.0 = Safe Baseline boundary).
                </div>
                <div style={{ width: '100%', height: '340px', minHeight: '340px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                      <PolarGrid stroke="rgba(148, 163, 184, 0.18)" />
                      <PolarAngleAxis dataKey="symbol" stroke="#94a3b8" fontSize={12} />
                      <PolarRadiusAxis angle={30} domain={[0, 'auto']} stroke="#64748b" fontSize={10} />
                      <Radar name="Safe Regulatory Threshold (1.0x)" dataKey="safeBaseline" stroke="#10b981" fill="#10b981" fillOpacity={0.12} strokeDasharray="3 3" />
                      <Radar name="Sample Contamination Profile (Ratio to Limit)" dataKey="ratio" stroke="#ef4444" fill="#ef4444" fillOpacity={0.35} />
                      <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '0.82rem' }} />
                      <Tooltip
                        formatter={(val) => [`${val}x Limit`, 'Exceedance Ratio']}
                        contentStyle={{ background: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* TAB 3: Metal Pollution Share (Donut Chart) */}
            {activeGraphTab === 'donut' && (
              <div style={{ padding: '1rem 0.5rem' }}>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1rem', padding: '0 0.5rem' }}>
                  Proportional share of total HPI score generated by each heavy metal (Product Wi × Qi share).
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '1.5rem', alignItems: 'center' }}>
                  <div style={{ width: '100%', height: '300px', minHeight: '300px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={65}
                          outerRadius={95}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`pie-cell-${index}`} fill={entry.fill} stroke="rgba(15, 23, 42, 0.8)" strokeWidth={2} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomPieTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Legend breakdown list */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', padding: '0 1rem' }}>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.35rem' }}>
                      Contaminant Contribution Hierarchy:
                    </div>
                    {pieData.map((item) => (
                      <div
                        key={item.symbol}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '0.35rem 0.6rem',
                          borderRadius: '6px',
                          background: 'rgba(15, 23, 42, 0.5)',
                          borderLeft: `3px solid ${item.fill}`,
                          fontSize: '0.82rem',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontWeight: 600, color: '#f8fafc' }}>{item.name}</span>
                          <span style={{ color: 'var(--text-muted)', fontFamily: 'JetBrains Mono', fontSize: '0.75rem' }}>
                            ({item.symbol})
                          </span>
                        </div>
                        <div style={{ fontWeight: 700, color: item.fill, fontFamily: 'JetBrains Mono' }}>
                          {item.value.toFixed(1)}%
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: Sub-Index Quality Rating (Qi) Bar Chart */}
            {activeGraphTab === 'subindex' && (
              <div style={{ padding: '1rem 0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', padding: '0 0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    Sub-Index Quality Rating: Qi = (Mi / Si) × 100. Values above 100 represent regulatory exceedances.
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#ef4444' }}>
                    🔴 Red Line = 100.0 Maximum Permissible Threshold
                  </div>
                </div>

                <div style={{ width: '100%', height: '320px', minHeight: '320px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={metalChartData} margin={{ top: 20, right: 20, left: 10, bottom: 25 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.12)" />
                      <XAxis dataKey="symbol" stroke="#94a3b8" fontSize={12} tickLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} label={{ value: 'Qi Rating', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 10 }} />
                      <ReferenceLine y={100} stroke="#ef4444" strokeDasharray="4 4" strokeWidth={2} label={{ value: 'Qi = 100 (Threshold)', fill: '#ef4444', fontSize: 11, position: 'top' }} />
                      <Tooltip
                        formatter={(val) => [val, 'Sub-Index Qi']}
                        contentStyle={{ background: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                      />
                      <Bar dataKey="subIndexQi" name="Quality Rating Qi" radius={[4, 4, 0, 0]}>
                        {metalChartData.map((entry, index) => (
                          <Cell key={`qi-cell-${index}`} fill={entry.subIndexQi > 100 ? '#ef4444' : '#10b981'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* TAB 5: Transparent Mathematical Derivation Table */}
            {activeGraphTab === 'table' && (
              <div style={{ padding: '0.5rem 0' }}>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.75rem', padding: '0 0.5rem' }}>
                  Prasad & Bose (2001) HPI formulation parameters: Wi = k / Si, Qi = (Mi / Si) * 100, HPI = ∑(Wi × Qi) / ∑Wi.
                </div>
                <div className="table-responsive">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Metal Chemical Element</th>
                        <th>Measured (Mi mg/L)</th>
                        <th>Permissible (Si mg/L)</th>
                        <th>Unit Weight (Wi)</th>
                        <th>Sub-index (Qi)</th>
                        <th>Product (Wi × Qi)</th>
                        <th>Exceedance Ratio</th>
                        <th>Compliance State</th>
                      </tr>
                    </thead>
                    <tbody>
                      {latest.intermediateResults?.hpi?.details?.map((d) => (
                        <tr key={d.metalSymbol}>
                          <td>
                            <strong>{d.metalName}</strong>
                            <span style={{ marginLeft: '0.35rem', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}>
                              ({d.metalSymbol})
                            </span>
                          </td>
                          <td style={{ fontFamily: 'JetBrains Mono', fontWeight: 600 }}>{d.measuredMgL}</td>
                          <td style={{ fontFamily: 'JetBrains Mono', color: 'var(--text-muted)' }}>{d.standardLimitMgL}</td>
                          <td style={{ fontFamily: 'JetBrains Mono', fontSize: '0.82rem' }}>{d.unitWeightWi}</td>
                          <td style={{ fontFamily: 'JetBrains Mono', color: d.subIndexQi > 100 ? 'var(--status-critical)' : 'var(--text-main)', fontWeight: d.subIndexQi > 100 ? 700 : 400 }}>
                            {d.subIndexQi}
                          </td>
                          <td style={{ fontFamily: 'JetBrains Mono', fontWeight: 700, color: 'var(--primary)' }}>
                            {d.productWiQi}
                          </td>
                          <td style={{ fontFamily: 'JetBrains Mono' }}>
                            {d.ratioToLimit ? `${d.ratioToLimit}x` : `${(d.measuredMgL / d.standardLimitMgL).toFixed(2)}x`}
                          </td>
                          <td>
                            {d.exceedsLimit ? (
                              <span className="badge badge-danger">Exceeds Limit</span>
                            ) : (
                              <span className="badge badge-success">Acceptable</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="card" style={{ textAlign: 'center', padding: '3.5rem 1.5rem', marginBottom: '1.5rem', background: 'rgba(15, 23, 42, 0.6)' }}>
          <Calculator size={42} style={{ color: 'var(--primary)', opacity: 0.6, marginBottom: '0.85rem' }} />
          <h3 style={{ fontSize: '1.25rem', color: 'var(--text-main)', marginBottom: '0.4rem' }}>
            No Assessment Computed Yet For This Location
          </h3>
          <p style={{ maxWidth: '520px', margin: '0 auto 1.5rem', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
            Click the <strong style={{ color: 'var(--primary)' }}>"Calculate Indices"</strong> button above to evaluate this sample against WHO / BIS reference standards and generate the graphical dashboard.
          </p>
          <button className="btn btn-primary" onClick={handleCalculate} disabled={calculating}>
            <Calculator size={16} />
            <span>{calculating ? 'Computing...' : 'Calculate Indices Now'}</span>
          </button>
        </div>
      )}

      {/* Heavy Metal Measured Analytical Concentrations Table */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="card-header">
          <div>
            <div className="card-title">
              <FlaskConical size={18} style={{ color: 'var(--accent)' }} />
              <span>Heavy Metal Analytical Concentrations Table</span>
            </div>
            <div className="card-subtitle">
              Measured concentrations with normalized internal standard values in mg/L
            </div>
          </div>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Metal Chemical Symbol</th>
                <th>Measured Value (Raw)</th>
                <th>Monitored Unit</th>
                <th>Normalized Concentration (mg/L)</th>
                <th>Entry Status</th>
              </tr>
            </thead>
            <tbody>
              {sample.measurements?.map((m) => (
                <tr key={m.metalSymbol}>
                  <td>
                    <strong style={{ color: 'var(--text-main)' }}>{m.metalSymbol}</strong>
                  </td>
                  <td style={{ fontFamily: 'JetBrains Mono' }}>{m.rawValue}</td>
                  <td>
                    <span className="badge badge-neutral">{m.rawUnit}</span>
                  </td>
                  <td style={{ fontFamily: 'JetBrains Mono', fontWeight: 600, color: 'var(--primary)' }}>
                    {m.normalizedValueMgL} mg/L
                  </td>
                  <td>
                    <span className="badge badge-success">Valid Entry</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SampleDetailsPage;
