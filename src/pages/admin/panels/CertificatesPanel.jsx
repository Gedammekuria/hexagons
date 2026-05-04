import React, { useState, useEffect } from 'react';
import { getCertificates, createCertificate, updateCertificate, deleteCertificate, uploadImage } from '../../../api/client';
import { Plus, Edit2, Trash2, Save, X, Loader2, Search, RefreshCw, Eye, EyeOff, FileText, ChevronLeft, ChevronRight } from 'lucide-react';
import { useToast } from '../../../components/Toast';
import Modal from '../../../components/Modal';

const EMPTY = { title: '', image: '', description: '', sort_order: 0, active: 1 };
const inp = { width: '100%', boxSizing: 'border-box', padding: '0.7rem 0.9rem', background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '0.5rem', color: '#111827', fontSize: '0.9rem', outline: 'none' };

const CertificatesPanel = ({ token, admin }) => {
  const isViewer = admin?.role === 'viewer';
  const [certs, setCerts] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const { addToast } = useToast();

  const load = async () => {
    setLoading(true);
    try {
      const d = await getCertificates(token);
      setCerts(d);
    } catch (e) {
      addToast('Failed to load certificates', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openNew = () => { setForm(EMPTY); setEditing('new'); };
  const openEdit = (c) => { setForm(c); setEditing(c.id); };
  const cancel = () => { setEditing(null); setMsg(''); };

  const save = async () => {
    setSaving(true);
    try {
      if (editing === 'new') await createCertificate(token, form);
      else await updateCertificate(token, editing, form);
      addToast(editing === 'new' ? 'Certificate added!' : 'Certificate updated!', 'success');
      await load(); cancel();
    } catch (e) { addToast('Error: ' + e.message, 'error'); }
    finally { setSaving(false); }
  };

  const del = async (id) => {
    if (!confirm('Delete this certificate?')) return;
    try {
      await deleteCertificate(token, id);
      addToast('Certificate deleted', 'success');
      load();
    } catch (e) { addToast('Delete failed: ' + e.message, 'error'); }
  };

  return (
    <div className="admin-content" style={{ padding: '2rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {editing !== null && (
        <Modal onClose={cancel} title={editing === 'new' ? 'Add Certificate' : 'Edit Certificate'} maxWidth="600px">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', color: '#6b7280', fontSize: '0.78rem', marginBottom: '0.3rem' }}>Certificate Title</label>
              <input type="text" value={form.title} onChange={e => setForm({...form, title: e.target.value})} style={inp} placeholder="e.g. ISO 9001:2015 Certification" />
            </div>
            
            <div>
              <label style={{ display: 'block', color: '#6b7280', fontSize: '0.78rem', marginBottom: '0.3rem' }}>Document Scan (Image)</label>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                {form.image && (
                  <img src={form.image} alt="Preview" style={{ width: 80, height: 110, objectFit: 'cover', borderRadius: '4px', border: '1px solid #e5e7eb' }} />
                )}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <input type="text" value={form.image} onChange={e => setForm({...form, image: e.target.value})} style={inp} placeholder="URL or upload below..." />
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: '#f3f4f6', borderRadius: '0.5rem', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, width: 'fit-content' }}>
                    Upload Scanned A4
                    <input type="file" accept="image/*" onChange={async (e) => {
                      const file = e.target.files[0]; if (!file) return;
                      setMsg('Uploading...');
                      try { const res = await uploadImage(token, file); setForm({...form, image: res.url}); setMsg('Uploaded!'); setTimeout(() => setMsg(''), 2000); } 
                      catch (err) { setMsg('Failed: ' + err.message); }
                    }} style={{ display: 'none' }} />
                  </label>
                  {msg && <span style={{ fontSize: '0.75rem', color: msg.startsWith('Fail') ? '#ef4444' : '#10b981' }}>{msg}</span>}
                </div>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', color: '#6b7280', fontSize: '0.78rem', marginBottom: '0.3rem' }}>Description (Optional)</label>
              <textarea rows={3} value={form.description} onChange={e => setForm({...form, description: e.target.value})} style={{ ...inp, resize: 'vertical' }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', color: '#6b7280', fontSize: '0.78rem', marginBottom: '0.3rem' }}>Sort Order</label>
                <input type="number" value={form.sort_order} onChange={e => setForm({...form, sort_order: parseInt(e.target.value)})} style={inp} />
              </div>
              <div>
                <label style={{ display: 'block', color: '#6b7280', fontSize: '0.78rem', marginBottom: '0.3rem' }}>Status</label>
                <select value={form.active} onChange={e => setForm({...form, active: parseInt(e.target.value)})} style={inp}>
                  <option value={1}>Visible</option>
                  <option value={0}>Hidden</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #e5e7eb' }}>
              <button onClick={cancel} style={{ padding: '0.6rem 1.2rem', borderRadius: '0.5rem', border: '1px solid #e5e7eb', background: '#fff', color: '#6b7280', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
              {!isViewer && <button onClick={save} disabled={saving} style={{ padding: '0.6rem 1.5rem', borderRadius: '0.5rem', border: 'none', background: 'linear-gradient(135deg,#00b37a,#009966)', color: '#fff', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Save
              </button>}
            </div>
          </div>
        </Modal>
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2 style={{ color: '#111827', margin: 0 }}>Company Certificates</h2>
        {!isViewer && <button onClick={openNew} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', background: 'linear-gradient(135deg,#00b37a,#009966)', border: 'none', borderRadius: '0.5rem', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>
          <Plus size={16}/> Add Certificate
        </button>}
      </div>

      {loading ? <div style={{ color: '#6b7280', textAlign: 'center', padding: '3rem' }}>Loading…</div> :
        certs.length === 0 ? <div style={{ color: '#6b7280', textAlign: 'center', padding: '3rem', background: '#ffffff', borderRadius: '0.75rem' }}>No certificates added yet.</div> :
        <div className="table-container">
          <table className="admin-table">
            <thead>
              <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                {['Preview', 'Title', 'Status', 'Updated By', 'Action'].map(h => <th key={h} style={{ padding: '0.7rem 0.9rem', color: '#6b7280', fontSize: '0.72rem', fontWeight: 600, textAlign: 'left', textTransform: 'uppercase' }}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {certs.map(c => (
                <tr key={c.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '0.75rem 0.9rem' }}>
                    <img src={c.image} alt={c.title} style={{ width: 40, height: 55, objectFit: 'cover', borderRadius: '2px', border: '1px solid #e5e7eb' }} />
                  </td>
                  <td style={{ padding: '0.75rem 0.9rem', color: '#111827', fontWeight: 600 }}>{c.title}</td>
                  <td style={{ padding: '0.75rem 0.9rem' }}>
                    <span style={{ padding: '0.2rem 0.5rem', borderRadius: '999px', fontSize: '0.7rem', fontWeight: 600, background: c.active ? 'rgba(34,197,94,0.1)' : 'rgba(100,116,139,0.1)', color: c.active ? '#16a34a' : '#64748b' }}>
                      {c.active ? 'Visible' : 'Hidden'}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem 0.9rem' }}>
                    <div style={{ fontSize: '0.78rem', color: '#111827' }}>{c.updated_by || 'System'}</div>
                    <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>{new Date(c.updated_at || c.created_at).toLocaleDateString()}</div>
                  </td>
                  <td style={{ padding: '0.75rem 0.9rem' }}>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button onClick={() => openEdit(c)} style={{ background: '#f3f4f6', border: 'none', borderRadius: '0.4rem', color: '#374151', padding: '0.35rem 0.6rem', cursor: 'pointer' }}><Edit2 size={13}/></button>
                      {!isViewer && <button onClick={() => del(c.id)} style={{ background: 'rgba(239,68,68,0.1)', border: 'none', borderRadius: '0.4rem', color: '#f87171', padding: '0.35rem 0.6rem', cursor: 'pointer' }}><Trash2 size={13}/></button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      }
    </div>
  );
};

export default CertificatesPanel;
