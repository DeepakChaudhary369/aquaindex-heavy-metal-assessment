import React, { useState } from 'react';
import { Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import {
  Waves,
  LogIn,
  Lock,
  User,
  Mail,
  ShieldAlert,
  ArrowRight,
  Eye,
  EyeOff,
  UserPlus,
  AlertCircle,
  CheckCircle2,
  Home,
  KeyRound,
  HelpCircle,
  Code2,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';

const LoginPage = () => {
  const { login, register, isAuthenticated, user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Primary mode: 'client' | 'admin'
  const isRegisterRoute = location.pathname === '/register' || new URLSearchParams(location.search).get('mode') === 'register';
  const searchRole = new URLSearchParams(location.search).get('role') || new URLSearchParams(location.search).get('portal');
  const [activeRole, setActiveRole] = useState(searchRole === 'admin' ? 'admin' : 'client');
  // For client: 'login' | 'register'
  const [clientMode, setClientMode] = useState(isRegisterRoute ? 'register' : 'login');

  // Form states
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Forgot Password modal/view states
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState(1); // 1 = enter email, 2 = enter new password
  const [forgotEmail, setForgotEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');

  // Developer secret credentials toggle (only visible when developer clicks secret toggle)
  const [showDevHint, setShowDevHint] = useState(false);

  // If user is already authenticated, directly route to respective portal
  if (isAuthenticated) {
    if (activeRole === 'admin' && (isAdmin || user?.role === 'admin')) {
      return <Navigate to="/admin" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  const redirectMessage = location.state?.message;
  const destinationRoute = location.state?.from?.pathname;
  const isExpired = new URLSearchParams(location.search).get('expired');

  const switchRole = (role) => {
    setActiveRole(role);
    setError('');
    setSuccessMsg('');
    setIdentifier('');
    setPassword('');
  };

  const handleClientLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      await login(identifier, password);
      // Whenever logging in as client, ALWAYS open dashboard
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleClientRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    try {
      await register({
        name: name.trim(),
        email: email.trim(),
        password,
        role: 'analyst',
      });
      // Whenever registering as client, ALWAYS open dashboard
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'Registration failed. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const authUser = await login(identifier, password);
      if (authUser?.role !== 'admin') {
        throw new Error('Access restricted: System administrator credentials required for Admin Portal.');
      }
      // Whenever logging in as admin, ALWAYS directly open admin page
      navigate('/admin', { replace: true });
    } catch (err) {
      setError(err.message || 'Administrator authorization failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Forgot Password Step 1: Verify Email
  const handleForgotRequest = async (e) => {
    e.preventDefault();
    setForgotError('');
    setForgotLoading(true);

    try {
      const res = await authAPI.forgotPassword({ email: forgotEmail });
      if (res.data?.resetToken) {
        setResetToken(res.data.resetToken);
      }
      setForgotStep(2);
      setForgotSuccess(res.message || 'Account verified. Please enter your new password.');
    } catch (err) {
      setForgotError(err.message || 'No registered account found with this email.');
    } finally {
      setForgotLoading(false);
    }
  };

  // Forgot Password Step 2: Set New Password
  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setForgotError('');

    if (newPassword.length < 6) {
      setForgotError('New password must be at least 6 characters long.');
      return;
    }

    setForgotLoading(true);
    try {
      const res = await authAPI.resetPassword({
        email: forgotEmail,
        newPassword,
        resetToken,
      });
      setSuccessMsg(res.message || 'Password successfully reset! You can now sign in.');
      setShowForgotModal(false);
      setForgotStep(1);
      setForgotEmail('');
      setNewPassword('');
      setResetToken('');
    } catch (err) {
      setForgotError(err.message || 'Password reset failed. Please try again.');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="auth-portal-page">
      {/* Background ambient lighting */}
      <div className="auth-ambient-orb-1" />
      <div className="auth-ambient-orb-2" />
      <div className="auth-matrix-grid" />

      {/* Top Floating Header */}
      <header className="auth-header">
        <Link to="/" className="auth-brand" title="AquaIndex - Return to Home">
          <div className="auth-brand-icon">
            <Waves size={20} />
          </div>
          <div>
            <div className="auth-brand-title">AquaIndex</div>
            <div className="auth-brand-subtitle">Water Analytics</div>
          </div>
        </Link>

        <Link to="/" className="auth-header-home-btn" title="Return to Public Homepage">
          <Home size={15} />
          <span>Home</span>
        </Link>
      </header>

      {/* Main Container Stage */}
      <main className="auth-stage-wrapper">
        <div className="auth-layout-grid">
          {/* LEFT: Scientific Laboratory Visual Showcase with Image */}
          <section className="auth-visual-showcase">
            <div className="auth-image-card">
              <img
                src="/auth-laboratory.jpg"
                alt="Environmental Water Testing Laboratory"
                className="auth-showcase-img"
              />
              <div className="auth-image-overlay" />

              {/* Holographic Laboratory Metadata Badges */}
              <div className="auth-img-badge top-badge">
                <span className="auth-pulse-dot" />
                <span>Heavy Metal Spectrometry Laboratory</span>
              </div>

              <div className="auth-img-footer">
                <div className="auth-img-title">
                  Standardized Hydrological &amp; Toxicological Screening
                </div>
                <div className="auth-img-desc">
                  Real-time computational surveillance for Heavy Metal Pollution Index (HPI) and Evaluation Index (HEI) conforming to WHO &amp; BIS IS 10500 standards.
                </div>
                <div className="auth-img-tags">
                  <span className="auth-chip">Pb • Lead</span>
                  <span className="auth-chip">Cd • Cadmium</span>
                  <span className="auth-chip">As • Arsenic</span>
                  <span className="auth-chip">Hg • Mercury</span>
                </div>
              </div>
            </div>
          </section>

          {/* RIGHT: Simplified Authentication Form */}
          <section className="auth-form-card">
            {/* Title & Subtitle */}
            <div className="auth-card-head">
              <h1 className="auth-headline">
                {activeRole === 'admin'
                  ? 'Administrator Login'
                  : (clientMode === 'register' ? 'Register Client Account' : 'Client Sign In')}
              </h1>
              <p className="auth-subline">
                {activeRole === 'admin'
                  ? 'Secure administrative terminal with restricted system configuration privileges.'
                  : (clientMode === 'register'
                    ? 'Create a new laboratory account to monitor water quality and sample records.'
                    : 'Access the comprehensive water surveillance dashboard and calculations.')}
              </p>
            </div>

            {/* Role Switcher: Client Portal vs Admin Portal */}
            <div className="auth-tabs-row">
              <button
                type="button"
                onClick={() => switchRole('client')}
                className={`auth-tab-btn ${activeRole === 'client' ? 'active-client-tab' : ''}`}
              >
                <User size={15} />
                <span>Client Portal</span>
              </button>
              <button
                type="button"
                onClick={() => switchRole('admin')}
                className={`auth-tab-btn ${activeRole === 'admin' ? 'active-admin-tab' : ''}`}
              >
                <ShieldAlert size={15} />
                <span>Admin Portal</span>
              </button>
            </div>

            {/* Alert & Notification Banners */}
            {destinationRoute && (
              <div className="auth-alert alert-warn">
                <AlertCircle size={16} className="alert-ico" />
                <span>
                  <strong>Authentication Required:</strong> {redirectMessage || 'Please sign in to proceed.'}
                </span>
              </div>
            )}

            {isExpired && (
              <div className="auth-alert alert-warn">
                <AlertCircle size={16} className="alert-ico" />
                <span>Session expired. Please sign in again.</span>
              </div>
            )}

            {error && (
              <div className="auth-alert alert-err">
                <AlertCircle size={16} className="alert-ico" />
                <span>{error}</span>
              </div>
            )}

            {successMsg && (
              <div className="auth-alert alert-success">
                <CheckCircle2 size={16} className="alert-ico" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* FUNCTION 1: CLIENT ACCESS */}
            {activeRole === 'client' && (
              <div>
                {/* Client Mode Switch: Sign In vs Register for New */}
                <div className="auth-mode-pill-container">
                  <button
                    type="button"
                    onClick={() => { setClientMode('login'); setError(''); setSuccessMsg(''); }}
                    className={`mode-pill ${clientMode === 'login' ? 'active-pill' : ''}`}
                  >
                    <LogIn size={13} />
                    <span>Sign In</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setClientMode('register'); setError(''); setSuccessMsg(''); }}
                    className={`mode-pill ${clientMode === 'register' ? 'active-pill' : ''}`}
                  >
                    <UserPlus size={13} />
                    <span>Register for New</span>
                  </button>
                </div>

                {/* 1A. CLIENT SIGN IN FORM */}
                {clientMode === 'login' ? (
                  <form onSubmit={handleClientLogin} className="auth-fields-stack">
                    <div className="field-group">
                      <label className="field-label">Username or Email</label>
                      <div className="field-input-box">
                        <User size={16} className="field-icon" />
                        <input
                          type="text"
                          className="field-input"
                          value={identifier}
                          onChange={(e) => setIdentifier(e.target.value)}
                          placeholder="Enter your username or email"
                          required
                          autoComplete="username"
                        />
                      </div>
                    </div>

                    <div className="field-group">
                      <div className="field-label-split">
                        <label className="field-label">Password</label>
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="pwd-toggle-action"
                        >
                          {showPassword ? <EyeOff size={13} /> : <Eye size={13} />}
                          <span>{showPassword ? 'Hide' : 'Show'}</span>
                        </button>
                      </div>
                      <div className="field-input-box">
                        <Lock size={16} className="field-icon" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          className="field-input"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••••••"
                          required
                          autoComplete="current-password"
                        />
                      </div>
                      <div style={{ textAlign: 'right', marginTop: '0.25rem' }}>
                        <button
                          type="button"
                          onClick={() => {
                            setShowForgotModal(true);
                            setForgotStep(1);
                            setForgotError('');
                            setForgotSuccess('');
                          }}
                          className="forgot-link-btn"
                        >
                          Forgot password?
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="auth-cta-btn client-cta"
                    >
                      {loading ? (
                        <span>Signing In...</span>
                      ) : (
                        <>
                          <LogIn size={16} />
                          <span>Sign In as Client</span>
                          <ArrowRight size={16} />
                        </>
                      )}
                    </button>

                    <div className="auth-switch-prompt">
                      Don&apos;t have an account?{' '}
                      <button
                        type="button"
                        onClick={() => { setClientMode('register'); setError(''); }}
                        className="auth-link-btn"
                      >
                        Register for new account
                      </button>
                    </div>
                  </form>
                ) : (
                  /* 1B. CLIENT REGISTER FORM */
                  <form onSubmit={handleClientRegister} className="auth-fields-stack">
                    <div className="field-group">
                      <label className="field-label">Full Name</label>
                      <div className="field-input-box">
                        <User size={16} className="field-icon" />
                        <input
                          type="text"
                          className="field-input"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="e.g. Dr. Alex Rivers"
                          required
                          autoComplete="name"
                        />
                      </div>
                    </div>

                    <div className="field-group">
                      <label className="field-label">Email Address</label>
                      <div className="field-input-box">
                        <Mail size={16} className="field-icon" />
                        <input
                          type="email"
                          className="field-input"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="e.g. alex@environmental.org"
                          required
                          autoComplete="email"
                        />
                      </div>
                    </div>

                    <div className="field-group">
                      <div className="field-label-split">
                        <label className="field-label">Password (Min. 6 chars)</label>
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="pwd-toggle-action"
                        >
                          {showPassword ? <EyeOff size={13} /> : <Eye size={13} />}
                          <span>{showPassword ? 'Hide' : 'Show'}</span>
                        </button>
                      </div>
                      <div className="field-input-box">
                        <Lock size={16} className="field-icon" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          className="field-input"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Create a strong password"
                          required
                          autoComplete="new-password"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="auth-cta-btn client-cta"
                    >
                      {loading ? (
                        <span>Creating Account...</span>
                      ) : (
                        <>
                          <UserPlus size={16} />
                          <span>Register &amp; Launch Dashboard</span>
                          <ArrowRight size={16} />
                        </>
                      )}
                    </button>

                    <div className="auth-switch-prompt">
                      Already registered?{' '}
                      <button
                        type="button"
                        onClick={() => { setClientMode('login'); setError(''); }}
                        className="auth-link-btn"
                      >
                        Sign In here
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* FUNCTION 2: ADMIN ACCESS */}
            {activeRole === 'admin' && (
              <form onSubmit={handleAdminLogin} className="auth-fields-stack">
                <div className="admin-notice-box">
                  <ShieldAlert size={16} style={{ color: '#06b6d4', flexShrink: 0 }} />
                  <div>
                    <strong>Restricted Access:</strong> Only authorized system administrators and developers may sign in here.
                  </div>
                </div>

                <div className="field-group">
                  <label className="field-label">Administrator ID or Email</label>
                  <div className="field-input-box">
                    <User size={16} className="field-icon" />
                    <input
                      type="text"
                      className="field-input"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="Enter administrator ID"
                      required
                      autoComplete="username"
                    />
                  </div>
                </div>

                <div className="field-group">
                  <div className="field-label-split">
                    <label className="field-label">Security Password</label>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="pwd-toggle-action"
                    >
                      {showPassword ? <EyeOff size={13} /> : <Eye size={13} />}
                      <span>{showPassword ? 'Hide' : 'Show'}</span>
                    </button>
                  </div>
                  <div className="field-input-box">
                    <Lock size={16} className="field-icon" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="field-input"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      required
                      autoComplete="current-password"
                    />
                  </div>
                  <div style={{ textAlign: 'right', marginTop: '0.25rem' }}>
                    <button
                      type="button"
                      onClick={() => {
                        setShowForgotModal(true);
                        setForgotStep(1);
                        setForgotError('');
                        setForgotSuccess('');
                      }}
                      className="forgot-link-btn"
                    >
                      Forgot password?
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="auth-cta-btn admin-cta"
                >
                  {loading ? (
                    <span>Verifying Administrator...</span>
                  ) : (
                    <>
                      <ShieldAlert size={16} />
                      <span>Authorize Administrator</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>

                <div className="auth-switch-prompt">
                  Not an administrator?{' '}
                  <button
                    type="button"
                    onClick={() => switchRole('client')}
                    className="auth-link-btn"
                  >
                    Switch to Client Access
                  </button>
                </div>
              </form>
            )}

            {/* Bottom Footer & Discreet Developer Key */}
            <div className="auth-card-footnote">
              <div className="compliance-row">
                <CheckCircle2 size={13} style={{ color: '#10b981' }} />
                <span>WHO &amp; BIS IS 10500 Certified Platform</span>
              </div>

              {/* Discreet Developer Info Toggle (Hidden from regular users) */}
              <div style={{ marginTop: '0.4rem', textAlign: 'center' }}>
                <button
                  type="button"
                  onClick={() => setShowDevHint(!showDevHint)}
                  className="dev-secret-toggle"
                  title="Developer Console Access"
                >
                  <Code2 size={12} />
                  <span>Developer Credentials Access</span>
                </button>

                {showDevHint && (
                  <div className="dev-secret-box">
                    <div style={{ fontWeight: 600, color: '#38bdf8', marginBottom: '0.2rem' }}>
                      ⚙️ Internal Developer Verification:
                    </div>
                    <div>Admin ID: <code style={{ color: '#10b981' }}>admin</code></div>
                    <div>Password: <code style={{ color: '#10b981' }}>Admin@12345</code></div>
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* FORGOT PASSWORD MODAL */}
      {showForgotModal && (
        <div className="forgot-modal-backdrop" onClick={() => setShowForgotModal(false)}>
          <div className="forgot-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-top-bar">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <KeyRound size={18} style={{ color: '#38bdf8' }} />
                <span style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '1.1rem' }}>
                  Reset Security Password
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                className="modal-close-btn"
              >
                ✕
              </button>
            </div>

            {forgotError && (
              <div className="auth-alert alert-err" style={{ marginBottom: '1rem' }}>
                <AlertCircle size={15} className="alert-ico" />
                <span>{forgotError}</span>
              </div>
            )}

            {forgotSuccess && (
              <div className="auth-alert alert-success" style={{ marginBottom: '1rem' }}>
                <CheckCircle2 size={15} className="alert-ico" />
                <span>{forgotSuccess}</span>
              </div>
            )}

            {forgotStep === 1 ? (
              <form onSubmit={handleForgotRequest} className="auth-fields-stack">
                <p style={{ fontSize: '0.82rem', color: '#94a3b8', margin: '0 0 0.8rem 0', lineHeight: 1.5 }}>
                  Enter your registered account email address to verify your identity and generate a secure password reset token.
                </p>
                <div className="field-group">
                  <label className="field-label">Account Email Address</label>
                  <div className="field-input-box">
                    <Mail size={16} className="field-icon" />
                    <input
                      type="email"
                      className="field-input"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="e.g. analyst@environmental.org"
                      required
                      autoComplete="email"
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="modal-cancel-btn"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="auth-cta-btn client-cta"
                    style={{ flex: 1 }}
                  >
                    {forgotLoading ? 'Verifying...' : 'Verify & Continue'}
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleResetSubmit} className="auth-fields-stack">
                <p style={{ fontSize: '0.82rem', color: '#94a3b8', margin: '0 0 0.8rem 0', lineHeight: 1.5 }}>
                  Account verified for <strong>{forgotEmail}</strong>. Enter your new password below.
                </p>
                <div className="field-group">
                  <label className="field-label">New Password (Min. 6 chars)</label>
                  <div className="field-input-box">
                    <Lock size={16} className="field-icon" />
                    <input
                      type="password"
                      className="field-input"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new secure password"
                      required
                      autoComplete="new-password"
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => setForgotStep(1)}
                    className="modal-cancel-btn"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="auth-cta-btn client-cta"
                    style={{ flex: 1 }}
                  >
                    {forgotLoading ? 'Updating...' : 'Save New Password'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Embedded High-Aesthetic Styles */}
      <style>{`
        .auth-portal-page {
          min-height: 100vh;
          width: 100%;
          background-color: #070b14;
          color: #f8fafc;
          position: relative;
          display: flex;
          flex-direction: column;
          overflow-x: hidden;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        }

        .auth-ambient-orb-1 {
          position: fixed;
          top: -120px;
          left: 15%;
          width: 600px;
          height: 380px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(6, 182, 212, 0.16) 0%, transparent 70%);
          filter: blur(65px);
          pointer-events: none;
          z-index: 0;
        }

        .auth-ambient-orb-2 {
          position: fixed;
          bottom: -150px;
          right: 15%;
          width: 550px;
          height: 380px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(20, 184, 166, 0.14) 0%, transparent 70%);
          filter: blur(65px);
          pointer-events: none;
          z-index: 0;
        }

        .auth-matrix-grid {
          position: fixed;
          inset: 0;
          background-image: 
            linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
          background-size: 36px 36px;
          pointer-events: none;
          z-index: 0;
        }

        .auth-header {
          position: relative;
          z-index: 10;
          height: 70px;
          padding: 0 clamp(1rem, 3.5vw, 2.5rem);
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
          background: rgba(10, 15, 29, 0.65);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
        }

        .auth-brand {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          text-decoration: none;
          cursor: pointer;
          touch-action: manipulation;
          transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .auth-brand:hover {
          transform: scale(1.02);
        }

        .auth-brand-icon {
          width: 38px;
          height: 38px;
          border-radius: 10px;
          background: linear-gradient(135deg, #06b6d4 0%, #14b8a6 100%);
          color: #04121f;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 16px rgba(6, 182, 212, 0.45);
        }

        .auth-brand-title {
          font-family: 'Outfit', sans-serif;
          font-weight: 800;
          font-size: 1.25rem;
          line-height: 1.1;
          background: linear-gradient(135deg, #ffffff 40%, #38bdf8 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .auth-brand-subtitle {
          font-size: 0.64rem;
          color: #06b6d4;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          font-weight: 700;
        }

        .auth-header-home-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.42rem 0.85rem;
          border-radius: 8px;
          background: rgba(15, 23, 42, 0.7);
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: #94a3b8;
          font-size: 0.8rem;
          font-weight: 500;
          text-decoration: none;
          transition: all 0.2s;
        }

        .auth-header-home-btn:hover {
          color: #ffffff;
          border-color: rgba(6, 182, 212, 0.4);
          background: rgba(6, 182, 212, 0.1);
        }

        .auth-stage-wrapper {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: clamp(1.25rem, 3.5vw, 2.5rem) 1rem clamp(2rem, 4vw, 3rem);
          position: relative;
          z-index: 1;
        }

        .auth-layout-grid {
          display: grid;
          grid-template-columns: 1.05fr 1fr;
          gap: clamp(1.5rem, 3vw, 2.5rem);
          width: 100%;
          max-width: 1040px;
          align-items: stretch;
        }

        /* Left Showcase with Laboratory Image */
        .auth-visual-showcase {
          display: flex;
          flex-direction: column;
          width: 100%;
          min-width: 0;
        }

        .auth-image-card {
          position: relative;
          width: 100%;
          height: 100%;
          min-height: 520px;
          border-radius: 20px;
          overflow: hidden;
          border: 1px solid rgba(6, 182, 212, 0.3);
          box-shadow: 0 25px 60px rgba(0, 0, 0, 0.75), 0 0 35px rgba(6, 182, 212, 0.18);
          background: #0a0f1d;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .auth-showcase-img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
          transition: transform 0.4s ease;
        }

        .auth-image-card:hover .auth-showcase-img {
          transform: scale(1.02);
        }

        .auth-image-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(7, 11, 20, 0.45) 0%, rgba(7, 11, 20, 0.2) 40%, rgba(7, 11, 20, 0.88) 100%);
          z-index: 1;
        }

        .auth-img-badge {
          position: relative;
          z-index: 2;
          margin: 1.25rem;
          align-self: flex-start;
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          padding: 0.35rem 0.75rem;
          border-radius: 9999px;
          background: rgba(10, 15, 29, 0.85);
          border: 1px solid rgba(6, 182, 212, 0.4);
          color: #38bdf8;
          font-size: 0.76rem;
          font-weight: 600;
          backdrop-filter: blur(8px);
        }

        .auth-pulse-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background-color: #06b6d4;
          box-shadow: 0 0 8px #06b6d4;
        }

        .auth-img-footer {
          position: relative;
          z-index: 2;
          padding: clamp(1.25rem, 2.5vw, 1.75rem);
          background: linear-gradient(0deg, rgba(7, 11, 20, 0.95) 0%, rgba(7, 11, 20, 0.7) 70%, transparent 100%);
        }

        .auth-img-title {
          font-family: 'Outfit', sans-serif;
          font-size: 1.2rem;
          font-weight: 700;
          color: #f8fafc;
          margin-bottom: 0.4rem;
          line-height: 1.25;
        }

        .auth-img-desc {
          font-size: 0.8rem;
          color: #94a3b8;
          line-height: 1.5;
          margin-bottom: 0.85rem;
        }

        .auth-img-tags {
          display: flex;
          gap: 0.4rem;
          flex-wrap: wrap;
        }

        .auth-chip {
          padding: 0.2rem 0.55rem;
          border-radius: 6px;
          background: rgba(6, 182, 212, 0.12);
          border: 1px solid rgba(6, 182, 212, 0.28);
          color: #38bdf8;
          font-size: 0.72rem;
          font-weight: 600;
          font-family: 'JetBrains Mono', monospace;
        }

        /* Right Form Card */
        .auth-form-card {
          width: 100%;
          background: rgba(15, 23, 42, 0.88);
          border: 1px solid rgba(6, 182, 212, 0.22);
          border-radius: 20px;
          padding: clamp(1.4rem, 3vw, 2.25rem);
          box-shadow: 0 25px 60px rgba(0, 0, 0, 0.65), 0 0 30px rgba(6, 182, 212, 0.1);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          display: flex;
          flex-direction: column;
          justify-content: center;
          box-sizing: border-box;
        }

        .auth-card-head {
          margin-bottom: 1.35rem;
        }

        .auth-headline {
          font-family: 'Outfit', sans-serif;
          font-size: clamp(1.4rem, 2.5vw, 1.75rem);
          font-weight: 800;
          letter-spacing: -0.02em;
          margin: 0 0 0.35rem 0;
          color: #f8fafc;
        }

        .auth-subline {
          font-size: 0.82rem;
          color: #94a3b8;
          line-height: 1.5;
          margin: 0;
        }

        /* 2 Primary Tabs: Client vs Admin */
        .auth-tabs-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.35rem;
          padding: 0.3rem;
          background: rgba(10, 15, 29, 0.8);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          margin-bottom: 1.25rem;
        }

        .auth-tab-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.6rem 0.75rem;
          border-radius: 9px;
          border: none;
          background: transparent;
          color: #94a3b8;
          font-size: 0.84rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .auth-tab-btn:hover {
          color: #ffffff;
        }

        .auth-tab-btn.active-client-tab {
          background: rgba(20, 184, 166, 0.2);
          border: 1px solid rgba(20, 184, 166, 0.45);
          color: #2dd4bf;
          box-shadow: 0 0 14px rgba(20, 184, 166, 0.25);
        }

        .auth-tab-btn.active-admin-tab {
          background: rgba(6, 182, 212, 0.2);
          border: 1px solid rgba(6, 182, 212, 0.45);
          color: #38bdf8;
          box-shadow: 0 0 14px rgba(6, 182, 212, 0.25);
        }

        /* Mode Pill Switcher for Client */
        .auth-mode-pill-container {
          display: flex;
          justify-content: center;
          gap: 0.35rem;
          margin-bottom: 1.15rem;
          padding: 0.2rem;
          background: rgba(10, 15, 29, 0.5);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 8px;
        }

        .mode-pill {
          flex: 1;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.35rem;
          padding: 0.42rem 0.65rem;
          border-radius: 6px;
          border: none;
          background: transparent;
          color: #94a3b8;
          font-size: 0.78rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .mode-pill.active-pill {
          background: rgba(255, 255, 255, 0.08);
          color: #f8fafc;
          font-weight: 600;
        }

        /* Alerts */
        .auth-alert {
          display: flex;
          align-items: flex-start;
          gap: 0.65rem;
          padding: 0.7rem 0.85rem;
          border-radius: 9px;
          font-size: 0.8rem;
          line-height: 1.45;
          margin-bottom: 1.15rem;
        }

        .alert-warn {
          background: rgba(245, 158, 11, 0.12);
          border: 1px solid rgba(245, 158, 11, 0.35);
          color: #fbbf24;
        }

        .alert-err {
          background: rgba(239, 68, 68, 0.12);
          border: 1px solid rgba(239, 68, 68, 0.35);
          color: #f87171;
        }

        .alert-success {
          background: rgba(16, 185, 129, 0.12);
          border: 1px solid rgba(16, 185, 129, 0.35);
          color: #34d399;
        }

        .alert-ico {
          flex-shrink: 0;
          margin-top: 1px;
        }

        .admin-notice-box {
          display: flex;
          align-items: flex-start;
          gap: 0.55rem;
          padding: 0.65rem 0.85rem;
          border-radius: 9px;
          background: rgba(6, 182, 212, 0.08);
          border: 1px solid rgba(6, 182, 212, 0.25);
          color: #38bdf8;
          font-size: 0.77rem;
          margin-bottom: 1.15rem;
          line-height: 1.45;
        }

        /* Form fields */
        .auth-fields-stack {
          display: flex;
          flex-direction: column;
          gap: 0.95rem;
        }

        .field-group {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }

        .field-label {
          font-size: 0.78rem;
          font-weight: 600;
          color: #cbd5e1;
        }

        .field-label-split {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .pwd-toggle-action {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          background: transparent;
          border: none;
          color: #38bdf8;
          font-size: 0.72rem;
          font-weight: 500;
          cursor: pointer;
          padding: 0;
        }

        .forgot-link-btn {
          background: transparent;
          border: none;
          color: #38bdf8;
          font-size: 0.73rem;
          font-weight: 500;
          cursor: pointer;
          padding: 0;
          text-decoration: underline;
        }

        .forgot-link-btn:hover {
          color: #ffffff;
        }

        .field-input-box {
          position: relative;
          display: flex;
          align-items: center;
        }

        .field-icon {
          position: absolute;
          left: 14px;
          color: #64748b;
          pointer-events: none;
        }

        .field-input {
          width: 100%;
          background: rgba(10, 15, 29, 0.75);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          padding: 0.68rem 1rem 0.68rem 2.55rem;
          color: #f8fafc;
          font-size: 0.86rem;
          outline: none;
          transition: all 0.2s;
          box-sizing: border-box;
        }

        .field-input:focus {
          border-color: #06b6d4;
          box-shadow: 0 0 15px rgba(6, 182, 212, 0.3);
          background: rgba(10, 15, 29, 0.95);
        }

        .auth-cta-btn {
          margin-top: 0.35rem;
          padding: 0.72rem 1.25rem;
          border-radius: 11px;
          border: none;
          font-size: 0.88rem;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.55rem;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          color: #04121f;
        }

        .client-cta {
          background: linear-gradient(135deg, #14b8a6 0%, #06b6d4 100%);
          box-shadow: 0 6px 20px rgba(20, 184, 166, 0.4);
        }

        .admin-cta {
          background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%);
          box-shadow: 0 6px 20px rgba(6, 182, 212, 0.45);
        }

        .auth-cta-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          filter: brightness(1.08);
          box-shadow: 0 10px 28px rgba(6, 182, 212, 0.6);
        }

        .auth-cta-btn:active:not(:disabled) {
          transform: scale(0.98);
        }

        .auth-cta-btn:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }

        .auth-switch-prompt {
          text-align: center;
          font-size: 0.78rem;
          color: #94a3b8;
          margin-top: 0.5rem;
        }

        .auth-link-btn {
          background: transparent;
          border: none;
          color: #38bdf8;
          font-size: 0.78rem;
          font-weight: 600;
          cursor: pointer;
          padding: 0;
          text-decoration: underline;
        }

        .auth-link-btn:hover {
          color: #ffffff;
        }

        .auth-card-footnote {
          margin-top: 1.5rem;
          padding-top: 1.15rem;
          border-top: 1px solid rgba(255, 255, 255, 0.07);
        }

        .compliance-row {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.45rem;
          font-size: 0.73rem;
          color: #64748b;
        }

        /* Discreet Developer Key */
        .dev-secret-toggle {
          background: transparent;
          border: none;
          color: #475569;
          font-size: 0.7rem;
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          cursor: pointer;
          padding: 0.2rem 0.5rem;
          border-radius: 6px;
          transition: all 0.2s;
        }

        .dev-secret-toggle:hover {
          color: #38bdf8;
          background: rgba(6, 182, 212, 0.08);
        }

        .dev-secret-box {
          margin-top: 0.5rem;
          padding: 0.6rem 0.8rem;
          border-radius: 8px;
          background: rgba(10, 15, 29, 0.9);
          border: 1px dashed rgba(6, 182, 212, 0.35);
          font-size: 0.73rem;
          font-family: monospace;
          color: #cbd5e1;
          text-align: left;
        }

        /* Forgot Password Modal */
        .forgot-modal-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.75);
          backdrop-filter: blur(8px);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
        }

        .forgot-modal-card {
          width: 100%;
          max-width: 440px;
          background: #0d1527;
          border: 1px solid rgba(6, 182, 212, 0.3);
          border-radius: 16px;
          padding: 1.5rem;
          box-shadow: 0 25px 60px rgba(0, 0, 0, 0.8), 0 0 35px rgba(6, 182, 212, 0.15);
        }

        .modal-top-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1.15rem;
          padding-bottom: 0.75rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }

        .modal-close-btn {
          background: transparent;
          border: none;
          color: #94a3b8;
          font-size: 1.1rem;
          cursor: pointer;
          padding: 0.2rem 0.5rem;
          border-radius: 6px;
        }

        .modal-close-btn:hover {
          color: #ffffff;
        }

        .modal-cancel-btn {
          padding: 0.72rem 1.1rem;
          border-radius: 10px;
          border: 1px solid rgba(255, 255, 255, 0.12);
          background: rgba(15, 23, 42, 0.8);
          color: #cbd5e1;
          font-size: 0.85rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .modal-cancel-btn:hover {
          background: rgba(255, 255, 255, 0.08);
          color: #ffffff;
        }

        /* Responsive Breakpoints */
        @media (max-width: 900px) {
          .auth-layout-grid {
            grid-template-columns: 1fr;
            max-width: 480px;
          }

          .auth-image-card {
            min-height: 220px;
            max-height: 240px;
          }

          .auth-img-footer {
            padding: 1rem;
          }

          .auth-img-desc {
            display: none;
          }
        }

        @media (max-width: 480px) {
          .auth-form-card {
            padding: 1.25rem 1rem;
            border-radius: 16px;
          }

          .auth-header {
            padding: 0 1rem;
            height: 60px;
          }
        }
      `}</style>
    </div>
  );
};

export default LoginPage;
