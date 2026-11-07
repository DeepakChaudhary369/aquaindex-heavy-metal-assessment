import React from 'react';
import { AlertTriangle, Info } from 'lucide-react';

const DemoDataBanner = ({ visible = true }) => {
  if (!visible) return null;

  return (
    <div
      style={{
        background: 'linear-gradient(90deg, rgba(168, 85, 247, 0.12) 0%, rgba(6, 182, 212, 0.1) 100%)',
        border: '1px solid rgba(168, 85, 247, 0.3)',
        borderRadius: 'var(--radius-md)',
        padding: '0.65rem 1rem',
        marginBottom: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '0.75rem',
        fontSize: '0.84rem',
        color: '#e2e8f0',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
        <Info size={18} style={{ color: '#c084fc', flexShrink: 0 }} />
        <span>
          <strong style={{ color: '#c084fc' }}>DEMONSTRATION DATASET ACTIVE:</strong> Measurements labeled with{' '}
          <span className="badge badge-demo" style={{ fontSize: '0.7rem', padding: '0.1rem 0.4rem' }}>Demo</span>{' '}
          are synthetic environmental baselines provided for system validation and methodology illustration.
        </span>
      </div>
      <div style={{ fontSize: '0.75rem', color: '#94a3b8', whiteSpace: 'nowrap' }}>
        Not certified field measurements
      </div>
    </div>
  );
};

export default DemoDataBanner;
