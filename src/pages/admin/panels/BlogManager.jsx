import React, { useState, useEffect } from 'react';
import { getBlogPosts, createPost, updatePost, deletePost, uploadImage } from '../../../api/client';
import { Plus, Edit2, Trash2, Save, X, Loader2, Eye, EyeOff, Image as ImageIcon, FileText } from 'lucide-react';
import { useToast } from '../../../components/Toast';

const EMPTY = { title: '', slug: '', excerpt: '', body: '', image: '', category: 'General', tags: '', status: 'draft', author: 'Hexagon Team' };

const inp = { width: '100%', boxSizing: 'border-box', padding: '0.7rem 0.9rem', background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '0.5rem', color: '#111827', fontSize: '0.9rem', outline: 'none' };
const ta  = { ...inp, resize: 'vertical', fontFamily: 'inherit' };

const statusBadge = s => ({
  published: { bg: 'rgba(34,197,94,0.15)',  color: '#4ade80' },
  draft:     { bg: 'rgba(234,179,8,0.15)',  color: '#facc15' },
}[s] || { bg: 'rgba(100,116,139,0.15)', color: '#94a3b8' });

const BlogManager = ({ token }) => {
  const [posts, setPosts]   = useState([]);
  const [total, setTotal]   = useState(0);
  const [editing, setEditing] = useState(null); // null = list, {} = form
  const [form, setForm]     = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving]   = useState(false);
  const [msg, setMsg]         = useState('');
  const { addToast }          = useToast();
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const load = async () => {
    setLoading(true);
    try { 
      const r = await getBlogPosts(token, { limit: 50 }); 
      setPosts(r.posts || []); 
      setTotal(r.total || 0); 
    }
    catch (e) {
      console.error('Failed to load blog posts:', e);
      addToast('Failed to load posts', 'error');
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { load(); }, []);

  const openNew  = () => { 
    console.log('Opening new post form');
    setForm({ ...EMPTY }); 
    setEditing('new'); 
  };
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
    setSaving(true); setMsg('');
    const payload = { ...form, tags: form.tags.split(',').map(t => t.trim()).filter(Boolean) };
    try {
      if (editing === 'new') await createPost(token, payload);
      else await updatePost(token, editing, payload);
      addToast(editing === 'new' ? 'Post created!' : 'Post updated!', 'success');
      await load(); cancel();
    } catch (e) { addToast('Error: ' + e.message, 'error'); }
    finally { setSaving(false); }
  };

  const del = (id) => {
    setDeleteConfirm(id);
  };

  const executeDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await deletePost(token, deleteConfirm);
      addToast('Post deleted', 'success');
      setDeleteConfirm(null);
      await load();
    } catch (e) { addToast('Delete failed: ' + e.message, 'error'); }
  };

  const toggleStatus = async (p) => {
    try {
      await updatePost(token, p.id, { ...p, status: p.status === 'draft' ? 'published' : 'draft' });
      addToast(`Post ${p.status === 'draft' ? 'published' : 'moved to draft'}`, 'success');
      await load();
    } catch (e) { addToast('Error: ' + e.message, 'error'); }
  };

  if (editing !== null) return (
    <div style={{ padding: '2rem', overflowY: 'auto', maxWidth: 760 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <h2 style={{ color: '#111827', margin: 0 }}>{editing === 'new' ? 'New Post' : 'Edit Post'}</h2>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {msg && <span style={{ color: msg.startsWith('E') ? '#f87171' : '#4ade80', fontSize: '0.85rem' }}>{msg}</span>}
          <button onClick={cancel} style={{ background: '#ffffff', border: 'none', borderRadius: '0.5rem', color: '#6b7280', padding: '0.5rem 0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}><X size={15} /> Cancel</button>
          <button onClick={savePost} disabled={saving} style={{ background: 'linear-gradient(135deg,#00b37a,#009966)', border: 'none', borderRadius: '0.5rem', color: '#111827', padding: '0.5rem 1rem', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
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
        <label style={{ display: 'block', color: '#6b7280', fontSize: '0.78rem', marginBottom: '0.3rem' }}>Cover Photo URL or Upload</label>
        {form.image && (
          <div style={{ marginBottom: '0.5rem' }}>
            <img 
              src={form.image} 
              alt="Preview" 
              style={{ maxHeight: 100, borderRadius: '0.4rem', border: '1px solid #e5e7eb' }} 
            />
          </div>
        )}
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <input type="text" value={form.image || ''} onChange={e => set('image', e.target.value)} style={{ ...inp, flex: 1 }} placeholder="Image URL..." />
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1rem', background: '#ffffff', border: '1px dashed #00b37a', borderRadius: '0.5rem', cursor: 'pointer', color: '#00b37a', whiteSpace: 'nowrap' }}>
            <ImageIcon size={16} />
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
            Rec: <strong style={{ color: '#111827' }}>1200x630 (~1.9:1)</strong>
          </div>
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
        <textarea rows={14} value={form.body || ''} onChange={e => set('body', e.target.value)} style={ta} placeholder="Write your post content here…" />
      </div>
    </div>
  );

  return (
    <div style={{ padding: '2rem', overflowY: 'auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <h2 style={{ color: '#111827', margin: 0 }}>Blog Posts <span style={{ color: '#6b7280', fontSize: '1rem' }}>({total})</span></h2>
        <button 
          type="button"
          onClick={openNew} 
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.6rem 1.2rem', background: 'linear-gradient(135deg,#00b37a,#009966)', border: 'none', borderRadius: '0.5rem', color: '#ffffff', fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
        >
          <Plus size={16} /> New Post
        </button>
      </div>

      {loading ? <div style={{ color: '#6b7280', textAlign: 'center', padding: '3rem' }}>Loading…</div> :
        !posts || posts.length === 0 ? (
          <div style={{ color: '#6b7280', textAlign: 'center', padding: '4rem 2rem', background: '#ffffff', borderRadius: '0.75rem', border: '1px dashed #e5e7eb', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            <FileText size={40} style={{ opacity: 0.2 }} />
            <div>
              <div style={{ fontWeight: 600, color: '#111827', fontSize: '1.1rem' }}>No posts yet</div>
              <p style={{ margin: '0.25rem 0 1rem', fontSize: '0.9rem' }}>Create your first blog post to get started!</p>
            </div>
            <button 
              type="button"
              onClick={openNew} 
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.6rem 1.2rem', background: 'linear-gradient(135deg,#00b37a,#009966)', border: 'none', borderRadius: '0.5rem', color: '#ffffff', fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
            >
              <Plus size={16} /> Create First Post
            </button>
          </div>
        ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {posts.map(p => {
            const s = statusBadge(p.status);
            return (
              <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.9rem 1.1rem', background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '0.6rem' }}>
                {p.image && (
                  <img 
                    src={p.image} 
                    alt="" 
                    style={{ width: 56, height: 42, objectFit: 'cover', borderRadius: '0.4rem', flexShrink: 0 }} 
                  />
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: '#111827', fontWeight: 600, fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.title}</div>
                  <div style={{ color: '#6b7280', fontSize: '0.75rem' }}>{p.category} · {new Date(p.created_at).toLocaleDateString()}</div>
                </div>
                <span style={{ padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.72rem', fontWeight: 600, background: s.bg, color: s.color, flexShrink: 0 }}>{p.status}</span>
                {p.status === 'draft' ? (
                  <button onClick={() => toggleStatus(p)} title="Publish" style={{ background: '#ffffff', border: 'none', borderRadius: '0.4rem', color: '#4ade80', padding: '0.4rem 0.7rem', cursor: 'pointer' }}><Eye size={14} /></button>
                ) : (
                  <button onClick={() => toggleStatus(p)} title="Unpublish" style={{ background: '#ffffff', border: 'none', borderRadius: '0.4rem', color: '#facc15', padding: '0.4rem 0.7rem', cursor: 'pointer' }}><EyeOff size={14} /></button>
                )}
                <button onClick={() => openEdit(p)} style={{ background: '#ffffff', border: 'none', borderRadius: '0.4rem', color: '#6b7280', padding: '0.4rem 0.7rem', cursor: 'pointer' }}><Edit2 size={14} /></button>
                <button onClick={() => del(p.id)} style={{ background: 'rgba(239,68,68,0.1)', border: 'none', borderRadius: '0.4rem', color: '#f87171', padding: '0.4rem 0.7rem', cursor: 'pointer' }}><Trash2 size={14} /></button>
              </div>
            );
          })}
        </div>
      )}

      {deleteConfirm && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(17, 24, 39, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ background: '#ffffff', padding: '2rem', borderRadius: '0.75rem', maxWidth: 400, width: '90%', textAlign: 'center', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}>
            <div style={{ width: '3rem', height: '3rem', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', color: '#ef4444' }}>
              <Trash2 size={24} />
            </div>
            <h3 style={{ marginTop: 0, color: '#111827', fontSize: '1.25rem', marginBottom: '0.5rem' }}>Confirm Deletion</h3>
            <p style={{ color: '#6b7280', marginBottom: '1.5rem', fontSize: '0.95rem' }}>Are you sure you want to delete this blog? This action cannot be undone.</p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button onClick={() => setDeleteConfirm(null)} style={{ flex: 1, padding: '0.6rem 1rem', background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
              <button onClick={executeDelete} style={{ flex: 1, padding: '0.6rem 1rem', background: '#ef4444', color: '#ffffff', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 600 }}>Delete Blog</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogManager;

