import React, { useState, useEffect } from 'react';
import { getServices, createService, updateService, deleteService, uploadImage } from '../../../api/client';
import { Plus, Edit2, Trash2, Save, X, Loader2, Image as ImageIcon, Layout, List, Trash } from 'lucide-react';
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

const ServicesManager = ({ token }) => {
  const [services, setServices] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { addToast } = useToast();

  const load = async () => {
    setLoading(true);
    try { 
      const data = await getServices(); 
      setServices(data); 
    } catch (e) {
      addToast('Failed to load services', 'error');
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { load(); }, []);

  const openNew = () => { 
    setForm({ ...EMPTY, features: [ { ...EMPTY_FEATURE, highlights: [] } ] }); 
    setEditing('new'); 
  };

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

  const autoSlug = (title) => {
    if (editing !== 'new') return;
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    set('slug', slug);
  };

  const addFeature = () => {
    set('features', [...form.features, { ...EMPTY_FEATURE, highlights: [] }]);
  };

  const removeFeature = (idx) => {
    const next = [...form.features];
    next.splice(idx, 1);
    set('features', next);
  };

  const updateFeature = (idx, k, v) => {
    const next = [...form.features];
    next[idx] = { ...next[idx], [k]: v };
    set('features', next);
  };

  const addHighlight = (fIdx) => {
    const next = [...form.features];
    const highlights = [...(next[fIdx].highlights || [])];
    highlights.push('');
    next[fIdx] = { ...next[fIdx], highlights };
    set('features', next);
  };

  const updateHighlight = (fIdx, hIdx, val) => {
    const next = [...form.features];
    const highlights = [...(next[fIdx].highlights || [])];
    highlights[hIdx] = val;
    next[fIdx] = { ...next[fIdx], highlights };
    set('features', next);
  };

  const removeHighlight = (fIdx, hIdx) => {
    const next = [...form.features];
    const highlights = [...(next[fIdx].highlights || [])];
    highlights.splice(hIdx, 1);
    next[fIdx] = { ...next[fIdx], highlights };
    set('features', next);
  };

  const save = async () => {
    setSaving(true);
    try {
      if (editing === 'new') await createService(token, form);
      else await updateService(token, editing, form);
      addToast(editing === 'new' ? 'Service created!' : 'Service updated!', 'success');
      await load(); cancel();
    } catch (e) {
      addToast('Error: ' + e.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const del = async (id) => {
    if (!window.confirm('Are you sure you want to delete this service?')) return;
    try {
      await deleteService(token, id);
      addToast('Service deleted', 'success');
      load();
    } catch (e) {
      addToast('Delete failed: ' + e.message, 'error');
    }
  };

  if (editing !== null) return (
    <div style={{ padding: '2rem', overflowY: 'auto', maxWidth: 800 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <h2 style={{ color: '#111827', margin: 0 }}>{editing === 'new' ? 'Add Service' : 'Edit Service'}</h2>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={cancel} style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '0.5rem', color: '#6b7280', padding: '0.5rem 1rem', cursor: 'pointer' }}>Cancel</button>
          <button onClick={save} disabled={saving} style={{ background: 'linear-gradient(135deg,#2563eb,#1d4ed8)', border: 'none', borderRadius: '0.5rem', color: '#fff', padding: '0.5rem 1rem', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Save Service
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <label style={{ display: 'block', color: '#6b7280', fontSize: '0.8rem', marginBottom: '0.3rem' }}>Service Title</label>
          <input value={form.title} onChange={e => { set('title', e.target.value); autoSlug(e.target.value); }} style={inp} placeholder="e.g. IT Support" />
        </div>
        <div>
          <label style={{ display: 'block', color: '#6b7280', fontSize: '0.8rem', marginBottom: '0.3rem' }}>Slug (URL path)</label>
          <input value={form.slug} onChange={e => set('slug', e.target.value)} style={inp} placeholder="e.g. it-support" />
        </div>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', color: '#6b7280', fontSize: '0.8rem', marginBottom: '0.3rem' }}>Tagline</label>
        <input value={form.tagline} onChange={e => set('tagline', e.target.value)} style={inp} placeholder="e.g. Strategic Technical Partnership" />
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', color: '#6b7280', fontSize: '0.8rem', marginBottom: '0.3rem' }}>Description</label>
        <textarea rows={4} value={form.description} onChange={e => set('description', e.target.value)} style={{ ...inp, resize: 'vertical', fontFamily: 'inherit' }} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <label style={{ display: 'block', color: '#6b7280', fontSize: '0.8rem', marginBottom: '0.3rem' }}>Icon Name (Lucide)</label>
          <input value={form.icon_name} onChange={e => set('icon_name', e.target.value)} style={inp} placeholder="ShieldCheck, Network, etc." />
        </div>
        <div>
          <label style={{ display: 'block', color: '#6b7280', fontSize: '0.8rem', marginBottom: '0.3rem' }}>Color Hex</label>
          <input type="color" value={form.color} onChange={e => set('color', e.target.value)} style={{ ...inp, padding: '0.2rem' }} />
        </div>
        <div>
          <label style={{ display: 'block', color: '#6b7280', fontSize: '0.8rem', marginBottom: '0.3rem' }}>Sort Order</label>
          <input type="number" value={form.sort_order} onChange={e => set('sort_order', parseInt(e.target.value))} style={inp} />
        </div>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h3 style={{ margin: 0, fontSize: '1rem', color: '#111827' }}>Sub-features / Solutions</h3>
          <button onClick={addFeature} style={{ background: 'rgba(37,99,235,0.1)', border: 'none', borderRadius: '0.4rem', color: '#2563eb', padding: '0.4rem 0.8rem', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <Plus size={14} /> Add Feature
          </button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {form.features.map((f, idx) => (
            <div key={idx} style={{ padding: '1rem', background: '#f9fafb', borderRadius: '0.6rem', border: '1px solid #e5e7eb', position: 'relative' }}>
              <button onClick={() => removeFeature(idx)} style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}>
                <Trash size={16} />
              </button>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <input placeholder="Feature Title" value={f.title} onChange={e => updateFeature(idx, 'title', e.target.value)} style={inp} />
                <input placeholder="Lucide Icon Name" value={f.icon} onChange={e => updateFeature(idx, 'icon', e.target.value)} style={inp} />
              </div>
              <textarea placeholder="Feature Description" rows={2} value={f.desc} onChange={e => updateFeature(idx, 'desc', e.target.value)} style={{ ...inp, resize: 'none', marginBottom: '1rem' }} />
              
              {/* Highlights List */}
              <div style={{ paddingLeft: '1rem', borderLeft: '2px solid #e5e7eb' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' }}>Key Highlights</span>
                  <button onClick={() => addHighlight(idx)} style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '0.7rem', fontWeight: 600, cursor: 'pointer' }}>+ Add Point</button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {(f.highlights || []).map((h, hIdx) => (
                    <div key={hIdx} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#2563eb', flexShrink: 0 }} />
                      <input value={h} onChange={e => updateHighlight(idx, hIdx, e.target.value)} style={{ ...inp, padding: '0.4rem 0.6rem', fontSize: '0.8rem' }} placeholder="e.g. 24/7 Monitoring" />
                      <button onClick={() => removeHighlight(idx, hIdx)} style={{ color: '#9ca3af', background: 'none', border: 'none', cursor: 'pointer' }}><X size={14} /></button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
        <input type="checkbox" checked={form.active} onChange={e => set('active', e.target.checked)} />
        <span style={{ fontSize: '0.9rem', color: '#374151' }}>Show on website</span>
      </label>
    </div>
  );

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <h2 style={{ color: '#111827', margin: 0 }}>Service Manager <span style={{ color: '#9ca3af', fontSize: '1rem' }}>({services.length})</span></h2>
        <button onClick={openNew} style={{ background: 'linear-gradient(135deg,#2563eb,#1d4ed8)', border: 'none', borderRadius: '0.5rem', color: '#fff', padding: '0.6rem 1.2rem', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Plus size={18} /> Add New Service
        </button>
      </div>

      {loading ? <div style={{ textAlign: 'center', padding: '3rem' }}><Loader2 className="animate-spin" /></div> :
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
          {services.map(s => (
            <div key={s.id} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '0.8rem', padding: '1.25rem', display: 'flex', flexDirection: 'column', opacity: s.active ? 1 : 0.6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1rem' }}>
                <div style={{ width: 44, height: 44, borderRadius: '0.6rem', background: s.color + '20', color: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Layout size={20} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{ margin: 0, fontSize: '1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.title}</h3>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: '#6b7280' }}>/{s.slug}</p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem', fontSize: '0.8rem', color: '#6b7280' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><List size={14} /> {s.features?.length || 0} Features</span>
                <span>Order: {s.sort_order}</span>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
                <button onClick={() => openEdit(s)} style={{ flex: 1, padding: '0.5rem', background: '#f3f4f6', border: 'none', borderRadius: '0.4rem', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}><Edit2 size={14} /> Edit</button>
                <button onClick={() => del(s.id)} style={{ padding: '0.5rem', background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '0.4rem', cursor: 'pointer' }}><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      }
    </div>
  );
};

export default ServicesManager;
