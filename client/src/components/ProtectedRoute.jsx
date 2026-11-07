import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Waves } from 'lucide-react';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0a0f1d',
          color: '#f8fafc',
          gap: '1rem',
        }}
      >
        <div
          style={{
            width: '54px',
            height: '54px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #06b6d4, #14b8a6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 25px rgba(6, 182, 212, 0.4)',
            animation: 'pulse 1.8s infinite',
          }}
        >
          <Waves size={28} color="#04121f" />
        </div>
        <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1rem', fontWeight: 600 }}>
          Verifying Surveillance Credentials...
        </div>
      </div>
    );
  }

  // Not authenticated: Redirect to /login with original location
  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        state={{
          from: location,
          message: 'Authentication required. Please log in to access the water quality dashboard.',
        }}
        replace
      />
    );
  }

  // Admin-only route guard
  if (adminOnly && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return children ? children : <Outlet />;
};

export default ProtectedRoute;
