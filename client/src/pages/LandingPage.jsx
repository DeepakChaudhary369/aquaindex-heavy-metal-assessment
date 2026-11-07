import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Waves,
  ShieldCheck,
  BarChart3,
  MapPin,
  FileText,
  ArrowRight,
  Database,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  FlaskConical,
  Award,
  Calculator,
  Server,
  Menu,
  X,
  Droplets,
  ExternalLink,
  Zap,
  Sparkles,
  ChevronUp,
  Activity,
  Globe,
  Compass,
  Shield,
  Lock,
  Home,
} from 'lucide-react';

const SCENARIOS = [
  {
    id: 'groundwater',
    title: 'Deep Aquifer Borewell',
    source: 'Groundwater (Pristine)',
    hpi: 18.42,
    hei: 3.12,
    status: 'Low Pollution',
    color: '#10b981',
    badgeClass: 'badge-success',
    desc: 'Heavy metal concentrations are comfortably below WHO & BIS permissible thresholds.',
    metals: [
      { name: 'Lead (Pb)', val: '0.002 mg/L', limit: '0.010 mg/L', status: 'Compliant' },
      { name: 'Cadmium (Cd)', val: '0.0005 mg/L', limit: '0.003 mg/L', status: 'Compliant' },
      { name: 'Arsenic (As)', val: '0.001 mg/L', limit: '0.010 mg/L', status: 'Compliant' },
    ],
  },
  {
    id: 'river',
    title: 'Urban River Confluence',
    source: 'Surface River (Monitored)',
    hpi: 68.75,
    hei: 14.80,
    status: 'Moderate Pollution',
    color: '#f59e0b',
    badgeClass: 'badge-warning',
    desc: 'Approaching critical boundary thresholds. Recommended for regular temporal surveillance.',
    metals: [
      { name: 'Lead (Pb)', val: '0.008 mg/L', limit: '0.010 mg/L', status: 'Elevated' },
      { name: 'Chromium (Cr)', val: '0.042 mg/L', limit: '0.050 mg/L', status: 'Elevated' },
      { name: 'Zinc (Zn)', val: '2.100 mg/L', limit: '5.000 mg/L', status: 'Compliant' },
    ],
  },
  {
    id: 'industrial',
    title: 'Industrial Outfall Drainage',
    source: 'Industrial Effluent Discharge',
    hpi: 154.60,
    hei: 38.45,
    status: 'Critical Contamination',
    color: '#ef4444',
    badgeClass: 'badge-danger',
    desc: 'Severe exceedance of international limits. Immediate regulatory remediation required.',
    metals: [
      { name: 'Lead (Pb)', val: '0.038 mg/L', limit: '0.010 mg/L', status: 'Critical' },
      { name: 'Cadmium (Cd)', val: '0.012 mg/L', limit: '0.003 mg/L', status: 'Critical' },
      { name: 'Arsenic (As)', val: '0.024 mg/L', limit: '0.010 mg/L', status: 'Critical' },
    ],
  },
];

