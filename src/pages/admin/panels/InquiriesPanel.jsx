import React, { useState, useEffect, useCallback } from 'react';
import { getInquiries, getStats, getInquiry, updateStatus, deleteInquiry } from '../../../api/client';
import { useToast } from '../../../components/Toast';
import { RefreshCw, Search, Eye, Trash2, ChevronLeft, ChevronRight, Inbox, Mail, Clock, CheckCircle, Globe, Phone, Users, ExternalLink } from 'lucide-react';
import Modal from '../../../components/Modal';

const STATUS = {
  accepted:      { bg: 'rgba(34,197,94,0.15)',   color: '#4ade80' },
  'in progress': { bg: 'rgba(234,179,8,0.15)',   color: '#facc15' },
  working:       { bg: 'rgba(20,184,166,0.15)',  color: '#2dd4bf' },
  finished:      { bg: 'rgba(167,139,250,0.15)', color: '#a78bfa' },
};

const ALL_STATUSES = ['new', 'accepted', 'in progress', 'working', 'finished'];

const Badge = ({ s }) => { 
  const newStyle = { bg: 'rgba(59,130,246,0.15)', color: '#60a5fa' };
  const c = STATUS[s] || (s === 'new' ? newStyle : { bg: 'rgba(100,116,139,0.15)', color: '#94a3b8' }); 
  return <span style={{ padding: '0.2rem 0.55rem', borderRadius: '999px', fontSize: '0.72rem', fontWeight: 600, background: c.bg, color: c.color, textTransform: 'capitalize' }}>{s}</span>; 
};

const LIMIT = 15;

const formatId = (id) => `REQ_${String(id).padStart(3, '0')}`;

