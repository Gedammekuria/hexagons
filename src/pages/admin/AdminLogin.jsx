import React, { useState, useEffect } from 'react';
import { adminLogin, forgotPassword, resetPassword } from '../../api/client';
import { LogIn, Loader2, AlertCircle, ShieldCheck, Mail, ArrowLeft, Key } from 'lucide-react';

const AdminLogin = ({ onLogin }) => {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [mode, setMode]         = useState('login'); // login | forgot | reset
  const [pin, setPin]           = useState('');
  const [newPass, setNewPass]   = useState('');
  const [success, setSuccess]   = useState('');

  useEffect(() => { document.title = 'Admin Login — Hexagon'; }, []);

  const inp = {
    width: '100%', boxSizing: 'border-box', padding: '0.8rem 1rem',
    background: '#f9fafb', border: '1px solid #d1d5db',
    borderRadius: '0.6rem', color: '#111827', fontSize: '0.95rem', outline: 'none',
    transition: 'border-color 0.2s',
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const data = await adminLogin(email, password);
      localStorage.setItem('hex_admin_token', data.token);
      onLogin(data.token, data.admin);
    } catch (err) {
      setError(err.message || 'Invalid credentials.');
    } finally { setLoading(false); }
  };

  const handleForgot = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await forgotPassword(email);
      setMode('reset');
      setSuccess('If the email matches an admin, a security PIN has been sent.');
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await resetPassword(email, pin, newPass);
      setMode('login');
      setSuccess('Password reset successfully! You can now sign in.');
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#f3f4f6', fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>
      {/* Left panel — visible on desktop */}
      <div style={{
        flex: 1, 
        background: 'linear-gradient(135deg, #001a0e 0%, #002b1c 100%)',
        display: 'flex',
        alignItems: 'center', 
        justifyContent: 'center', 
        padding: '3rem',
      }} className="login-left-panel">
        <div style={{ textAlign: 'center', color: 'white' }}>
          <div style={{ fontSize: '5rem', marginBottom: '1rem', color: '#00b37a' }}>⬡</div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: '0 0 0.5rem' }}>Hexagon CMS</h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1rem' }}>Complete website management in one place</p>
        </div>
      </div>

      {/* Right login form */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div style={{ width: '100%', maxWidth: 400 }}>
          <div style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
            <img src="/images/hexagon-logo.png" alt="Hexagon Logo" style={{ height: '48px', marginBottom: '1.25rem', display: 'inline-block' }} />
            <h2 style={{ color: '#111827', margin: 0, fontWeight: 700, fontSize: '1.6rem' }}>Welcome back</h2>
            <p style={{ color: '#6b7280', margin: '0.4rem 0 0', fontSize: '0.9rem' }}>Sign in to manage Hexagon website</p>
          </div>

          {error && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '0.6rem', color: '#f87171', marginBottom: '1.25rem', fontSize: '0.875rem' }}>
              <AlertCircle size={15} /> {error}
            </div>
          )}

          {success && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '0.6rem', color: '#10b981', marginBottom: '1.25rem', fontSize: '0.875rem' }}>
              <ShieldCheck size={15} /> {success}
            </div>
          )}

          {mode === 'login' && (
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', color: '#374151', fontSize: '0.82rem', marginBottom: '0.4rem', fontWeight: 600 }}>Email Address</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="admin@hexagonview.com" style={inp} autoFocus />
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                  <label style={{ color: '#374151', fontSize: '0.82rem', fontWeight: 600 }}>Password</label>
                  <button type="button" onClick={() => { setMode('forgot'); setError(''); setSuccess(''); }} style={{ background: 'none', border: 'none', color: '#00b37a', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 500 }}>Forgot password?</button>
                </div>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••" style={inp} />
              </div>
              <button type="submit" disabled={loading} style={{
                marginTop: '0.5rem', padding: '0.85rem', border: 'none', borderRadius: '0.6rem',
                background: loading ? 'rgba(0,179,122,0.4)' : 'linear-gradient(135deg,#00b37a,#009966)',
                color: 'white', fontWeight: 600, fontSize: '0.95rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
              }}>
                {loading ? <Loader2 size={17} style={{ animation: 'spin 0.8s linear infinite' }} /> : <LogIn size={17} />}
                {loading ? 'Signing in…' : 'Sign In'}
              </button>
            </form>
          )}

          {mode === 'forgot' && (
            <form onSubmit={handleForgot} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', color: '#374151', fontSize: '0.82rem', marginBottom: '0.4rem', fontWeight: 600 }}>Email Address</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="Enter your admin email" style={inp} autoFocus />
              </div>
              <button type="submit" disabled={loading} style={{
                marginTop: '0.5rem', padding: '0.85rem', border: 'none', borderRadius: '0.6rem',
                background: '#111827', color: 'white', fontWeight: 600, fontSize: '0.95rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
              }}>
                {loading ? <Loader2 size={17} style={{ animation: 'spin 0.8s linear infinite' }} /> : <Mail size={17} />}
                Send Reset PIN
              </button>
              <button type="button" onClick={() => setMode('login')} style={{ background: 'none', border: 'none', color: '#6b7280', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', marginTop: '0.5rem' }}>
                <ArrowLeft size={14} /> Back to Login
              </button>
            </form>
          )}

          {mode === 'reset' && (
            <form onSubmit={handleReset} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', color: '#374151', fontSize: '0.82rem', marginBottom: '0.4rem', fontWeight: 600 }}>Security PIN</label>
                <input type="text" value={pin} onChange={e => setPin(e.target.value)} required placeholder="6-digit code from email" style={inp} autoFocus />
              </div>
              <div>
                <label style={{ display: 'block', color: '#374151', fontSize: '0.82rem', marginBottom: '0.4rem', fontWeight: 600 }}>New Password</label>
                <input type="password" value={newPass} onChange={e => setNewPass(e.target.value)} required placeholder="Minimum 6 characters" style={inp} />
              </div>
              <button type="submit" disabled={loading} style={{
                marginTop: '0.5rem', padding: '0.85rem', border: 'none', borderRadius: '0.6rem',
                background: '#111827', color: 'white', fontWeight: 600, fontSize: '0.95rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
              }}>
                {loading ? <Loader2 size={17} style={{ animation: 'spin 0.8s linear infinite' }} /> : <Key size={17} />}
                Reset Password
              </button>
              <button type="button" onClick={() => setMode('login')} style={{ background: 'none', border: 'none', color: '#6b7280', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', marginTop: '0.5rem' }}>
                <ArrowLeft size={14} /> Back to Login
              </button>
            </form>
          )}

          <p style={{ color: '#9ca3af', fontSize: '0.78rem', marginTop: '2rem', textAlign: 'center' }}>
            Hexagon Computer Systems · Admin Portal
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
