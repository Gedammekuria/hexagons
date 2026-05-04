import React, { useState, useEffect } from 'react';
import { getAllTeam, createMember, updateMember, deleteMember, uploadImage } from '../../../api/client';
import { Plus, Edit2, Trash2, Save, X, Loader2, Search, Eye, RefreshCw, Shield, ChevronLeft, ChevronRight } from 'lucide-react';
import { useToast } from '../../../components/Toast';
import Modal from '../../../components/Modal';

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

const EMPTY = { name: '', role: '', bio: '', image: '', email: '', linkedin: '', sort_order: 0, active: true, status: 'official', grant_admin: false, admin_role: 'admin' };
const inp = { width: '100%', boxSizing: 'border-box', padding: '0.7rem 0.9rem', background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '0.5rem', color: '#111827', fontSize: '0.9rem', outline: 'none' };
const LIMIT = 15;
const formatId = (id) => `HEX_${String(id).padStart(3, '0')}`;

const TeamManager = ({ token, admin }) => {
  const isViewer = admin?.role === 'viewer';
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
  const openEdit = (m) => { setForm({ ...m, active: m.active === 1 || m.active === true, status: m.status || 'official', grant_admin: !!m.is_admin, admin_role: m.admin_role || 'admin' }); setEditing(m.id); };
  const cancel   = () => { setEditing(null); setMsg(''); };

  const save = async () => {
    setSaving(true); setMsg('');
    try {
      if (editing === 'new') await createMember(token, form);
      else await updateMember(token, editing, form);
      
      let successMsg = editing === 'new' ? 'Member added!' : 'Member updated!';
      if (form.reset_password || editing === 'new') {
        if (form.grant_admin) successMsg += ' Login credentials sent via email.';
        else if (form.reset_password) successMsg += ' (Password reset to default)';
      }
      
      addToast(successMsg, 'success');
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

  return (
    <div className="admin-content" style={{ padding: '2rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {editing !== null && (
        <Modal 
          onClose={cancel} 
          title={editing === 'new' ? 'Add Team Member' : 'Edit Member Details'}
          maxWidth="600px"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[['Full Name', 'name'], ['Job Title / Role', 'role'], ['Email', 'email'], ['LinkedIn URL', 'linkedin'], ['Display Order', 'sort_order']].map(([label, key]) => (
              <div key={key}>
                <label style={{ display: 'block', color: '#6b7280', fontSize: '0.78rem', marginBottom: '0.3rem' }}>{label}</label>
                <input type={key === 'sort_order' ? 'number' : 'text'} value={form[key] || ''} onChange={e => set(key, e.target.value)} style={inp} />
              </div>
            ))}

            <div>
              <label style={{ display: 'block', color: '#6b7280', fontSize: '0.78rem', marginBottom: '0.3rem' }}>Employment Status</label>
              <select value={form.status || 'official'} onChange={e => set('status', e.target.value)} style={inp}>
                <option value="official">Official</option>
                <option value="probation">Probation</option>
                <option value="terminated">Terminated</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', color: '#6b7280', fontSize: '0.78rem', marginBottom: '0.3rem' }}>
                Photo <span style={{ color: '#94a3b8', fontWeight: 400 }}>(Recommended: Square 400×400px)</span>
              </label>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                {form.image && (
                  <img 
                    src={form.image.startsWith('http') ? form.image : (form.image.startsWith('/images') ? form.image : `${form.image}`)} 
                    alt="Preview" 
                    style={{ width: 60, height: 60, borderRadius: '50%', objectFit: 'cover', border: '1px solid #e5e7eb' }} 
                  />
                )}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <input type="text" value={form.image || ''} onChange={e => set('image', e.target.value)} style={inp} placeholder="Image URL..." />
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: '#f3f4f6', borderRadius: '0.5rem', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, width: 'fit-content' }}>
                      Upload Photo
                      <input type="file" accept="image/*" onChange={async (e) => {
                        const file = e.target.files[0]; if (!file) return;
                        setMsg('Uploading...');
                        try { const res = await uploadImage(token, file); set('image', res.url); setMsg('Uploaded!'); setTimeout(() => setMsg(''), 2000); } 
                        catch (err) { setMsg('Failed: ' + err.message); }
                      }} style={{ display: 'none' }} />
                    </label>
                    {msg && <span style={{ fontSize: '0.75rem', color: msg.startsWith('Fail') ? '#ef4444' : '#10b981' }}>{msg}</span>}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', color: '#6b7280', fontSize: '0.78rem', marginBottom: '0.3rem' }}>Bio</label>
              <textarea rows={3} value={form.bio || ''} onChange={e => set('bio', e.target.value)} style={{ ...inp, resize: 'vertical', fontFamily: 'inherit' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem', padding: '1rem', background: '#f8fafc', borderRadius: '0.75rem', border: '1px solid #e2e8f0' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem' }}>
                <input type="checkbox" checked={!!form.active} onChange={e => set('active', e.target.checked)} /> Show on public website
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem' }}>
                <input type="checkbox" checked={!!form.grant_admin} onChange={e => set('grant_admin', e.target.checked)} /> Grant Admin Panel Access
              </label>
              {form.grant_admin && (
                <div style={{ marginLeft: '1.5rem', marginTop: '0.5rem' }}>
                  <label style={{ display: 'block', color: '#6b7280', fontSize: '0.75rem', marginBottom: '0.3rem' }}>Access Level</label>
                  <select value={form.admin_role || 'admin'} onChange={e => set('admin_role', e.target.value)} style={{ ...inp, maxWidth: '200px' }}>
                    <option value="admin">Administrator (Full Access)</option>
                    <option value="viewer">Viewer (Read Only)</option>
                  </select>
                  {editing !== 'new' && (
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem', color: '#ef4444', marginTop: '0.75rem', fontWeight: 600 }}>
                      <input type="checkbox" checked={!!form.reset_password} onChange={e => set('reset_password', e.target.checked)} /> Reset to Default Password
                    </label>
                  )}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #e5e7eb' }}>
              <button onClick={cancel} style={{ padding: '0.6rem 1.2rem', borderRadius: '0.5rem', border: '1px solid #e5e7eb', background: '#fff', color: '#6b7280', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
              {!isViewer && <button onClick={save} disabled={saving} style={{ padding: '0.6rem 1.5rem', borderRadius: '0.5rem', border: 'none', background: 'linear-gradient(135deg,#00b37a,#009966)', color: '#fff', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Save Member
              </button>}
            </div>
          </div>
        </Modal>
      )}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
        <h2 style={{ color: '#111827', margin: 0 }}>Team Members <span style={{ color: '#6b7280', fontSize: '1rem' }}>({members.length})</span></h2>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={load} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: '#ffffff', border: 'none', borderRadius: '0.5rem', color: '#6b7280', padding: '0.5rem 0.9rem', cursor: 'pointer', fontSize: '0.85rem' }}>
            <RefreshCw size={14}/> Refresh
          </button>
          {!isViewer && <button onClick={openNew} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', background: 'linear-gradient(135deg,#00b37a,#009966)', border: 'none', borderRadius: '0.5rem', color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem' }}>
            <Plus size={16}/> Add Member
          </button>}
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
              {['ID', 'Photo', 'Name', 'Role', 'Email', 'Status', 'Updated By', 'Order', 'Visibility', 'Action'].map(h => <th key={h} style={{ padding: '0.7rem 0.9rem', color: '#6b7280', fontSize: '0.72rem', fontWeight: 600, textAlign: 'left', textTransform: 'uppercase' }}>{h}</th>)}
            </tr></thead>
            <tbody>{paginatedMembers.map(m => (
              <tr key={m.id} style={{ borderBottom: '1px solid #e5e7eb', background: m.active ? 'transparent' : 'rgba(0,0,0,0.02)' }}>
                <td style={{ padding: '0.75rem 0.9rem', color: '#6b7280', fontSize: '0.8rem' }}>{formatId(m.id)}</td>
                <td style={{ padding: '0.75rem 0.9rem' }}>
                  {m.image ? (
                    <img src={m.image.startsWith('http') ? m.image : (m.image.startsWith('/images') ? m.image : `${m.image}`)} alt={m.name} style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(0,179,122,0.1)', color: '#00b37a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700 }}>{m.name[0]}</div>
                  )}
                </td>
                <td style={{ padding: '0.75rem 0.9rem', color: '#111827', fontWeight: 600, fontSize: '0.88rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    {m.name}
                    {m.is_admin ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', padding: '0.1rem 0.3rem', background: 'rgba(0,179,122,0.1)', color: '#00b37a', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase' }}>
                        <Shield size={10} /> {m.admin_role === 'viewer' ? 'Viewer' : 'Admin'}
                      </span>
                    ) : null}
                  </div>
                </td>
                <td style={{ padding: '0.75rem 0.9rem', color: '#6b7280', fontSize: '0.83rem' }}>{m.role}</td>
                <td style={{ padding: '0.75rem 0.9rem', color: '#6b7280', fontSize: '0.83rem' }}>{m.email || '—'}</td>
                <td style={{ padding: '0.75rem 0.9rem' }}><StatusBadge status={m.status || 'official'} /></td>
                <td style={{ padding: '0.75rem 0.9rem' }}>
                  <div style={{ fontSize: '0.78rem', color: '#111827', fontWeight: 500 }}>{m.updated_by || 'System'}</div>
                  <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>{fmtDate(m.updated_at || m.created_at)}</div>
                </td>
                <td style={{ padding: '0.75rem 0.9rem', color: '#6b7280', fontSize: '0.8rem' }}>{m.sort_order}</td>
                <td style={{ padding: '0.75rem 0.9rem' }}>
                  <span style={{ fontSize: '0.72rem', padding: '0.2rem 0.5rem', borderRadius: '4px', background: m.active ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', color: m.active ? '#16a34a' : '#ef4444', fontWeight: 600 }}>
                    {m.active ? 'Visible' : 'Hidden'}
                  </span>
                </td>
                <td style={{ padding: '0.75rem 0.9rem' }}>
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <button onClick={() => openEdit(m)} style={{ background: '#f3f4f6', border: 'none', borderRadius: '0.4rem', color: '#374151', padding: '0.35rem 0.6rem', cursor: 'pointer' }}>{isViewer ? <Eye size={13}/> : <Edit2 size={13}/>}</button>
                    {!isViewer && <button onClick={() => del(m.id)} style={{ background: 'rgba(239,68,68,0.1)', border: 'none', borderRadius: '0.4rem', color: '#f87171', padding: '0.35rem 0.6rem', cursor: 'pointer' }}><Trash2 size={13}/></button>}
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