const InquiriesPanel = ({ token, admin }) => {
  const isViewer = admin?.role === 'viewer';
  const [view, setView]     = useState('list'); // list | detail
  const [items, setItems]   = useState([]);
  const [total, setTotal]   = useState(0);
  const [page, setPage]     = useState(1);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [date, setDate]     = useState('');
  const [selected, setSel]  = useState(null);
  const [stats, setStats]   = useState(null);
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await getInquiries(token, { page, limit: LIMIT, search, status: filter, date });
      setItems(r.inquiries); setTotal(r.total);
    } catch {} finally { setLoading(false); }
  }, [token, page, search, filter, date]);

  const loadStats = useCallback(async () => {
    try { setStats(await getStats(token)); } catch {}
  }, [token]);

  useEffect(() => { load(); loadStats(); }, [load, loadStats]);

  const open = async (id) => {
    try { const d = await getInquiry(token, id); setSel(d); setView('detail'); loadStats(); } catch {}
  };

  const changeStatus = async (id, s, e) => {
    if (e) { e.stopPropagation(); e.preventDefault(); }
    try {
      const res = await updateStatus(token, id, s);
      const finishedAt = res.finished_at;

      setSel(prev => prev ? { ...prev, status: s, finished_at: finishedAt } : prev);
      setItems(prev => prev.map(item => item.id === id ? { ...item, status: s, finished_at: finishedAt } : item));
      loadStats();
      
      if (s) {
        addToast(`Status updated to ${s}. Notification email sent to client and admin.`, 'success');
      }
    } catch (err) {
      addToast('Failed to update status.', 'error');
      console.error('Status update failed:', err);
    }
  };

  const del = async (id) => {
    if (!confirm('Delete inquiry?')) return;
    try {
      await deleteInquiry(token, id);
      addToast('Inquiry moved to trash. Notification sent to client.', 'info');
      if (view === 'detail') setView('list');
      load(); loadStats();
    } catch {
      addToast('Failed to delete inquiry.', 'error');
    }
  };

  const inp = { padding: '0.6rem 0.75rem 0.6rem 2rem', background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '0.5rem', color: '#111827', fontSize: '0.85rem', outline: 'none', width: '100%', boxSizing: 'border-box' };

  return (
    <div className="admin-content" style={{ padding: '2rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {view === 'detail' && selected && (
        <Modal 
          onClose={() => { setView('list'); setSel(null); }} 
          title={`Inquiry Details - ${formatId(selected.id)}`}
          maxWidth="1000px"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Header / Actions */}
            <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#111827' }}>{selected.first_name} {selected.last_name}</h3>
                  <Badge s={selected.status}/>
                </div>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Received on {new Date(selected.created_at).toLocaleString()}</div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', background: '#ffffff', padding: '0.4rem', borderRadius: '0.6rem', border: '1px solid #e2e8f0', opacity: isViewer ? 0.7 : 1 }}>
                {ALL_STATUSES.map(s => (
                  <button key={s} disabled={isViewer} onClick={() => changeStatus(selected.id, s)} style={{ padding: '0.35rem 0.75rem', borderRadius: '0.4rem', border: 'none', background: selected.status === s ? '#00b37a' : 'transparent', color: selected.status === s ? '#fff' : '#64748b', cursor: isViewer ? 'not-allowed' : 'pointer', fontSize: '0.75rem', fontWeight: 600, transition: 'all 0.2s' }}>{s}</button>
                ))}
              </div>
            </div>

            {/* Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
              <div style={{ border: '1px solid #e5e7eb', borderRadius: '0.75rem', padding: '1.25rem' }}>
                <h4 style={{ margin: '0 0 1rem', fontSize: '0.85rem', textTransform: 'uppercase', color: '#94a3b8', letterSpacing: '0.05em' }}>Contact Information</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                  <div style={{ display: 'flex', gap: '0.75rem' }}><Mail size={16} color="#64748b"/><span style={{ fontSize: '0.9rem' }}>{selected.email}</span></div>
                  <div style={{ display: 'flex', gap: '0.75rem' }}><Phone size={16} color="#64748b"/><span style={{ fontSize: '0.9rem' }}>{selected.phone}</span></div>
                  <div style={{ display: 'flex', gap: '0.75rem' }}><Globe size={16} color="#64748b"/><span style={{ fontSize: '0.9rem' }}>{selected.location || 'N/A'}</span></div>
                  <div style={{ display: 'flex', gap: '0.75rem' }}><Users size={16} color="#64748b"/><span style={{ fontSize: '0.9rem' }}>{selected.company || 'N/A'}</span></div>
                </div>
              </div>
              <div style={{ border: '1px solid #e5e7eb', borderRadius: '0.75rem', padding: '1.25rem' }}>
                <h4 style={{ margin: '0 0 1rem', fontSize: '0.85rem', textTransform: 'uppercase', color: '#94a3b8', letterSpacing: '0.05em' }}>Service Requirements</h4>
                <div style={{ marginBottom: '0.75rem' }}><div style={{ fontSize: '0.75rem', color: '#64748b' }}>Main Service</div><div style={{ fontSize: '0.95rem', fontWeight: 600 }}>{selected.service}</div></div>
                {selected.sub_services?.length > 0 && (
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.4rem' }}>Sub-services</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                      {selected.sub_services.map(s => <span key={s} style={{ fontSize: '0.75rem', background: '#f3f4f6', padding: '0.2rem 0.5rem', borderRadius: '0.3rem' }}>{s}</span>)}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {selected.message && (
              <div style={{ border: '1px solid #e5e7eb', borderRadius: '0.75rem', padding: '1.25rem' }}>
                <h4 style={{ margin: '0 0 0.75rem', fontSize: '0.85rem', textTransform: 'uppercase', color: '#94a3b8', letterSpacing: '0.05em' }}>Message</h4>
                <div style={{ fontSize: '0.95rem', lineHeight: 1.6, color: '#374151', whiteSpace: 'pre-wrap', background: '#f9fafb', padding: '1rem', borderRadius: '0.5rem' }}>{selected.message}</div>
              </div>
            )}

            {!isViewer && <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #e5e7eb' }}>
              <button onClick={() => del(selected.id)} style={{ padding: '0.6rem 1.2rem', borderRadius: '0.5rem', border: 'none', background: '#fee2e2', color: '#ef4444', fontWeight: 600, cursor: 'pointer' }}>Delete Inquiry</button>
            </div>}
          </div>
        </Modal>
      )}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
        <h2 style={{ color: '#111827', margin: 0 }}>Inquiries <span style={{ color: '#6b7280', fontSize: '1rem' }}>({total})</span></h2>
        <button onClick={load} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: '#ffffff', border: 'none', borderRadius: '0.5rem', color: '#6b7280', padding: '0.5rem 0.9rem', cursor: 'pointer', fontSize: '0.85rem' }}>
          <RefreshCw size={14}/> Refresh
        </button>
      </div>

      {/* Mini stats */}
      {stats && (
        <div className="admin-stat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.6rem' }}>
          {[
            ['Total', stats.total, '#6366f1', Inbox], 
            ['New', stats.new, '#3b82f6', Mail],
            ['Accepted', stats.accepted, '#22c55e', CheckCircle],
            ['In Progress', stats.progress, '#eab308', Clock],
            ['Finished', stats.finished, '#a78bfa', RefreshCw],
            ['Working', stats.working, '#2dd4bf', Globe],
            ['Deleted', stats.deleted, '#f87171', Trash2]
          ].map(([l, v, c, Icon]) => (
            <div key={l} style={{ padding: '0.75rem', background: '#ffffff', borderRadius: '0.6rem', display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
              <Icon size={16} color={c}/><div><div style={{ color: '#111827', fontWeight: 700 }}>{v || 0}</div><div style={{ color: '#6b7280', fontSize: '0.7rem' }}>{l}</div></div>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 180 }}>
          <Search size={13} style={{ position: 'absolute', left: '0.6rem', top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }}/>
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search…" style={inp}/>
        </div>
        <input 
          type="date" 
          value={date} 
          onChange={e => { setDate(e.target.value); setPage(1); }} 
          style={{ ...inp, width: 'auto', paddingLeft: '0.75rem', color: date ? '#111827' : '#6b7280' }}
        />
        <select value={filter} onChange={e => { setFilter(e.target.value); setPage(1); }} style={{ ...inp, width: 'auto', paddingLeft: '0.75rem' }}>
          <option value="all">All Status</option>
          <option value="new">New</option>
          {Object.keys(STATUS).map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
          <option value="archived">Archived</option>
        </select>
        {(search || filter !== 'all' || date) && (
          <button 
            onClick={() => { setSearch(''); setFilter('all'); setDate(''); setPage(1); }}
            style={{ background: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: '0.5rem', padding: '0 0.8rem', color: '#374151', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 500 }}
          >
            Clear
          </button>
        )}
      </div>

      {loading ? <div style={{ color: '#6b7280', textAlign: 'center', padding: '3rem' }}>Loading…</div> :
        items.length === 0 ? <div style={{ color: '#6b7280', textAlign: 'center', padding: '3rem', background: '#ffffff', borderRadius: '0.75rem' }}>No inquiries found.</div> :
        <div className="table-container">
          <table className="admin-table">
            <thead><tr style={{ borderBottom: '1px solid #e5e7eb' }}>
              {['ID','Name','Email','Company','Location','Service','Sub Service','Message','Requested Date','Finished Date','Status','Updated By','Action',''].map(h => <th key={h} style={{ padding: '0.7rem 0.9rem', color: '#6b7280', fontSize: '0.72rem', fontWeight: 600, textAlign: 'left', textTransform: 'uppercase' }}>{h}</th>)}
            </tr></thead>
            <tbody>{items.map(q => (
              <tr key={q.id} onClick={() => open(q.id)} style={{ borderBottom: '1px solid #e5e7eb', cursor: 'pointer' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <td style={{ padding: '0.75rem 0.9rem', color: '#6b7280', fontSize: '0.8rem' }}>{formatId(q.id)}</td>
                <td style={{ padding: '0.75rem 0.9rem', color: '#111827', fontWeight: q.status === 'new' ? 600 : 400, fontSize: '0.88rem' }}>{q.first_name} {q.last_name}</td>
                <td style={{ padding: '0.75rem 0.9rem', color: '#6b7280', fontSize: '0.83rem' }}>{q.email}</td>
                <td style={{ padding: '0.75rem 0.9rem', color: '#6b7280', fontSize: '0.83rem' }}>{q.company || '—'}</td>
                <td style={{ padding: '0.75rem 0.9rem', color: '#6b7280', fontSize: '0.83rem' }}>{q.location || '—'}</td>
                <td style={{ padding: '0.75rem 0.9rem', color: '#6b7280', fontSize: '0.83rem', maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{q.service}</td>
                <td style={{ padding: '0.75rem 0.9rem', color: '#6b7280', fontSize: '0.83rem', maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{q.sub_services?.join(', ') || '—'}</td>
                <td style={{ padding: '0.75rem 0.9rem', color: '#6b7280', fontSize: '0.83rem', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{q.message || '—'}</td>
                <td style={{ padding: '0.75rem 0.9rem', color: '#6b7280', fontSize: '0.78rem' }}>{new Date(q.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</td>
                <td style={{ padding: '0.75rem 0.9rem', color: '#6b7280', fontSize: '0.78rem' }}>{q.finished_at ? new Date(q.finished_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : '—'}</td>
                <td style={{ padding: '0.75rem 0.9rem' }}><Badge s={q.status}/></td>
                <td style={{ padding: '0.75rem 0.9rem' }}>
                  <div style={{ fontSize: '0.75rem', color: '#111827', fontWeight: 500 }}>{q.updated_by || '—'}</div>
                </td>
                <td style={{ padding: '0.75rem 0.9rem' }} onClick={e => e.stopPropagation()}>
                  <select 
                    value={q.status} 
                    disabled={isViewer}
                    onChange={(e) => changeStatus(q.id, e.target.value, e)}
                    onClick={e => e.stopPropagation()}
                    style={{ padding: '0.2rem 0.4rem', fontSize: '0.75rem', borderRadius: '0.4rem', border: '1px solid #e5e7eb', outline: 'none', cursor: isViewer ? 'not-allowed' : 'pointer', background: '#f9fafb', color: '#111827' }}
                  >
                    {ALL_STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                  </select>
                </td>
                <td style={{ padding: '0.75rem 0.9rem' }} onClick={e => e.stopPropagation()}>
                  {!isViewer && <button onClick={() => del(q.id)} style={{ background: 'rgba(239,68,68,0.1)', border: 'none', borderRadius: '0.4rem', color: '#f87171', padding: '0.35rem 0.6rem', cursor: 'pointer' }}><Trash2 size={13}/></button>}
                </td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      }
      {total > LIMIT && (
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', alignItems: 'center' }}>
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{ background: '#ffffff', border: 'none', borderRadius: '0.4rem', color: '#111827', padding: '0.45rem 0.7rem', cursor: 'pointer', opacity: page === 1 ? 0.4 : 1 }}><ChevronLeft size={15}/></button>
          <span style={{ color: '#6b7280', fontSize: '0.82rem' }}>Page {page} of {Math.ceil(total / LIMIT)}</span>
          <button onClick={() => setPage(p => p + 1)} disabled={page >= Math.ceil(total / LIMIT)} style={{ background: '#ffffff', border: 'none', borderRadius: '0.4rem', color: '#111827', padding: '0.45rem 0.7rem', cursor: 'pointer', opacity: page >= Math.ceil(total / LIMIT) ? 0.4 : 1 }}><ChevronRight size={15}/></button>
        </div>
      )}
    </div>
  );
};

export default InquiriesPanel;

