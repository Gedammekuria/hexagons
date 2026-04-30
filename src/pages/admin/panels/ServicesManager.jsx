import React, { useState, useEffect } from 'react';
import { getServices, createService, updateService, deleteService, uploadImage } from '../../../api/client';
import { Plus, Edit2, Trash2, Save, X, Loader2, Search, RefreshCw, ChevronLeft, ChevronRight, Layout, List } from 'lucide-react';
import { useToast } from '../../../components/Toast';

const EMPTY_FEATURE = { title: '', desc: '', icon: 'CheckCircle2', highlights: [] };
const EMPTY = { 
  slug: '', 
  title: '', 
  tagline: '', 
  description: '', 
  icon_name: 'Rocket', 
  color: '#2563eb', 
  image: '', 
  features: [ { ...EMPTY_FEATURE, highlights: [] } ],
  sort_order: 0,
  active: true 
};

const inp = { width: '100%', boxSizing: 'border-box', padding: '0.7rem 0.9rem', background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '0.5rem', color: '#111827', fontSize: '0.9rem', outline: 'none' };
const LIMIT = 15;

const ServicesManager = ({ token }) => {
  const [services, setServices] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm]       = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving]   = useState(false);
  const [search, setSearch]   = useState('');
  const [date, setDate]       = useState('');
  const [page, setPage]       = useState(1);
  const { addToast }          = useToast();

  const load = async () => {
    setLoading(true);
    try { const d = await getServices(); setServices(d); } 
    catch { addToast('Failed to load services', 'error'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const openNew = () => { setForm({ ...EMPTY, features: [ { ...EMPTY_FEATURE, highlights: [] } ] }); setEditing('new'); };
  const openEdit = (s) => { 
    setForm({ 
      ...s, 
      features: (Array.isArray(s.features) && s.features.length > 0 ? s.features : [ { ...EMPTY_FEATURE } ]).map(f => ({ ...f, highlights: Array.isArray(f.highlights) ? f.highlights : [] })),
      active: !!s.active 
    }); 
    setEditing(s.id); 
  };
  const cancel = () => { setEditing(null); };

  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const saveService = async () => {
    setSaving(true);
    try {
      if (editing === 'new') await createService(token, form);
      else await updateService(token, editing, form);
      addToast(editing === 'new' ? 'Service created!' : 'Service updated!', 'success');
      await load(); cancel();
    } catch (e) { addToast('Error: ' + e.message, 'error'); }
    finally { setSaving(false); }
  };

  const del = async (id) => {
    if (!window.confirm('Delete this service?')) return;
    try {
      await deleteService(token, id);
      addToast('Service deleted', 'success');
      load();
    } catch (e) { addToast('Delete failed: ' + e.message, 'error'); }
  };

  const filteredServices = services.filter(s => {
    const matchesSearch = !search || s.title.toLowerCase().includes(search.toLowerCase()) || s.slug.toLowerCase().includes(search.toLowerCase());
    const matchesDate = !date || (s.created_at && new Date(s.created_at).toISOString().split('T')[0] === date);
    return matchesSearch && matchesDate;
  });

  const totalPages = Math.ceil(filteredServices.length / LIMIT);
  const paginatedServices = filteredServices.slice((page - 1) * LIMIT, page * LIMIT);

  useEffect(() => { setPage(1); }, [search, date]);

  // Feature logic preserved
  const addFeature = () => set('features', [...form.features, { ...EMPTY_FEATURE, highlights: [] }]);
  const removeFeature = (idx) => { const next = [...form.features]; next.splice(idx, 1); set('features', next); };
  const updateFeature = (idx, k, v) => { const next = [...form.features]; next[idx] = { ...next[idx], [k]: v }; set('features', next); };
  const addHighlight = (fIdx) => { const next = [...form.features]; const highlights = [...(next[fIdx].highlights || [])]; highlights.push(''); next[fIdx] = { ...next[fIdx], highlights }; set('features', next); };
  const updateHighlight = (fIdx, hIdx, val) => { const next = [...form.features]; const highlights = [...(next[fIdx].highlights || [])]; highlights[hIdx] = val; next[fIdx] = { ...next[fIdx], highlights }; set('features', next); };
  const removeHighlight = (fIdx, hIdx) => { const next = [...form.features]; const highlights = [...(next[fIdx].highlights || [])]; highlights.splice(hIdx, 1); next[fIdx] = { ...next[fIdx], highlights }; set('features', next); };

  if (editing !== null) return (
    <div style={{ padding: '2rem', overflowY: 'auto', maxWidth: 800 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <h2 style={{ color: '#111827', margin: 0 }}>{editing === 'new' ? 'New Service' : 'Edit Service'}</h2>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={cancel} style={{ background: '#ffffff', border: 'none', borderRadius: '0.5rem', color: '#6b7280', padding: '0.5rem 0.9rem', cursor: 'pointer' }}><X size={15}/> Cancel</button>
          <button onClick={saveService} disabled={saving} style={{ background: 'linear-gradient(135deg,#00b37a,#009966)', border: 'none', borderRadius: '0.5rem', color: '#fff', padding: '0.5rem 1rem', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            {saving ? <Loader2 size={14}/> : <Save size={14}/>} {saving ? 'Saving...' : 'Save Service'}
          </button>
        </div>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
        <div><label style={{ display: 'block', fontSize: '0.8rem', color: '#6b7280', marginBottom: '0.3rem' }}>Service Title</label><input value={form.title} onChange={e => { set('title', e.target.value); if(editing==='new') set('slug', e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')); }} style={inp} /></div>
        <div><label style={{ display: 'block', fontSize: '0.8rem', color: '#6b7280', marginBottom: '0.3rem' }}>Slug (URL)</label><input value={form.slug} onChange={e => set('slug', e.target.value)} style={inp} /></div>
      </div>
      <div style={{ marginBottom: '1rem' }}><label style={{ display: 'block', fontSize: '0.8rem', color: '#6b7280', marginBottom: '0.3rem' }}>Tagline</label><input value={form.tagline} onChange={e => set('tagline', e.target.value)} style={inp} /></div>
      <div style={{ marginBottom: '1rem' }}><label style={{ display: 'block', fontSize: '0.8rem', color: '#6b7280', marginBottom: '0.3rem' }}>Description</label><textarea rows={3} value={form.description} onChange={e => set('description', e.target.value)} style={{ ...inp, resize: 'vertical' }} /></div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
        <div><label style={{ display: 'block', fontSize: '0.8rem', color: '#6b7280', marginBottom: '0.3rem' }}>Icon (Lucide)</label><input value={form.icon_name} onChange={e => set('icon_name', e.target.value)} style={inp} /></div>
        <div><label style={{ display: 'block', fontSize: '0.8rem', color: '#6b7280', marginBottom: '0.3rem' }}>Color Hex</label><input type="color" value={form.color} onChange={e => set('color', e.target.value)} style={{ ...inp, padding: '0.2rem' }} /></div>
        <div><label style={{ display: 'block', fontSize: '0.8rem', color: '#6b7280', marginBottom: '0.3rem' }}>Order</label><input type="number" value={form.sort_order} onChange={e => set('sort_order', parseInt(e.target.value))} style={inp} /></div>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h3 style={{ margin: 0, fontSize: '1rem' }}>Sub-features</h3>
          <button onClick={addFeature} style={{ background: 'rgba(0,179,122,0.1)', border: 'none', borderRadius: '0.4rem', color: '#00b37a', padding: '0.4rem 0.8rem', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}>+ Add Feature</button>
        </div>
        {form.features.map((f, idx) => (
          <div key={idx} style={{ padding: '1rem', background: '#f9fafb', borderRadius: '0.6rem', border: '1px solid #e5e7eb', marginBottom: '1rem', position: 'relative' }}>
            <button onClick={() => removeFeature(idx)} style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', color: '#ef4444', border: 'none', background: 'none', cursor: 'pointer' }}><Trash2 size={16}/></button>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '0.75rem' }}>
              <input placeholder="Title" value={f.title} onChange={e => updateFeature(idx, 'title', e.target.value)} style={inp} />
              <input placeholder="Icon" value={f.icon} onChange={e => updateFeature(idx, 'icon', e.target.value)} style={inp} />
            </div>
            <textarea placeholder="Desc" rows={2} value={f.desc} onChange={e => updateFeature(idx, 'desc', e.target.value)} style={{ ...inp, marginBottom: '1rem' }} />
            <div style={{ paddingLeft: '1rem', borderLeft: '2px solid #e5e7eb' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6b7280' }}>HIGHLIGHTS</span>
                <button onClick={() => addHighlight(idx)} style={{ color: '#00b37a', border: 'none', background: 'none', cursor: 'pointer', fontSize: '0.7rem' }}>+ Add Point</button>
              </div>
              {f.highlights.map((h, hIdx) => (
                <div key={hIdx} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <input value={h} onChange={e => updateHighlight(idx, hIdx, e.target.value)} style={{ ...inp, padding: '0.4rem 0.6rem', fontSize: '0.8rem' }} />
                  <button onClick={() => removeHighlight(idx, hIdx)} style={{ color: '#ef4444', border: 'none', background: 'none', cursor: 'pointer' }}><X size={14}/></button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem' }}><input type="checkbox" checked={form.active} onChange={e => set('active', e.target.checked)} /> Visible on Site</label>
    </div>
  );

  return (
    <div className="admin-content" style={{ padding: '2rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
        <h2 style={{ color: '#111827', margin: 0 }}>Service Manager <span style={{ color: '#6b7280', fontSize: '1rem' }}>({services.length})</span></h2>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={load} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: '#ffffff', border: 'none', borderRadius: '0.5rem', color: '#6b7280', padding: '0.5rem 0.9rem', cursor: 'pointer', fontSize: '0.85rem' }}>
            <RefreshCw size={14}/> Refresh
          </button>
          <button onClick={openNew} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', background: 'linear-gradient(135deg,#00b37a,#009966)', border: 'none', borderRadius: '0.5rem', color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem' }}>
            <Plus size={16}/> New Service
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 180 }}>
          <Search size={13} style={{ position: 'absolute', left: '0.6rem', top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }}/>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search services..." style={{ ...inp, paddingLeft: '2rem', fontSize: '0.85rem' }}/>
        </div>
        <input type="date" value={date} onChange={e => setDate(e.target.value)} style={{ ...inp, width: 'auto', paddingLeft: '0.75rem', fontSize: '0.85rem', color: date ? '#111827' : '#6b7280' }} />
        {(search || date) && (
          <button onClick={() => { setSearch(''); setDate(''); }} style={{ background: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: '0.5rem', padding: '0 0.8rem', color: '#374151', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 500 }}>Clear</button>
        )}
      </div>

      {loading ? <div style={{ color: '#6b7280', textAlign: 'center', padding: '3rem' }}>Loading…</div> :
        filteredServices.length === 0 ? <div style={{ color: '#6b7280', textAlign: 'center', padding: '3rem', background: '#ffffff', borderRadius: '0.75rem' }}>No services found.</div> :
        <div className="table-container">
          <table className="admin-table">
            <thead><tr style={{ borderBottom: '1px solid #e5e7eb' }}>
              {['Order', 'Title', 'Slug', 'Sub-features', 'Status', 'Action'].map(h => <th key={h} style={{ padding: '0.7rem 0.9rem', color: '#6b7280', fontSize: '0.72rem', fontWeight: 600, textAlign: 'left', textTransform: 'uppercase' }}>{h}</th>)}
            </tr></thead>
            <tbody>{paginatedServices.map(s => (
              <tr key={s.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                <td style={{ padding: '0.75rem 0.9rem', color: '#6b7280', fontSize: '0.8rem' }}>{s.sort_order}</td>
                <td style={{ padding: '0.75rem 0.9rem', color: '#111827', fontWeight: 600, fontSize: '0.88rem' }}>{s.title}</td>
                <td style={{ padding: '0.75rem 0.9rem', color: '#6b7280', fontSize: '0.8rem' }}>/{s.slug}</td>
                <td style={{ padding: '0.75rem 0.9rem', color: '#6b7280', fontSize: '0.8rem' }}>{s.features?.length || 0} items</td>
                <td style={{ padding: '0.75rem 0.9rem' }}>
                  <span style={{ fontSize: '0.72rem', padding: '0.2rem 0.5rem', borderRadius: '4px', background: s.active ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', color: s.active ? '#16a34a' : '#ef4444', fontWeight: 600 }}>{s.active ? 'Active' : 'Hidden'}</span>
                </td>
                <td style={{ padding: '0.75rem 0.9rem' }}>
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <button onClick={() => openEdit(s)} style={{ background: '#f3f4f6', border: 'none', borderRadius: '0.4rem', color: '#374151', padding: '0.35rem 0.6rem', cursor: 'pointer' }}><Edit2 size={13}/></button>
                    <button onClick={() => del(s.id)} style={{ background: 'rgba(239,68,68,0.1)', border: 'none', borderRadius: '0.4rem', color: '#f87171', padding: '0.35rem 0.6rem', cursor: 'pointer' }}><Trash2 size={13}/></button>
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

export default ServicesManager;
