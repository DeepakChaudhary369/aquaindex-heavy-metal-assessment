import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PlusCircle,
  FlaskConical,
  MapPin,
  Calendar,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  Calculator,
  ArrowLeft,
  Database,
  Shuffle,
  RotateCcw,
  Sparkles,
  Droplets,
  Info,
} from 'lucide-react';
import { samplesAPI, datasetAPI } from '../services/api';

const DEFAULT_METALS = [
  { symbol: 'PB', name: 'Lead', defaultUnit: 'mg/L', whoLimitMgL: 0.01, bisLimitMgL: 0.01 },
  { symbol: 'CD', name: 'Cadmium', defaultUnit: 'mg/L', whoLimitMgL: 0.003, bisLimitMgL: 0.003 },
  { symbol: 'CR', name: 'Chromium', defaultUnit: 'mg/L', whoLimitMgL: 0.05, bisLimitMgL: 0.05 },
  { symbol: 'CU', name: 'Copper', defaultUnit: 'mg/L', whoLimitMgL: 2.0, bisLimitMgL: 0.05 },
  { symbol: 'ZN', name: 'Zinc', defaultUnit: 'mg/L', whoLimitMgL: 3.0, bisLimitMgL: 5.0 },
  { symbol: 'NI', name: 'Nickel', defaultUnit: 'mg/L', whoLimitMgL: 0.07, bisLimitMgL: 0.02 },
  { symbol: 'FE', name: 'Iron', defaultUnit: 'mg/L', whoLimitMgL: 0.3, bisLimitMgL: 0.3 },
  { symbol: 'AS', name: 'Arsenic', defaultUnit: 'mg/L', whoLimitMgL: 0.01, bisLimitMgL: 0.01 },
  { symbol: 'HG', name: 'Mercury', defaultUnit: 'mg/L', whoLimitMgL: 0.001, bisLimitMgL: 0.001 },
];

const POPULAR_DISTRICTS = [
  'Ludhiana',
  'Jalandhar',
  'Amritsar',
  'Panipat',
  'Sonipat',
  'Jaipur',
  'Kota',
  'Kanpur',
  'Varanasi',
  'Delhi',
  'Raipur',
  'Dhanbad',
  'Korba',
  'Durgapur',
  'Singrauli',
  'Ranchi',
  'Bhopal',
  'Patna',
  'Nagpur',
  'Surat',
];

const POPULAR_STATES = [
  'Punjab',
  'Haryana',
  'Rajasthan',
  'Uttar Pradesh',
  'Delhi',
  'Chhattisgarh',
  'Jharkhand',
  'West Bengal',
  'Madhya Pradesh',
  'Bihar',
  'Maharashtra',
  'Gujarat',
  'Odisha',
  'Tamil Nadu',
  'Karnataka',
];

const UNIT_CONVERSIONS = {
  'mg/L': 1.0,
  'µg/L': 0.001,
  'ppm': 1.0,
  'ppb': 0.001,
};

