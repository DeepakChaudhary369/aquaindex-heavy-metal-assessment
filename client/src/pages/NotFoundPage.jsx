import React from 'react';
import { Link } from 'react-router-dom';
import { Waves, Home, ArrowLeft } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div
      style={{
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '2rem',
      }}
    >
      <div style={{ maxWidth: '480px' }}>
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'rgba(6, 182, 212, 0.12)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--primary)',
            marginBottom: '1.25rem',
          }}
        >
          <Waves size={32} />
        </div>
        <h1 style={{ fontFamily: 'Outfit', fontSize: '4rem', fontWeight: 800, color: 'var(--primary)', lineHeight: 1 }}>
          404
        </h1>
        <h2 style={{ fontSize: '1.5rem', margin: '0.75rem 0' }}>Environmental Data Point Not Found</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '2rem' }}>
          The water quality monitoring station, assessment dossier, or page URL you requested does not exist or has been relocated.
        </p>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <Link to="/" className="btn btn-secondary">
            <Home size={16} /> Home Portal
          </Link>
          <Link to="/dashboard" className="btn btn-primary">
            <ArrowLeft size={16} /> Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
