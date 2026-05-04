import React, { useState, useEffect } from 'react';
import { getStats, changePassword } from '../../api/client';
import { useToast } from '../../components/Toast';
import Modal from '../../components/Modal';
import SiteSettings  from './panels/SiteSettings';
import BlogManager   from './panels/BlogManager';
import TeamManager   from './panels/TeamManager';
import InquiriesPanel from './panels/InquiriesPanel';

import ProjectManager from './panels/ProjectManager';
import ServicesManager from './panels/ServicesManager';
import BrandManager   from './panels/BrandManager';
import ClientManager  from './panels/ClientManager';
import CertificatesPanel from './panels/CertificatesPanel';
import LogsManager    from './panels/LogsManager';
import {
  LayoutDashboard, Settings, FileText, Users, Inbox,
  LogOut, ChevronDown, ChevronRight, ExternalLink,
  Mail, Globe, Folder, Briefcase, Award, CheckCircle, Shield
} from 'lucide-react';

const ACCENT = '#00b37a';

// Static navigation moved into component for better reactivity

// ── Mini stat card ──────────────────────────────────────────────────────────
const Stat = ({ label, value, color, icon: Icon }) => (
  <div style={{ padding: '1.25rem', background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', gap: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
    <div style={{ width: 44, height: 44, borderRadius: '0.6rem', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <Icon size={20} color="white"/>
    </div>
    <div>
      <div style={{ color: '#111827', fontSize: '1.5rem', fontWeight: 700, lineHeight: 1 }}>{value ?? '—'}</div>
      <div style={{ color: '#6b7280', fontSize: '0.78rem', marginTop: '0.2rem' }}>{label}</div>
    </div>
  </div>
);

// ── Dashboard home ──────────────────────────────────────────────────────────
const DashboardHome = ({ token, setActive, admin }) => {
  const [stats, setStats] = useState(null);
  useEffect(() => { getStats(token).then(setStats).catch(() => {}); }, [token]);

  return (
    <div style={{ padding: '2rem', overflowY: 'auto' }}>
      <h2 style={{ color: '#111827', margin: '0 0 0.25rem', fontSize: '1.4rem' }}>Dashboard</h2>
      <p style={{ color: '#6b7280', margin: '0 0 2rem', fontSize: '0.9rem' }}>Welcome back! Here's what's happening on your website.</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', marginBottom: '2rem' }}>
        <Stat label="Total Inquiries" value={stats?.total}    color="linear-gradient(135deg,#6366f1,#4f46e5)" icon={Inbox}/>
        <Stat label="New Inquiries"   value={stats?.new}      color="linear-gradient(135deg,#3b82f6,#2563eb)" icon={Mail}/>
        <Stat label="Resolved"        value={stats?.finished} color="linear-gradient(135deg,#22c55e,#16a34a)" icon={CheckCircle}/>
      </div>

      {/* Quick actions */}
      <h3 style={{ color: '#6b7280', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 0.75rem' }}>Quick Actions</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.6rem', marginBottom: '2rem' }}>
        {[
          { label: 'Manage Inquiries', icon: Inbox,     id: 'inquiries' },
          { label: 'Write Blog Post',  icon: FileText,  id: 'blog' },
          ...(admin?.email === 'gedu0194@gmail.com' ? [{ label: 'Edit Team', icon: Users, id: 'team' }] : []),
          { label: 'Manage Projects',  icon: Folder,    id: 'projects' },

          { label: 'Site Settings',    icon: Settings,  id: 'settings' },
        ].map(item => (
          <button key={item.id} onClick={() => setActive(item.id)} style={{
            display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.9rem 1rem',
            background: '#ffffff', border: '1px solid #e5e7eb',
            borderRadius: '0.6rem', color: '#374151', cursor: 'pointer',
            fontSize: '0.88rem', fontWeight: 500, textAlign: 'left', transition: 'border-color 0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
          }} onMouseEnter={e => e.currentTarget.style.borderColor = ACCENT} onMouseLeave={e => e.currentTarget.style.borderColor = '#e5e7eb'}>
            <item.icon size={18} color={ACCENT}/> {item.label}
          </button>
        ))}
      </div>

      {/* View website link */}
      <a href="/" target="_blank" rel="noopener noreferrer" style={{
        display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.2rem',
        background: 'rgba(0,179,122,0.1)', border: '1px solid rgba(0,179,122,0.3)',
        borderRadius: '0.5rem', color: ACCENT, fontSize: '0.88rem', fontWeight: 600, textDecoration: 'none',
      }}>
        <Globe size={15}/> View Live Website <ExternalLink size={13}/>
      </a>
    </div>
  );
};

// ── Main CMS Dashboard ──────────────────────────────────────────────────────
const AdminDashboard = ({ token, admin, onLogout }) => {
  const [active, setActive] = useState('dashboard');
  const [stats, setStats]   = useState(null);
  const [mustChange, setMustChange] = useState(!!admin?.mustChangePassword);
  const [passForm, setPassForm] = useState({ current: '', new: '', confirm: '' });
  const [changing, setChanging] = useState(false);
  const { addToast } = useToast();

  const isSuper = admin?.email === 'gedu0194@gmail.com';
  console.log('[Auth Debug] Admin:', admin?.email, 'isSuper:', isSuper, 'Role:', admin?.role);

  const baseNav = [
    { id: 'dashboard',  label: 'Dashboard',     icon: LayoutDashboard },
    { id: 'inquiries',  label: 'Inquiries',      icon: Inbox,  badge: true },
    { id: 'blog',       label: 'Blog Posts',     icon: FileText },
    { id: 'projects',   label: 'Projects',       icon: Folder },
    { id: 'brands',     label: 'Brands/Partners',icon: Award },
    { id: 'clients',    label: 'Our Clients',    icon: Briefcase },
    { id: 'certificates', label: 'Certificates',  icon: Award },
    { id: 'settings',   label: 'Site Settings',  icon: Settings },
  ];

  const superNav = [
    { id: 'team',       label: 'Team Members',   icon: Users },
    { id: 'logs',       label: 'Activity Logs',  icon: Shield },
  ];

  // If super, put them right after dashboard for maximum visibility
  const allNavItems = isSuper 
    ? [baseNav[0], ...superNav, ...baseNav.slice(1)] 
    : baseNav;

  useEffect(() => { getStats(token).then(setStats).catch(() => {}); }, [token, active]);

  const handleForceChange = async (e) => {
    e.preventDefault();
    if (passForm.new !== passForm.confirm) return addToast('Passwords do not match', 'error');
    if (passForm.new.length < 8) return addToast('New password must be at least 8 characters', 'error');
    
    setChanging(true);
    try {
      await changePassword(token, passForm.current, passForm.new);
      addToast('Password updated! You can now access the portal.', 'success');
      setMustChange(false);
    } catch (err) { addToast(err.message, 'error'); }
    finally { setChanging(false); }
  };

  const panels = {
    dashboard: <DashboardHome token={token} setActive={setActive} admin={admin}/>,
    inquiries: <InquiriesPanel token={token} admin={admin}/>,
    blog:      <BlogManager token={token} admin={admin}/>,
    team:      <TeamManager token={token} admin={admin}/>,
    projects:  <ProjectManager token={token} admin={admin}/>,
    services:  <ServicesManager token={token} admin={admin}/>,
    brands:    <BrandManager token={token} admin={admin}/>,
    clients:   <ClientManager token={token} admin={admin}/>,
    certificates: <CertificatesPanel token={token} admin={admin}/>,
    logs:      <LogsManager token={token} admin={admin}/>,

    settings:  <SiteSettings token={token} admin={admin}/>,
  };

  if (mustChange) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0f', padding: '2rem' }}>
      <div style={{ width: '100%', maxWidth: '400px', background: '#fff', borderRadius: '1.25rem', padding: '2.5rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ width: 64, height: 64, background: 'rgba(0,179,122,0.1)', color: ACCENT, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
            <Shield size={32} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#111827', margin: '0 0 0.5rem' }}>Update Password</h2>
          <p style={{ color: '#6b7280', fontSize: '0.9rem', lineHeight: 1.5 }}>You are using a temporary password. For security, please choose a new one to continue.</p>
        </div>

        <form onSubmit={handleForceChange} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#374151', marginBottom: '0.4rem' }}>Temporary Password</label>
            <input type="password" required value={passForm.current} onChange={e => setPassForm({...passForm, current: e.target.value})} style={{ width: '100%', boxSizing: 'border-box', padding: '0.85rem 1rem', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '0.75rem', outline: 'none' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#374151', marginBottom: '0.4rem' }}>New Password</label>
            <input type="password" required value={passForm.new} onChange={e => setPassForm({...passForm, new: e.target.value})} placeholder="Min 8 characters" style={{ width: '100%', boxSizing: 'border-box', padding: '0.85rem 1rem', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '0.75rem', outline: 'none' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#374151', marginBottom: '0.4rem' }}>Confirm New Password</label>
            <input type="password" required value={passForm.confirm} onChange={e => setPassForm({...passForm, confirm: e.target.value})} style={{ width: '100%', boxSizing: 'border-box', padding: '0.85rem 1rem', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '0.75rem', outline: 'none' }} />
          </div>

          <button type="submit" disabled={changing} style={{
            marginTop: '0.5rem', padding: '1rem', background: changing ? '#9ca3af' : `linear-gradient(135deg, ${ACCENT}, #009966)`,
            color: '#fff', border: 'none', borderRadius: '0.75rem', fontWeight: 700, cursor: changing ? 'not-allowed' : 'pointer', fontSize: '1rem',
            boxShadow: '0 10px 15px -3px rgba(0, 179, 122, 0.3)'
          }}>
            {changing ? 'Updating...' : 'Update & Continue'}
          </button>
          
          <button type="button" onClick={onLogout} style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', marginTop: '0.5rem' }}>
            Cancel & Sign Out
          </button>
        </form>
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#f3f4f6', fontFamily: "'Inter','Segoe UI',sans-serif", color: '#111827', overflow: 'hidden' }}>
      
      {/* ── Top Navigation Bar ── */}
      <header className="admin-header" style={{ background: '#ffffff', borderBottom: '1px solid #e5e7eb', padding: '1rem 1.5rem 0 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', flexShrink: 0 }}>
        {/* Top row: Logo and User actions */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <img src="/images/hexagon-logo.png" alt="Hexagon Logo" style={{ height: '32px', objectFit: 'contain' }} />
            <div style={{ color: '#6b7280', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', borderLeft: '1px solid #e5e7eb', paddingLeft: '1rem' }}>CMS Administrator</div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
              <div style={{ color: '#111827', fontSize: '0.85rem', fontWeight: 700 }}>{admin?.email}</div>
              <div style={{ 
                fontSize: '0.65rem', 
                fontWeight: 800, 
                textTransform: 'uppercase', 
                padding: '0.1rem 0.5rem', 
                borderRadius: '4px', 
                marginTop: '0.2rem',
                background: admin?.role === 'viewer' ? 'rgba(59,130,246,0.1)' : 'rgba(0,179,122,0.1)',
                color: admin?.role === 'viewer' ? '#3b82f6' : '#00b37a',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem'
              }}>
                <Shield size={10} />
                {admin?.isSuper ? 'Main Administrator' : (admin?.role === 'viewer' ? 'View Only Access' : 'Administrator Access')}
              </div>
            </div>
            <button onClick={onLogout} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.45rem 0.9rem', borderRadius: '0.5rem', border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.05)', color: '#ef4444', fontSize: '0.85rem', cursor: 'pointer', fontWeight: 500 }}>
              <LogOut size={15}/> Sign Out
            </button>
          </div>
        </div>

        {/* Bottom row: Navigation Links */}
        <nav className="admin-nav" style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', scrollbarWidth: 'none', paddingBottom: '0.5rem' }}>
          {allNavItems.map(item => {
            const isActive = active === item.id;
            return (
              <button key={item.id} onClick={() => setActive(item.id)} style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.55rem 0.9rem',
                borderRadius: '0.5rem', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap',
                background: isActive ? 'rgba(0,179,122,0.1)' : 'transparent',
                color: isActive ? ACCENT : '#4b5563',
                fontWeight: isActive ? 600 : 500, fontSize: '0.88rem',
                boxShadow: isActive ? `inset 0 -2px 0 ${ACCENT}` : 'none',
                transition: 'all 0.2s'
              }}>
                {(() => {
                  const NavIcon = item.icon;
                  return <NavIcon size={16} />;
                })()}
                <span>{item.label}</span>
                {item.badge && stats?.new > 0 && (
                  <span style={{ background: '#3b82f6', color: 'white', borderRadius: '999px', fontSize: '0.65rem', fontWeight: 700, padding: '0.1rem 0.4rem', marginLeft: '0.2rem' }}>{stats.new}</span>
                )}
              </button>
            );
          })}
          <div style={{ width: '1px', background: '#e5e7eb', margin: '0 0.25rem' }}></div>
          <a href="/" target="_blank" rel="noopener noreferrer" style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.55rem 0.9rem',
            borderRadius: '0.5rem', border: '1px solid rgba(0,179,122,0.3)', cursor: 'pointer', whiteSpace: 'nowrap',
            background: 'rgba(0,179,122,0.1)', color: ACCENT, fontWeight: 600, fontSize: '0.88rem', textDecoration: 'none'
          }}>
            <Globe size={15}/> <span>View Live Site</span>
          </a>
        </nav>
      </header>

      {/* ── Main Content ── */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Panel */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {panels[active]}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
