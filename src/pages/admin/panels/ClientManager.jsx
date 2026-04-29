import React, { useState, useEffect } from 'react';
import { getClients, createClient, updateClient, deleteClient, uploadImage } from '../../../api/client';
import { Plus, Trash2, Loader2, Image as ImageIcon, Link as LinkIcon, EyeOff } from 'lucide-react';
import { useToast } from '../../../components/Toast';

const ClientManager = ({ token }) => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', logo: '', url: '', show_on_page: true });
  const [editing, setEditing] = useState(null);
  const [msg, setMsg] = useState('');
  const { addToast } = useToast();

  const load = async () => {
    try { const d = await getClients(); setClients(d); } catch {}
  };
  useEffect(() => { load(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.name) return;
    setLoading(true);
    try {
      if (editing) {
        await updateClient(token, editing, form);
        addToast('Client updated!', 'success');
      } else {
        await createClient(token, form);
        addToast('Client added!', 'success');
      }
      setForm({ name: '', logo: '', url: '', show_on_page: true });
      setEditing(null);
      await load();
    } catch (err) { addToast('Error: ' + err.message, 'error'); }
    finally { setLoading(false); }
  };

  const handleEdit = (c) => {
    setForm({ name: c.name, logo: c.logo, url: c.url || '', show_on_page: !!c.show_on_page });
    setEditing(c.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setForm({ name: '', logo: '', url: '', show_on_page: true });
    setEditing(null);
  };

  const handleDelete = async (id) => {
    if (!confirm('Remove this client?')) return;
    try { 
      await deleteClient(token, id); 
      addToast('Client removed', 'success');
      await load(); 
    } catch (err) { addToast(err.message, 'error'); }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2 style={{ color: '#111827', marginBottom: '1.5rem' }}>Our Clients</h2>
      
      <form onSubmit={handleAdd} style={{ background: '#fff', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid #e5e7eb', marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>{editing ? 'Edit Client' : 'Add New Client'}</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.3rem' }}>Client Name</label>
              <input 
                type="text" 
                value={form.name} 
                onChange={e => setForm({ ...form, name: e.target.value })} 
                placeholder="e.g. Spanish Cooperation" 
                style={{ width: '100%', padding: '0.6rem', borderRadius: '0.4rem', border: '1px solid #d1d5db' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.3rem' }}>Website URL (Optional)</label>
              <input 
                type="text" 
                value={form.url} 
                onChange={e => setForm({ ...form, url: e.target.value })} 
                placeholder="https://..." 
                style={{ width: '100%', padding: '0.6rem', borderRadius: '0.4rem', border: '1px solid #d1d5db' }}
              />
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.3rem' }}>Client Logo URL or Upload</label>
            {form.logo && (
              <div style={{ marginBottom: '0.5rem' }}>
                <img 
                  src={form.logo.startsWith('http') ? form.logo : (form.logo.startsWith('/images') ? form.logo : `http://localhost:5000${form.logo}`)} 
                  alt="Preview" 
                  style={{ height: 40, borderRadius: '0.2rem', objectFit: 'contain' }} 
                />
              </div>
            )}
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <input 
                type="text" 
                value={form.logo} 
                onChange={e => setForm({ ...form, logo: e.target.value })} 
                placeholder="Logo URL..." 
                style={{ flex: 1, padding: '0.65rem', borderRadius: '0.5rem', border: '1px solid #d1d5db', fontSize: '0.9rem' }}
              />
              <label htmlFor="client-upload" style={{ padding: '0.65rem 1rem', background: '#ffffff', border: '1px dashed #00b37a', borderRadius: '0.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#00b37a', whiteSpace: 'nowrap' }}>
                <ImageIcon size={18} /> <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Upload Logo</span>
              </label>
              <input 
                type="file" 
                onChange={async (e) => {
                  const file = e.target.files[0];
                  if (!file) return;
                  setMsg('Uploading...');
                  try {
                    const res = await uploadImage(token, file);
                    setForm(prev => ({ ...prev, logo: res.url }));
                    setMsg('Logo uploaded!');
                    setTimeout(() => setMsg(''), 2000);
                  } catch (err) { setMsg('Upload Error: ' + err.message); }
                }}
                style={{ display: 'none' }}
                id="client-upload"
              />
              <div style={{ fontSize: '0.75rem', color: '#6b7280', whiteSpace: 'nowrap', background: '#f8fafc', padding: '0.6rem 0.8rem', borderRadius: '0.4rem', border: '1px solid #e2e8f0' }}>
                Rec: <strong style={{ color: '#111827' }}>300x150 (2:1)</strong>
              </div>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <input
            type="checkbox"
            id="client-show-on-page"
            checked={!!form.show_on_page}
            onChange={e => setForm({ ...form, show_on_page: e.target.checked })}
          />
          <label htmlFor="client-show-on-page" style={{ fontSize: '0.9rem', color: '#374151', cursor: 'pointer' }}>Show on Our Clients page</label>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
          {editing && (
            <button 
              type="button"
              onClick={cancelEdit}
              style={{ padding: '0.6rem 1.5rem', background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '0.4rem', fontWeight: 600, cursor: 'pointer' }}
            >
              Cancel
            </button>
          )}
          <button 
            type="submit" 
            disabled={loading} 
            style={{ padding: '0.6rem 1.5rem', background: '#00b37a', color: '#fff', border: 'none', borderRadius: '0.4rem', fontWeight: 600, cursor: 'pointer' }}
          >
            {loading ? <Loader2 size={18} className="spinner" /> : (editing ? 'Update Client' : 'Add Client')}
          </button>
        </div>
        {msg && <p style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: msg.includes('Error') ? '#ef4444' : '#00b37a' }}>{msg}</p>}
      </form>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
        {clients.map(c => (
          <div key={c.id} style={{ background: '#fff', padding: '1rem', borderRadius: '0.75rem', border: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', display: 'flex', gap: '0.2rem' }}>
              <button 
                onClick={() => handleEdit(c)} 
                style={{ background: 'transparent', border: 'none', color: '#6b7280', cursor: 'pointer', padding: '0.2rem' }}
                title="Edit"
              >
                <ImageIcon size={16} />
              </button>
              <button 
                onClick={() => handleDelete(c.id)} 
                style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.2rem' }}
                title="Delete"
              >
                <Trash2 size={16} />
              </button>
            </div>
            <div style={{ width: '100%', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.5rem' }}>
              {c.logo ? (
                <img 
                  src={c.logo.startsWith('http') ? c.logo : (c.logo.startsWith('/images') ? c.logo : `http://localhost:5000${c.logo}`)} 
                  alt={c.name} 
                  style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', opacity: c.show_on_page ? 1 : 0.4 }} 
                />
              ) : (
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00b37a', fontWeight: 700 }}>{c.name[0]}</div>
              )}
            </div>
            <div style={{ fontWeight: 600, fontSize: '0.9rem', textAlign: 'center', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              {c.name}
              {!c.show_on_page && <EyeOff size={13} color="#9ca3af" title="Hidden from page" />}
            </div>
            {c.url && (
              <a href={c.url} target="_blank" rel="noopener noreferrer" style={{ marginTop: '0.3rem', fontSize: '0.75rem', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '0.2rem', textDecoration: 'none' }}>
                <LinkIcon size={12} /> Website
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ClientManager;
