import React, { useState, useEffect } from 'react';
import { getAllTeam, createMember, updateMember, deleteMember, uploadImage } from '../../../api/client';
import { Plus, Edit2, Trash2, Save, X, Loader2, Search, RefreshCw } from 'lucide-react';
import { useToast } from '../../../components/Toast';

const STATUS_CONFIG = {
  official:    { label: 'Official',    bg: 'rgba(34,197,94,0.12)',  color: '#16a34a', dot: '#22c55e' },
  probation:   { label: 'Probation',   bg: 'rgba(234,179,8,0.12)',  color: '#b45309', dot: '#eab308' },
  terminated:  { label: 'Terminated',  bg: 'rgba(239,68,68,0.12)',  color: '#dc2626', dot: '#ef4444' },
};

const StatusBadge = ({ status }) => {
  const c = STATUS_CONFIG[status] || STATUS_CONFIG.official;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.15rem 0.55rem', borderRadius: '999px', background: c.bg, fontSize: '0.7rem', fontWeight: 700, color: c.color }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: c.dot, display: 'inline-block' }}></span>
      {c.label}
    </span>
  );
};

const EMPTY = { name: '', role: '', bio: '', image: '', email: '', linkedin: '', sort_order: 0, active: true, status: 'official' };
const inp = { width: '100%', boxSizing: 'border-box', padding: '0.7rem 0.9rem', background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '0.5rem', color: '#111827', fontSize: '0.9rem', outline: 'none' };
const LIMIT = 15;

