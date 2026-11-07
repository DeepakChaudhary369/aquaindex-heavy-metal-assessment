import React from 'react';
import { Link } from 'react-router-dom';
import { Waves, ShieldCheck, ChevronUp, Database, Sparkles, MapPin, Calculator, FileText } from 'lucide-react';

const AppFooter = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer
      className="app-footer"
      style={{
        marginTop: 'auto',
        borderTop: '1px solid var(--border-subtle)',
        background: 'rgba(11, 17, 33, 0.85)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        padding: '1.25rem 2rem',
        position: 'relative',
        color: 'var(--text-muted)',
        fontSize: '0.8rem',
        zIndex: 50,
      }}
    >
      {/* Top Subtle Cyan Gradient Line */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '1px',
          background: 'linear-gradient(90deg, transparent 5%, rgba(6, 182, 212, 0.5) 35%, rgba(20, 184, 166, 0.5) 65%, transparent 95%)',
        }}
      />

      <div
        className="app-footer-inner"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          maxWidth: '1600px',
          margin: '0 auto',
        }}
      >
        {/* Brand & Standards Status - Clickable / Touchable redirecting to Home */}
        <Link
          to="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            flexWrap: 'wrap',
            textDecoration: 'none',
            color: 'inherit',
            cursor: 'pointer',
            userSelect: 'none',
            WebkitTapHighlightColor: 'transparent',
            transition: 'opacity 0.2s ease',
          }}
          title="AquaIndex - Return to Home"
        >
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #06b6d4 0%, #14b8a6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#04121f',
              boxShadow: '0 0 12px rgba(6, 182, 212, 0.3)',
              flexShrink: 0,
            }}
          >
            <Waves size={16} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, color: '#f8fafc', fontSize: '0.86rem' }}>
                AquaIndex Surveillance
              </span>
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-subtle)' }}>
              WHO 4th Ed &amp; BIS IS 10500 Compliant Toxicological Engine
            </div>
          </div>
        </Link>

        {/* Quick Analytical Navigation */}
        <div
          className="app-footer-links"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1.25rem',
            flexWrap: 'wrap',
            fontSize: '0.78rem',
          }}
        >
          <Link
            to="/"
            style={{ color: 'var(--text-muted)', textDecoration: 'none', transition: 'color 0.2s', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
            title="Public Interactive Landing Page"
          >
            <Sparkles size={13} style={{ color: 'var(--primary)' }} />
            <span>Public Portal</span>
          </Link>
          <Link
            to="/standards"
            style={{ color: 'var(--text-muted)', textDecoration: 'none', transition: 'color 0.2s', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
            title="WHO & BIS Regulatory Limits"
          >
            <ShieldCheck size={13} style={{ color: '#10b981' }} />
            <span>Standards DB</span>
          </Link>
          <Link
            to="/analysis"
            style={{ color: 'var(--text-muted)', textDecoration: 'none', transition: 'color 0.2s', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
            title="Compute Heavy Metal Indices"
          >
            <Calculator size={13} style={{ color: '#38bdf8' }} />
            <span>Calculator</span>
          </Link>
          <Link
            to="/map"
            style={{ color: 'var(--text-muted)', textDecoration: 'none', transition: 'color 0.2s', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
            title="Geospatial Pollution Hotspots"
          >
            <MapPin size={13} style={{ color: '#f59e0b' }} />
            <span>GIS Map</span>
          </Link>
          <Link
            to="/reports"
            style={{ color: 'var(--text-muted)', textDecoration: 'none', transition: 'color 0.2s', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
            title="Export CSV & PDF Records"
          >
            <FileText size={13} style={{ color: '#c084fc' }} />
            <span>Reports</span>
          </Link>
        </div>

        {/* System Online Status & Back to Top */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              fontSize: '0.72rem',
              color: '#10b981',
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              padding: '0.2rem 0.55rem',
              borderRadius: '9999px',
            }}
          >
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981', boxShadow: '0 0 6px #10b981' }} />
            <span className="hide-on-tiny">API Engine Active</span>
          </div>

          <button
            type="button"
            onClick={scrollToTop}
            title="Scroll to top"
            style={{
              background: 'rgba(30, 41, 59, 0.7)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-main)',
              borderRadius: '8px',
              padding: '0.35rem 0.55rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              cursor: 'pointer',
              fontSize: '0.72rem',
              fontWeight: 600,
              transition: 'all 0.2s',
            }}
          >
            <ChevronUp size={14} />
            <span>Top</span>
          </button>
        </div>
      </div>
    </footer>
  );
};

export default AppFooter;
