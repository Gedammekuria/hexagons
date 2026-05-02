import React, { useState, useEffect } from 'react';
import { getBrands, createBrand, updateBrand, deleteBrand, uploadImage } from '../../../api/client';
import { Plus, Edit2, Trash2, Loader2, Image as ImageIcon, EyeOff, Search, RefreshCw, X, Save } from 'lucide-react';
import { useToast } from '../../../components/Toast';

const EMPTY = { name: '', logo: '', show_on_page: true };
const inp = { width: '100%', boxSizing: 'border-box', padding: '0.7rem 0.9rem', background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '0.5rem', color: '#111827', fontSize: '0.9rem', outline: 'none' };

const BrandManager = ({ token }) => {
  const [brands, setBrands] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm]       = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving]   = useState(false);
  const [search, setSearch]   = useState('');
  const [date, setDate]       = useState('');
  const [page, setPage]       = useState(1);
  const [msg, setMsg]         = useState('');
  const { addToast }          = useToast();
  const LIMIT = 15;

  const load = async () => {
    setLoading(true);
    try { const d = await getBrands(); setBrands(d); } 
    catch {} finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const openNew  = () => { setForm(EMPTY); setEditing('new'); };
  const openEdit = (b) => { setForm({ ...b, show_on_page: !!b.show_on_page }); setEditing(b.id); };
  const cancel   = () => { setEditing(null); setMsg(''); };

  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const saveBrand = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      if (editing === 'new') await createBrand(token, form);
      else await updateBrand(token, editing, form);
      addToast(editing === 'new' ? 'Brand added!' : 'Brand updated!', 'success');
      await load(); cancel();
    } catch (err) { addToast('Error: ' + err.message, 'error'); }
    finally { setSaving(false); }
  };

  const del = async (id) => {
    if (!confirm('Remove this brand?')) return;
    try { 
      await deleteBrand(token, id); 
      addToast('Brand removed', 'success');
      load(); 
    } catch (err) { addToast(err.message, 'error'); }
  };

  const filteredBrands = brands.filter(b => 
    (!search || b.name.toLowerCase().includes(search.toLowerCase())) &&
    (!date || (b.created_at && new Date(b.created_at).toISOString().split('T')[0] === date))
  );

  const totalPages = Math.ceil(filteredBrands.length / LIMIT);
  const paginatedBrands = filteredBrands.slice((page - 1) * LIMIT, page * LIMIT);

  useEffect(() => { setPage(1); }, [search, date]);

  if (editing !== null) return (
    <div style={{ padding: '2rem', maxWidth: 600 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <h2 style={{ color: '#111827', margin: 0 }}>{editing === 'new' ? 'Add Brand' : 'Edit Brand'}</h2>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={cancel} style={{ background: '#ffffff', border: 'none', borderRadius: '0.5rem', color: '#6b7280', padding: '0.5rem 0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}><X size={15}/> Cancel</button>
          <button onClick={saveBrand} disabled={saving} style={{ background: 'linear-gradient(135deg,#00b37a,#009966)', border: 'none', borderRadius: '0.5rem', color: '#fff', padding: '0.5rem 1rem', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            {saving ? <Loader2 size={14}/> : <Save size={14}/>} {saving ? 'Saving...' : 'Save Brand'}
          </button>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <label style={{ display: 'block', color: '#6b7280', fontSize: '0.78rem', marginBottom: '0.3rem' }}>Brand Name</label>
          <input value={form.name} onChange={e => set('name', e.target.value)} style={inp} placeholder="e.g. Cisco" />
        </div>
        <div>
          <label style={{ display: 'block', color: '#6b7280', fontSize: '0.78rem', marginBottom: '0.3rem' }}>Logo</label>
          {form.logo && (
            <div style={{ marginBottom: '0.5rem' }}>
              <img src={form.logo.startsWith('http') ? form.logo : (form.logo.startsWith('/images') ? form.logo : `${form.logo}`)} alt="Preview" style={{ height: 40, objectFit: 'contain' }} />
            </div>
          )}
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <input type="text" value={form.logo} onChange={e => set('logo', e.target.value)} style={{ ...inp, flex: 1 }} placeholder="Logo URL..." />
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1rem', background: '#ffffff', border: '1px dashed #00b37a', borderRadius: '0.5rem', cursor: 'pointer', color: '#00b37a', whiteSpace: 'nowrap' }}>
              <ImageIcon size={18} /> <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Upload</span>
              <input type="file" accept="image/*" onChange={async (e) => {
                const file = e.target.files[0];
                if (!file) return;
                setMsg('Uploading...');
                try {
                  const res = await uploadImage(token, file);
                  set('logo', res.url);
                  setMsg('Uploaded!');
                  setTimeout(() => setMsg(''), 2000);
                } catch (err) { setMsg('Error: ' + err.message); }
              }} style={{ display: 'none' }} />
            </label>
            <span style={{ fontSize: '0.75rem', color: '#9ca3af', whiteSpace: 'nowrap' }}>Recommended: 800x600px, Max 2MB</span>
          </div>
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: '#6b7280', fontSize: '0.9rem' }}>
          <input type="checkbox" checked={!!form.show_on_page} onChange={e => set('show_on_page', e.target.checked)} /> Show on website
        </label>
      </div>
      {msg && <p style={{ marginTop: '1rem', fontSize: '0.85rem', color: msg.includes('Error') ? '#ef4444' : '#00b37a' }}>{msg}</p>}
    </div>
  );

  return (
    <div className="admin-content" style={{ padding: '2rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
        <h2 style={{ color: '#111827', margin: 0 }}>Brands & Partners <span style={{ color: '#6b7280', fontSize: '1rem' }}>({brands.length})</span></h2>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={load} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: '#ffffff', border: 'none', borderRadius: '0.5rem', color: '#6b7280', padding: '0.5rem 0.9rem', cursor: 'pointer', fontSize: '0.85rem' }}>
            <RefreshCw size={14}/> Refresh
          </button>
          <button onClick={openNew} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', background: 'linear-gradient(135deg,#00b37a,#009966)', border: 'none', borderRadius: '0.5rem', color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem' }}>
            <Plus size={16}/> Add Brand
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 180 }}>
          <Search size={13} style={{ position: 'absolute', left: '0.6rem', top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }}/>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search brands by name..." style={{ ...inp, paddingLeft: '2rem', fontSize: '0.85rem' }}/>
        </div>
        <input 
          type="date" 
          value={date} 
          onChange={e => setDate(e.target.value)} 
          style={{ ...inp, width: 'auto', paddingLeft: '0.75rem', fontSize: '0.85rem', color: date ? '#111827' : '#6b7280' }}
        />
        {(search || date) && (
          <button onClick={() => { setSearch(''); setDate(''); }} style={{ background: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: '0.5rem', padding: '0 0.8rem', color: '#374151', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 500 }}>Clear</button>
        )}
      </div>

      {loading ? <div style={{ color: '#6b7280', textAlign: 'center', padding: '3rem' }}>Loading…</div> :
        filteredBrands.length === 0 ? <div style={{ color: '#6b7280', textAlign: 'center', padding: '3rem', background: '#ffffff', borderRadius: '0.75rem' }}>No brands found.</div> :
        <div className="table-container">
          <table className="admin-table">
            <thead><tr style={{ borderBottom: '1px solid #e5e7eb' }}>
              {['ID', 'Logo', 'Brand Name', 'Registered', 'Visibility', 'Action'].map(h => <th key={h} style={{ padding: '0.7rem 0.9rem', color: '#6b7280', fontSize: '0.72rem', fontWeight: 600, textAlign: 'left', textTransform: 'uppercase' }}>{h}</th>)}
            </tr></thead>
            <tbody>{paginatedBrands.map(b => (
              <tr key={b.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                <td style={{ padding: '0.75rem 0.9rem', color: '#6b7280', fontSize: '0.8rem' }}>BRA_{b.id}</td>
                <td style={{ padding: '0.75rem 0.9rem' }}>
                  {b.logo ? <img src={b.logo.startsWith('http') ? b.logo : (b.logo.startsWith('/images') ? b.logo : `${b.logo}`)} alt="" style={{ height: 30, objectFit: 'contain' }} /> : <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem' }}>{b.name[0]}</div>}
                </td>
                <td style={{ padding: '0.75rem 0.9rem', color: '#111827', fontWeight: 600, fontSize: '0.88rem' }}>{b.name}</td>
                <td style={{ padding: '0.75rem 0.9rem', color: '#6b7280', fontSize: '0.78rem' }}>{b.created_at ? new Date(b.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : '—'}</td>
                <td style={{ padding: '0.75rem 0.9rem' }}>
                  <span style={{ fontSize: '0.72rem', padding: '0.2rem 0.5rem', borderRadius: '4px', background: b.show_on_page ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', color: b.show_on_page ? '#16a34a' : '#ef4444', fontWeight: 600 }}>
                    {b.show_on_page ? 'Visible' : 'Hidden'}
                  </span>
                </td>
                <td style={{ padding: '0.75rem 0.9rem' }}>
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <button onClick={() => openEdit(b)} style={{ background: '#f3f4f6', border: 'none', borderRadius: '0.4rem', color: '#374151', padding: '0.35rem 0.6rem', cursor: 'pointer' }}><Edit2 size={13}/></button>
                    <button onClick={() => del(b.id)} style={{ background: 'rgba(239,68,68,0.1)', border: 'none', borderRadius: '0.4rem', color: '#f87171', padding: '0.35rem 0.6rem', cursor: 'pointer' }}><Trash2 size={13}/></button>
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

export default BrandManager;
