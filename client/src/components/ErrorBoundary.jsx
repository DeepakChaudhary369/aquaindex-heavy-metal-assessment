import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#0a0f1d',
            color: '#f8fafc',
            padding: '2rem',
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          <div
            style={{
              maxWidth: '560px',
              width: '100%',
              background: '#121a2f',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              borderRadius: '16px',
              padding: '2rem',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#ef4444', marginBottom: '1rem' }}>
              <AlertTriangle size={28} />
              <h2 style={{ fontSize: '1.4rem', fontWeight: 700 }}>Application Rendering Error</h2>
            </div>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1.25rem', lineHeight: 1.5 }}>
              A client-side component error occurred. Details are captured below:
            </p>
            <div
              style={{
                background: '#0a0f1d',
                padding: '0.85rem 1rem',
                borderRadius: '8px',
                fontFamily: 'monospace',
                fontSize: '0.8rem',
                color: '#f87171',
                marginBottom: '1.5rem',
                wordBreak: 'break-all',
              }}
            >
              {this.state.error?.toString()}
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={() => window.location.reload()}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.6rem 1.2rem',
                  borderRadius: '8px',
                  background: '#06b6d4',
                  color: '#04121f',
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                <RefreshCw size={16} /> Reload Page
              </button>
              <a
                href="/"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.6rem 1.2rem',
                  borderRadius: '8px',
                  background: '#1e293b',
                  color: '#f8fafc',
                  border: '1px solid rgba(148, 163, 184, 0.2)',
                  textDecoration: 'none',
                }}
              >
                <Home size={16} /> Return to Home
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
