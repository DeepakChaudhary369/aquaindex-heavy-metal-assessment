import React, { useState, useEffect } from 'react';
import {
  GitCompare,
  MapPin,
  BarChart2,
  Filter,
  CheckCircle2,
  AlertTriangle,
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
} from 'recharts';
import { samplesAPI, dashboardAPI } from '../services/api';
import LoadingSkeleton from '../components/LoadingSkeleton';

const LocationComparisonPage = () => {
  const [samples, setSamples] = useState([]);
  const [locationRankings, setLocationRankings] = useState([]);
  const [selectedLocations, setSelectedLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      samplesAPI.getSamples({ limit: 1000 }),
      dashboardAPI.getTrends(),
    ])
      .then(([sampleRes, trendRes]) => {
        if (sampleRes.success) {
          setSamples(sampleRes.data);
          // Pick distinct locations
          const distinct = Array.from(new Set(sampleRes.data.map((s) => s.location)));
          setSelectedLocations(distinct.slice(0, 4));
        }
        if (trendRes.success && trendRes.data?.locationRankings) {
          setLocationRankings(trendRes.data.locationRankings);
        }
      })
      .catch((err) => setError(err.message || 'Failed to load comparison data.'))
      .finally(() => setLoading(false));
  }, []);

  const handleLocationToggle = (loc) => {
    setSelectedLocations((prev) =>
      prev.includes(loc) ? prev.filter((l) => l !== loc) : [...prev, loc]
    );
  };

  // Compare metal averages across selected locations
  const allMetals = ['PB', 'CD', 'CR', 'CU', 'ZN', 'FE', 'AS', 'NI', 'HG'];
  const comparisonData = allMetals.map((sym) => {
    const row = { metal: sym };
    selectedLocations.forEach((loc) => {
      const locSamples = samples.filter((s) => s.location === loc);
      let sum = 0;
      let count = 0;
      locSamples.forEach((s) => {
        const m = s.measurements?.find((item) => item.metalSymbol.toUpperCase() === sym);
        if (m) {
          sum += m.normalizedValueMgL;
          count += 1;
        }
      });
      row[loc] = count > 0 ? Number((sum / count).toFixed(4)) : 0;
    });
    return row;
  });

  const distinctLocations = Array.from(new Set(samples.map((s) => s.location)));
  const palette = ['#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];

  return (
    <div style={{ maxWidth: '1150px', margin: '0 auto' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Multi-Location Comparison</h1>
          <p className="page-description">
            Evaluate and benchmark heavy metal concentrations, HPI scores, and contamination variances across river basins and aquifers.
          </p>
        </div>
      </div>

      {error && (
        <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }}>
          {error}
        </div>
      )}

      {/* Location Selector Chips */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <MapPin size={16} style={{ color: 'var(--primary)' }} /> Select Locations to Cross-Compare:
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {distinctLocations.map((loc, idx) => {
            const isSelected = selectedLocations.includes(loc);
            return (
              <button
                key={loc}
                type="button"
                onClick={() => handleLocationToggle(loc)}
                style={{
                  padding: '0.4rem 0.85rem',
                  fontSize: '0.82rem',
                  borderRadius: '9999px',
                  border: isSelected ? '1px solid var(--primary)' : '1px solid var(--border-subtle)',
                  background: isSelected ? 'rgba(6, 182, 212, 0.15)' : 'var(--bg-elevated)',
                  color: isSelected ? 'var(--primary)' : 'var(--text-muted)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  fontWeight: isSelected ? 600 : 400,
                }}
              >
                {loc}
              </button>
            );
          })}
        </div>
      </div>

      {loading ? (
        <LoadingSkeleton height="120px" count={2} />
      ) : (
        <>
          {/* Metal Concentration Comparison Bar Chart */}
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <div className="card-header">
              <div>
                <div className="card-title">
                  <BarChart2 size={18} style={{ color: 'var(--primary)' }} />
                  <span>Cross-Location Metal Concentrations (mg/L)</span>
                </div>
                <div className="card-subtitle">
                  Benchmarking individual heavy metal levels across chosen monitoring sites
                </div>
              </div>
            </div>

            <div style={{ width: '100%', height: '340px' }}>
              {selectedLocations.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={comparisonData} margin={{ top: 15, right: 20, left: 0, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.15)" />
                    <XAxis dataKey="metal" stroke="#94a3b8" fontSize={11} />
                    <YAxis stroke="#94a3b8" fontSize={11} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(148, 163, 184, 0.2)', borderRadius: '8px', color: '#f8fafc', fontSize: '12px' }}
                      formatter={(val) => [`${val} mg/L`]}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                    {selectedLocations.map((loc, idx) => (
                      <Bar
                        key={loc}
                        dataKey={loc}
                        fill={palette[idx % palette.length]}
                        radius={[3, 3, 0, 0]}
                      />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
                  Please select at least one location from the list above.
                </div>
              )}
            </div>
          </div>

          {/* Location Pollution Rankings Table */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <GitCompare size={18} style={{ color: 'var(--accent)' }} />
                <span>Geographic Pollution Summary Ranking</span>
              </div>
              <div className="card-subtitle">
                Aggregated mean Heavy Metal Pollution Index (HPI) and Evaluation Index (HEI)
              </div>
            </div>

            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Monitoring Location</th>
                    <th>Samples Count</th>
                    <th>Average HPI</th>
                    <th>Average HEI</th>
                    <th>Comparative Quality Status</th>
                  </tr>
                </thead>
                <tbody>
                  {locationRankings.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                        No location rankings calculated yet.
                      </td>
                    </tr>
                  ) : (
                    locationRankings
                      .sort((a, b) => b.avgHpi - a.avgHpi)
                      .map((loc, idx) => {
                        const isCritical = loc.avgHpi > 100;
                        const isThreshold = loc.avgHpi >= 50 && loc.avgHpi <= 100;

                        return (
                          <tr key={loc.location}>
                            <td style={{ fontWeight: 700, color: 'var(--text-subtle)' }}>#{idx + 1}</td>
                            <td style={{ fontWeight: 600 }}>{loc.location}</td>
                            <td>{loc.sampleCount}</td>
                            <td style={{ fontFamily: 'JetBrains Mono', fontWeight: 600, color: isCritical ? 'var(--status-critical)' : isThreshold ? 'var(--status-medium)' : 'var(--status-low)' }}>
                              {loc.avgHpi}
                            </td>
                            <td style={{ fontFamily: 'JetBrains Mono' }}>{loc.avgHei}</td>
                            <td>
                              {isCritical ? (
                                <span className="badge badge-danger">High Contamination (&gt;100)</span>
                              ) : isThreshold ? (
                                <span className="badge badge-warning">Threshold / Moderate (50-100)</span>
                              ) : (
                                <span className="badge badge-success">Good Water Quality (&lt;50)</span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default LocationComparisonPage;
