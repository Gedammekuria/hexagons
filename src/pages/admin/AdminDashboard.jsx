import React, { useState, useEffect } from 'react';
import { getStats } from '../../api/client';
import SiteSettings  from './panels/SiteSettings';
import BlogManager   from './panels/BlogManager';
import TeamManager   from './panels/TeamManager';
import InquiriesPanel from './panels/InquiriesPanel';
import PageEditor     from './panels/PageEditor';
import ProjectManager from './panels/ProjectManager';
import ServicesManager from './panels/ServicesManager';
import BrandManager   from './panels/BrandManager';
import ClientManager  from './panels/ClientManager';
import {
  LayoutDashboard, Settings, FileText, Users, Inbox,
  LogOut, ChevronDown, ChevronRight, Bell, ExternalLink,
  Mail, TrendingUp, Globe, Layers, Folder, Briefcase, Award, CheckCircle
} from 'lucide-react';

const ACCENT = '#00b37a';

const nav = [
  { id: 'dashboard',  label: 'Dashboard',     icon: LayoutDashboard },
  { id: 'inquiries',  label: 'Inquiries',      icon: Inbox,  badge: true },
  { id: 'blog',       label: 'Blog Posts',     icon: FileText },
  { id: 'team',       label: 'Team Members',   icon: Users },
  { id: 'projects',   label: 'Projects',       icon: Folder },
  { id: 'brands',     label: 'Brands/Partners',icon: Award },
  { id: 'clients',    label: 'Our Clients',    icon: Briefcase },
  { id: 'pages',      label: 'Page Content',   icon: Layers },
  { id: 'settings',   label: 'Site Settings',  icon: Settings },
];

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
const DashboardHome = ({ token, setActive }) => {
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
          { label: 'Edit Team',        icon: Users,     id: 'team' },
          { label: 'Manage Projects',  icon: Folder,    id: 'projects' },
          { label: 'Edit Page Text',   icon: Layers,    id: 'pages' },
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

  useEffect(() => { getStats(token).then(setStats).catch(() => {}); }, [token, active]);

  const panels = {
    dashboard: <DashboardHome token={token} setActive={setActive}/>,
    inquiries: <InquiriesPanel token={token}/>,
    blog:      <BlogManager token={token}/>,
    team:      <TeamManager token={token}/>,
    projects:  <ProjectManager token={token}/>,
    services:  <ServicesManager token={token}/>,
    brands:    <BrandManager token={token}/>,
    clients:   <ClientManager token={token}/>,
    pages:     <PageEditor token={token}/>,
    settings:  <SiteSettings token={token}/>,
  };

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
            <div style={{ color: '#374151', fontSize: '0.85rem', fontWeight: 600 }}>{admin?.email}</div>
            <button onClick={onLogout} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.45rem 0.9rem', borderRadius: '0.5rem', border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.05)', color: '#ef4444', fontSize: '0.85rem', cursor: 'pointer', fontWeight: 500 }}>
              <LogOut size={15}/> Sign Out
            </button>
          </div>
        </div>

        {/* Bottom row: Navigation Links */}
        <nav className="admin-nav" style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', scrollbarWidth: 'none', paddingBottom: '0.5rem' }}>
          {nav.map(item => {
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
