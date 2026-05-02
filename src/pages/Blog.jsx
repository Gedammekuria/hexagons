import React, { useState, useEffect } from 'react';
import { Calendar, User, ArrowRight, Loader2, X } from 'lucide-react';
import { getPublicBlog } from '../api/client';
import SEO from '../components/SEO';
import { CardSkeleton } from '../components/Skeleton';

const BlogPostCard = ({ post, onReadMore }) => (
  <article className="blog-card glass-card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
    <div style={{ padding: '1.25rem 1.25rem 0 1.25rem' }}>
      <span className="blog-category" style={{ position: 'static', background: 'rgba(0, 179, 122, 0.1)', color: '#00b37a', padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600 }}>{post.category}</span>
    </div>
    <div className="blog-content" style={{ display: 'flex', flexDirection: 'column', flex: 1, padding: '1.25rem' }}>
      <div className="blog-meta" style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: '#6b7280', marginBottom: '0.75rem' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Calendar size={14} /> {new Date(post.created_at).toLocaleDateString()}</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><User size={14} /> {post.author}</span>
      </div>
      <h3 style={{ margin: '0 0 0.75rem', fontSize: '1.25rem', color: '#111827', lineHeight: 1.3, fontWeight: 700 }}>{post.title}</h3>
      <p style={{ color: '#4b5563', fontSize: '0.95rem', lineHeight: 1.6, flex: 1, marginBottom: '1.25rem' }}>
        {post.body ? post.body.substring(0, 120) + '...' : (post.excerpt ? post.excerpt.substring(0, 120) + '...' : '')}
      </p>
      <button 
        onClick={() => onReadMore(post)}
        style={{ background: 'linear-gradient(135deg, #00b37a, #009966)', color: 'white', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 600, alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '0.4rem', transition: 'transform 0.2s ease, opacity 0.2s ease' }}
        onMouseOver={e => e.currentTarget.style.opacity = '0.9'}
        onMouseOut={e => e.currentTarget.style.opacity = '1'}
      >
        Read More <ArrowRight size={16} />
      </button>
    </div>
  </article>
);

const Blog = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState(null);

  useEffect(() => {
    getPublicBlog()
      .then(res => setPosts(res.posts || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (selectedPost) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [selectedPost]);

  return (
    <div className="blog-page">
      <SEO 
        title="Blog" 
        description="Stay updated with the latest technology trends, news, and insights from the Hexagon Computer Systems team." 
      />
      <div className="container">
        <header className="page-header center">
          <h1 className="section-title">Our Insights</h1>
          <p className="subtitle">Latest updates and tech news from Hexagon Computer Systems.</p>
        </header>

        {loading ? (
          <div className="blog-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem' }}>
            {[1, 2, 3, 4, 5, 6].map(i => <CardSkeleton key={i} />)}
          </div>
        ) : posts.length === 0 ? (
          <section className="blog-notice glass-card" style={{ textAlign: 'center' }}>
            <p>More articles will be uploaded soon by the administration.</p>
          </section>
        ) : (
          <div className="blog-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
            {posts.map((post) => (
              <BlogPostCard key={post.id} post={post} onReadMore={setSelectedPost} />
            ))}
          </div>
        )}
      </div>

      {selectedPost && (
        <div 
          className="modal-overlay" 
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', backdropFilter: 'blur(5px)', opacity: 1, transition: 'opacity 0.3s ease' }} 
          onClick={() => setSelectedPost(null)}
        >
          <div 
            className="modal-content" 
            style={{ background: '#ffffff', width: '100%', maxWidth: '1000px', maxHeight: '90vh', overflowY: 'auto', borderRadius: '1rem', position: 'relative', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', border: '1px solid #e5e7eb', animation: 'slideUp 0.3s ease-out' }} 
            onClick={e => e.stopPropagation()}
          >
            <button 
              onClick={() => setSelectedPost(null)} 
              style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'rgba(255,255,255,0.8)', border: '1px solid #e5e7eb', color: '#111827', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10, transition: 'background 0.2s', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
              onMouseOver={e => e.currentTarget.style.background = '#f3f4f6'}
              onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.8)'}
            >
              <X size={20} />
            </button>



            <div style={{ padding: '3rem' }}>
              <div style={{ display: 'flex', gap: '1rem', color: '#00b37a', fontSize: '0.9rem', marginBottom: '1.5rem', fontWeight: 600 }}>
                <span style={{ background: 'rgba(0, 179, 122, 0.1)', padding: '0.3rem 0.8rem', borderRadius: '999px' }}>{selectedPost.category}</span>
                <span style={{ display: 'flex', alignItems: 'center', color: '#6b7280' }}>{new Date(selectedPost.created_at).toLocaleDateString()}</span>
              </div>
              
              <h2 style={{ fontSize: '2.5rem', margin: '0 0 1.5rem', color: '#111827', lineHeight: 1.3 }}>{selectedPost.title}</h2>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2.5rem', color: '#6b7280', fontSize: '0.95rem', paddingBottom: '1.5rem', borderBottom: '1px solid #e5e7eb' }}>
                <User size={16} /> By <span style={{ color: '#374151', fontWeight: 500 }}>{selectedPost.author}</span>
              </div>
              
              <div style={{ color: '#374151', lineHeight: 1.8, fontSize: '1.1rem', whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>
                {selectedPost.body || selectedPost.excerpt}
              </div>
            </div>
          </div>
        </div>
      )}
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default Blog;
