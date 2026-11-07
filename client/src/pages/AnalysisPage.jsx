import React, { useState, useEffect } from 'react';
import {
  Calculator,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  Info,
  BarChart2,
  Layers,
  ChevronRight,
  Cpu,
  Sparkles,
  ShieldAlert,
  RotateCcw,
  Sliders,
  Check,
  AlertCircle,
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
} from 'recharts';
import { samplesAPI, assessmentsAPI, predictionAPI } from '../services/api';
import { getHpiBadge, getHeiBadge, getReviewBadge } from '../utils/formatters';
import LoadingSkeleton from '../components/LoadingSkeleton';

// Custom Glowing SVG Speedometer / Gauge Meter Component
const GaugeMeter = ({ value, min = 0, max = 200, safeLimit = 50, criticalLimit = 100, title, subtitle, unit = '', colorScheme = 'hpi' }) => {
  const numericVal = typeof value === 'number' ? value : parseFloat(value) || 0;
  const clampedVal = Math.min(Math.max(numericVal, min), max);
  const percent = (clampedVal - min) / (max - min);
  const angle = -180 + percent * 180;

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
            <linearGradient id={`gauge-track-an-${colorScheme}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="45%" stopColor="#10b981" />
              <stop offset="50%" stopColor="#f59e0b" />
              <stop offset="70%" stopColor="#f59e0b" />
              <stop offset="75%" stopColor="#ef4444" />
              <stop offset="100%" stopColor="#ef4444" />
            </linearGradient>
            <filter id={`needle-glow-an-${colorScheme}`}>
              <feDropShadow dx="0" dy="0" stdDeviation="2.5" floodColor={activeColor} floodOpacity="0.85" />
            </filter>
          </defs>

          <path
            d={describeArc(cx, cy, r, 0, 180)}
            fill="none"
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />

          <path
            d={describeArc(cx, cy, r, 0, 180)}
            fill="none"
            stroke={`url(#gauge-track-an-${colorScheme})`}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            opacity="0.85"
          />

          <circle cx={cx} cy={cy} r="6" fill="#0f172a" stroke={activeColor} strokeWidth="3" filter={`url(#needle-glow-an-${colorScheme})`} />

          <line
            x1={cx}
            y1={cy}
            x2={nx}
            y2={ny}
            stroke={activeColor}
            strokeWidth="3.5"
            strokeLinecap="round"
            filter={`url(#needle-glow-an-${colorScheme})`}
          />

          <circle cx={nx} cy={ny} r="3" fill="#ffffff" filter={`url(#needle-glow-an-${colorScheme})`} />
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

const PRESETS = {
  potable: {
    name: 'Potable Tap Water (Low Risk)',
    description: 'Clean municipal drinking water with low trace elements.',
    data: {
      pH: 7.2,
      tds: 220,
      turbidity: 1.1,
      Pb: 0.0015,
      Cd: 0.0004,
      Cr: 0.006,
      Cu: 0.08,
      Zn: 0.25,
      Ni: 0.005,
      Fe: 0.08,
      As: 0.001,
      Hg: 0.0001,
    },
  },
  threshold: {
    name: 'Suburban Groundwater (Threshold Risk)',
    description: 'Borderline parameters approaching maximum permissible bounds.',
    data: {
      pH: 6.4,
      tds: 560,
      turbidity: 3.8,
      Pb: 0.009,
      Cd: 0.0025,
      Cr: 0.035,
      Cu: 0.45,
      Zn: 1.1,
      Ni: 0.045,
      Fe: 0.42,
      As: 0.0085,
      Hg: 0.0007,
    },
  },
  industrial: {
    name: 'Industrial Catchment (Critical Contamination)',
    description: 'Severe multi-metal contamination exceeding regulatory limits.',
    data: {
      pH: 5.8,
      tds: 1250,
      turbidity: 8.5,
      Pb: 0.048,
      Cd: 0.0095,
      Cr: 0.11,
      Cu: 1.25,
      Zn: 3.4,
      Ni: 0.12,
      Fe: 2.8,
      As: 0.038,
      Hg: 0.0025,
    },
  },
};

const AnalysisPage = () => {
  const [activeTab, setActiveTab] = useState('math'); // 'math' | 'prediction'

  // Tab 1: Math Engine State
  const [samples, setSamples] = useState([]);
  const [selectedSampleId, setSelectedSampleId] = useState('');
  const [selectedAuthority, setSelectedAuthority] = useState('WHO');
  const [assessment, setAssessment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);
  const [error, setError] = useState('');

  // Tab 2: Prediction State
  const [predForm, setPredForm] = useState(PRESETS.threshold.data);
  const [predAuthority, setPredAuthority] = useState('WHO');
  const [predResult, setPredResult] = useState(null);
  const [predicting, setPredicting] = useState(false);
  const [predError, setPredError] = useState('');

  const runAnalysis = async (sampleId, authority) => {
    if (!sampleId) return;
    setCalculating(true);
    setError('');
    try {
      const res = await assessmentsAPI.calculate(sampleId, { authority });
      if (res.success && res.data) {
        setAssessment(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to calculate pollution index analysis.');
    } finally {
      setCalculating(false);
    }
  };

  useEffect(() => {
    samplesAPI.getSamples({ limit: 1000 })
      .then((res) => {
        if (res.success && res.data?.length > 0) {
          setSamples(res.data);
          setSelectedSampleId(res.data[0]._id);
          runAnalysis(res.data[0]._id, 'WHO');
        }
      })
      .catch((err) => setError(err.message || 'Failed to load samples.'))
      .finally(() => setLoading(false));

    // Run initial demo prediction
    handleRunPrediction(PRESETS.threshold.data, 'WHO');
  }, []);

  const handleRunClick = (e) => {
    e.preventDefault();
    runAnalysis(selectedSampleId, selectedAuthority);
  };

  const handleRunPrediction = async (formData = predForm, auth = predAuthority) => {
    setPredicting(true);
    setPredError('');
    try {
      const payload = {
        ...formData,
        standardAuthority: auth,
      };
      const res = await predictionAPI.predict(payload);
      if (res.success && res.data) {
        setPredResult(res.data);
      }
    } catch (err) {
      setPredError(err.message || 'Prediction execution failed.');
    } finally {
      setPredicting(false);
    }
  };

  const loadPreset = (key) => {
    const p = PRESETS[key];
    if (p) {
      setPredForm(p.data);
      handleRunPrediction(p.data, predAuthority);
    }
  };

  const hpiBadge = getHpiBadge(assessment?.hpiValue);
  const heiBadge = getHeiBadge(assessment?.heiValue);
  const reviewBadge = getReviewBadge(assessment?.classification?.overallReview);

  const subIndexChartData = assessment?.intermediateResults?.hpi?.details?.map((d) => ({
    symbol: d.metalSymbol,
    subIndexQi: d.subIndexQi,
    ratio: d.ratioToLimit,
    exceeds: d.exceedsLimit,
  })) || [];

  const heiContributionChartData = assessment?.intermediateResults?.hei?.contributions?.map((c) => ({
    symbol: c.metalSymbol,
    percentage: c.percentageOfHEI,
    ratio: c.ratioCiOverMACi,
  })) || [];

  return (
    <div style={{ maxWidth: '1150px', margin: '0 auto' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">HPI & HEI Scientific Engine & ML Demonstration</h1>
          <p className="page-description">
            Interactive analytical workbench implementing Prasad & Bose (2001) HPI, Edet & Offiong (2002) HEI, and demonstration ML contamination risk modeling.
          </p>
        </div>
      </div>

      {/* Mode Navigation Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
        <button
          type="button"
          onClick={() => setActiveTab('math')}
          className={`btn ${activeTab === 'math' ? 'btn-primary' : 'btn-outline'}`}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.85rem' }}
        >
          <Calculator size={16} />
          <span>HPI & HEI Mathematical Derivations</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('prediction')}
          className={`btn ${activeTab === 'prediction' ? 'btn-primary' : 'btn-outline'}`}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.85rem' }}
        >
          <Cpu size={16} />
          <span>ML Risk Prediction (Demonstration Model)</span>
          <span className="badge badge-demo" style={{ fontSize: '0.62rem', marginLeft: '0.2rem' }}>Demo</span>
        </button>
      </div>

      {/* =========================================================================
          TAB 1: HPI & HEI MATHEMATICAL DERIVATIONS ENGINE
          ========================================================================= */}
      {activeTab === 'math' && (
        <>
          {/* Control Selector Card */}
          <div className="card" style={{ marginBottom: '1.5rem', background: 'rgba(15, 23, 42, 0.9)' }}>
            <form onSubmit={handleRunClick} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ flex: '1 1 320px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600, marginBottom: '0.35rem' }}>
                  📍 Select Monitoring Location:
                </label>
                <select
                  className="form-select"
                  value={selectedSampleId}
                  onChange={(e) => setSelectedSampleId(e.target.value)}
                  disabled={loading || calculating}
                >
                  {samples.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.location} [{s.sampleId}] {s.district ? `— ${s.district}, ${s.state}` : ''} ({s.waterSource})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ flex: '0 1 190px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Standard Authority:
                </label>
                <select
                  className="form-select"
                  value={selectedAuthority}
                  onChange={(e) => setSelectedAuthority(e.target.value)}
                  disabled={loading || calculating}
                >
                  <option value="WHO">WHO Drinking Water 4th Ed</option>
                  <option value="BIS">BIS IS 10500:2012</option>
                </select>
              </div>

              <div style={{ alignSelf: 'flex-end' }}>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading || calculating || !selectedSampleId}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    height: '42px',
                    padding: '0 1.3rem',
                    fontWeight: 700,
                    boxShadow: '0 0 20px rgba(6, 182, 212, 0.4)',
                  }}
                >
                  <Calculator size={17} />
                  <span>{calculating ? 'Computing HPI/HEI...' : 'Calculate Indices'}</span>
                </button>
              </div>
            </form>
          </div>

          {error && (
            <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }}>
              {error}
            </div>
          )}

          {loading ? (
            <LoadingSkeleton height="200px" count={3} />
          ) : !assessment ? (
            <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
              Select a monitoring location and click Calculate to run the analytical engine.
            </div>
          ) : (
            <>
              {/* Dual Glowing Speedometer Gauges */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
                <GaugeMeter
                  value={assessment.hpiValue}
                  min={0}
                  max={220}
                  safeLimit={50}
                  criticalLimit={100}
                  title="Heavy Metal Pollution Index (HPI)"
                  subtitle="Prasad & Bose (2001) Standard Scale"
                  colorScheme="hpi"
                />

                <GaugeMeter
                  value={assessment.heiValue}
                  min={0}
                  max={40}
                  safeLimit={10}
                  criticalLimit={20}
                  title="Heavy Metal Evaluation Index (HEI)"
                  subtitle="Edet & Offiong (2002) Multi-Metal Evaluation"
                  colorScheme="hei"
                />
              </div>

              {/* Primary Score Cards */}
              <div className="metric-grid" style={{ marginBottom: '1.5rem' }}>
                <div className="card" style={{ borderLeft: `4px solid ${hpiBadge.text}` }}>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                    Heavy Metal Pollution Index (HPI)
                  </div>
                  <div style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'Outfit', color: hpiBadge.text }}>
                    {assessment.hpiValue}
                  </div>
                  <div style={{ marginTop: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span className={`badge ${hpiBadge.className}`}>{assessment.classification?.hpiCategory}</span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-subtle)' }}>Prasad & Bose (2001)</span>
                  </div>
                </div>

                <div className="card" style={{ borderLeft: `4px solid ${heiBadge.text}` }}>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                    Heavy Metal Evaluation Index (HEI)
                  </div>
                  <div style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'Outfit', color: heiBadge.text }}>
                    {assessment.heiValue}
                  </div>
                  <div style={{ marginTop: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span className={`badge ${heiBadge.className}`}>{assessment.classification?.heiCategory}</span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-subtle)' }}>Edet & Offiong (2002)</span>
                  </div>
                </div>

                <div className="card" style={{ borderLeft: `4px solid ${reviewBadge.text}` }}>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                    Overall Regulatory Review State
                  </div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 700, fontFamily: 'Outfit', color: reviewBadge.text, marginTop: '0.4rem' }}>
                    {assessment.classification?.overallReview}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                    Evaluated against {selectedAuthority} Permissible Limits
                  </div>
                </div>
              </div>

              {/* Sub-index & Contribution Charts */}
              <div className="dashboard-charts-grid" style={{ marginBottom: '1.5rem' }}>
                <div className="card">
                  <div className="card-header">
                    <div>
                      <div className="card-title">HPI Metal Sub-Index Rating (Qi)</div>
                      <div className="card-subtitle">Sub-index quality rating: Qi = (Mi / Si) * 100</div>
                    </div>
                  </div>
                  <div style={{ width: '100%', height: '260px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={subIndexChartData} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.15)" />
                        <XAxis dataKey="symbol" stroke="#94a3b8" fontSize={11} />
                        <YAxis stroke="#94a3b8" fontSize={11} />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(148, 163, 184, 0.2)', borderRadius: '8px', color: '#f8fafc', fontSize: '12px' }}
                        />
                        <Bar dataKey="subIndexQi" name="Sub-Index Qi" fill="#06b6d4" radius={[4, 4, 0, 0]}>
                          {subIndexChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.exceeds ? '#ef4444' : '#06b6d4'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="card">
                  <div className="card-header">
                    <div>
                      <div className="card-title">HEI Heavy Metal Proportional Load</div>
                      <div className="card-subtitle">Percentage contribution to overall cumulative index (Ci / MACi)</div>
                    </div>
                  </div>
                  <div style={{ width: '100%', height: '260px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={heiContributionChartData} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.15)" />
                        <XAxis dataKey="symbol" stroke="#94a3b8" fontSize={11} />
                        <YAxis stroke="#94a3b8" fontSize={11} unit="%" />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(148, 163, 184, 0.2)', borderRadius: '8px', color: '#f8fafc', fontSize: '12px' }}
                          formatter={(v) => [`${v}%`, 'HEI Contribution']}
                        />
                        <Bar dataKey="percentage" name="Contribution %" fill="#14b8a6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Comprehensive Mathematical Derivation Table */}
              <div className="card" style={{ marginBottom: '1.5rem' }}>
                <div className="card-header">
                  <div className="card-title">Step-by-Step Mathematical Derivations</div>
                  <div className="card-subtitle">Unit weights (Wi), Sub-indices (Qi), and Hazard Ratios</div>
                </div>

                <div className="table-responsive">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Metal</th>
                        <th>Measured (Mi)</th>
                        <th>Standard (Si)</th>
                        <th>Weight (Wi)</th>
                        <th>Sub-Index (Qi)</th>
                        <th>Product (Wi · Qi)</th>
                        <th>Hazard Ratio (Ci/MACi)</th>
                        <th>HEI Contrib %</th>
                      </tr>
                    </thead>
                    <tbody>
                      {assessment.intermediateResults?.hpi?.details?.map((item) => {
                        const heiItem = assessment.intermediateResults?.hei?.contributions?.find(
                          (c) => c.metalSymbol === item.metalSymbol
                        );

                        return (
                          <tr key={item.metalSymbol}>
                            <td>
                              <span style={{ fontWeight: 600 }}>{item.metalName}</span>
                              <span style={{ color: 'var(--text-subtle)', marginLeft: '0.35rem', fontSize: '0.75rem' }}>
                                ({item.metalSymbol})
                              </span>
                            </td>
                            <td style={{ fontFamily: 'JetBrains Mono', color: item.exceedsLimit ? '#ef4444' : 'inherit', fontWeight: item.exceedsLimit ? 700 : 400 }}>
                              {item.measuredMgL} mg/L
                            </td>
                            <td style={{ fontFamily: 'JetBrains Mono', color: 'var(--text-muted)' }}>
                              {item.standardLimitMgL} mg/L
                            </td>
                            <td style={{ fontFamily: 'JetBrains Mono' }}>{item.unitWeightWi}</td>
                            <td style={{ fontFamily: 'JetBrains Mono', color: item.exceedsLimit ? '#ef4444' : 'inherit' }}>
                              {item.subIndexQi}
                            </td>
                            <td style={{ fontFamily: 'JetBrains Mono', fontWeight: 600, color: 'var(--primary)' }}>
                              {item.productWiQi}
                            </td>
                            <td style={{ fontFamily: 'JetBrains Mono' }}>{heiItem?.ratioCiOverMACi ?? '—'}</td>
                            <td style={{ fontFamily: 'JetBrains Mono', color: 'var(--accent)' }}>
                              {heiItem?.percentageOfHEI ? `${heiItem.percentageOfHEI}%` : '—'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      <tr style={{ background: 'rgba(15, 23, 42, 0.9)', fontWeight: 600 }}>
                        <td colSpan={3}>Sum Totals (Σ):</td>
                        <td style={{ fontFamily: 'JetBrains Mono' }}>{assessment.intermediateResults?.hpi?.sumWi}</td>
                        <td>—</td>
                        <td style={{ fontFamily: 'JetBrains Mono', color: 'var(--primary)' }}>
                          {assessment.intermediateResults?.hpi?.sumWiQi}
                        </td>
                        <td style={{ fontFamily: 'JetBrains Mono', color: 'var(--accent)' }}>{assessment.heiValue}</td>
                        <td>100.00%</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Scientific Interpretation & Limitations Disclaimer */}
              <div
                style={{
                  padding: '1.25rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(6, 182, 212, 0.08)',
                  border: '1px solid rgba(6, 182, 212, 0.25)',
                  color: '#f8fafc',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--primary)', fontWeight: 600, marginBottom: '0.4rem' }}>
                  <Info size={18} /> Scientific Interpretation & Methodology Citations
                </div>
                <p style={{ fontSize: '0.84rem', color: '#cbd5e1', lineHeight: 1.5 }}>
                  <strong>Prasad & Bose (2001) HPI:</strong> Values &lt; 50 denote low pollution (good potable quality); 50–100 indicate threshold pollution requiring continuous surveillance; and &gt; 100 flag critical contamination. <strong>Edet & Offiong (2002) HEI:</strong> Cumulative index where &lt; 10 is low, 10–20 is moderate, and &gt; 20 is severe pollution.
                </p>
              </div>
            </>
          )}
        </>
      )}

      {/* =========================================================================
          TAB 2: ML CONTAMINATION RISK PREDICTION (DEMONSTRATION MODEL)
          ========================================================================= */}
      {activeTab === 'prediction' && (
        <>
          {/* Scientific Model Disclaimer Banner */}
          <div
            style={{
              padding: '1rem 1.25rem',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(245, 158, 11, 0.12)',
              border: '1px solid rgba(245, 158, 11, 0.35)',
              marginBottom: '1.5rem',
              display: 'flex',
              gap: '0.75rem',
              alignItems: 'flex-start',
            }}
          >
            <ShieldAlert size={20} style={{ color: '#f59e0b', flexShrink: 0, marginTop: '2px' }} />
            <div style={{ fontSize: '0.82rem', color: '#fef3c7', lineHeight: 1.5 }}>
              <strong>DEMONSTRATION ML MODEL NOTICE:</strong> This predictive risk engine is calibrated on synthetic environmental monitoring demonstration data for software and surveillance workflow prototyping. It is <strong>NOT scientifically validated for public health drinking-water safety clearance</strong>. Water safety must <em>never</em> be declared solely from an AI prediction without certified laboratory (AAS/ICP-MS) verification.
            </div>
          </div>

          {/* Preset Selector */}
          <div className="card" style={{ padding: '1rem 1.25rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.86rem', fontWeight: 600 }}>
                <Sparkles size={16} style={{ color: 'var(--primary)' }} />
                <span>Simulate Scenario Presets:</span>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {Object.entries(PRESETS).map(([key, p]) => (
                  <button
                    key={key}
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => loadPreset(key)}
                    style={{ fontSize: '0.75rem' }}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Form & Controls Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
            {/* Input Parameters Card */}
            <div className="card">
              <div className="card-header">
                <div className="card-title">Water Sample Parameters (mg/L)</div>
                <div className="card-subtitle">Adjust physico-chemical & heavy metal concentrations</div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {/* Physical Parameters Row */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                      pH (Units)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      className="form-input"
                      value={predForm.pH ?? ''}
                      onChange={(e) => setPredForm({ ...predForm, pH: parseFloat(e.target.value) || 0 })}
                    />
                    <span style={{ fontSize: '0.62rem', color: 'var(--text-subtle)' }}>WHO: 6.5–8.5</span>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                      TDS (mg/L)
                    </label>
                    <input
                      type="number"
                      step="1"
                      className="form-input"
                      value={predForm.tds ?? ''}
                      onChange={(e) => setPredForm({ ...predForm, tds: parseFloat(e.target.value) || 0 })}
                    />
                    <span style={{ fontSize: '0.62rem', color: 'var(--text-subtle)' }}>WHO: &lt;500</span>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                      Turbidity (NTU)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      className="form-input"
                      value={predForm.turbidity ?? ''}
                      onChange={(e) => setPredForm({ ...predForm, turbidity: parseFloat(e.target.value) || 0 })}
                    />
                    <span style={{ fontSize: '0.62rem', color: 'var(--text-subtle)' }}>WHO: &lt;5</span>
                  </div>
                </div>

                <div style={{ borderBottom: '1px solid var(--border-subtle)', margin: '0.3rem 0' }} />

                {/* Heavy Metals Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                  {[
                    { key: 'Pb', name: 'Lead (Pb)', limit: '0.01' },
                    { key: 'Cd', name: 'Cadmium (Cd)', limit: '0.003' },
                    { key: 'Cr', name: 'Chromium (Cr)', limit: '0.05' },
                    { key: 'Cu', name: 'Copper (Cu)', limit: '2.0' },
                    { key: 'Zn', name: 'Zinc (Zn)', limit: '3.0' },
                    { key: 'Ni', name: 'Nickel (Ni)', limit: '0.07' },
                    { key: 'Fe', name: 'Iron (Fe)', limit: '0.3' },
                    { key: 'As', name: 'Arsenic (As)', limit: '0.01' },
                    { key: 'Hg', name: 'Mercury (Hg)', limit: '0.001' },
                  ].map((m) => (
                    <div key={m.key}>
                      <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                        {m.name}
                      </label>
                      <input
                        type="number"
                        step="0.0001"
                        className="form-input"
                        value={predForm[m.key] ?? ''}
                        onChange={(e) => setPredForm({ ...predForm, [m.key]: parseFloat(e.target.value) || 0 })}
                      />
                      <span style={{ fontSize: '0.62rem', color: 'var(--text-subtle)' }}>Limit: {m.limit}</span>
                    </div>
                  ))}
                </div>

                {/* Standard Selection & Trigger */}
                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem', alignItems: 'center' }}>
                  <select
                    className="form-select"
                    style={{ flex: 1, padding: '0.45rem' }}
                    value={predAuthority}
                    onChange={(e) => {
                      setPredAuthority(e.target.value);
                      handleRunPrediction(predForm, e.target.value);
                    }}
                  >
                    <option value="WHO">WHO Drinking Water 4th Ed</option>
                    <option value="BIS">BIS IS 10500:2012</option>
                  </select>

                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => handleRunPrediction()}
                    disabled={predicting}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', whiteSpace: 'nowrap' }}
                  >
                    <Cpu size={15} />
                    <span>{predicting ? 'Evaluating...' : 'Run Prediction'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Prediction Output Results Card */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div className="card-header">
                  <div className="card-title">Demonstration Prediction Assessment</div>
                  <div className="card-subtitle">Transparent multi-parameter rule ensemble result</div>
                </div>

                {predError && (
                  <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444', padding: '0.75rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontSize: '0.8rem' }}>
                    {predError}
                  </div>
                )}

                {predResult ? (
                  <div>
                    {/* Gauge / Score Bar */}
                    <div style={{ marginBottom: '1.25rem', textAlign: 'center', background: 'rgba(10, 15, 29, 0.6)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                        Composite Contamination Risk Score
                      </div>
                      <div
                        style={{
                          fontSize: '2.5rem',
                          fontWeight: 800,
                          fontFamily: 'Outfit',
                          color: predResult.badgeVariant === 'danger' ? '#ef4444' : predResult.badgeVariant === 'warning' ? '#f59e0b' : '#10b981',
                        }}
                      >
                        {predResult.riskScore} <span style={{ fontSize: '1rem', color: 'var(--text-subtle)' }}>/ 100</span>
                      </div>

                      {/* Visual Meter Bar */}
                      <div style={{ height: '8px', background: '#1e293b', borderRadius: '999px', overflow: 'hidden', margin: '0.75rem 0 0.5rem' }}>
                        <div
                          style={{
                            height: '100%',
                            width: `${predResult.riskScore}%`,
                            background: predResult.badgeVariant === 'danger' ? 'linear-gradient(90deg, #f59e0b, #ef4444)' : predResult.badgeVariant === 'warning' ? '#f59e0b' : '#10b981',
                            transition: 'width 0.4s ease',
                          }}
                        />
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', alignItems: 'center', marginTop: '0.5rem' }}>
                        <span
                          className="badge"
                          style={{
                            backgroundColor: predResult.badgeVariant === 'danger' ? 'rgba(239,68,68,0.2)' : predResult.badgeVariant === 'warning' ? 'rgba(245,158,11,0.2)' : 'rgba(16,185,129,0.2)',
                            color: predResult.badgeVariant === 'danger' ? '#ef4444' : predResult.badgeVariant === 'warning' ? '#f59e0b' : '#10b981',
                            border: `1px solid ${predResult.badgeVariant === 'danger' ? '#ef4444' : predResult.badgeVariant === 'warning' ? '#f59e0b' : '#10b981'}40`,
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            padding: '0.25rem 0.65rem',
                          }}
                        >
                          {predResult.riskCategory}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          Confidence: {predResult.confidencePercent}%
                        </span>
                      </div>
                    </div>

                    {/* Derived Index Metrics */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                      <div style={{ background: '#131d36', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(148,163,184,0.12)' }}>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>HPI Score (Prasad & Bose)</div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 700, color: predResult.hpi.value > 100 ? '#ef4444' : '#06b6d4' }}>
                          {predResult.hpi.value}
                        </div>
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-subtle)' }}>Threshold: 100</div>
                      </div>

                      <div style={{ background: '#131d36', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(148,163,184,0.12)' }}>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>HEI Score (Edet & Offiong)</div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 700, color: predResult.hei.value > 20 ? '#ef4444' : '#10b981' }}>
                          {predResult.hei.value}
                        </div>
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-subtle)' }}>Threshold: 20</div>
                      </div>
                    </div>

                    {/* Exceeded Limits Highlights */}
                    {predResult.exceededLimitsCount > 0 ? (
                      <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: '8px', padding: '0.75rem', marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#ef4444', fontSize: '0.78rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                          <AlertTriangle size={14} /> Exceeded Reference Limits ({predResult.exceededLimitsCount})
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                          {predResult.exceededLimits.map((e) => (
                            <span key={e.metalSymbol} className="badge badge-danger" style={{ fontSize: '0.72rem' }}>
                              {e.metalName}: {e.measuredMgL} mg/L ({e.hazardRatio}x limit)
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: '8px', padding: '0.65rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#10b981', fontSize: '0.78rem' }}>
                        <Check size={14} /> All heavy metal concentrations are within {predResult.standardAuthority} permissible guidelines.
                      </div>
                    )}

                    {/* Recommended Action */}
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', background: 'rgba(15, 23, 42, 0.5)', padding: '0.65rem', borderRadius: '8px' }}>
                      <strong style={{ color: '#f8fafc' }}>Action Recommendation:</strong> {predResult.recommendedAction}
                    </div>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    Adjust parameters on the left and click Run Prediction.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Heavy Metal Comparison Table against Selected Authority */}
          {predResult && (
            <div className="card" style={{ marginBottom: '1.5rem' }}>
              <div className="card-header">
                <div className="card-title">Heavy Metal Concentration Reference Comparison</div>
                <div className="card-subtitle">
                  Benchmarked against {predResult.authorityDescription}
                </div>
              </div>

              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Metal</th>
                      <th>Measured (mg/L)</th>
                      <th>Reference Limit</th>
                      <th>Hazard Ratio (C / Limit)</th>
                      <th>Visual Compliance Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {predResult.metalBreakdown.map((m) => (
                      <tr key={m.metalSymbol}>
                        <td style={{ fontWeight: 600 }}>
                          {m.metalName} ({m.metalSymbol})
                        </td>
                        <td style={{ fontFamily: 'JetBrains Mono', fontWeight: m.exceedsLimit ? 700 : 400, color: m.exceedsLimit ? '#ef4444' : 'inherit' }}>
                          {m.measuredMgL} mg/L
                        </td>
                        <td style={{ fontFamily: 'JetBrains Mono', color: 'var(--text-muted)' }}>
                          {m.permissibleLimitMgL} mg/L
                        </td>
                        <td style={{ fontFamily: 'JetBrains Mono', color: m.exceedsLimit ? '#ef4444' : 'inherit' }}>
                          {m.hazardRatio}x
                        </td>
                        <td>
                          {m.exceedsLimit ? (
                            <span className="badge badge-danger" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                              <AlertCircle size={12} /> Above Limit
                            </span>
                          ) : (
                            <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                              <Check size={12} /> Within Limit
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AnalysisPage;
