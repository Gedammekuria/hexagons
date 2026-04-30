import React, { useState, useEffect } from 'react';
import { getProjects, createProject, updateProject, deleteProject, uploadImage, getProjectCategories } from '../../../api/client';
import { Plus, Edit2, Trash2, Folder, Star, Upload, Search, RefreshCw, X, Save, Loader2 } from 'lucide-react';
import { useToast } from '../../../components/Toast';

const EMPTY = { title: '', category: 'Software & Web Development', description: '', image: '', tags: '', link: '', show_link: true, featured: false };
const inp = { width: '100%', boxSizing: 'border-box', padding: '0.7rem 0.9rem', background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '0.5rem', fontSize: '0.9rem', outline: 'none' };

const ProjectManager = ({ token }) => {
  const [projects, setProjects] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving]   = useState(false);
  const [search, setSearch]   = useState('');
  const [filter, setFilter]   = useState('all');
  const [featuredFilter, setFeaturedFilter] = useState('all');
  const [date, setDate]       = useState('');
  const [page, setPage]       = useState(1);
  const [delConfirm, setDelConfirm] = useState(null);
  const { addToast } = useToast();
  const LIMIT = 15;
  const [categories, setCategories] = useState([
    'IT Support & Consulting',
    'Networking & Infrastructure',
    'Security & Surveillance',
    'Cybersecurity & Antivirus',
    'Digital Marketing & Graphics',
    'Software & Web Development',
    'Web Hosting & Domains'
  ]);

  const load = async () => {
    setLoading(true);
    try { const r = await getProjects(); setProjects(r); }
    catch {} finally { setLoading(false); }
  };

  useEffect(() => { 
    load(); 
    getProjectCategories().then(dbCategories => {
      if (dbCategories && dbCategories.length > 0) {
        setCategories(prev => Array.from(new Set([...prev, ...dbCategories])));
      }
    }).catch(() => {});
  }, []);

  const openNew = () => { setForm(EMPTY); setEditing('new'); };
  const openEdit = (p) => { setForm({ ...p, tags: (p.tags || []).join(', '), show_link: !!p.show_link, featured: !!p.featured }); setEditing(p.id); };
  const cancel = () => { setEditing(null); };

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
    setSaving(true);
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

  const execDel = async () => {
    try {
      await deleteProject(token, delConfirm);
      addToast('Project deleted', 'success');
      setDelConfirm(null); load();
    } catch (e) { addToast('Delete failed: ' + e.message, 'error'); }
  };

  const filteredProjects = projects.filter(p => {
    const matchesSearch = !search || 
      p.title.toLowerCase().includes(search.toLowerCase()) || 
      p.description.toLowerCase().includes(search.toLowerCase());
    
    const matchesCategory = filter === 'all' || p.category === filter;
    const matchesFeatured = featuredFilter === 'all' || 
      (featuredFilter === 'featured' && p.featured) || 
      (featuredFilter === 'regular' && !p.featured);
    
    const matchesDate = !date || (p.created_at && new Date(p.created_at).toISOString().split('T')[0] === date);
    
    return matchesSearch && matchesCategory && matchesFeatured && matchesDate;
  });

  const totalPages = Math.ceil(filteredProjects.length / LIMIT);
  const paginatedProjects = filteredProjects.slice((page - 1) * LIMIT, page * LIMIT);

  useEffect(() => { setPage(1); }, [search, filter, featuredFilter, date]);

  if (editing !== null) return (
    <div style={{ padding: '2rem', maxWidth: 700 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <h2 style={{ color: '#111827', margin: 0 }}>{editing === 'new' ? 'New Project' : 'Edit Project'}</h2>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={cancel} style={{ background: '#ffffff', border: 'none', borderRadius: '0.5rem', color: '#6b7280', padding: '0.5rem 0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}><X size={15}/> Cancel</button>
          <button onClick={saveProject} disabled={saving} style={{ background: 'linear-gradient(135deg,#00b37a,#009966)', border: 'none', borderRadius: '0.5rem', color: '#fff', padding: '0.5rem 1rem', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            {saving ? <Loader2 size={14}/> : <Save size={14}/>} {saving ? 'Saving...' : 'Save Project'}
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
          <label style={{ display: 'block', fontSize: '0.8rem', color: '#6b7280', marginBottom: '0.3rem' }}>Tags (comma separated)</label>
          <input value={form.tags} onChange={e => set('tags', e.target.value)} style={inp} placeholder="React, Node.js, SQLite" />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', color: '#6b7280', marginBottom: '0.3rem' }}>External Link</label>
          <input value={form.link} onChange={e => set('link', e.target.value)} style={inp} placeholder="https://..." />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', color: '#6b7280', marginBottom: '0.3rem' }}>Project Image</label>
            {form.image && (
              <div style={{ width: '100%', height: '140px', background: '#f3f4f6', borderRadius: '0.5rem', overflow: 'hidden', border: '1px solid #e5e7eb', marginBottom: '0.5rem' }}>
                <img 
                  src={form.image.startsWith('http') ? form.image : (form.image.startsWith('/images') ? form.image : `${form.image}`)} 
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
          </div>
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', color: '#6b7280', marginBottom: '0.3rem' }}>Description</label>
          <textarea rows={4} value={form.description} onChange={e => set('description', e.target.value)} style={{ ...inp, fontFamily: 'inherit', resize: 'vertical' }} />
        </div>
        <div style={{ display: 'flex', gap: '1.5rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem', color: '#374151' }}>
            <input type="checkbox" checked={form.show_link} onChange={e => set('show_link', e.target.checked)} /> Show external link
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem', color: '#374151' }}>
            <input type="checkbox" checked={form.featured} onChange={e => set('featured', e.target.checked)} /> Featured project
          </label>
        </div>
      </div>
    </div>
  );

  return (
    <div className="admin-content" style={{ padding: '2rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
        <h2 style={{ color: '#111827', margin: 0 }}>Projects <span style={{ color: '#6b7280', fontSize: '1rem' }}>({projects.length})</span></h2>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={load} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: '#ffffff', border: 'none', borderRadius: '0.5rem', color: '#6b7280', padding: '0.5rem 0.9rem', cursor: 'pointer', fontSize: '0.85rem' }}>
            <RefreshCw size={14}/> Refresh
          </button>
          <button onClick={openNew} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', background: 'linear-gradient(135deg,#00b37a,#009966)', border: 'none', borderRadius: '0.5rem', color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem' }}>
            <Plus size={16}/> Add Project
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 180 }}>
          <Search size={13} style={{ position: 'absolute', left: '0.6rem', top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }}/>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search projects by title or description..." style={{ ...inp, paddingLeft: '2rem', fontSize: '0.85rem' }}/>
        </div>
        <select value={filter} onChange={e => setFilter(e.target.value)} style={{ ...inp, width: 'auto', paddingLeft: '0.75rem', fontSize: '0.85rem' }}>
          <option value="all">All Categories</option>
          {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
        </select>
        <select value={featuredFilter} onChange={e => setFeaturedFilter(e.target.value)} style={{ ...inp, width: 'auto', paddingLeft: '0.75rem', fontSize: '0.85rem' }}>
          <option value="all">All Projects</option>
          <option value="featured">Featured Only</option>
          <option value="regular">Regular Only</option>
        </select>
        <input 
          type="date" 
          value={date} 
          onChange={e => setDate(e.target.value)} 
          style={{ ...inp, width: 'auto', paddingLeft: '0.75rem', fontSize: '0.85rem', color: date ? '#111827' : '#6b7280' }}
        />
        {(search || filter !== 'all' || featuredFilter !== 'all' || date) && (
          <button 
            onClick={() => { setSearch(''); setFilter('all'); setFeaturedFilter('all'); setDate(''); }}
            style={{ background: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: '0.5rem', padding: '0 0.8rem', color: '#374151', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 500 }}
          >
            Clear
          </button>
        )}
      </div>

      {loading ? <div style={{ color: '#6b7280', textAlign: 'center', padding: '3rem' }}>Loading…</div> :
        filteredProjects.length === 0 ? <div style={{ color: '#6b7280', textAlign: 'center', padding: '3rem', background: '#ffffff', borderRadius: '0.75rem' }}>No projects found.</div> :
        <div className="table-container">
          <table className="admin-table">
            <thead><tr style={{ borderBottom: '1px solid #e5e7eb' }}>
              {['ID', 'Image', 'Title', 'Category', 'Featured', 'Created', 'Link', 'Tags', 'Action'].map(h => <th key={h} style={{ padding: '0.7rem 0.9rem', color: '#6b7280', fontSize: '0.72rem', fontWeight: 600, textAlign: 'left', textTransform: 'uppercase' }}>{h}</th>)}
            </tr></thead>
            <tbody>{paginatedProjects.map(p => (
              <tr key={p.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                <td style={{ padding: '0.75rem 0.9rem', color: '#6b7280', fontSize: '0.8rem' }}>PRO_{p.id}</td>
                <td style={{ padding: '0.75rem 0.9rem' }}>
                  {p.image ? (
                    <img src={p.image.startsWith('http') ? p.image : (p.image.startsWith('/images') ? p.image : `${p.image}`)} alt={p.title} style={{ width: 40, height: 40, borderRadius: '4px', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: 40, height: 40, borderRadius: '4px', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}><Folder size={18} /></div>
                  )}
                </td>
                <td style={{ padding: '0.75rem 0.9rem', color: '#111827', fontWeight: 600, fontSize: '0.88rem' }}>{p.title}</td>
                <td style={{ padding: '0.75rem 0.9rem', color: '#6b7280', fontSize: '0.83rem' }}>{p.category}</td>
                <td style={{ padding: '0.75rem 0.9rem' }}>
                  {p.featured ? <Star size={16} fill="#facc15" color="#facc15" /> : <span style={{ color: '#d1d5db' }}>—</span>}
                </td>
                <td style={{ padding: '0.75rem 0.9rem', color: '#6b7280', fontSize: '0.78rem' }}>{new Date(p.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</td>
                <td style={{ padding: '0.75rem 0.9rem', color: '#3b82f6', fontSize: '0.8rem', maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {p.link ? <a href={p.link} target="_blank" rel="noopener noreferrer">{p.link.replace(/^https?:\/\//, '')}</a> : '—'}
                </td>
                <td style={{ padding: '0.75rem 0.9rem' }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.2rem' }}>
                    {(p.tags || []).slice(0, 2).map(tag => (
                      <span key={tag} style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem', borderRadius: '4px', background: '#f3f4f6', color: '#6b7280' }}>{tag}</span>
                    ))}
                    {(p.tags || []).length > 2 && <span style={{ fontSize: '0.65rem', color: '#9ca3af' }}>+{p.tags.length - 2}</span>}
                  </div>
                </td>
                <td style={{ padding: '0.75rem 0.9rem' }}>
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <button onClick={() => openEdit(p)} style={{ background: '#f3f4f6', border: 'none', borderRadius: '0.4rem', color: '#374151', padding: '0.35rem 0.6rem', cursor: 'pointer' }}><Edit2 size={13}/></button>
                    <button onClick={() => setDelConfirm(p.id)} style={{ background: 'rgba(239,68,68,0.1)', border: 'none', borderRadius: '0.4rem', color: '#f87171', padding: '0.35rem 0.6rem', cursor: 'pointer' }}><Trash2 size={13}/></button>
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

      {delConfirm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, backdropFilter: 'blur(4px)' }}>
          <div style={{ background: 'white', padding: '2rem', borderRadius: '1rem', maxWidth: 400, width: '90%', textAlign: 'center', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <div style={{ width: 50, height: 50, borderRadius: '50%', background: 'rgba(239,68,68,0.1)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}><Trash2 size={24} /></div>
            <h3 style={{ margin: '0 0 0.5rem', color: '#111827' }}>Delete Project?</h3>
            <p style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '1.5rem' }}>This action cannot be undone. All project data will be permanently removed.</p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={() => setDelConfirm(null)} style={{ flex: 1, padding: '0.7rem', borderRadius: '0.5rem', border: '1px solid #e5e7eb', background: '#fff', color: '#374151', cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
              <button onClick={execDel} style={{ flex: 1, padding: '0.7rem', borderRadius: '0.5rem', border: 'none', background: '#ef4444', color: 'white', cursor: 'pointer', fontWeight: 600 }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectManager;
