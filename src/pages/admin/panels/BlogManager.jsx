import React, { useState, useEffect } from 'react';
import { getBlogPosts, createPost, updatePost, deletePost, uploadImage } from '../../../api/client';
import { Plus, Edit2, Trash2, Save, X, Loader2, Eye, EyeOff, FileText, Search, RefreshCw } from 'lucide-react';
import { useToast } from '../../../components/Toast';

const EMPTY = { title: '', slug: '', excerpt: '', body: '', image: '', category: 'General', tags: '', status: 'draft', author: 'Hexagon Team' };
const inp = { width: '100%', boxSizing: 'border-box', padding: '0.7rem 0.9rem', background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '0.5rem', color: '#111827', fontSize: '0.9rem', outline: 'none' };
const ta  = { ...inp, resize: 'vertical', fontFamily: 'inherit' };

const statusBadgeStyle = s => ({
  published: { bg: 'rgba(34,197,94,0.15)',  color: '#4ade80' },
  draft:     { bg: 'rgba(234,179,8,0.15)',  color: '#facc15' },
}[s] || { bg: 'rgba(100,116,139,0.15)', color: '#94a3b8' });

const BlogManager = ({ token }) => {
  const [posts, setPosts]   = useState([]);
  const [total, setTotal]   = useState(0);
  const [editing, setEditing] = useState(null);
  const [form, setForm]     = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving]   = useState(false);
  const [search, setSearch]   = useState('');
  const [filter, setFilter]   = useState('all');
  const [date, setDate]       = useState('');
  const [page, setPage]       = useState(1);
  const [msg, setMsg]         = useState('');
  const LIMIT = 15;
  const { addToast }          = useToast();
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const load = async () => {
    setLoading(true);
    try { 
      const r = await getBlogPosts(token, { limit: 100 }); 
      setPosts(r.posts || []); 
      setTotal(r.total || 0); 
    }
    catch (e) {
      addToast('Failed to load posts', 'error');
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { load(); }, []);

  const openNew  = () => { setForm({ ...EMPTY }); setEditing('new'); };
  const openEdit = (p) => { 
    setForm({ ...p, tags: Array.isArray(p.tags) ? p.tags.join(', ') : (p.tags || '') }); 
    setEditing(p.id); 
  };
  const cancel   = () => { setEditing(null); setMsg(''); };

  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const autoSlug = (title) => {
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    set('slug', slug);
  };

  const savePost = async () => {
    setSaving(true);
    const payload = { ...form, tags: form.tags.split(',').map(t => t.trim()).filter(Boolean) };
    try {
      if (editing === 'new') await createPost(token, payload);
      else await updatePost(token, editing, payload);
      addToast(editing === 'new' ? 'Post created!' : 'Post updated!', 'success');
      await load(); cancel();
    } catch (e) { addToast('Error: ' + e.message, 'error'); }
    finally { setSaving(false); }
  };

  const executeDelete = async () => {
    try {
      await deletePost(token, deleteConfirm);
      addToast('Post deleted', 'success');
      setDeleteConfirm(null); await load();
    } catch (e) { addToast('Delete failed: ' + e.message, 'error'); }
  };

  const toggleStatus = async (p) => {
    try {
      await updatePost(token, p.id, { ...p, status: p.status === 'draft' ? 'published' : 'draft' });
      addToast(`Post ${p.status === 'draft' ? 'published' : 'moved to draft'}`, 'success');
      await load();
    } catch (e) { addToast('Error: ' + e.message, 'error'); }
  };

  const filteredPosts = posts.filter(p => {
    const matchesSearch = !search || 
      p.title.toLowerCase().includes(search.toLowerCase()) || 
      p.body.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filter === 'all' || p.status === filter;
    const matchesDate = !date || (p.created_at && new Date(p.created_at).toISOString().split('T')[0] === date);
    return matchesSearch && matchesStatus && matchesDate;
  });

  const totalPages = Math.ceil(filteredPosts.length / LIMIT);
  const paginatedPosts = filteredPosts.slice((page - 1) * LIMIT, page * LIMIT);

  useEffect(() => { setPage(1); }, [search, filter, date]);

  if (editing !== null) return (
    <div style={{ padding: '2rem', overflowY: 'auto', maxWidth: 760 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <h2 style={{ color: '#111827', margin: 0 }}>{editing === 'new' ? 'New Post' : 'Edit Post'}</h2>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {msg && <span style={{ color: msg.startsWith('E') ? '#f87171' : '#4ade80', fontSize: '0.85rem' }}>{msg}</span>}
          <button onClick={cancel} style={{ background: '#ffffff', border: 'none', borderRadius: '0.5rem', color: '#6b7280', padding: '0.5rem 0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}><X size={15} /> Cancel</button>
          <button onClick={savePost} disabled={saving} style={{ background: 'linear-gradient(135deg,#00b37a,#009966)', border: 'none', borderRadius: '0.5rem', color: '#fff', padding: '0.5rem 1rem', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            {saving ? <Loader2 size={14} /> : <Save size={14} />} {saving ? 'Saving…' : 'Save Post'}
          </button>
        </div>
      </div>

      {[['Title', 'title', 'text'], ['Slug (URL)', 'slug', 'text'], ['Author', 'author', 'text'], ['Category', 'category', 'text'], ['Tags (comma separated)', 'tags', 'text']].map(([label, key, type]) => (
        <div key={key} style={{ marginBottom: '0.9rem' }}>
          <label style={{ display: 'block', color: '#6b7280', fontSize: '0.78rem', marginBottom: '0.3rem' }}>{label}</label>
          <input type={type} value={form[key] || ''} onChange={e => { set(key, e.target.value); if (key === 'title' && editing === 'new') autoSlug(e.target.value); }} style={inp} />
        </div>
      ))}

      <div style={{ marginBottom: '0.9rem' }}>
        <label style={{ display: 'block', color: '#6b7280', fontSize: '0.78rem', marginBottom: '0.3rem' }}>Cover Photo</label>
        {form.image && (
          <div style={{ marginBottom: '0.5rem' }}>
            <img src={form.image} alt="Preview" style={{ maxHeight: 100, borderRadius: '0.4rem', border: '1px solid #e5e7eb' }} />
          </div>
        )}
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <input type="text" value={form.image || ''} onChange={e => set('image', e.target.value)} style={{ ...inp, flex: 1 }} placeholder="Image URL..." />
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1rem', background: '#ffffff', border: '1px dashed #00b37a', borderRadius: '0.5rem', cursor: 'pointer', color: '#00b37a', whiteSpace: 'nowrap' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Upload</span>
            <input type="file" accept="image/*" onChange={async (e) => {
              const file = e.target.files[0];
              if (!file) return;
              setMsg('Uploading...');
              try {
                const res = await uploadImage(token, file);
                set('image', res.url);
                setMsg('Uploaded!');
                setTimeout(() => setMsg(''), 2000);
              } catch (err) { setMsg('Failed: ' + err.message); }
            }} style={{ display: 'none' }} />
          </label>
        </div>
      </div>

      <div style={{ marginBottom: '0.9rem' }}>
        <label style={{ display: 'block', color: '#6b7280', fontSize: '0.78rem', marginBottom: '0.3rem' }}>Status</label>
        <select value={form.status} onChange={e => set('status', e.target.value)} style={inp}>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
        </select>
      </div>

      <div style={{ marginBottom: '0.9rem' }}>
        <label style={{ display: 'block', color: '#6b7280', fontSize: '0.78rem', marginBottom: '0.3rem' }}>Excerpt</label>
        <textarea rows={3} value={form.excerpt || ''} onChange={e => set('excerpt', e.target.value)} style={ta} />
      </div>
      <div>
        <label style={{ display: 'block', color: '#6b7280', fontSize: '0.78rem', marginBottom: '0.3rem' }}>Body Content</label>
        <textarea rows={14} value={form.body || ''} onChange={e => set('body', e.target.value)} style={ta} />
      </div>
    </div>
  );

  return (
    <div className="admin-content" style={{ padding: '2rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
        <h2 style={{ color: '#111827', margin: 0 }}>Blog Posts <span style={{ color: '#6b7280', fontSize: '1rem' }}>({total})</span></h2>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={load} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: '#ffffff', border: 'none', borderRadius: '0.5rem', color: '#6b7280', padding: '0.5rem 0.9rem', cursor: 'pointer', fontSize: '0.85rem' }}>
            <RefreshCw size={14}/> Refresh
          </button>
          <button onClick={openNew} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', background: 'linear-gradient(135deg,#00b37a,#009966)', border: 'none', borderRadius: '0.5rem', color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem' }}>
            <Plus size={16}/> New Post
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 180 }}>
          <Search size={13} style={{ position: 'absolute', left: '0.6rem', top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }}/>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search posts by title or content..." style={{ ...inp, paddingLeft: '2rem', fontSize: '0.85rem' }}/>
        </div>
        <input 
          type="date" 
          value={date} 
          onChange={e => setDate(e.target.value)} 
          style={{ ...inp, width: 'auto', paddingLeft: '0.75rem', fontSize: '0.85rem', color: date ? '#111827' : '#6b7280' }}
        />
        <select value={filter} onChange={e => setFilter(e.target.value)} style={{ ...inp, width: 'auto', paddingLeft: '0.75rem', fontSize: '0.85rem' }}>
          <option value="all">All Status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
        {(search || filter !== 'all' || date) && (
          <button onClick={() => { setSearch(''); setFilter('all'); setDate(''); }} style={{ background: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: '0.5rem', padding: '0 0.8rem', color: '#374151', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 500 }}>Clear</button>
        )}
      </div>

      {loading ? <div style={{ color: '#6b7280', textAlign: 'center', padding: '3rem' }}>Loading…</div> :
        filteredPosts.length === 0 ? <div style={{ color: '#6b7280', textAlign: 'center', padding: '3rem', background: '#ffffff', borderRadius: '0.75rem' }}>No posts found.</div> :
        <div className="table-container">
          <table className="admin-table">
            <thead><tr style={{ borderBottom: '1px solid #e5e7eb' }}>
              {['Date', 'Cover', 'Title', 'Category', 'Status', 'Action'].map(h => <th key={h} style={{ padding: '0.7rem 0.9rem', color: '#6b7280', fontSize: '0.72rem', fontWeight: 600, textAlign: 'left', textTransform: 'uppercase' }}>{h}</th>)}
            </tr></thead>
            <tbody>{paginatedPosts.map(p => {
              const s = statusBadgeStyle(p.status);
              return (
                <tr key={p.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '0.75rem 0.9rem', color: '#6b7280', fontSize: '0.78rem' }}>{new Date(p.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</td>
                  <td style={{ padding: '0.75rem 0.9rem' }}>
                    {p.image ? <img src={p.image} alt="" style={{ width: 40, height: 30, borderRadius: '4px', objectFit: 'cover' }} /> : <div style={{ width: 40, height: 30, borderRadius: '4px', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FileText size={14} /></div>}
                  </td>
                  <td style={{ padding: '0.75rem 0.9rem', color: '#111827', fontWeight: 600, fontSize: '0.88rem', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.title}</td>
                  <td style={{ padding: '0.75rem 0.9rem', color: '#6b7280', fontSize: '0.83rem' }}>{p.category}</td>
                  <td style={{ padding: '0.75rem 0.9rem' }}>
                    <span style={{ padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.72rem', fontWeight: 600, background: s.bg, color: s.color }}>{p.status}</span>
                  </td>
                  <td style={{ padding: '0.75rem 0.9rem' }}>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button onClick={() => toggleStatus(p)} title={p.status === 'draft' ? 'Publish' : 'Unpublish'} style={{ background: '#f3f4f6', border: 'none', borderRadius: '0.4rem', color: p.status === 'draft' ? '#4ade80' : '#facc15', padding: '0.35rem 0.6rem', cursor: 'pointer' }}>{p.status === 'draft' ? <Eye size={13}/> : <EyeOff size={13}/>}</button>
                      <button onClick={() => openEdit(p)} style={{ background: '#f3f4f6', border: 'none', borderRadius: '0.4rem', color: '#374151', padding: '0.35rem 0.6rem', cursor: 'pointer' }}><Edit2 size={13}/></button>
                      <button onClick={() => setDeleteConfirm(p.id)} style={{ background: 'rgba(239,68,68,0.1)', border: 'none', borderRadius: '0.4rem', color: '#f87171', padding: '0.35rem 0.6rem', cursor: 'pointer' }}><Trash2 size={13}/></button>
                    </div>
                  </td>
                </tr>
              );
            })}</tbody>
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

      {deleteConfirm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, backdropFilter: 'blur(4px)' }}>
          <div style={{ background: 'white', padding: '2rem', borderRadius: '1rem', maxWidth: 400, width: '90%', textAlign: 'center' }}>
            <h3 style={{ margin: '0 0 1rem' }}>Delete Post?</h3>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={() => setDeleteConfirm(null)} style={{ flex: 1, padding: '0.7rem', borderRadius: '0.5rem', border: 'none' }}>Cancel</button>
              <button onClick={executeDelete} style={{ flex: 1, padding: '0.7rem', borderRadius: '0.5rem', border: 'none', background: '#ef4444', color: 'white' }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogManager;