const AddSamplePage = () => {
  const navigate = useNavigate();

  // Metadata state
  const [sampleId, setSampleId] = useState('');
  const [location, setLocation] = useState('');
  const [district, setDistrict] = useState('');
  const [state, setState] = useState('');
  const [waterSource, setWaterSource] = useState('Groundwater');
  const [collectionDate, setCollectionDate] = useState(() => new Date().toISOString().slice(0, 16));
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [notes, setNotes] = useState('');

  // Physical Water Quality Parameters (from Dataset Schema)
  const [pH, setPH] = useState('');
  const [tdsMgL, setTdsMgL] = useState('');
  const [turbidityNtu, setTurbidityNtu] = useState('');

  // Assessment options
  const [autoAssess, setAutoAssess] = useState(true);
  const [standardAuthority, setStandardAuthority] = useState('WHO');

  // Metal measurements state
  const [measurements, setMeasurements] = useState(() =>
    DEFAULT_METALS.map((m) => ({
      metalSymbol: m.symbol,
      metalName: m.name,
      enabled: true,
      rawValue: '',
      rawUnit: m.defaultUnit,
    }))
  );

  // Dataset Quick Load state
  const [datasetSamples, setDatasetSamples] = useState([]);
  const [selectedDatasetId, setSelectedDatasetId] = useState('');
  const [loadingDataset, setLoadingDataset] = useState(false);
  const [datasetNotice, setDatasetNotice] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch dataset records on mount for quick selector
  useEffect(() => {
    let mounted = true;
    setLoadingDataset(true);
    datasetAPI
      .getSamples({ limit: 1000 })
      .then((res) => {
        if (mounted && res && res.data) {
          setDatasetSamples(res.data);
        }
      })
      .catch((err) => {
        console.warn('[AddSamplePage] Dataset fetch note:', err.message);
      })
      .finally(() => {
        if (mounted) setLoadingDataset(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  // Autofill form from a chosen dataset sample
  const applyDatasetSample = (rec) => {
    if (!rec) return;
    setSelectedDatasetId(rec.sampleId);
    setSampleId(`${rec.sampleId}-REG`);
    setLocation(rec.location || (rec.district && rec.state ? `${rec.district}, ${rec.state}` : `${rec.sampleId} Surveillance Site`));
    setDistrict(rec.district || '');
    setState(rec.state || '');
    setWaterSource(rec.waterSource || rec.waterSourceType || 'Groundwater');

    if (rec.sampleDate || rec.collectionDate) {
      const d = new Date(rec.sampleDate || rec.collectionDate);
      if (!isNaN(d.getTime())) {
        setCollectionDate(d.toISOString().slice(0, 16));
      }
    }

    setLatitude(rec.latitude !== null && rec.latitude !== undefined ? String(rec.latitude) : '');
    setLongitude(rec.longitude !== null && rec.longitude !== undefined ? String(rec.longitude) : '');
    setPH(rec.pH !== null && rec.pH !== undefined ? String(rec.pH) : '');
    setTdsMgL(rec.tdsMgL !== null && rec.tdsMgL !== undefined ? String(rec.tdsMgL) : '');
    setTurbidityNtu(rec.turbidityNtu !== null && rec.turbidityNtu !== undefined ? String(rec.turbidityNtu) : '');

    // Populate metal concentrations
    const metalsMap = rec.metals || {};
    if (Array.isArray(rec.measurements)) {
      rec.measurements.forEach((m) => {
        if (m.metalSymbol) {
          const sym = m.metalSymbol.toUpperCase();
          metalsMap[sym] = m.normalizedValueMgL !== undefined ? m.normalizedValueMgL : m.rawValue;
        }
      });
    }

    setMeasurements((prev) =>
      prev.map((m) => {
        const sym = m.metalSymbol.toUpperCase();
        let val = metalsMap[sym];
        if (val === undefined || val === null) {
          val = metalsMap[sym.charAt(0) + sym.slice(1).toLowerCase()];
        }
        const hasVal = val !== undefined && val !== null;
        return {
          ...m,
          enabled: hasVal,
          rawValue: hasVal ? String(val) : '',
          rawUnit: 'mg/L',
        };
      })
    );

    setNotes(`Imported from Surveillance Dataset (${rec.sampleId}). Field parameters: pH ${rec.pH ?? 'N/A'}, TDS ${rec.tdsMgL ?? 'N/A'} mg/L, Turbidity ${rec.turbidityNtu ?? 'N/A'} NTU.`);
    setDatasetNotice(`✓ Successfully loaded dataset record ${rec.sampleId} (${rec.district || 'Site'}, ${rec.state || ''})! You can adjust any parameter before saving.`);
  };

  const handleDropdownSelect = (e) => {
    const val = e.target.value;
    setSelectedDatasetId(val);
    if (!val) return;
    const found = datasetSamples.find((s) => s.sampleId === val);
    if (found) {
      applyDatasetSample(found);
    }
  };

  const handleRandomDataset = async () => {
    try {
      setLoadingDataset(true);
      if (datasetSamples.length > 0) {
        const randomIdx = Math.floor(Math.random() * datasetSamples.length);
        applyDatasetSample(datasetSamples[randomIdx]);
      } else {
        const res = await datasetAPI.getSamples({ limit: 1000 });
        if (res && res.data && res.data.length > 0) {
          setDatasetSamples(res.data);
          const randomIdx = Math.floor(Math.random() * res.data.length);
          applyDatasetSample(res.data[randomIdx]);
        }
      }
    } catch (err) {
      setError('Failed to fetch dataset record: ' + (err.message || 'Error'));
    } finally {
      setLoadingDataset(false);
    }
  };

  const handleResetForm = () => {
    setSampleId('');
    setLocation('');
    setDistrict('');
    setState('');
    setWaterSource('Groundwater');
    setCollectionDate(new Date().toISOString().slice(0, 16));
    setLatitude('');
    setLongitude('');
    setPH('');
    setTdsMgL('');
    setTurbidityNtu('');
    setNotes('');
    setSelectedDatasetId('');
    setMeasurements(
      DEFAULT_METALS.map((m) => ({
        metalSymbol: m.symbol,
        metalName: m.name,
        enabled: true,
        rawValue: '',
        rawUnit: m.defaultUnit,
      }))
    );
    setDatasetNotice('Form cleared. Ready for custom entry.');
    setTimeout(() => setDatasetNotice(''), 3000);
  };

  const handleMetalToggle = (index) => {
    setMeasurements((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], enabled: !updated[index].enabled };
      return updated;
    });
  };

  const handleToggleAllMetals = (enable) => {
    setMeasurements((prev) => prev.map((m) => ({ ...m, enabled: enable })));
  };

  const handleValueChange = (index, value) => {
    setMeasurements((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], rawValue: value };
      return updated;
    });
  };

  const handleUnitChange = (index, unit) => {
    setMeasurements((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], rawUnit: unit };
      return updated;
    });
  };

  const calculateNormalized = (value, unit) => {
    const num = parseFloat(value);
    if (isNaN(num) || num < 0) return null;
    const factor = UNIT_CONVERSIONS[unit] || 1;
    return (num * factor).toFixed(6);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Filter enabled measurements
    const activeMeasurements = measurements.filter((m) => m.enabled);
    if (activeMeasurements.length === 0) {
      setError('Please enable and provide at least one heavy metal measurement.');
      return;
    }

    // Validate values
    for (const m of activeMeasurements) {
      if (m.rawValue === '' || m.rawValue === null || isNaN(parseFloat(m.rawValue))) {
        setError(`Please provide a valid numeric value for ${m.metalName} (${m.metalSymbol}) or disable it.`);
        return;
      }
      if (parseFloat(m.rawValue) < 0) {
        setError(`Concentration cannot be negative for ${m.metalName} (${m.metalSymbol}).`);
        return;
      }
    }

    setLoading(true);

    try {
      const finalLoc = location.trim() || (district && state ? `${district.trim()}, ${state.trim()}` : 'Water Sample Collection Site');

      const payload = {
        sampleId: sampleId.trim() || undefined,
        location: finalLoc,
        district: district.trim(),
        state: state.trim(),
        waterSource,
        collectionDate: new Date(collectionDate).toISOString(),
        coordinates: {
          latitude: latitude !== '' ? parseFloat(latitude) : null,
          longitude: longitude !== '' ? parseFloat(longitude) : null,
        },
        pH: pH !== '' && !isNaN(parseFloat(pH)) ? parseFloat(pH) : null,
        tdsMgL: tdsMgL !== '' && !isNaN(parseFloat(tdsMgL)) ? parseFloat(tdsMgL) : null,
        turbidityNtu: turbidityNtu !== '' && !isNaN(parseFloat(turbidityNtu)) ? parseFloat(turbidityNtu) : null,
        dataType: 'measured',
        notes: notes.trim(),
        measurements: activeMeasurements.map((m) => {
          const norm = calculateNormalized(m.rawValue, m.rawUnit);
          return {
            metalSymbol: m.metalSymbol,
            rawValue: parseFloat(m.rawValue),
            rawUnit: m.rawUnit,
            normalizedValueMgL: norm !== null ? parseFloat(norm) : parseFloat(m.rawValue),
          };
        }),
        autoAssess,
        standardAuthority,
      };

      const res = await samplesAPI.createSample(payload);

      if (res.success) {
        setSuccess(`Water sample ${res.data.sampleId} recorded & synced with surveillance dataset! Redirecting...`);
        setTimeout(() => {
          navigate(`/samples/${res.data._id}`);
        }, 1200);
      }
    } catch (err) {
      setError(err.message || 'Failed to save water sample.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '980px', margin: '0 auto', paddingBottom: '3rem' }}>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <button
            onClick={() => navigate(-1)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              color: 'var(--text-muted)',
              fontSize: '0.85rem',
              marginBottom: '0.5rem',
              cursor: 'pointer',
              background: 'transparent',
              border: 'none',
              padding: 0,
            }}
          >
            <ArrowLeft size={16} /> Back to samples
          </button>
          <h1 className="page-title">Register Water Quality Sample</h1>
          <p className="page-description">
            Record physical parameters, location coordinates, and laboratory heavy metal test concentrations with dataset schema alignment.
          </p>
        </div>
      </div>

      {/* Dataset Quick-Load Toolbar Card */}
      <div
        className="card"
        style={{
          marginBottom: '1.5rem',
          background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.08) 0%, rgba(15, 23, 42, 0.6) 100%)',
          borderColor: 'rgba(6, 182, 212, 0.28)',
          boxShadow: '0 4px 20px -2px rgba(6, 182, 212, 0.12)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'rgba(6, 182, 212, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--primary)',
              }}
            >
              <Database size={17} />
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.95rem', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <span>Pre-fill from Surveillance Dataset (500 Samples)</span>
                <span className="badge badge-info" style={{ fontSize: '0.68rem', padding: '0.15rem 0.5rem' }}>
                  Auto-Populate
                </span>
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Select any certified surveillance sample to auto-populate metadata, physical parameters, and all 9 metal concentrations.
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleRandomDataset}
              disabled={loadingDataset}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem' }}
            >
              <Shuffle size={14} style={{ color: 'var(--primary)' }} />
              <span>{loadingDataset ? 'Fetching...' : 'Random Sample'}</span>
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleResetForm}
              title="Reset all inputs"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem' }}
            >
              <RotateCcw size={13} />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Dataset Sample Selector */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '0.75rem', alignItems: 'center' }}>
          <div>
            <select
              className="form-select"
              style={{ fontSize: '0.84rem', borderColor: 'rgba(6, 182, 212, 0.35)', background: 'rgba(11, 19, 38, 0.8)' }}
              value={selectedDatasetId}
              onChange={handleDropdownSelect}
              disabled={loadingDataset}
            >
              <option value="">-- Choose a Dataset Record to Load ({datasetSamples.length > 0 ? `${datasetSamples.length} available` : 'Loading...'}) --</option>
              {datasetSamples.map((s) => (
                <option key={s.sampleId} value={s.sampleId}>
                  {s.sampleId} — {s.district || s.location} ({s.state || 'IN'}) • {s.waterSource || s.waterSourceType} {s.hpi ? `[HPI: ${s.hpi}]` : ''}
                </option>
              ))}
            </select>
          </div>

          {datasetNotice && (
            <div
              style={{
                fontSize: '0.8rem',
                color: '#38bdf8',
                background: 'rgba(56, 189, 248, 0.12)',
                border: '1px solid rgba(56, 189, 248, 0.25)',
                padding: '0.45rem 0.75rem',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
              }}
            >
              <Sparkles size={14} />
              <span>{datasetNotice}</span>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <AlertCircle size={20} /> {error}
        </div>
      )}

      {success && (
        <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#10b981', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <CheckCircle2 size={20} /> {success}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Sample Metadata Card */}
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div className="card-header">
            <div className="card-title">
              <MapPin size={18} style={{ color: 'var(--primary)' }} />
              <span>Sample Metadata & Collection Site</span>
            </div>
            <div className="card-subtitle">
              Specify administrative district, state, coordinates, and exact source typology.
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: '1.15rem' }}>
            {/* Sample ID */}
            <div className="form-group">
              <label className="form-label">
                Sample ID (Auto-Generated if blank)
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="Leave blank for auto SMP-2026-XXXX"
                value={sampleId}
                onChange={(e) => setSampleId(e.target.value)}
              />
              <span className="form-hint">E.g., SMP-2026-0042 or AI-0001-REG</span>
            </div>

            {/* Location Name */}
            <div className="form-group">
              <label className="form-label required">Location / Site Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Ganga River - Dashashwamedh Ghat"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
              />
              <span className="form-hint">Landmark or sampling point</span>
            </div>

            {/* District */}
            <div className="form-group">
              <label className="form-label required">District (Dataset Field)</label>
              <input
                type="text"
                className="form-input"
                list="district-options"
                placeholder="e.g. Ludhiana, Varanasi, Kanpur..."
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                required
              />
              <datalist id="district-options">
                {POPULAR_DISTRICTS.map((d) => (
                  <option key={d} value={d} />
                ))}
              </datalist>
              <span className="form-hint">Administrative District</span>
            </div>

            {/* State */}
            <div className="form-group">
              <label className="form-label required">State / Province</label>
              <input
                type="text"
                className="form-input"
                list="state-options"
                placeholder="e.g. Punjab, Uttar Pradesh..."
                value={state}
                onChange={(e) => setState(e.target.value)}
                required
              />
              <datalist id="state-options">
                {POPULAR_STATES.map((s) => (
                  <option key={s} value={s} />
                ))}
              </datalist>
              <span className="form-hint">State / Union Territory</span>
            </div>

            {/* Water Source */}
            <div className="form-group">
              <label className="form-label required">Water Source Typology</label>
              <select
                className="form-select"
                value={waterSource}
                onChange={(e) => setWaterSource(e.target.value)}
                required
              >
                <option value="Groundwater">Groundwater / Borewell</option>
                <option value="Hand pump">Hand pump</option>
                <option value="Surface water">Surface water</option>
                <option value="Municipal supply">Municipal supply</option>
                <option value="River">River</option>
                <option value="Lake / Reservoir">Lake / Reservoir</option>
                <option value="Agricultural / Surface Pond">Agricultural / Surface Pond</option>
                <option value="Industrial Outfall / Other">Industrial Outfall / Other</option>
              </select>
              <span className="form-hint">Matches surveillance dataset categories</span>
            </div>

            {/* Collection Date */}
            <div className="form-group">
              <label className="form-label required">Collection Date & Time</label>
              <input
                type="datetime-local"
                className="form-input"
                value={collectionDate}
                onChange={(e) => setCollectionDate(e.target.value)}
                required
              />
            </div>

            {/* Latitude */}
            <div className="form-group">
              <label className="form-label">Latitude (°N/S, Optional)</label>
              <input
                type="number"
                step="any"
                className="form-input"
                placeholder="e.g. 25.3176"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
              />
            </div>

            {/* Longitude */}
            <div className="form-group">
              <label className="form-label">Longitude (°E/W, Optional)</label>
              <input
                type="number"
                step="any"
                className="form-input"
                placeholder="e.g. 83.0062"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginTop: '0.85rem', marginBottom: 0 }}>
            <label className="form-label">Field Notes & Observations</label>
            <textarea
              className="form-textarea"
              rows={2}
              placeholder="e.g. Water turbidity moderate; sampled 10m from north bank after monsoon rainfall event."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>

        {/* Physical Water Parameters Card (Dataset Schema) */}
        <div className="card" style={{ marginBottom: '1.5rem', background: 'rgba(15, 23, 42, 0.45)' }}>
          <div className="card-header">
            <div>
              <div className="card-title">
                <Droplets size={18} style={{ color: 'var(--primary)' }} />
                <span>Physical Water Quality Parameters (from Dataset Schema)</span>
              </div>
              <div className="card-subtitle">
                Key physical attributes recorded alongside heavy metal testings in the surveillance dataset.
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: '1.25rem' }}>
            {/* pH */}
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>pH Value</span>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-subtle)' }}>Standard: 6.5 – 8.5</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="14"
                className="form-input"
                placeholder="e.g. 7.45"
                value={pH}
                onChange={(e) => setPH(e.target.value)}
              />
              <span className="form-hint">
                {pH !== '' && !isNaN(parseFloat(pH)) ? (
                  parseFloat(pH) < 6.5 || parseFloat(pH) > 8.5 ? (
                    <span style={{ color: 'var(--status-critical)' }}>⚠️ Outside WHO standard (6.5 - 8.5)</span>
                  ) : (
                    <span style={{ color: 'var(--status-safe)' }}>✓ Within permissible drinking range</span>
                  )
                ) : (
                  'Acidic (<7) / Alkaline (>7)'
                )}
              </span>
            </div>

            {/* TDS */}
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>TDS (mg/L)</span>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-subtle)' }}>Limit: &lt; 500 mg/L</span>
              </label>
              <input
                type="number"
                step="any"
                min="0"
                className="form-input"
                placeholder="e.g. 280.5"
                value={tdsMgL}
                onChange={(e) => setTdsMgL(e.target.value)}
              />
              <span className="form-hint">Total Dissolved Solids in mg/L</span>
            </div>

            {/* Turbidity */}
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Turbidity (NTU)</span>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-subtle)' }}>Limit: &lt; 5 NTU</span>
              </label>
              <input
                type="number"
                step="any"
                min="0"
                className="form-input"
                placeholder="e.g. 1.85"
                value={turbidityNtu}
                onChange={(e) => setTurbidityNtu(e.target.value)}
              />
              <span className="form-hint">Nephelometric Turbidity Units</span>
            </div>
          </div>
        </div>

        {/* Heavy Metal Measurements Card */}
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <div className="card-title">
                <FlaskConical size={18} style={{ color: 'var(--accent)' }} />
                <span>Heavy Metal Concentrations & Analytical Units</span>
              </div>
              <div className="card-subtitle">
                All 9 standard metals from the dataset (Pb, Cd, Cr, Cu, Zn, Ni, Fe, As, Hg). Units normalize into standard mg/L.
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => handleToggleAllMetals(true)}
                style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}
              >
                Enable All 9
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => handleToggleAllMetals(false)}
                style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}
              >
                Clear All
              </button>
            </div>
          </div>

          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: '45px', textAlign: 'center' }}>Active</th>
                  <th>Metal Chemical Symbol</th>
                  <th>Measured Concentration</th>
                  <th>Selected Unit</th>
                  <th>Normalized (mg/L)</th>
                  <th>WHO Permissible Limit</th>
                  <th>BIS Acceptable Limit</th>
                </tr>
              </thead>
              <tbody>
                {measurements.map((m, idx) => {
                  const normalized = calculateNormalized(m.rawValue, m.rawUnit);
                  const def = DEFAULT_METALS.find((d) => d.symbol === m.metalSymbol);
                  const exceedsWho = normalized !== null && def && parseFloat(normalized) > def.whoLimitMgL;
                  const exceedsBis = normalized !== null && def && parseFloat(normalized) > def.bisLimitMgL;

                  return (
                    <tr key={m.metalSymbol} style={{ opacity: m.enabled ? 1 : 0.45 }}>
                      <td style={{ textAlign: 'center' }}>
                        <input
                          type="checkbox"
                          checked={m.enabled}
                          onChange={() => handleMetalToggle(idx)}
                          style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                        />
                      </td>
                      <td>
                        <strong>{m.metalName}</strong>
                        <span style={{ marginLeft: '0.4rem', color: 'var(--text-subtle)', fontFamily: 'JetBrains Mono' }}>
                          ({m.metalSymbol})
                        </span>
                      </td>
                      <td>
                        <input
                          type="number"
                          step="any"
                          min="0"
                          disabled={!m.enabled}
                          className="form-input"
                          style={{ width: '140px', padding: '0.45rem 0.6rem' }}
                          placeholder="e.g. 0.005"
                          value={m.rawValue}
                          onChange={(e) => handleValueChange(idx, e.target.value)}
                        />
                      </td>
                      <td>
                        <select
                          disabled={!m.enabled}
                          className="form-select"
                          style={{ width: '105px', padding: '0.45rem 0.6rem' }}
                          value={m.rawUnit}
                          onChange={(e) => handleUnitChange(idx, e.target.value)}
                        >
                          <option value="mg/L">mg/L</option>
                          <option value="µg/L">µg/L</option>
                          <option value="ppm">ppm</option>
                          <option value="ppb">ppb</option>
                        </select>
                      </td>
                      <td style={{ fontFamily: 'JetBrains Mono', fontSize: '0.85rem' }}>
                        {normalized !== null ? (
                          <span style={{ color: exceedsWho ? 'var(--status-critical)' : 'var(--text-main)', fontWeight: exceedsWho ? 600 : 400 }}>
                            {normalized} mg/L
                            {exceedsWho && (
                              <span className="badge badge-danger" style={{ marginLeft: '0.5rem', fontSize: '0.65rem' }}>
                                &gt; WHO Limit
                              </span>
                            )}
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-subtle)' }}>—</span>
                        )}
                      </td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        {def?.whoLimitMgL} mg/L
                      </td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        {def?.bisLimitMgL} mg/L
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Instant Assessment Computation Option */}
        <div className="card" style={{ marginBottom: '1.5rem', background: 'rgba(6, 182, 212, 0.05)', borderColor: 'rgba(6, 182, 212, 0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Calculator size={22} style={{ color: 'var(--primary)' }} />
              <div>
                <div style={{ fontWeight: 600 }}>Automatic HPI / HEI Math Assessment on Submission</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Immediately run the Prasad & Bose / Edet & Offiong assessment algorithms upon saving.
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <select
                className="form-select"
                style={{ width: '180px', padding: '0.45rem 0.75rem' }}
                value={standardAuthority}
                onChange={(e) => setStandardAuthority(e.target.value)}
                disabled={!autoAssess}
              >
                <option value="WHO">WHO 4th Edition</option>
                <option value="BIS">BIS IS 10500:2012</option>
              </select>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '0.85rem' }}>
                <input
                  type="checkbox"
                  checked={autoAssess}
                  onChange={(e) => setAutoAssess(e.target.checked)}
                  style={{ width: '16px', height: '16px' }}
                />
                <span>Auto-Calculate</span>
              </label>
            </div>
          </div>
        </div>

        {/* Submit Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/samples')}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading} style={{ padding: '0.75rem 1.75rem' }}>
            {loading ? 'Validating & Saving...' : <><PlusCircle size={18} /> Register Water Sample</>}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddSamplePage;
