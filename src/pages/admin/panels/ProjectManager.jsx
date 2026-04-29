import React, { useState, useEffect } from 'react';
import { getProjects, createProject, updateProject, deleteProject, uploadImage, getProjectCategories } from '../../../api/client';
import { Plus, Edit2, Trash2, Folder, Star, Image as ImageIcon, Upload } from 'lucide-react';
import { useToast } from '../../../components/Toast';

const EMPTY = { title: '', category: 'Software & Web Development', description: '', image: '', tags: '', link: '', show_link: true, featured: false };

const ProjectManager = ({ token }) => {
  const [projects, setProjects] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [delConfirm, setDelConfirm] = useState(null);
  const { addToast } = useToast();
  const [categories, setCategories] = useState([
    'IT Support & Consulting',
    'Networking & Infrastructure',
    'Security & Surveillance',
    'Cybersecurity & Antivirus',
    'Digital Marketing & Graphics',
    'Software & Web Development',
    'Web Hosting & Domains'
  ]); // Full list of company services

  const load = async () => {
    setLoading(true);
    try { const r = await getProjects(); setProjects(r); }
    catch {} finally { setLoading(false); }
  };

  useEffect(() => { 
    load(); 
    // Fetch unique categories from DB and merge with defaults
    getProjectCategories().then(dbCategories => {
      if (dbCategories && dbCategories.length > 0) {
        setCategories(prev => Array.from(new Set([...prev, ...dbCategories])));
      }
    }).catch(() => {});
  }, []);

  const openNew = () => { setForm(EMPTY); setEditing('new'); };
  const openEdit = (p) => { setForm({ ...p, tags: (p.tags || []).join(', '), show_link: !!p.show_link, featured: !!p.featured }); setEditing(p.id); };
  const cancel = () => { setEditing(null); setMsg(''); };

  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSaving(true);
    try {
      const res = await uploadImage(token, file);
      set('image', res.url);
      addToast('Image uploaded!', 'success');
    } catch (e) { addToast('Upload Error: ' + e.message, 'error'); }
    finally { setSaving(false); }
  };

  const saveProject = async () => {
    setSaving(true); setMsg('');
    const payload = { 
      ...form, 
      tags: (form.tags || '').split(',').map(t => t.trim()).filter(Boolean) 
    };
    try {
      if (editing === 'new') await createProject(token, payload);
      else await updateProject(token, editing, payload);
      addToast(editing === 'new' ? 'Project created!' : 'Project updated!', 'success');
      await load(); cancel();
    } catch (e) { addToast('Error: ' + e.message, 'error'); }
    finally { setSaving(false); }
  };

  const del = (id) => setDelConfirm(id);
  const execDel = async () => {
    try {
      await deleteProject(token, delConfirm);
      addToast('Project deleted', 'success');
      setDelConfirm(null); load();
    } catch (e) { addToast('Delete failed: ' + e.message, 'error'); }
  };

  const inp = { width: '100%', boxSizing: 'border-box', padding: '0.7rem 0.9rem', background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '0.5rem', fontSize: '0.9rem', outline: 'none' };

  if (editing !== null) return (
    <div style={{ padding: '2rem', maxWidth: 700 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <h2 style={{ color: '#111827', margin: 0 }}>{editing === 'new' ? 'New Project' : 'Edit Project'}</h2>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={cancel} style={{ background: '#f3f4f6', border: 'none', borderRadius: '0.5rem', padding: '0.5rem 1rem', cursor: 'pointer' }}>Cancel</button>
          <button onClick={saveProject} disabled={saving} style={{ background: '#00b37a', color: 'white', border: 'none', borderRadius: '0.5rem', padding: '0.5rem 1rem', cursor: 'pointer', fontWeight: 600 }}>
            {saving ? 'Saving...' : 'Save Project'}
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', color: '#6b7280', marginBottom: '0.3rem' }}>Project Title</label>
          <input value={form.title} onChange={e => set('title', e.target.value)} style={inp} placeholder="e.g. ERP System v2" />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', color: '#6b7280', marginBottom: '0.3rem' }}>Category</label>
          <select value={form.category} onChange={e => set('category', e.target.value)} style={inp}>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', color: '#6b7280', marginBottom: '0.3rem' }}>Tags (comma separated, optional)</label>
          <input value={form.tags} onChange={e => set('tags', e.target.value)} style={inp} placeholder="React, Node.js, SQLite" />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', color: '#6b7280', marginBottom: '0.3rem' }}>External Link (optional)</label>
          <input value={form.link} onChange={e => set('link', e.target.value)} style={inp} placeholder="https://..." />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', color: '#6b7280', marginBottom: '0.3rem' }}>Project Image (optional)</label>
            {form.image && (
              <div style={{ width: '100%', height: '140px', background: '#f3f4f6', borderRadius: '0.5rem', overflow: 'hidden', border: '1px solid #e5e7eb', marginBottom: '0.5rem' }}>
                <img 
                  src={form.image.startsWith('http') ? form.image : (form.image.startsWith('/images') ? form.image : `http://localhost:5000${form.image}`)} 
                  alt="Preview" 
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
                />
              </div>
            )}
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <input type="text" value={form.image} onChange={e => set('image', e.target.value)} style={{ ...inp, flex: 1 }} placeholder="Image URL..." />
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1rem', background: '#ffffff', border: '1px dashed #00b37a', borderRadius: '0.5rem', cursor: 'pointer', color: '#00b37a', whiteSpace: 'nowrap' }}>
              <Upload size={18} />
              <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Upload Image</span>
              <input type="file" onChange={handleImageUpload} style={{ display: 'none' }} accept="image/*" />
            </label>
            <div style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 500, background: '#f8fafc', padding: '0.6rem 0.8rem', borderRadius: '0.4rem', border: '1px solid #e2e8f0', whiteSpace: 'nowrap' }}>
              Rec: <strong style={{ color: '#111827' }}>800x400 (2:1)</strong>
            </div>
          </div>
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', color: '#6b7280', marginBottom: '0.3rem' }}>Description (optional)</label>
          <textarea rows={4} value={form.description} onChange={e => set('description', e.target.value)} style={{ ...inp, fontFamily: 'inherit', resize: 'vertical' }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input type="checkbox" id="show_link" checked={form.show_link} onChange={e => set('show_link', e.target.checked)} />
            <label htmlFor="show_link" style={{ fontSize: '0.9rem', color: '#374151', cursor: 'pointer' }}>Show external link on project page</label>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input type="checkbox" id="featured" checked={form.featured} onChange={e => set('featured', e.target.checked)} />
            <label htmlFor="featured" style={{ fontSize: '0.9rem', color: '#374151', cursor: 'pointer' }}>Feature this project on homepage</label>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <h2 style={{ color: '#111827', margin: 0 }}>Projects <span style={{ color: '#9ca3af', fontSize: '1rem' }}>({projects.length})</span></h2>
        <button onClick={openNew} style={{ background: '#00b37a', color: 'white', border: 'none', borderRadius: '0.5rem', padding: '0.6rem 1.2rem', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Plus size={18} /> Add Project
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
        {projects.map(p => (
          <div key={p.id} style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '0.75rem', padding: '1.25rem', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.75rem' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '0.5rem', background: '#f3f4f6', overflow: 'hidden', flexShrink: 0, border: '1px solid #e5e7eb' }}>
                {p.image ? (
                  <img 
                    src={p.image.startsWith('http') ? p.image : (p.image.startsWith('/images') ? p.image : `http://localhost:5000${p.image}`)} 
                    alt={p.title} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                  />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>
                    <Folder size={24} />
                  </div>
                )}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <span style={{ fontSize: '0.7rem', color: '#00b37a', fontWeight: 700, textTransform: 'uppercase' }}>{p.category}</span>
                    <h3 style={{ margin: '0.2rem 0', fontSize: '1.1rem' }}>{p.title}</h3>
                  </div>
                  {p.featured ? <Star size={18} fill="#facc15" color="#facc15" /> : null}
                </div>
              </div>
            </div>
            <p style={{ color: '#6b7280', fontSize: '0.85rem', flex: 1, margin: '0 0 1rem' }}>{p.description?.substring(0, 100)}...</p>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
              <button onClick={() => openEdit(p)} style={{ flex: 1, padding: '0.5rem', background: '#f3f4f6', border: 'none', borderRadius: '0.4rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}><Edit2 size={14}/> Edit</button>
              <button onClick={() => del(p.id)} style={{ padding: '0.5rem', background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '0.4rem', cursor: 'pointer' }}><Trash2 size={14}/></button>
            </div>
          </div>
        ))}
      </div>

      {delConfirm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000 }}>
          <div style={{ background: 'white', padding: '2rem', borderRadius: '1rem', maxWidth: 400, textAlign: 'center' }}>
            <h3 style={{ margin: '0 0 1rem' }}>Delete Project?</h3>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={() => setDelConfirm(null)} style={{ flex: 1, padding: '0.6rem', borderRadius: '0.5rem', border: 'none' }}>Cancel</button>
              <button onClick={execDel} style={{ flex: 1, padding: '0.6rem', borderRadius: '0.5rem', border: 'none', background: '#ef4444', color: 'white' }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectManager;
