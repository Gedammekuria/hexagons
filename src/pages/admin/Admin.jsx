import React, { useState, useEffect } from 'react';
import AdminLogin from './AdminLogin';
import AdminDashboard from './AdminDashboard';
import { verifyToken } from '../../api/client';

const Admin = () => {
  const [token, setToken] = useState(null);
  const [admin, setAdmin] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('hex_admin_token');
    if (!saved) { setChecking(false); return; }
    verifyToken(saved)
      .then(data => { setToken(saved); setAdmin(data.admin); })
      .catch(() => localStorage.removeItem('hex_admin_token'))
      .finally(() => setChecking(false));
  }, []);

  const handleLogin = (t, a) => { setToken(t); setAdmin(a); };

  const handleLogout = () => {
    localStorage.removeItem('hex_admin_token');
    setToken(null);
    setAdmin(null);
  };

  if (checking) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0f' }}>
        <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid rgba(0,179,122,0.3)', borderTopColor: '#00b37a', animation: 'spin 0.8s linear infinite' }} />
      </div>
    );
  }

  if (!token) return <AdminLogin onLogin={handleLogin} />;
  return <AdminDashboard token={token} admin={admin} onLogout={handleLogout} />;
};

export default Admin;
