import React, { useState, useEffect } from 'react';
import { getSettings, saveSettings, changePassword } from '../../../api/client';
import { Save, Loader2, Lock, ShieldCheck } from 'lucide-react';

const field = (label, key, val, onChange, type = 'text') => (
  <div key={key} style={{ marginBottom: '1rem' }}>
    <label style={{ display: 'block', color: '#6b7280', fontSize: '0.8rem', marginBottom: '0.3rem' }}>{label}</label>
    <input type={type} value={val || ''} onChange={e => onChange(key, e.target.value)}
      style={{ width: '100%', boxSizing: 'border-box', padding: '0.7rem 0.9rem', background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '0.5rem', color: '#111827', fontSize: '0.9rem', outline: 'none' }} />
  </div>
);

const SiteSettings = ({ token }) => {
  const [data, setData]       = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [msg, setMsg]         = useState('');
  const [pass, setPass]       = useState({ current: '', next: '', confirm: '' });
  const [passMsg, setPassMsg] = useState({ text: '', type: '' });
  const [passLoading, setPassLoading] = useState(false);

  useEffect(() => {
    getSettings(token).then(d => { setData(d); setLoading(false); }).catch(() => setLoading(false));
  }, [token]);

  const set = (k, v) => setData(prev => ({ ...prev, [k]: v }));

  const save = async () => {
    setSaving(true); setMsg('');
    try { await saveSettings(token, data); setMsg('Saved!'); setTimeout(() => setMsg(''), 3000); }
    catch (e) { setMsg('Error: ' + e.message); }
    finally { setSaving(false); }
  };

  const updatePassword = async () => {
    if (!pass.current || !pass.next) return setPassMsg({ text: 'All fields required', type: 'error' });
    if (pass.next !== pass.confirm) return setPassMsg({ text: 'Passwords do not match', type: 'error' });
    if (pass.next.length < 8) return setPassMsg({ text: 'New password must be at least 8 characters', type: 'error' });

    setPassLoading(true); setPassMsg({ text: '', type: '' });
    try {
      await changePassword(token, pass.current, pass.next);
      setPassMsg({ text: 'Password updated successfully!', type: 'success' });
      setPass({ current: '', next: '', confirm: '' });
    } catch (e) {
      setPassMsg({ text: e.message || 'Error updating password', type: 'error' });
    } finally {
      setPassLoading(false);
    }
  };

  if (loading) return <div style={{ color: '#6b7280', padding: '3rem', textAlign: 'center' }}>Loading…</div>;

  const section = (title, children) => (
    <div style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '0.75rem', padding: '1.25rem', marginBottom: '1.25rem' }}>
      <h3 style={{ color: '#111827', margin: '0 0 1rem', fontSize: '0.95rem', fontWeight: 600 }}>{title}</h3>
      {children}
    </div>
  );

  return (
    <div style={{ padding: '2rem', overflowY: 'auto', maxWidth: 700, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <h2 style={{ color: '#111827', margin: 0 }}>Site Settings</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {msg && <span style={{ color: msg.startsWith('Error') ? '#f87171' : '#4ade80', fontSize: '0.85rem' }}>{msg}</span>}
          <button onClick={save} disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.6rem 1.2rem', background: 'linear-gradient(135deg,#00b37a,#009966)', border: 'none', borderRadius: '0.5rem', color: '#111827', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem' }}>
            {saving ? <Loader2 size={15} /> : <Save size={15} />} {saving ? 'Saving…' : 'Save All'}
          </button>
        </div>
      </div>

      {section('Company Info', <>
        {field('Company Name', 'company_name', data.company_name, set)}
        {field('Tagline', 'company_tagline', data.company_tagline, set)}
        {field('Founded Year', 'founded_year', data.founded_year, set)}
        {field('Working Hours', 'working_hours', data.working_hours, set)}
      </>)}

      {section('Contact Details', <>
        {field('Phone Number', 'phone', data.phone, set, 'tel')}
        {field('Email Address', 'email', data.email, set, 'email')}
        {field('Address', 'address', data.address, set)}
        {field('P.O. Box', 'po_box', data.po_box, set)}
        {field('WhatsApp Number', 'whatsapp', data.whatsapp, set)}
      </>)}

      {section('Statistics', <>
        {field('Years of Experience', 'experience_years', data.experience_years, set)}
        {field('Software Projects', 'software_projects', data.software_projects, set)}
        {field('Network Projects', 'network_projects', data.network_projects, set)}
        {field('Employees', 'employees', data.employees, set)}
      </>)}

      {section('Social Media Links', <>
        {field('Facebook URL', 'facebook', data.facebook, set, 'url')}
        {field('LinkedIn URL', 'linkedin', data.linkedin, set, 'url')}
        {field('Twitter/X URL', 'twitter', data.twitter, set, 'url')}
        {field('Instagram URL', 'instagram', data.instagram, set, 'url')}
        {field('Telegram URL', 'telegram', data.telegram, set, 'url')}
        {field('TikTok URL', 'tiktok', data.tiktok, set, 'url')}
      </>)}

      {section('Security', <>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: '#6b7280' }}>
          <Lock size={16} />
          <span style={{ fontSize: '0.85rem' }}>Change Admin Password</span>
        </div>
        
        {field('Current Password', 'current', pass.current, (k, v) => setPass(p => ({ ...p, current: v })), 'password')}
        
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', color: '#6b7280', fontSize: '0.8rem', marginBottom: '0.3rem' }}>New Password</label>
          <input 
            type="password" 
            value={pass.next || ''} 
            onChange={e => setPass(p => ({ ...p, next: e.target.value }))}
            style={{ width: '100%', boxSizing: 'border-box', padding: '0.7rem 0.9rem', background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '0.5rem', color: '#111827', fontSize: '0.9rem', outline: 'none' }} 
            autoComplete="new-password"
          />
          
          {pass.next && (
            <div style={{ marginTop: '0.5rem' }}>
              <div style={{ display: 'flex', gap: '4px', height: '4px', marginBottom: '0.4rem' }}>
                {[1, 2, 3, 4].map(level => {
                  const strength = (() => {
                    let score = 0;
                    if (pass.next.length >= 8) score++;
                    if (/[0-9]/.test(pass.next)) score++;
                    if (/[A-Z]/.test(pass.next)) score++;
                    if (/[^A-Za-z0-9]/.test(pass.next)) score++;
                    return score;
                  })();
                  
                  const colors = ['#e5e7eb', '#ef4444', '#f59e0b', '#10b981', '#059669'];
                  const activeColor = level <= strength ? colors[strength] : '#e5e7eb';
                  
                  return <div key={level} style={{ flex: 1, background: activeColor, borderRadius: '2px', transition: 'all 0.3s' }} />;
                })}
              </div>
              <div style={{ fontSize: '0.7rem', color: '#6b7280', display: 'flex', justifyContent: 'space-between' }}>
                <span>Strength: {(() => {
                  const s = pass.next.length;
                  if (s === 0) return 'None';
                  let score = 0;
                  if (s >= 8) score++;
                  if (/[0-9]/.test(pass.next)) score++;
                  if (/[A-Z]/.test(pass.next)) score++;
                  if (/[^A-Za-z0-9]/.test(pass.next)) score++;
                  return ['Too Weak', 'Weak', 'Medium', 'Strong', 'Very Strong'][score];
                })()}</span>
                <span>Min 8 chars + numbers/symbols</span>
              </div>
            </div>
          )}
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', color: '#6b7280', fontSize: '0.8rem', marginBottom: '0.3rem' }}>Confirm New Password</label>
          <input 
            type="password" 
            value={pass.confirm || ''} 
            onChange={e => setPass(p => ({ ...p, confirm: e.target.value }))}
            style={{ width: '100%', boxSizing: 'border-box', padding: '0.7rem 0.9rem', background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '0.5rem', color: '#111827', fontSize: '0.9rem', outline: 'none' }} 
            autoComplete="new-password"
          />
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1.5rem' }}>
          {passMsg.text && (
            <span style={{ fontSize: '0.82rem', color: passMsg.type === 'error' ? '#ef4444' : '#10b981', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              {passMsg.type === 'success' && <ShieldCheck size={14} />} {passMsg.text}
            </span>
          )}
          <button 
            onClick={updatePassword} 
            disabled={passLoading}
            style={{ 
              marginLeft: 'auto',
              padding: '0.6rem 1.2rem', 
              background: '#111827', 
              color: 'white', 
              border: 'none', 
              borderRadius: '0.5rem', 
              fontWeight: 600, 
              cursor: 'pointer', 
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            {passLoading ? <Loader2 size={14} className="animate-spin" /> : <Lock size={14} />}
            Change Password
          </button>
        </div>
      </>)}
    </div>
  );
};

export default SiteSettings;

