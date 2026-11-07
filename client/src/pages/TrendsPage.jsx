import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  BarChart2,
  PieChart as PieIcon,
  Activity,
  Layers,
  Calendar,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import { dashboardAPI, samplesAPI } from '../services/api';
import LoadingSkeleton from '../components/LoadingSkeleton';

const TrendsPage = () => {
  const [trends, setTrends] = useState(null);
  const [samples, setSamples] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      dashboardAPI.getTrends(),
      samplesAPI.getSamples({ limit: 1000 }),
    ])
      .then(([trendRes, sampleRes]) => {
        if (trendRes.success) setTrends(trendRes.data);
        if (sampleRes.success) setSamples(sampleRes.data);
      })
      .catch((err) => setError(err.message || 'Failed to load analytical trend datasets.'))
      .finally(() => setLoading(false));
  }, []);

  // Compute Missing Data / Parameter Availability Completeness
  const standardMetals = ['PB', 'CD', 'CR', 'CU', 'ZN', 'NI', 'FE', 'AS', 'HG'];
  const metalPresenceCounts = standardMetals.map((sym) => {
    let measuredCount = 0;
    samples.forEach((s) => {
      if (s.measurements?.some((m) => m.metalSymbol.toUpperCase() === sym)) {
        measuredCount += 1;
      }
    });
    const completenessPercent = samples.length > 0 ? Number(((measuredCount / samples.length) * 100).toFixed(1)) : 0;
    return {
      symbol: sym,
      measured: measuredCount,
      missing: samples.length - measuredCount,
      completenessPercent,
    };
  });

  return (
    <div style={{ maxWidth: '1150px', margin: '0 auto' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Charts & Trend Analytics</h1>
          <p className="page-description">
            Time-series environmental analytics, heavy metal concentration distributions, and data completeness evaluations.
          </p>
        </div>
      </div>

      {error && (
        <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }}>
          {error}
        </div>
      )}

      {loading ? (
        <LoadingSkeleton height="150px" count={3} />
      ) : (
        <>
          {/* Main Time-series Area / Line Chart */}
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <div className="card-header">
              <div>
                <div className="card-title">
                  <TrendingUp size={18} style={{ color: 'var(--primary)' }} />
                  <span>Sequential Water Quality Index Profile</span>
                </div>
                <div className="card-subtitle">
                  Continuous progression of calculated HPI and HEI index values across chronological sample collections
                </div>
              </div>
            </div>

            <div style={{ width: '100%', height: '340px' }}>
              {trends && trends.timelineData?.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trends.timelineData} margin={{ top: 15, right: 25, left: 0, bottom: 20 }}>
                    <defs>
                      <linearGradient id="hpiGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="heiGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.12)" />
                    <XAxis dataKey="sampleId" stroke="#94a3b8" fontSize={11} />
                    <YAxis stroke="#94a3b8" fontSize={11} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(148, 163, 184, 0.2)', borderRadius: '8px', color: '#f8fafc', fontSize: '12px' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                    <ReferenceLine y={100} label={{ value: 'HPI Critical Threshold (>100)', fill: '#ef4444', fontSize: 10 }} stroke="#ef4444" strokeDasharray="4 4" />
                    <ReferenceLine y={50} label={{ value: 'HPI Warning Threshold (50)', fill: '#f59e0b', fontSize: 10 }} stroke="#f59e0b" strokeDasharray="4 4" />
                    <Area type="monotone" dataKey="hpi" name="HPI (Pollution Index)" stroke="#06b6d4" strokeWidth={2.5} fillOpacity={1} fill="url(#hpiGradient)" />
                    <Area type="monotone" dataKey="hei" name="HEI (Evaluation Index)" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#heiGradient)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
                  No historical trend timeline data available.
                </div>
              )}
            </div>
          </div>

          {/* Two Columns: Metal Mean Levels & Missing Data Breakdown */}
          <div className="dashboard-charts-grid">
            {/* Average Metal Levels Bar Chart */}
            <div className="card">
              <div className="card-header">
                <div>
                  <div className="card-title">
                    <BarChart2 size={18} style={{ color: 'var(--accent)' }} />
                    <span>Average Heavy Metal Concentrations (mg/L)</span>
                  </div>
                  <div className="card-subtitle">Normalized mean values across sample pool</div>
                </div>
              </div>

              <div style={{ width: '100%', height: '300px' }}>
                {trends && trends.metalAverages?.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={trends.metalAverages} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.12)" />
                      <XAxis dataKey="symbol" stroke="#94a3b8" fontSize={11} />
                      <YAxis stroke="#94a3b8" fontSize={11} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(148, 163, 184, 0.2)', borderRadius: '8px', color: '#f8fafc', fontSize: '12px' }}
                        formatter={(val) => [`${val} mg/L`, 'Mean Concentration']}
                      />
                      <Bar dataKey="averageMgL" name="Concentration (mg/L)" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
                    No concentration averages computed yet.
                  </div>
                )}
              </div>
            </div>

            {/* Data Completeness & Missing Data Evaluation */}
            <div className="card">
              <div className="card-header">
                <div>
                  <div className="card-title">
                    <Layers size={18} style={{ color: '#c084fc' }} />
                    <span>Data Completeness & Coverage Assessment</span>
                  </div>
                  <div className="card-subtitle">
                    Laboratory testing completeness percentage per target heavy metal
                  </div>
                </div>
              </div>

              <div style={{ width: '100%', height: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={metalPresenceCounts} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.12)" />
                    <XAxis dataKey="symbol" stroke="#94a3b8" fontSize={11} />
                    <YAxis stroke="#94a3b8" fontSize={11} domain={[0, 100]} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(148, 163, 184, 0.2)', borderRadius: '8px', color: '#f8fafc', fontSize: '12px' }}
                      formatter={(val) => [`${val}%`, 'Coverage Rate']}
                    />
                    <Bar dataKey="completenessPercent" name="Completeness %" fill="#14b8a6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default TrendsPage;
