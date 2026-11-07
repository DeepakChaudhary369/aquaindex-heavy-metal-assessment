import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Info, Layers, RefreshCw, AlertTriangle, Eye } from 'lucide-react';
import L from 'leaflet';
import { samplesAPI } from '../services/api';
import { formatDateShort, getHpiBadge, getReviewBadge } from '../utils/formatters';
import DemoDataBanner from '../components/DemoDataBanner';

// Fix Leaflet's default marker icons in Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const createCustomCircleMarker = (color) => {
  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `
      <div style="
        width: 22px;
        height: 22px;
        background-color: ${color};
        border: 2px solid #ffffff;
        border-radius: 50%;
        box-shadow: 0 0 10px ${color}80, 0 2px 4px rgba(0,0,0,0.5);
      "></div>
    `,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
    popupAnchor: [0, -11],
  });
};

const MapPage = () => {
  const mapContainerRef = useRef(null);
  const leafletMapRef = useRef(null);
  const markersLayerRef = useRef(null);

  const [samples, setSamples] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  const fetchSamples = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await samplesAPI.getSamples({ hasCoordinates: 'true', limit: 1000 });
      if (res.success) {
        setSamples(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load map spatial coordinates.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSamples();
  }, []);

  // Initialize Leaflet map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (!leafletMapRef.current) {
      // Default center around Northern / Central India coordinates (or first sample)
      const map = L.map(mapContainerRef.current, {
        center: [23.5, 78.5],
        zoom: 5,
        attributionControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 18,
      }).addTo(map);

      markersLayerRef.current = L.layerGroup().addTo(map);
      leafletMapRef.current = map;
    }

    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, []);

  // Plot markers when samples or filter changes
  useEffect(() => {
    if (!leafletMapRef.current || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();

    const validSamples = samples.filter((s) => {
      if (!s.coordinates?.latitude || !s.coordinates?.longitude) return false;
      if (selectedFilter === 'all') return true;

      const hpi = s.latestAssessment?.hpiValue;
      if (selectedFilter === 'critical') return hpi > 100;
      if (selectedFilter === 'threshold') return hpi >= 50 && hpi <= 100;
      if (selectedFilter === 'good') return hpi < 50;
      return true;
    });

    const bounds = [];

    validSamples.forEach((sample) => {
      const lat = sample.coordinates.latitude;
      const lng = sample.coordinates.longitude;
      bounds.push([lat, lng]);

      const hpi = sample.latestAssessment?.hpiValue;
      let markerColor = '#10b981'; // Green (Good / <50)
      if (hpi > 100) {
        markerColor = '#ef4444'; // Red (Critical / >100)
      } else if (hpi >= 50) {
        markerColor = '#f59e0b'; // Amber (Threshold / 50-100)
      }

      const marker = L.marker([lat, lng], {
        icon: createCustomCircleMarker(markerColor),
      });

      const popupHtml = `
        <div style="font-family: inherit; font-size: 13px; color: #0f172a; min-width: 200px; padding: 2px;">
          <div style="font-weight: 700; font-size: 14px; margin-bottom: 4px; color: #0f172a;">
            ${sample.location}
          </div>
          <div style="color: #64748b; font-size: 11px; margin-bottom: 6px;">
            Sample ID: <strong>${sample.sampleId}</strong> | Source: <span style="text-transform: capitalize;">${sample.waterSource}</span>
          </div>
          <div style="background: #f1f5f9; padding: 6px 8px; border-radius: 6px; margin-bottom: 8px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
              <span>HPI Score:</span>
              <strong style="color: ${markerColor};">${hpi !== undefined && hpi !== null ? hpi : 'Unassessed'}</strong>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span>HEI Score:</span>
              <strong>${sample.latestAssessment?.heiValue ?? '—'}</strong>
            </div>
          </div>
          <div style="font-size: 11px; color: #475569; margin-bottom: 8px;">
            Tested: ${(sample.measurements || []).map((m) => m.metalSymbol).join(', ')}
          </div>
          <a href="/samples/${sample._id}" style="
            display: block;
            text-align: center;
            background: #0284c7;
            color: #ffffff;
            text-decoration: none;
            padding: 5px 8px;
            border-radius: 4px;
            font-size: 11px;
            font-weight: 600;
          ">
            View Complete Measurements
          </a>
        </div>
      `;

      marker.bindPopup(popupHtml);
      markersLayerRef.current.addLayer(marker);
    });

    if (bounds.length > 0) {
      leafletMapRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 10 });
    }
  }, [samples, selectedFilter]);

  const hasDemo = samples.some((s) => s.isDemoData);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Pollution Hotspot Map</h1>
          <p className="page-description">
            Geographic spatial distribution of water quality monitoring sites and heavy metal pollution levels using OpenStreetMap.
          </p>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary btn-sm" onClick={fetchSamples} title="Refresh map points">
            <RefreshCw size={14} /> Refresh Map
          </button>
        </div>
      </div>

      <DemoDataBanner visible={hasDemo} />

      {error && (
        <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }}>
          {error}
        </div>
      )}

      {/* Map Filter Controls Bar */}
      <div className="card" style={{ padding: '0.85rem 1.25rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          <Layers size={16} style={{ color: 'var(--primary)' }} />
          <span>Filter Map Hotspots:</span>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {[
            { id: 'all', label: `All Sites (${samples.length})`, color: 'var(--text-main)' },
            { id: 'good', label: 'Low Pollution (<50)', color: '#10b981' },
            { id: 'threshold', label: 'Threshold (50-100)', color: '#f59e0b' },
            { id: 'critical', label: 'Critical Pollution (>100)', color: '#ef4444' },
          ].map((filter) => (
            <button
              key={filter.id}
              type="button"
              onClick={() => setSelectedFilter(filter.id)}
              style={{
                padding: '0.35rem 0.75rem',
                fontSize: '0.8rem',
                borderRadius: 'var(--radius-md)',
                border: selectedFilter === filter.id ? `1px solid ${filter.color}` : '1px solid var(--border-subtle)',
                background: selectedFilter === filter.id ? 'rgba(255, 255, 255, 0.08)' : 'var(--bg-elevated)',
                color: filter.color,
                fontWeight: selectedFilter === filter.id ? 600 : 400,
                cursor: 'pointer',
              }}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Map Canvas and Legend */}
      <div className="card" style={{ padding: '0.5rem', overflow: 'hidden', position: 'relative' }}>
        <div
          ref={mapContainerRef}
          style={{
            width: '100%',
            height: '560px',
            borderRadius: 'var(--radius-md)',
            zIndex: 10,
          }}
        />

        {/* Floating Scientific Legend Card */}
        <div
          className="map-legend-card"
          style={{
            position: 'absolute',
            bottom: '25px',
            right: '25px',
            backgroundColor: 'rgba(15, 23, 42, 0.92)',
            backdropFilter: 'blur(8px)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '1rem',
            zIndex: 1000,
            maxWidth: '280px',
            boxShadow: 'var(--shadow-lg)',
            fontSize: '0.8rem',
          }}
        >
          <div style={{ fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.3rem' }}>
            HPI Classification Legend
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#10b981', flexShrink: 0 }} />
              <span><strong>Low Pollution (&lt;50):</strong> Suitable water quality</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#f59e0b', flexShrink: 0 }} />
              <span><strong>Threshold (50–100):</strong> Surveillance required</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ef4444', flexShrink: 0 }} />
              <span><strong>Critical (&gt;100):</strong> Unsuitable / remediation needed</span>
            </div>
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-subtle)', marginTop: '0.6rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.3rem' }}>
            Prasad & Bose (2001) / Edet & Offiong (2002)
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapPage;