const TeamManager = ({ token }) => {
  const [members, setMembers] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm]       = useState(EMPTY);
  const [saving, setSaving]   = useState(false);
  const [loading, setLoading] = useState(false);
  const [search, setSearch]   = useState('');
  const [filter, setFilter]   = useState('all');
  const [date, setDate]       = useState('');
  const [page, setPage]       = useState(1);
  const [msg, setMsg]         = useState('');
  const { addToast }          = useToast();

  const load = async () => {
    setLoading(true);
    try { 
      const d = await getAllTeam(token); 
      setMembers(d); 
    } catch {} 
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));
  const openNew  = () => { setForm(EMPTY); setEditing('new'); };
  const openEdit = (m) => { setForm({ ...m, active: m.active === 1 || m.active === true, status: m.status || 'official' }); setEditing(m.id); };
  const cancel   = () => { setEditing(null); setMsg(''); };

  const save = async () => {
    setSaving(true); setMsg('');
    try {
      if (editing === 'new') await createMember(token, form);
      else await updateMember(token, editing, form);
      addToast(editing === 'new' ? 'Member added!' : 'Member updated!', 'success');
      await load(); cancel();
    } catch (e) { addToast('Error: ' + e.message, 'error'); }
    finally { setSaving(false); }
  };

  const del = async (id) => {
    if (!confirm('Remove this team member?')) return;
    try {
      await deleteMember(token, id); 
      addToast('Member removed', 'success');
      load();
    } catch (e) { addToast('Delete failed: ' + e.message, 'error'); }
  };

  const filteredMembers = members.filter(m => {
    const matchesSearch = !search || 
      m.name.toLowerCase().includes(search.toLowerCase()) || 
      m.role.toLowerCase().includes(search.toLowerCase()) ||
      (m.email && m.email.toLowerCase().includes(search.toLowerCase()));
    
    const matchesStatus = filter === 'all' || m.status === filter;

    const matchesDate = !date || (m.created_at && new Date(m.created_at).toISOString().split('T')[0] === date);
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  const totalPages = Math.ceil(filteredMembers.length / LIMIT);
  const paginatedMembers = filteredMembers.slice((page - 1) * LIMIT, page * LIMIT);

  const fmtDate = (d) => d ? new Date(d).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : '—';
  
  useEffect(() => { setPage(1); }, [search, filter, date]);

  if (editing !== null) return (
    <div style={{ padding: '2rem', overflowY: 'auto', maxWidth: 600 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <h2 style={{ color: '#111827', margin: 0 }}>{editing === 'new' ? 'Add Team Member' : 'Edit Member'}</h2>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {msg && <span style={{ color: msg.startsWith('E') ? '#f87171' : '#4ade80', fontSize: '0.85rem' }}>{msg}</span>}
          <button onClick={cancel} style={{ background: '#ffffff', border: 'none', borderRadius: '0.5rem', color: '#6b7280', padding: '0.5rem 0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}><X size={15}/> Cancel</button>
          <button onClick={save} disabled={saving} style={{ background: 'linear-gradient(135deg,#00b37a,#009966)', border: 'none', borderRadius: '0.5rem', color: '#fff', padding: '0.5rem 1rem', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            {saving ? <Loader2 size={14}/> : <Save size={14}/>} {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>

      {[['Full Name', 'name'], ['Job Title / Role', 'role'], ['Email', 'email'], ['LinkedIn URL', 'linkedin'], ['Display Order', 'sort_order']].map(([label, key]) => (
        <div key={key} style={{ marginBottom: '0.9rem' }}>
          <label style={{ display: 'block', color: '#6b7280', fontSize: '0.78rem', marginBottom: '0.3rem' }}>{label}</label>
          <input type={key === 'sort_order' ? 'number' : 'text'} value={form[key] || ''} onChange={e => set(key, e.target.value)} style={inp} />
        </div>
      ))}

      <div style={{ marginBottom: '0.9rem' }}>
        <label style={{ display: 'block', color: '#6b7280', fontSize: '0.78rem', marginBottom: '0.3rem' }}>Employment Status</label>
        <select value={form.status || 'official'} onChange={e => set('status', e.target.value)} style={inp}>
          <option value="official">Official</option>
          <option value="probation">Probation</option>
          <option value="terminated">Terminated</option>
        </select>
      </div>

      <div style={{ marginBottom: '0.9rem' }}>
        <label style={{ display: 'block', color: '#6b7280', fontSize: '0.78rem', marginBottom: '0.3rem' }}>Photo URL or Upload</label>
        {form.image && (
          <div style={{ marginBottom: '0.5rem' }}>
            <img 
              src={form.image.startsWith('http') ? form.image : (form.image.startsWith('/images') ? form.image : `${form.image}`)} 
              alt="Preview" 
              style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', border: '1px solid #e5e7eb' }} 
            />
          </div>
        )}
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <input type="text" value={form.image || ''} onChange={e => set('image', e.target.value)} style={{ ...inp, flex: 1 }} placeholder="Image URL..." />
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1rem', background: '#ffffff', border: '1px dashed #00b37a', borderRadius: '0.5rem', cursor: 'pointer', color: '#00b37a', whiteSpace: 'nowrap' }}>
            <Plus size={16} />
            <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Upload Photo</span>
            <input type="file" accept="image/*" onChange={async (e) => {
              const file = e.target.files[0];
              if (!file) return;
              setMsg('Uploading photo...');
              try {
                const res = await uploadImage(token, file);
                set('image', res.url);
                setMsg('Photo uploaded!');
                setTimeout(() => setMsg(''), 2000);
              } catch (err) { setMsg('Upload failed: ' + err.message); }
            }} style={{ display: 'none' }} />
          </label>
        </div>
      </div>

      <div style={{ marginBottom: '0.9rem' }}>
        <label style={{ display: 'block', color: '#6b7280', fontSize: '0.78rem', marginBottom: '0.3rem' }}>Bio</label>
        <textarea rows={4} value={form.bio || ''} onChange={e => set('bio', e.target.value)} style={{ ...inp, resize: 'vertical', fontFamily: 'inherit' }} />
      </div>

      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: '#6b7280', fontSize: '0.9rem' }}>
        <input type="checkbox" checked={!!form.active} onChange={e => set('active', e.target.checked)} /> Show on website
      </label>
    </div>
  );

  return (
    <div className="admin-content" style={{ padding: '2rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
        <h2 style={{ color: '#111827', margin: 0 }}>Team Members <span style={{ color: '#6b7280', fontSize: '1rem' }}>({members.length})</span></h2>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={load} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: '#ffffff', border: 'none', borderRadius: '0.5rem', color: '#6b7280', padding: '0.5rem 0.9rem', cursor: 'pointer', fontSize: '0.85rem' }}>
            <RefreshCw size={14}/> Refresh
          </button>
          <button onClick={openNew} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', background: 'linear-gradient(135deg,#00b37a,#009966)', border: 'none', borderRadius: '0.5rem', color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem' }}>
            <Plus size={16}/> Add Member
          </button>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 180 }}>
          <Search size={13} style={{ position: 'absolute', left: '0.6rem', top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }}/>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search members by name, role or email..." style={{ ...inp, paddingLeft: '2rem', fontSize: '0.85rem' }}/>
        </div>
        <input 
          type="date" 
          value={date} 
          onChange={e => setDate(e.target.value)} 
          style={{ ...inp, width: 'auto', paddingLeft: '0.75rem', fontSize: '0.85rem', color: date ? '#111827' : '#6b7280' }}
        />
        <select value={filter} onChange={e => setFilter(e.target.value)} style={{ ...inp, width: 'auto', paddingLeft: '0.75rem', fontSize: '0.85rem' }}>
          <option value="all">All Status</option>
          {Object.keys(STATUS_CONFIG).map(s => <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>)}
        </select>
        {(search || filter !== 'all' || date) && (
          <button 
            onClick={() => { setSearch(''); setFilter('all'); setDate(''); }}
            style={{ background: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: '0.5rem', padding: '0 0.8rem', color: '#374151', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 500 }}
          >
            Clear
          </button>
        )}
      </div>

      {loading ? <div style={{ color: '#6b7280', textAlign: 'center', padding: '3rem' }}>Loading…</div> :
        filteredMembers.length === 0 ? <div style={{ color: '#6b7280', textAlign: 'center', padding: '3rem', background: '#ffffff', borderRadius: '0.75rem' }}>No team members found.</div> :
        <div className="table-container">
          <table className="admin-table">
            <thead><tr style={{ borderBottom: '1px solid #e5e7eb' }}>
              {['ID', 'Photo', 'Name', 'Role', 'Email', 'Status', 'Registered', 'Order', 'Visibility', 'Action'].map(h => <th key={h} style={{ padding: '0.7rem 0.9rem', color: '#6b7280', fontSize: '0.72rem', fontWeight: 600, textAlign: 'left', textTransform: 'uppercase' }}>{h}</th>)}
            </tr></thead>
            <tbody>{paginatedMembers.map(m => (
              <tr key={m.id} style={{ borderBottom: '1px solid #e5e7eb', background: m.active ? 'transparent' : 'rgba(0,0,0,0.02)' }}>
                <td style={{ padding: '0.75rem 0.9rem', color: '#6b7280', fontSize: '0.8rem' }}>HEX_{m.id}</td>
                <td style={{ padding: '0.75rem 0.9rem' }}>
                  {m.image ? (
                    <img src={m.image.startsWith('http') ? m.image : (m.image.startsWith('/images') ? m.image : `${m.image}`)} alt={m.name} style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(0,179,122,0.1)', color: '#00b37a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700 }}>{m.name[0]}</div>
                  )}
                </td>
                <td style={{ padding: '0.75rem 0.9rem', color: '#111827', fontWeight: 600, fontSize: '0.88rem' }}>{m.name}</td>
                <td style={{ padding: '0.75rem 0.9rem', color: '#6b7280', fontSize: '0.83rem' }}>{m.role}</td>
                <td style={{ padding: '0.75rem 0.9rem', color: '#6b7280', fontSize: '0.83rem' }}>{m.email || '—'}</td>
                <td style={{ padding: '0.75rem 0.9rem' }}><StatusBadge status={m.status || 'official'} /></td>
                <td style={{ padding: '0.75rem 0.9rem', color: '#6b7280', fontSize: '0.78rem' }}>{fmtDate(m.created_at)}</td>
                <td style={{ padding: '0.75rem 0.9rem', color: '#6b7280', fontSize: '0.8rem' }}>{m.sort_order}</td>
                <td style={{ padding: '0.75rem 0.9rem' }}>
                  <span style={{ fontSize: '0.72rem', padding: '0.2rem 0.5rem', borderRadius: '4px', background: m.active ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', color: m.active ? '#16a34a' : '#ef4444', fontWeight: 600 }}>
                    {m.active ? 'Visible' : 'Hidden'}
                  </span>
                </td>
                <td style={{ padding: '0.75rem 0.9rem' }}>
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <button onClick={() => openEdit(m)} style={{ background: '#f3f4f6', border: 'none', borderRadius: '0.4rem', color: '#374151', padding: '0.35rem 0.6rem', cursor: 'pointer' }}><Edit2 size={13}/></button>
                    <button onClick={() => del(m.id)} style={{ background: 'rgba(239,68,68,0.1)', border: 'none', borderRadius: '0.4rem', color: '#f87171', padding: '0.35rem 0.6rem', cursor: 'pointer' }}><Trash2 size={13}/></button>
                  </div>
                </td>
              </tr>
            ))}</tbody>
          </table>
          {totalPages > 1 && (
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', alignItems: 'center', padding: '1rem', borderTop: '1px solid #e5e7eb' }}>
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '0.4rem', color: '#111827', padding: '0.45rem 0.7rem', cursor: 'pointer', opacity: page === 1 ? 0.4 : 1 }}><ChevronLeft size={15}/></button>
              <span style={{ color: '#6b7280', fontSize: '0.82rem' }}>Page {page} of {totalPages}</span>
              <button onClick={() => setPage(p => p + 1)} disabled={page >= totalPages} style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '0.4rem', color: '#111827', padding: '0.45rem 0.7rem', cursor: 'pointer', opacity: page >= totalPages ? 0.4 : 1 }}><ChevronRight size={15}/></button>
            </div>
          )}
        </div>
      }
    </div>
  );
};

export default TeamManager;
