import React, { useState, useEffect } from 'react';
import { getAllTeam, createMember, updateMember, deleteMember, uploadImage } from '../../../api/client';
import { Plus, Edit2, Trash2, Save, X, Loader2 } from 'lucide-react';
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

const TeamManager = ({ token }) => {
  const [members, setMembers] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm]       = useState(EMPTY);
  const [saving, setSaving]   = useState(false);
  const [msg, setMsg]         = useState('');
  const { addToast }          = useToast();

  const load = async () => {
    try { const d = await getAllTeam(token); setMembers(d); } catch {}
  };
  useEffect(() => { load(); }, []);

  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));
  const openNew  = () => { setForm(EMPTY); setEditing('new'); };
  const openEdit = (m) => { setForm({ ...m, active: m.active === 1, status: m.status || 'official' }); setEditing(m.id); };
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

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

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

      {/* Status dropdown */}
      <div style={{ marginBottom: '0.9rem' }}>
        <label style={{ display: 'block', color: '#6b7280', fontSize: '0.78rem', marginBottom: '0.3rem' }}>Employment Status</label>
        <select value={form.status || 'official'} onChange={e => set('status', e.target.value)} style={inp}>
          <option value="official">Official</option>
          <option value="probation">Probation</option>
          <option value="terminated">Terminated</option>
        </select>
      </div>

      {/* Photo Upload */}
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
          <div style={{ fontSize: '0.75rem', color: '#6b7280', whiteSpace: 'nowrap', background: '#f8fafc', padding: '0.6rem 0.8rem', borderRadius: '0.4rem', border: '1px solid #e2e8f0' }}>
            Rec: <strong style={{ color: '#111827' }}>400x400 (1:1)</strong>
          </div>
        </div>
      </div>

      {/* Bio */}
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
    <div style={{ padding: '2rem', overflowY: 'auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <h2 style={{ color: '#111827', margin: 0 }}>Team Members <span style={{ color: '#6b7280', fontSize: '1rem' }}>({members.length})</span></h2>
        <button onClick={openNew} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.6rem 1.2rem', background: 'linear-gradient(135deg,#00b37a,#009966)', border: 'none', borderRadius: '0.5rem', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>
          <Plus size={16}/> Add Member
        </button>
      </div>

      {members.length === 0
        ? <div style={{ color: '#6b7280', textAlign: 'center', padding: '3rem', background: '#ffffff', borderRadius: '0.75rem' }}>No team members yet.</div>
        : <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '0.75rem' }}>
            {members.map(m => (
              <div key={m.id} style={{ padding: '1rem', background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.6rem', opacity: m.active ? 1 : 0.55 }}>
                {/* Top row: avatar + name + actions */}
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                  {m.image
                    ? <img 
                        src={m.image.startsWith('http') ? m.image : (m.image.startsWith('/images') ? m.image : `${m.image}`)} 
                        alt={m.name} 
                        style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} 
                      />
                    : <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(0,179,122,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#00b37a', fontWeight: 700, fontSize: '1.1rem' }}>{m.name[0]}</div>
                  }
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <div style={{ color: '#111827', fontWeight: 600, fontSize: '0.9rem' }}>{m.name}</div>
                      <span style={{ fontSize: '0.7rem', color: '#9ca3af', background: '#f8fafc', padding: '0.05rem 0.35rem', borderRadius: '4px', border: '1px solid #e2e8f0' }}>HEX_{m.id}</span>
                    </div>
                    <div style={{ color: '#6b7280', fontSize: '0.78rem' }}>{m.role}</div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.3rem', flexShrink: 0 }}>
                    <button onClick={() => openEdit(m)} style={{ background: '#f3f4f6', border: 'none', borderRadius: '0.4rem', color: '#374151', padding: '0.35rem 0.6rem', cursor: 'pointer' }}><Edit2 size={13}/></button>
                    <button onClick={() => del(m.id)} style={{ background: 'rgba(239,68,68,0.1)', border: 'none', borderRadius: '0.4rem', color: '#f87171', padding: '0.35rem 0.6rem', cursor: 'pointer' }}><Trash2 size={13}/></button>
                  </div>
                </div>

                {/* Bottom row: status badge + registered date */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.4rem', borderTop: '1px solid #f3f4f6' }}>
                  <StatusBadge status={m.status || 'official'} />
                  <span style={{ fontSize: '0.68rem', color: '#9ca3af' }}>
                    Registered: {fmtDate(m.created_at)}
                  </span>
                </div>
              </div>
            ))}
          </div>
      }
    </div>
  );
};

export default TeamManager;