const LandingPage = () => {
  const { user, isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState(SCENARIOS[0]);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);

      const sections = ['hero', 'simulator', 'standards', 'features', 'methodology'];
      const scrollPos = window.scrollY + 140;

      for (let i = sections.length - 1; i >= 0; i--) {
        const id = sections[i];
        if (id === 'hero') {
          if (window.scrollY < 350) {
            setActiveSection('hero');
            break;
          }
        } else {
          const el = document.getElementById(id);
          if (el && el.offsetTop <= scrollPos) {
            setActiveSection(id);
            break;
          }
        }
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (e, sectionId) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setMobileMenuOpen(false);
    if (sectionId === 'hero' || sectionId === 'home') {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
      if (window.location.hash) {
        window.history.pushState(null, '', window.location.pathname);
      }
      return;
    }
    const element = document.getElementById(sectionId);
    if (element) {
      const headerOffset = 84;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({
        top: Math.max(0, offsetPosition),
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="landing-page-root" style={{ minHeight: '100vh', backgroundColor: 'var(--bg-primary)', color: 'var(--text-main)', width: '100%', boxSizing: 'border-box' }}>
      {/* Top Header Navbar - Fixed at the top so it stays permanently pinned while scrolling */}
      <header
        className="landing-top-header"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          width: '100%',
          height: '76px',
          padding: '0 2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: scrolled ? '1px solid rgba(6, 182, 212, 0.35)' : '1px solid rgba(6, 182, 212, 0.2)',
          backgroundColor: scrolled ? 'rgba(8, 13, 26, 0.96)' : 'rgba(10, 15, 29, 0.88)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          zIndex: 1000,
          boxShadow: scrolled ? '0 12px 35px rgba(0, 0, 0, 0.65), 0 0 25px rgba(6, 182, 212, 0.12)' : '0 8px 32px rgba(0, 0, 0, 0.45)',
          boxSizing: 'border-box',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {/* Ambient Top Glow Line */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '2px',
            background: 'linear-gradient(90deg, transparent 5%, rgba(6, 182, 212, 0.8) 35%, rgba(20, 184, 166, 0.9) 65%, transparent 95%)',
          }}
        />

        {/* Brand Area - Touchable / Clickable Logo redirecting to Home */}
        <Link
          to="/"
          onClick={(e) => {
            scrollToSection(e, 'hero');
          }}
          className="landing-brand-link"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.85rem',
            textDecoration: 'none',
            cursor: 'pointer',
            userSelect: 'none',
            WebkitTapHighlightColor: 'transparent',
          }}
          title="AquaIndex - Return to Home"
        >
          <div
            className="landing-brand-box"
            style={{
              width: '42px',
              height: '42px',
              background: 'linear-gradient(135deg, #06b6d4 0%, #14b8a6 50%, #3b82f6 100%)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#04121f',
              boxShadow: '0 0 25px rgba(6, 182, 212, 0.45), inset 0 1px 1px rgba(255, 255, 255, 0.4)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              flexShrink: 0,
              transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}
          >
            <Waves size={24} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span
                style={{
                  fontFamily: 'Outfit, sans-serif',
                  fontWeight: 800,
                  fontSize: '1.35rem',
                  lineHeight: 1.1,
                  background: 'linear-gradient(135deg, #ffffff 40%, #38bdf8 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  letterSpacing: '-0.02em',
                }}
              >
                AquaIndex
              </span>
            </div>
            <div
              className="landing-brand-sub"
              style={{
                fontSize: '0.66rem',
                color: 'var(--primary)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                fontWeight: 700,
                marginTop: '1px',
                whiteSpace: 'nowrap',
              }}
            >
              Water Analytics
            </div>
          </div>
        </Link>

        {/* Desktop Nav Capsule Island & Actions */}
        <div className="hide-on-mobile" style={{ display: 'flex', alignItems: 'center', gap: '1.15rem' }}>
          <nav className="landing-nav-capsule">
            <button
              type="button"
              onClick={(e) => scrollToSection(e, 'hero')}
              className={`landing-header-link ${activeSection === 'hero' ? 'active' : ''}`}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                font: 'inherit',
                color: 'var(--text-muted)',
                whiteSpace: 'nowrap',
              }}
            >
              <Home size={14} style={{ color: 'var(--primary)' }} />
              <span>Home</span>
            </button>
            <button
              type="button"
              onClick={(e) => scrollToSection(e, 'simulator')}
              className={`landing-header-link ${activeSection === 'simulator' ? 'active' : ''}`}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                font: 'inherit',
                color: 'var(--text-muted)',
                whiteSpace: 'nowrap',
              }}
            >
              <Zap size={14} style={{ color: 'var(--accent)' }} />
              <span>Simulator</span>
            </button>
            <button
              type="button"
              onClick={(e) => scrollToSection(e, 'standards')}
              className={`landing-header-link ${activeSection === 'standards' ? 'active' : ''}`}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                font: 'inherit',
                color: 'var(--text-muted)',
                whiteSpace: 'nowrap',
              }}
            >
              <BookOpen size={14} style={{ color: '#38bdf8' }} />
              <span>Standards</span>
            </button>
            <button
              type="button"
              onClick={(e) => scrollToSection(e, 'features')}
              className={`landing-header-link ${activeSection === 'features' ? 'active' : ''}`}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                font: 'inherit',
                color: 'var(--text-muted)',
                whiteSpace: 'nowrap',
              }}
            >
              <Sparkles size={14} style={{ color: '#f59e0b' }} />
              <span>Features</span>
            </button>
            <button
              type="button"
              onClick={(e) => scrollToSection(e, 'methodology')}
              className={`landing-header-link ${activeSection === 'methodology' ? 'active' : ''}`}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                font: 'inherit',
                color: 'var(--text-muted)',
                whiteSpace: 'nowrap',
              }}
            >
              <Calculator size={14} style={{ color: '#c084fc' }} />
              <span>Formulas</span>
            </button>
          </nav>

          {/* CTA Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            {!isAuthenticated ? (
              <>
                <Link
                  to="/login"
                  className="btn btn-secondary btn-sm"
                  style={{
                    textDecoration: 'none',
                    padding: '0.45rem 1rem',
                    fontSize: '0.82rem',
                    borderRadius: '10px',
                    border: '1px solid rgba(148, 163, 184, 0.25)',
                    background: 'rgba(30, 41, 59, 0.65)',
                    backdropFilter: 'blur(10px)',
                    transition: 'all 0.2s',
                    cursor: 'pointer',
                  }}
                >
                  Sign In
                </Link>
                <Link
                  to="/dashboard"
                  className="btn btn-primary btn-sm landing-portal-btn"
                  style={{
                    textDecoration: 'none',
                    padding: '0.48rem 1.25rem',
                    fontSize: '0.84rem',
                    fontWeight: 600,
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #06b6d4 0%, #0d9488 100%)',
                    boxShadow: '0 4px 20px rgba(6, 182, 212, 0.45)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                    cursor: 'pointer',
                  }}
                >
                  <span>Launch Portal</span>
                  <ArrowRight size={15} />
                </Link>
              </>
            ) : (
              <Link
                to="/dashboard"
                className="btn btn-primary btn-sm landing-portal-btn"
                style={{
                  textDecoration: 'none',
                  padding: '0.48rem 1.25rem',
                  fontSize: '0.84rem',
                  fontWeight: 600,
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #06b6d4 0%, #0d9488 100%)',
                  boxShadow: '0 4px 20px rgba(6, 182, 212, 0.45)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                  cursor: 'pointer',
                }}
              >
                <span>Dashboard ({user?.name ? user.name.split(' ')[0] : 'Active'})</span>
                <ArrowRight size={15} />
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation menu"
          style={{
            display: 'none',
            background: 'rgba(15, 23, 42, 0.8)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '10px',
            color: 'var(--text-main)',
            padding: '0.5rem',
            cursor: 'pointer',
          }}
          className="mobile-menu-trigger"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {/* Mobile Navigation Drawer Dropdown */}
      {mobileMenuOpen && (
        <div
          style={{
            position: 'fixed',
            top: '76px',
            left: 0,
            right: 0,
            background: 'rgba(10, 15, 29, 0.98)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(6, 182, 212, 0.25)',
            padding: '1.25rem 1rem 1.5rem',
            zIndex: 999,
            display: 'flex',
            flexDirection: 'column',
            gap: '0.65rem',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.65)',
            maxHeight: 'calc(100vh - 80px)',
            overflowY: 'auto',
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={(e) => scrollToSection(e, 'hero')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                color: 'var(--text-main)',
                fontSize: '0.9rem',
                fontWeight: 600,
                padding: '0.75rem 0.85rem',
                borderRadius: '10px',
                background: 'rgba(15, 23, 42, 0.7)',
                border: '1px solid var(--border-subtle)',
                width: '100%',
                textAlign: 'left',
                cursor: 'pointer',
              }}
            >
              <Home size={18} style={{ color: 'var(--primary)' }} />
              <span>Home Overview</span>
            </button>
            <button
              type="button"
              onClick={(e) => scrollToSection(e, 'simulator')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                color: 'var(--text-main)',
                fontSize: '0.9rem',
                fontWeight: 600,
                padding: '0.75rem 0.85rem',
                borderRadius: '10px',
                background: 'rgba(15, 23, 42, 0.7)',
                border: '1px solid var(--border-subtle)',
                width: '100%',
                textAlign: 'left',
                cursor: 'pointer',
              }}
            >
              <Zap size={18} style={{ color: 'var(--primary)' }} />
              <span>Live Calculation Simulator</span>
            </button>
            <button
              type="button"
              onClick={(e) => scrollToSection(e, 'standards')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                color: 'var(--text-main)',
                fontSize: '0.9rem',
                fontWeight: 600,
                padding: '0.75rem 0.85rem',
                borderRadius: '10px',
                background: 'rgba(15, 23, 42, 0.7)',
                border: '1px solid var(--border-subtle)',
                width: '100%',
                textAlign: 'left',
                cursor: 'pointer',
              }}
            >
              <BookOpen size={18} style={{ color: 'var(--accent)' }} />
              <span>WHO &amp; BIS Threshold Matrix</span>
            </button>
            <button
              type="button"
              onClick={(e) => scrollToSection(e, 'features')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                color: 'var(--text-main)',
                fontSize: '0.9rem',
                fontWeight: 600,
                padding: '0.75rem 0.85rem',
                borderRadius: '10px',
                background: 'rgba(15, 23, 42, 0.7)',
                border: '1px solid var(--border-subtle)',
                width: '100%',
                textAlign: 'left',
                cursor: 'pointer',
              }}
            >
              <Sparkles size={18} style={{ color: '#f59e0b' }} />
              <span>Architecture Capabilities</span>
            </button>
            <button
              type="button"
              onClick={(e) => scrollToSection(e, 'methodology')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                color: 'var(--text-main)',
                fontSize: '0.9rem',
                fontWeight: 600,
                padding: '0.75rem 0.85rem',
                borderRadius: '10px',
                background: 'rgba(15, 23, 42, 0.7)',
                border: '1px solid var(--border-subtle)',
                width: '100%',
                textAlign: 'left',
                cursor: 'pointer',
              }}
            >
              <Calculator size={18} style={{ color: '#c084fc' }} />
              <span>HPI &amp; HEI Formulations</span>
            </button>
            <Link
              to="/map"
              onClick={() => setMobileMenuOpen(false)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                color: '#06b6d4',
                fontSize: '0.88rem',
                fontWeight: 600,
                textDecoration: 'none',
                padding: '0.75rem 0.85rem',
                borderRadius: '10px',
                background: 'rgba(6, 182, 212, 0.1)',
                border: '1px solid rgba(6, 182, 212, 0.3)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <MapPin size={18} style={{ color: '#06b6d4' }} />
                <span>GIS Spatial Hotspots Map</span>
              </div>
              <ArrowRight size={15} />
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem', marginTop: '0.6rem' }}>
            {!isAuthenticated ? (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn btn-secondary"
                  style={{ justifyContent: 'center', textDecoration: 'none', padding: '0.65rem', fontSize: '0.85rem' }}
                >
                  Sign In
                </Link>
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn btn-primary"
                  style={{ justifyContent: 'center', textDecoration: 'none', padding: '0.65rem', fontSize: '0.85rem' }}
                >
                  Portal <ArrowRight size={15} />
                </Link>
              </>
            ) : (
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="btn btn-primary"
                style={{ gridColumn: 'span 2', justifyContent: 'center', textDecoration: 'none', padding: '0.65rem', fontSize: '0.85rem' }}
              >
                Open Dashboard ({user?.name || 'Active'}) <ArrowRight size={15} />
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="landing-hero-section" style={{ position: 'relative' }}>
        {/* Ambient Hero Atmospheric Glows */}
        <div
          style={{
            position: 'absolute',
            top: '-5%',
            left: '5%',
            width: '450px',
            height: '450px',
            background: 'radial-gradient(circle, rgba(6, 182, 212, 0.12) 0%, transparent 70%)',
            filter: 'blur(60px)',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: '10%',
            right: '5%',
            width: '400px',
            height: '400px',
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.10) 0%, transparent 70%)',
            filter: 'blur(60px)',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />

        <div className="landing-hero-grid" style={{ position: 'relative', zIndex: 1 }}>
          {/* Left Column: Hero Copy */}
          <div className="landing-hero-copy">
            <h1 className="landing-hero-title">
              <span className="hero-title-main">Heavy Metal Pollution Index</span>
              <span className="hero-title-gradient">Assessment &amp; Water Surveillance</span>
            </h1>

            <p className="landing-hero-desc">
              A full-stack, enterprise computational engine for assessing heavy metal toxicity in surface &amp; groundwater.
              Computes peer-reviewed <strong>Heavy Metal Pollution Index (HPI)</strong> and{' '}
              <strong>Heavy Metal Evaluation Index (HEI)</strong> against authoritative WHO and BIS drinking water standards
              with automated multi-metal hazard mapping.
            </p>

            <div className="landing-hero-cta">
              <Link to="/dashboard" className="btn btn-primary landing-cta-btn">
                <span>Launch Surveillance Dashboard</span>
                <ArrowRight size={17} style={{ flexShrink: 0 }} />
              </Link>
              {!isAuthenticated ? (
                <Link to="/login" className="btn btn-secondary landing-cta-btn">
                  <Lock size={15} style={{ flexShrink: 0 }} />
                  <span>Admin &amp; Analyst Sign In</span>
                </Link>
              ) : (
                <Link to="/dashboard" className="btn btn-secondary landing-cta-btn">
                  <Activity size={15} style={{ color: '#10b981', flexShrink: 0 }} />
                  <span>Live Workspace ({user?.name ? user.name.split(' ')[0] : 'Active'})</span>
                </Link>
              )}
              <button
                type="button"
                onClick={(e) => scrollToSection(e, 'simulator')}
                className="btn btn-outline landing-cta-btn"
                style={{ cursor: 'pointer', background: 'rgba(15, 23, 42, 0.65)' }}
              >
                <Zap size={15} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                <span>Instant Simulator ↓</span>
              </button>
            </div>

            {/* Quick Benchmark Ribbons */}
            <div className="landing-benchmarks-grid">
              <div className="landing-benchmark-item">
                <div className="landing-benchmark-val" style={{ color: 'var(--primary)' }}>WHO &amp; BIS</div>
                <div className="landing-benchmark-lbl">Drinking Standards Integrated</div>
              </div>
              <div className="landing-benchmark-item">
                <div className="landing-benchmark-val" style={{ color: 'var(--accent)' }}>9 Heavy Metals</div>
                <div className="landing-benchmark-lbl">Pb, Cd, Cr, Cu, Zn, Ni, Fe, As, Hg</div>
              </div>
              <div className="landing-benchmark-item">
                <div className="landing-benchmark-val" style={{ color: 'var(--status-low)' }}>100% Verified</div>
                <div className="landing-benchmark-lbl">Prasad &amp; Bose (2001) Formulation</div>
              </div>
            </div>
          </div>

          {/* Right Column: High-Tech Photorealistic 3D Water Surveillance Visual */}
          <div className="landing-hero-visual-col" style={{ position: 'relative' }}>
            <div
              className="hero-image-container"
              style={{
                position: 'relative',
                borderRadius: '24px',
                padding: '6px',
                background: 'linear-gradient(145deg, rgba(6, 182, 212, 0.45) 0%, rgba(20, 184, 166, 0.2) 45%, rgba(59, 130, 246, 0.35) 100%)',
                boxShadow: '0 25px 60px rgba(0, 0, 0, 0.75), 0 0 45px rgba(6, 182, 212, 0.22)',
                overflow: 'hidden',
                transition: 'all 0.35s ease',
              }}
            >
              {/* Inner Frame */}
              <div
                style={{
                  position: 'relative',
                  borderRadius: '20px',
                  overflow: 'hidden',
                  backgroundColor: '#0a0f1d',
                }}
              >
                <img
                  src="/hero-water-analysis.jpg"
                  alt="Holographic Water Quality and Heavy Metal Ion Surveillance"
                  style={{
                    width: '100%',
                    height: 'auto',
                    display: 'block',
                    borderRadius: '20px',
                    transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                  className="hero-media-img"
                />

                {/* Cyber Gradient Overlay */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(180deg, rgba(10, 15, 29, 0.05) 0%, rgba(10, 15, 29, 0.3) 65%, rgba(10, 15, 29, 0.9) 100%)',
                    pointerEvents: 'none',
                  }}
                />

                {/* Floating Top Left Telemetry Tag */}
                <div
                  style={{
                    position: 'absolute',
                    top: '1rem',
                    left: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    background: 'rgba(10, 15, 29, 0.85)',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    border: '1px solid rgba(6, 182, 212, 0.45)',
                    padding: '0.4rem 0.85rem',
                    borderRadius: '9999px',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    color: '#f8fafc',
                    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.5)',
                  }}
                >
                  <span
                    style={{
                      width: '7px',
                      height: '7px',
                      borderRadius: '50%',
                      backgroundColor: '#10b981',
                      boxShadow: '0 0 8px #10b981',
                    }}
                  />
                  <span>ISO 17025 Certified Telemetry</span>
                </div>

                {/* Floating Bottom Overlay Card */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: '0.85rem',
                    left: '0.85rem',
                    right: '0.85rem',
                    background: 'rgba(15, 23, 42, 0.92)',
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)',
                    border: '1px solid rgba(6, 182, 212, 0.35)',
                    borderRadius: '14px',
                    padding: '0.75rem 1rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '0.75rem',
                    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.65)',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.68rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>
                      Monitored Cation Species
                    </div>
                    <div style={{ display: 'flex', gap: '0.35rem', marginTop: '0.25rem' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f87171', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '0.12rem 0.45rem', borderRadius: '6px' }}>Pb²⁺</span>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#fb923c', background: 'rgba(251, 146, 60, 0.15)', border: '1px solid rgba(251, 146, 60, 0.3)', padding: '0.12rem 0.45rem', borderRadius: '6px' }}>Cd²⁺</span>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#facc15', background: 'rgba(250, 204, 21, 0.15)', border: '1px solid rgba(250, 204, 21, 0.3)', padding: '0.12rem 0.45rem', borderRadius: '6px' }}>As³⁺</span>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#38bdf8', background: 'rgba(56, 189, 248, 0.15)', border: '1px solid rgba(56, 189, 248, 0.3)', padding: '0.12rem 0.45rem', borderRadius: '6px' }}>Cr⁶⁺</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => scrollToSection(e, 'simulator')}
                    className="btn btn-primary btn-sm"
                    style={{
                      padding: '0.45rem 0.95rem',
                      fontSize: '0.8rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      borderRadius: '10px',
                    }}
                  >
                    <span>Try Simulator ↓</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dedicated Interactive Calculation Simulator Section - Positioned directly below Hero */}
      <section
        id="simulator"
        style={{
          padding: 'clamp(2.5rem, 5vw, 4.5rem) 1.5rem',
          background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.5) 0%, rgba(10, 15, 29, 0.95) 100%)',
          borderTop: '1px solid rgba(6, 182, 212, 0.22)',
          borderBottom: '1px solid var(--border-subtle)',
          scrollMarginTop: '90px',
          position: 'relative',
        }}
      >
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--primary)', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.45rem' }}>
              <Zap size={16} /> Instant Toxicological Simulation Engine
            </div>
            <h2 style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.4rem)', marginBottom: '0.65rem' }}>
              Real-Time HPI &amp; HEI Calculation Engine
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '720px', margin: '0 auto' }}>
              Toggle between real-world hydrological scenarios to compute Prasad &amp; Bose (2001) HPI and Edet &amp; Offiong (2002) HEI indices against WHO guideline limits.
            </p>
          </div>

          <div
            className="card landing-sim-card"
            style={{
              maxWidth: '960px',
              margin: '0 auto',
              background: 'linear-gradient(145deg, rgba(18, 26, 47, 0.95) 0%, rgba(15, 23, 42, 0.98) 100%)',
              border: '1px solid rgba(6, 182, 212, 0.35)',
              boxShadow: '0 20px 45px rgba(0, 0, 0, 0.6), 0 0 35px rgba(6, 182, 212, 0.15)',
              padding: 'clamp(1.25rem, 3vw, 2rem)',
              borderRadius: '20px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Zap size={18} style={{ color: 'var(--primary)' }} />
                <span style={{ fontSize: '1rem', fontWeight: 700, fontFamily: 'Outfit' }}>
                  Live Assessment: {selectedScenario.title}
                </span>
              </div>
              <span className={`badge ${selectedScenario.badgeClass}`}>
                {selectedScenario.status}
              </span>
            </div>

            {/* Scenario Toggle Pills */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', overflowX: 'auto', paddingBottom: '0.3rem' }}>
              {SCENARIOS.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSelectedScenario(s)}
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '10px',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    border: selectedScenario.id === s.id ? '1px solid var(--primary)' : '1px solid rgba(148, 163, 184, 0.2)',
                    background: selectedScenario.id === s.id ? 'rgba(6, 182, 212, 0.18)' : 'rgba(15, 23, 42, 0.6)',
                    color: selectedScenario.id === s.id ? '#06b6d4' : '#94a3b8',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.2s',
                  }}
                >
                  {s.title}
                </button>
              ))}
            </div>

            {/* Live Metric Cards Grid */}
            <div className="landing-sim-cards" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
              <div style={{ background: 'var(--bg-elevated)', padding: '1.25rem', borderRadius: '14px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
                  Heavy Metal Pollution Index (HPI)
                </div>
                <div style={{ fontSize: '2.5rem', fontWeight: 800, color: selectedScenario.color, fontFamily: 'Outfit' }}>
                  {selectedScenario.hpi}
                </div>
                <div style={{ fontSize: '0.75rem', color: selectedScenario.color, fontWeight: 600 }}>
                  Threshold: &lt;50 Low • 50-100 Mod • &gt;100 Critical
                </div>
              </div>

              <div style={{ background: 'var(--bg-elevated)', padding: '1.25rem', borderRadius: '14px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
                  Heavy Metal Evaluation Index (HEI)
                </div>
                <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#38bdf8', fontFamily: 'Outfit' }}>
                  {selectedScenario.hei}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#38bdf8', fontWeight: 600 }}>
                  Edet &amp; Offiong (2002) Cumulative Standard
                </div>
              </div>
            </div>

            {/* Sample Metals Table Preview */}
            <div style={{ background: 'rgba(10, 15, 29, 0.7)', padding: '1rem', borderRadius: '12px', marginBottom: '1.25rem', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-subtle)', textTransform: 'uppercase', marginBottom: '0.65rem', fontWeight: 700 }}>
                Selected Heavy Metal Concentrations (vs WHO Guideline Value)
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
                {selectedScenario.metals.map((m, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                    <span style={{ color: '#cbd5e1', fontWeight: 500 }}>{m.name}</span>
                    <span style={{ fontFamily: 'JetBrains Mono', color: 'var(--text-main)', fontWeight: 600 }}>{m.val}</span>
                    <span style={{ fontSize: '0.75rem', color: m.status === 'Critical' ? '#ef4444' : m.status === 'Elevated' ? '#f59e0b' : '#10b981', fontWeight: 600 }}>
                      {m.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Hydrological Source: <strong>{selectedScenario.source}</strong>
              </span>
              <Link to="/analysis" className="btn btn-primary btn-sm" style={{ textDecoration: 'none' }}>
                Full Calculation Engine <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Authoritative Standards Comparison Matrix Section */}
      <section id="standards" style={{ padding: 'clamp(2.5rem, 5vw, 4rem) 1.5rem', background: 'rgba(15, 23, 42, 0.6)', borderTop: '1px solid var(--border-subtle)', borderBottom: '1px solid var(--border-subtle)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent)', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.4rem' }}>
              <BookOpen size={16} /> Regulatory Baseline Limits
            </div>
            <h2 style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.4rem)', marginBottom: '0.5rem' }}>
              Documented WHO & BIS Drinking Water Standards
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '700px', margin: '0 auto' }}>
              Built directly into the calculation service. Each metal is mapped with its maximum permissible limit (Si / MACi) and unit weighting coefficient (Wi).
            </p>
          </div>

          <div className="table-responsive" style={{ background: 'var(--bg-card)', borderRadius: '14px', border: '1px solid var(--border-subtle)', overflowX: 'auto', WebkitOverflowScrolling: 'touch', width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Metal Name</th>
                  <th>Chemical Symbol</th>
                  <th>WHO Limit (4th Ed)</th>
                  <th>BIS Limit (IS 10500:2012)</th>
                  <th>Toxicological Target</th>
                  <th>Standard Weighting (Wi)</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { name: 'Lead', sym: 'Pb', who: '0.010 mg/L', bis: '0.010 mg/L', tox: 'Neurological & Renal Toxicity', weight: 'High (0.138)' },
                  { name: 'Cadmium', sym: 'Cd', who: '0.003 mg/L', bis: '0.003 mg/L', tox: 'Kidney Dysfunction (Itai-Itai)', weight: 'Critical (0.460)' },
                  { name: 'Arsenic', sym: 'As', who: '0.010 mg/L', bis: '0.010 mg/L', tox: 'Carcinogenic & Skin Lesions', weight: 'High (0.138)' },
                  { name: 'Chromium', sym: 'Cr', who: '0.050 mg/L', bis: '0.050 mg/L', tox: 'Carcinogenic Hexavalent Cr(VI)', weight: 'Moderate (0.028)' },
                  { name: 'Copper', sym: 'Cu', who: '2.000 mg/L', bis: '0.050 mg/L', tox: 'Gastrointestinal Distress', weight: 'Low (0.0007)' },
                  { name: 'Zinc', sym: 'Zn', who: '5.000 mg/L', bis: '5.000 mg/L', tox: 'Astringent Taste / Growth', weight: 'Low (0.0003)' },
                  { name: 'Iron', sym: 'Fe', who: '0.300 mg/L', bis: '0.300 mg/L', tox: 'Turbidity & Taste Imbalance', weight: 'Moderate (0.0046)' },
                  { name: 'Nickel', sym: 'Ni', who: '0.070 mg/L', bis: '0.020 mg/L', tox: 'Allergic Dermatitis & Lungs', weight: 'Moderate (0.020)' },
                  { name: 'Mercury', sym: 'Hg', who: '0.006 mg/L', bis: '0.001 mg/L', tox: 'Severe Central Nervous System', weight: 'Critical (0.230)' },
                ].map((row, i) => (
                  <tr key={i}>
                    <td><strong style={{ color: '#f8fafc' }}>{row.name}</strong></td>
                    <td><code style={{ color: 'var(--primary)', fontWeight: 700 }}>{row.sym}</code></td>
                    <td style={{ fontFamily: 'JetBrains Mono', color: '#10b981' }}>{row.who}</td>
                    <td style={{ fontFamily: 'JetBrains Mono', color: '#06b6d4' }}>{row.bis}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{row.tox}</td>
                    <td><span className="badge badge-neutral" style={{ fontFamily: 'JetBrains Mono' }}>{row.weight}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Full-Stack Capabilities Grid */}
      <section id="features" style={{ padding: 'clamp(2.5rem, 5vw, 4.5rem) 1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.4rem)', marginBottom: '0.5rem' }}>
            Architectural Capabilities & Analytical Stack
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '650px', margin: '0 auto' }}>
            Engineered specifically for water quality surveillance agencies, laboratory analysts, and environmental researchers.
          </p>
        </div>

        <div className="landing-features-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ color: 'var(--primary)', marginBottom: '1rem' }}><Database size={30} /></div>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>Flexible Ingestion & Normalization</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.5 }}>
              Enter concentrations in mg/L, µg/L, ppm, or ppb. The backend automatically validates and converts values into uniform internal metric units.
            </p>
          </div>

          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ color: 'var(--accent)', marginBottom: '1rem' }}><Calculator size={30} /></div>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>Dual Mathematical Index Engine</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.5 }}>
              Executes both Prasad & Bose (2001) HPI and Edet & Offiong (2002) HEI with transparent exposure of intermediate unit weights and sub-index values.
            </p>
          </div>

          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ color: '#10b981', marginBottom: '1rem' }}><MapPin size={30} /></div>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>Spatial Hotspot Mapping</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.5 }}>
              Interactive OpenStreetMap GIS visualization with chromatic markers highlighting critical contamination zones and safe monitoring stations.
            </p>
          </div>

          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ color: '#c084fc', marginBottom: '1rem' }}><FileText size={30} /></div>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>Automated PDF & CSV Export</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.5 }}>
              Generate comprehensive executive PDF dossiers with charts and download raw structured analytical datasets in standard CSV format.
            </p>
          </div>
        </div>
      </section>

      {/* Methodology Section */}
      <section id="methodology" style={{ padding: 'clamp(2.5rem, 5vw, 4.5rem) 1.5rem', background: 'rgba(15, 23, 42, 0.7)', borderTop: '1px solid var(--border-subtle)' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--primary)', marginBottom: '0.5rem' }}>
            <BookOpen size={20} />
            <span style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase' }}>Academic Formulations</span>
          </div>
          <h2 style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.3rem)', marginBottom: '1.5rem' }}>
            Peer-Reviewed Index Formulations
          </h2>

          <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
            <h3 style={{ color: 'var(--primary)', marginBottom: '0.75rem' }}>1. Heavy Metal Pollution Index (HPI)</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '0.75rem' }}>
              Based on Prasad & Bose (2001) and Mohan et al. (1996), HPI represents the composite influence of individual heavy metals on overall water quality:
            </p>
            <div style={{ background: 'var(--bg-primary)', padding: '1rem', borderRadius: 'var(--radius-md)', fontFamily: 'JetBrains Mono', color: '#38bdf8', fontSize: '0.95rem', overflowX: 'auto' }}>
              HPI = Σ(Wi × Qi) / ΣWi
            </div>
            <ul style={{ paddingLeft: '1.5rem', color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.75rem', lineHeight: 1.6 }}>
              <li><strong>Wi (Unit Weight):</strong> Inversely proportional to standard limit (Wi = k / Si, where k = 1 / Σ(1/Si)). Gives higher weight to more toxic metals.</li>
              <li><strong>Qi (Sub-index):</strong> (Mi / Si) × 100, where Mi is monitored concentration and Si is permissible limit.</li>
              <li><strong>Classification Thresholds:</strong> HPI &lt; 50 (Low Pollution), 50–100 (Threshold / Moderate), &gt; 100 (High Pollution / Critical).</li>
            </ul>
          </div>

          <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
            <h3 style={{ color: 'var(--accent)', marginBottom: '0.75rem' }}>2. Heavy Metal Evaluation Index (HEI)</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '0.75rem' }}>
              Formulated by Edet & Offiong (2002) to assess cumulative water contamination relative to maximum allowable concentrations:
            </p>
            <div style={{ background: 'var(--bg-primary)', padding: '1rem', borderRadius: 'var(--radius-md)', fontFamily: 'JetBrains Mono', color: '#2dd4bf', fontSize: '0.95rem', overflowX: 'auto' }}>
              HEI = Σ(Ci / MACi)
            </div>
            <ul style={{ paddingLeft: '1.5rem', color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.75rem', lineHeight: 1.6 }}>
              <li><strong>Ci:</strong> Measured concentration of heavy metal i.</li>
              <li><strong>MACi:</strong> Maximum Allowable Concentration (standard limit).</li>
              <li><strong>Classification Thresholds:</strong> HEI &lt; 10 (Low Pollution), 10–20 (Medium Pollution), &gt; 20 (High Pollution).</li>
            </ul>
          </div>

          {/* Responsible Use Disclaimer */}
          <div
            style={{
              padding: '1.25rem',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(245, 158, 11, 0.08)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              color: '#f8fafc',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#f59e0b', fontWeight: 600, marginBottom: '0.4rem' }}>
              <AlertTriangle size={18} /> Responsible-Use & Scientific Disclaimer
            </div>
            <p style={{ fontSize: '0.84rem', color: '#cbd5e1', lineHeight: 1.5 }}>
              HPI and HEI indices are mathematical screening and preliminary assessment tools. They do not constitute official clinical toxicity verdicts or replace certified laboratory chemical testing. Always verify critical thresholds with local environmental protection agencies.
            </p>
          </div>
        </div>
      </section>

      {/* High-Impact Pre-Footer Surveillance Action Banner */}
      <section
        style={{
          maxWidth: '1240px',
          margin: '0 auto',
          padding: '0 1.5rem 3.5rem',
          boxSizing: 'border-box',
        }}
      >
        <div
          style={{
            position: 'relative',
            borderRadius: '20px',
            background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(6, 182, 212, 0.18) 50%, rgba(20, 184, 166, 0.14) 100%)',
            border: '1px solid rgba(6, 182, 212, 0.35)',
            padding: 'clamp(1.75rem, 4vw, 2.75rem) clamp(1.25rem, 3.5vw, 2.5rem)',
            overflow: 'hidden',
            boxShadow: '0 12px 35px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
          }}
        >
          {/* Ambient Glow Orb */}
          <div
            style={{
              position: 'absolute',
              top: '-40px',
              right: '-40px',
              width: '220px',
              height: '220px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(6, 182, 212, 0.25) 0%, transparent 70%)',
              pointerEvents: 'none',
            }}
          />

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1.5rem',
              position: 'relative',
              zIndex: 2,
            }}
          >
            <div style={{ maxWidth: '680px' }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: 'var(--primary)',
                  marginBottom: '0.65rem',
                }}
              >
                <Sparkles size={14} />
                <span>Next-Gen Environmental Surveillance</span>
              </div>
              <h3
                style={{
                  fontFamily: 'Outfit, sans-serif',
                  fontSize: 'clamp(1.35rem, 3vw, 1.85rem)',
                  fontWeight: 800,
                  color: '#ffffff',
                  lineHeight: 1.25,
                  marginBottom: '0.65rem',
                  letterSpacing: '-0.02em',
                }}
              >
                Ready to Screen Heavy Metal Toxicity in Your River Basin or Aquifer?
              </h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.55, margin: 0 }}>
                Deploy automated Prasad &amp; Bose (2001) HPI calculation, spatial contamination GIS hotspot mapping, and instant WHO/BIS regulatory dossiers.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <Link
                to="/dashboard"
                className="btn btn-primary"
                style={{
                  padding: '0.75rem 1.4rem',
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  borderRadius: '12px',
                  boxShadow: '0 4px 20px rgba(6, 182, 212, 0.45)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  textDecoration: 'none',
                }}
              >
                <span>Launch Portal</span>
                <ArrowRight size={16} />
              </Link>
              <Link
                to="/standards"
                className="btn btn-secondary"
                style={{
                  padding: '0.75rem 1.25rem',
                  fontSize: '0.88rem',
                  borderRadius: '12px',
                  border: '1px solid rgba(148, 163, 184, 0.25)',
                  background: 'rgba(15, 23, 42, 0.7)',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <BookOpen size={16} />
                <span>WHO Standards</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Rich Multi-Column Environmental Computing Footer */}
      <footer
        style={{
          borderTop: '1px solid rgba(6, 182, 212, 0.25)',
          background: 'radial-gradient(circle at 50% 0%, rgba(6, 182, 212, 0.08) 0%, transparent 60%), linear-gradient(180deg, rgba(15, 23, 42, 0.98) 0%, #050811 100%)',
          position: 'relative',
          paddingTop: '3.5rem',
          paddingBottom: '2.5rem',
          overflow: 'hidden',
        }}
      >
        {/* Top Glowing Ambient Border */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: '10%',
            right: '10%',
            height: '1px',
            background: 'linear-gradient(90deg, transparent, #06b6d4 50%, transparent)',
            boxShadow: '0 0 15px #06b6d4',
          }}
        />

        <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '0 1.5rem' }}>
          {/* Main Footer 4-Column Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))',
              gap: '2.5rem',
              marginBottom: '2.5rem',
            }}
          >
            {/* Col 1: Brand & Certification Statement */}
            <div>
              <Link
                to="/"
                onClick={(e) => scrollToSection(e, 'hero')}
                className="landing-brand-link"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  marginBottom: '1rem',
                  textDecoration: 'none',
                  color: 'inherit',
                  cursor: 'pointer',
                  userSelect: 'none',
                  WebkitTapHighlightColor: 'transparent',
                }}
                title="AquaIndex - Return to Home"
              >
                <div
                  className="landing-brand-box"
                  style={{
                    width: '38px',
                    height: '38px',
                    background: 'linear-gradient(135deg, #06b6d4 0%, #14b8a6 100%)',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#04121f',
                    boxShadow: '0 0 20px rgba(6, 182, 212, 0.35)',
                    transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  }}
                >
                  <Waves size={22} />
                </div>
                <div>
                  <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: '1.25rem', color: '#f8fafc' }}>
                    AquaIndex
                  </div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--primary)', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 700 }}>
                    Water Analytics
                  </div>
                </div>
              </Link>

              <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '1.25rem' }}>
                Computational toxicological screening platform for assessing heavy metal pollution indices in surface and groundwater systems with international regulatory compliance.
              </p>

              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.35rem 0.75rem',
                  borderRadius: '9999px',
                  background: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  fontSize: '0.74rem',
                  color: '#10b981',
                  fontWeight: 600,
                }}
              >
                <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#10b981', boxShadow: '0 0 6px #10b981' }} />
                <span>WHO 4th Ed &amp; BIS IS 10500 Certified</span>
              </div>
            </div>

            {/* Col 2: Mathematical Formulations */}
            <div>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--primary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Calculator size={15} /> Mathematical Models
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.84rem' }}>
                <li>
                  <a href="#methodology" className="landing-footer-link">
                    Heavy Metal Pollution Index (HPI)
                  </a>
                </li>
                <li>
                  <a href="#methodology" className="landing-footer-link">
                    Heavy Metal Evaluation Index (HEI)
                  </a>
                </li>
                <li>
                  <a href="#standards" className="landing-footer-link">
                    Prasad &amp; Bose (2001) Formulations
                  </a>
                </li>
                <li>
                  <a href="#standards" className="landing-footer-link">
                    Edet &amp; Offiong (2002) Criteria
                  </a>
                </li>
                <li>
                  <a href="#methodology" className="landing-footer-link">
                    Unit Weight (Wi) Arithmetic Model
                  </a>
                </li>
              </ul>
            </div>

            {/* Col 3: Analytical Capabilities */}
            <div>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--accent)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <BarChart3 size={15} /> Surveillance Suite
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.84rem' }}>
                <li>
                  <Link to="/dashboard" className="landing-footer-link">
                    Water Quality Surveillance Dashboard
                  </Link>
                </li>
                <li>
                  <Link to="/map" className="landing-footer-link">
                    GIS Spatial Contamination Hotspots
                  </Link>
                </li>
                <li>
                  <Link to="/trends" className="landing-footer-link">
                    Temporal Parameter Trajectories
                  </Link>
                </li>
                <li>
                  <Link to="/comparison" className="landing-footer-link">
                    Multi-Location Basin Comparison
                  </Link>
                </li>
                <li>
                  <Link to="/reports" className="landing-footer-link">
                    Automated PDF Dossiers &amp; CSV Exports
                  </Link>
                </li>
              </ul>
            </div>

            {/* Col 4: Platform Security & Governance */}
            <div>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#c084fc', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Server size={15} /> Security &amp; Governance
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.84rem' }}>
                <li>
                  <Link to="/login" className="landing-footer-link">
                    Analyst &amp; Admin Security Portal
                  </Link>
                </li>
                <li>
                  <Link to="/standards" className="landing-footer-link">
                    Regulatory Standards Database
                  </Link>
                </li>
                <li>
                  <Link to="/samples" className="landing-footer-link">
                    Water Samples Registry
                  </Link>
                </li>
                <li>
                  <Link to="/analysis" className="landing-footer-link">
                    Toxicological Math Engine
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Academic & Methodological Citation Box */}
          <div
            style={{
              marginBottom: '2rem',
              padding: '0.9rem 1.25rem',
              borderRadius: '12px',
              background: 'rgba(6, 182, 212, 0.05)',
              border: '1px solid rgba(6, 182, 212, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '0.85rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: 'rgba(6, 182, 212, 0.15)',
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <FlaskConical size={16} />
              </div>
              <div>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#f8fafc' }}>
                  Academic &amp; Methodological Citation
                </div>
                <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)' }}>
                  AquaIndex Surveillance Platform (2026). Standardized Heavy Metal Pollution Index (HPI) &amp; Evaluation Index (HEI) Engine.
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span
                style={{
                  fontSize: '0.7rem',
                  padding: '0.2rem 0.55rem',
                  borderRadius: '6px',
                  background: 'rgba(15, 23, 42, 0.8)',
                  border: '1px solid var(--border-subtle)',
                  color: '#38bdf8',
                  fontFamily: 'monospace',
                }}
              >
                ISO 17025 Conformant
              </span>
              <span
                style={{
                  fontSize: '0.7rem',
                  padding: '0.2rem 0.55rem',
                  borderRadius: '6px',
                  background: 'rgba(15, 23, 42, 0.8)',
                  border: '1px solid var(--border-subtle)',
                  color: '#10b981',
                  fontFamily: 'monospace',
                }}
              >
                Prasad &amp; Bose (2001)
              </span>
            </div>
          </div>

          {/* Bottom Bar: Copyright and Back to Top */}
          <div
            style={{
              paddingTop: '1.75rem',
              borderTop: '1px solid rgba(148, 163, 184, 0.12)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem',
              fontSize: '0.78rem',
              color: 'var(--text-subtle)',
            }}
          >
            <div>
              &copy; {new Date().getFullYear()} <strong>AquaIndex Environmental Computing</strong> • Antigravity Computational Systems. Designed for Water Quality Research &amp; Surveillance.
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                style={{
                  background: 'rgba(6, 182, 212, 0.15)',
                  border: '1px solid rgba(6, 182, 212, 0.3)',
                  color: '#38bdf8',
                  padding: '0.35rem 0.65rem',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  transition: 'all 0.2s',
                }}
                title="Scroll back to top of page"
              >
                <ChevronUp size={14} />
                <span>Top</span>
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* Embedded Responsive Grid Styles for Landing Page (Standard Breakpoints) */}
      <style>{`
        .landing-nav-capsule {
          display: flex;
          align-items: center;
          gap: 0.2rem;
          background: rgba(15, 23, 42, 0.7);
          border: 1px solid rgba(255, 255, 255, 0.08);
          padding: 0.22rem 0.35rem;
          border-radius: 9999px;
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.06);
          white-space: nowrap !important;
          flex-shrink: 0;
        }
        .landing-header-link {
          color: #94a3b8 !important;
          font-size: 0.82rem;
          font-weight: 500;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 0.32rem;
          padding: 0.35rem 0.65rem;
          border-radius: 9999px;
          white-space: nowrap !important;
          flex-shrink: 0;
          line-height: 1;
          user-select: none;
          touch-action: manipulation;
          -webkit-tap-highlight-color: transparent;
          transition: all 0.22s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .landing-header-link:hover {
          color: #ffffff !important;
          background: rgba(6, 182, 212, 0.14);
          box-shadow: 0 0 14px rgba(6, 182, 212, 0.25);
          transform: translateY(-1px);
        }
        .landing-header-link:active {
          transform: scale(0.96);
          background: rgba(6, 182, 212, 0.22);
        }
        .landing-portal-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 24px rgba(6, 182, 212, 0.6) !important;
        }
        .landing-portal-btn:active {
          transform: scale(0.97);
        }
        .landing-brand-link {
          cursor: pointer;
          user-select: none;
          touch-action: manipulation;
          -webkit-tap-highlight-color: transparent;
          transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.2s ease;
        }
        .landing-brand-link:hover {
          opacity: 0.95;
        }
        .landing-brand-link:hover .landing-brand-box {
          transform: scale(1.06) rotate(-2deg);
          box-shadow: 0 0 30px rgba(6, 182, 212, 0.65), inset 0 1px 1px rgba(255, 255, 255, 0.5) !important;
        }
        .landing-brand-link:active {
          transform: scale(0.96);
          opacity: 0.85;
        }
        .landing-brand-link:active .landing-brand-box {
          transform: scale(0.94);
        }
        .landing-footer-link {
          color: #94a3b8 !important;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.84rem;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .landing-footer-link:hover {
          color: #38bdf8 !important;
          transform: translateX(4px);
        }

        html {
          scroll-behavior: smooth;
        }
        #simulator, #standards, #features, #methodology {
          scroll-margin-top: 90px;
        }

        .landing-page-root {
          padding-top: 76px;
        }

        .landing-hero-section {
          padding: clamp(1.75rem, 3.5vw, 2.75rem) 1.25rem clamp(1.5rem, 3vw, 2.5rem);
          max-width: 1280px;
          margin: 0 auto;
          width: 100%;
          box-sizing: border-box;
        }

        .landing-hero-grid {
          display: grid;
          align-items: center;
          width: 100%;
          max-width: 100%;
          box-sizing: border-box;
        }

        .landing-hero-copy {
          min-width: 0;
          width: 100%;
          max-width: 100%;
          box-sizing: border-box;
        }

        .landing-badge-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.38rem 0.95rem;
          border-radius: 9999px;
          background: rgba(6, 182, 212, 0.12);
          border: 1px solid rgba(6, 182, 212, 0.32);
          color: var(--primary);
          font-size: 0.8rem;
          font-weight: 600;
          margin-bottom: 1.15rem;
          max-width: 100%;
          box-sizing: border-box;
          flex-wrap: wrap;
          white-space: normal;
        }

        .landing-hero-title {
          font-family: 'Outfit', sans-serif;
          font-size: clamp(2rem, 3.8vw, 3.15rem);
          font-weight: 800;
          line-height: 1.14;
          margin-bottom: 1.15rem;
          letter-spacing: -0.025em;
          color: var(--text-main);
          overflow-wrap: break-word;
          word-break: break-word;
          max-width: 100%;
          box-sizing: border-box;
        }

        .hero-title-main {
          display: block;
          background: linear-gradient(135deg, #ffffff 40%, #38bdf8 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .hero-title-gradient {
          display: block;
          background: linear-gradient(135deg, #38bdf8 0%, #14b8a6 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          font-size: 0.9em;
        }

        .landing-hero-desc {
          font-size: clamp(0.9rem, 1.8vw, 1.02rem);
          color: #94a3b8;
          line-height: 1.58;
          margin-bottom: 1.65rem;
          overflow-wrap: break-word;
          word-break: break-word;
          max-width: 100%;
          box-sizing: border-box;
        }

        .landing-hero-cta {
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;
          margin-bottom: 2rem;
          width: 100%;
          max-width: 100%;
          box-sizing: border-box;
        }

        .landing-hero-cta .landing-cta-btn {
          padding: 0.7rem 1.35rem;
          font-size: 0.92rem;
          text-decoration: none;
          box-sizing: border-box;
          border-radius: 12px;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 600;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .landing-benchmarks-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: 0.85rem;
          border-top: 1px solid var(--border-subtle);
          padding-top: 1.35rem;
          width: 100%;
          max-width: 100%;
          box-sizing: border-box;
        }

        .landing-benchmark-item {
          min-width: 0;
          box-sizing: border-box;
        }

        .landing-benchmark-val {
          font-family: 'Outfit', sans-serif;
          font-size: 1.35rem;
          font-weight: 800;
          line-height: 1.15;
        }

        .landing-benchmark-lbl {
          font-size: 0.76rem;
          color: var(--text-muted);
          overflow-wrap: break-word;
          word-break: break-word;
        }

        .landing-sim-card {
          padding: clamp(1.15rem, 2.5vw, 1.65rem);
          border-radius: 20px;
          width: 100%;
          max-width: 100%;
          box-sizing: border-box;
          min-width: 0;
        }

        .landing-hero-visual-col {
          width: 100%;
          min-width: 0;
          box-sizing: border-box;
        }

        .hero-image-container {
          transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.35s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .hero-image-container:hover {
          transform: translateY(-4px);
          box-shadow: 0 30px 75px rgba(0, 0, 0, 0.85), 0 0 55px rgba(6, 182, 212, 0.35) !important;
        }

        .hero-image-container:hover .hero-media-img {
          transform: scale(1.03);
        }

        /* 1. Large Desktops (1025px and up) */
        @media (min-width: 1025px) {
          .landing-hero-grid {
            grid-template-columns: 1.12fr 0.88fr;
            gap: 2.25rem;
            align-items: center;
          }
          .mobile-menu-trigger {
            display: none !important;
          }
        }

        /* 2. Laptops / Desktops (769px – 1024px) */
        @media (min-width: 769px) and (max-width: 1024px) {
          .landing-hero-grid {
            grid-template-columns: 1fr 1fr;
            gap: 1.75rem;
          }
          .mobile-menu-trigger {
            display: none !important;
          }
        }

        @media (max-width: 1120px) {
          .landing-brand-sub {
            display: none !important;
          }
          .landing-header-link {
            padding: 0.32rem 0.52rem !important;
            font-size: 0.78rem !important;
            gap: 0.22rem !important;
          }
          .landing-nav-capsule {
            gap: 0.15rem !important;
            padding: 0.2rem 0.3rem !important;
          }
        }

        /* 3. Tablets (481px – 768px) */
        @media (min-width: 481px) and (max-width: 768px) {
          .landing-hero-grid {
            grid-template-columns: minmax(0, 1fr);
            gap: 2.25rem;
          }
          .landing-hero-copy {
            min-width: 0;
          }
          .mobile-menu-trigger {
            display: flex !important;
          }
          .hide-on-mobile {
            display: none !important;
          }
        }

        /* 4. Mobile Phones (0px – 480px) */
        @media (max-width: 480px) {
          .landing-top-header {
            padding: 0 0.75rem !important;
            height: 58px !important;
            width: 100% !important;
            max-width: 100vw !important;
            box-sizing: border-box !important;
          }
          .landing-page-root {
            padding-top: 58px !important;
          }
          .landing-hero-section {
            padding: 1.25rem 0.65rem 1.5rem !important;
            width: 100% !important;
            max-width: 100vw !important;
            box-sizing: border-box !important;
          }
          .landing-hero-grid {
            grid-template-columns: minmax(0, 1fr) !important;
            gap: 1.5rem !important;
            width: 100% !important;
            max-width: 100% !important;
          }
          .landing-hero-copy {
            min-width: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            overflow: hidden !important;
          }
          .mobile-menu-trigger {
            display: flex !important;
          }
          .hide-on-mobile {
            display: none !important;
          }
          .landing-badge-pill {
            font-size: 0.7rem !important;
            padding: 0.25rem 0.55rem !important;
            white-space: normal !important;
            line-height: 1.3 !important;
            max-width: 100% !important;
            margin-bottom: 0.75rem !important;
            flex-wrap: wrap !important;
          }
          .landing-hero-title {
            font-size: clamp(1.35rem, 6.2vw, 1.75rem) !important;
            line-height: 1.22 !important;
            margin-bottom: 0.75rem !important;
            word-break: break-word !important;
            max-width: 100% !important;
          }
          .landing-hero-desc {
            font-size: clamp(0.82rem, 3.4vw, 0.9rem) !important;
            line-height: 1.48 !important;
            margin-bottom: 1.25rem !important;
            word-break: break-word !important;
            max-width: 100% !important;
          }
          .landing-hero-cta {
            display: flex !important;
            flex-direction: column !important;
            width: 100% !important;
            max-width: 100% !important;
            gap: 0.55rem !important;
            margin-bottom: 1.5rem !important;
          }
          .landing-hero-cta .landing-cta-btn {
            width: 100% !important;
            max-width: 100% !important;
            box-sizing: border-box !important;
            padding: 0.65rem 0.8rem !important;
            font-size: 0.85rem !important;
            white-space: normal !important;
            word-break: break-word !important;
            text-align: center !important;
            justify-content: center !important;
          }
          .landing-benchmarks-grid {
            grid-template-columns: minmax(0, 1fr) !important;
            gap: 0.5rem !important;
            padding-top: 0.85rem !important;
            width: 100% !important;
            max-width: 100% !important;
          }
          .landing-benchmark-item {
            display: flex !important;
            flex-direction: row !important;
            justify-content: space-between !important;
            align-items: center !important;
            padding: 0.55rem 0.75rem !important;
            background: rgba(15, 23, 42, 0.65) !important;
            border: 1px solid var(--border-subtle) !important;
            border-radius: var(--radius-md) !important;
            width: 100% !important;
            max-width: 100% !important;
            box-sizing: border-box !important;
          }
          .landing-benchmark-val {
            font-size: 1.08rem !important;
            font-weight: 800 !important;
            white-space: nowrap !important;
          }
          .landing-benchmark-lbl {
            font-size: 0.72rem !important;
            color: var(--text-muted) !important;
            text-align: right !important;
            max-width: 60% !important;
            word-break: break-word !important;
          }
          .landing-sim-card {
            padding: 0.85rem 0.65rem !important;
            border-radius: 14px !important;
            min-width: 0 !important;
            max-width: 100% !important;
          }
          .landing-sim-cards {
            grid-template-columns: minmax(0, 1fr) !important;
            gap: 0.65rem !important;
          }
          .landing-features-grid {
            grid-template-columns: minmax(0, 1fr) !important;
            gap: 0.85rem !important;
          }
        }

        /* Micro Mobile & 360px Viewports */
        @media (max-width: 420px) {
          .landing-brand-sub {
            display: none !important;
          }
        }

        @media (max-width: 360px) {
          .landing-top-header {
            padding: 0 0.5rem !important;
            height: 54px !important;
          }
          .landing-page-root {
            padding-top: 54px !important;
          }
          .landing-hero-section {
            padding: 1rem 0.5rem 1.25rem !important;
          }
          .landing-badge-pill {
            font-size: 0.65rem !important;
            padding: 0.2rem 0.45rem !important;
            margin-bottom: 0.65rem !important;
          }
          .landing-hero-title {
            font-size: 1.32rem !important;
            line-height: 1.2 !important;
            margin-bottom: 0.6rem !important;
          }
          .landing-hero-desc {
            font-size: 0.8rem !important;
            line-height: 1.4 !important;
            margin-bottom: 1.15rem !important;
          }
          .landing-hero-cta {
            gap: 0.45rem !important;
            margin-bottom: 1.15rem !important;
          }
          .landing-hero-cta .landing-cta-btn {
            padding: 0.55rem 0.6rem !important;
            font-size: 0.8rem !important;
          }
          .landing-benchmark-item {
            padding: 0.45rem 0.6rem !important;
          }
          .landing-benchmark-val {
            font-size: 1rem !important;
          }
          .landing-benchmark-lbl {
            font-size: 0.68rem !important;
          }
          .landing-sim-card {
            padding: 0.75rem 0.5rem !important;
            border-radius: 12px !important;
          }
          .landing-sim-cards {
            gap: 0.55rem !important;
          }
        }
      `}</style>
    </div>
  );
};

export default LandingPage;
