import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, User, ArrowLeft, Loader2, Tag } from 'lucide-react';
import { getBlogPost } from '../api/client';
import SEO from '../components/SEO';

const BlogDetail = () => {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    getBlogPost(slug)
      .then(setPost)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
    
    window.scrollTo(0, 0);
  }, [slug]);

  if (loading) return (
    <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.5)' }}>
      <Loader2 className="spinner" size={48} style={{ animation: 'spin 1s linear infinite', marginBottom: '1rem' }} />
      <p>Loading post content...</p>
    </div>
  );

  if (error || !post) return (
    <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '2rem' }}>
      <h2 style={{ color: '#ef4444' }}>Post Not Found</h2>
      <p style={{ color: 'rgba(255,255,255,0.6)', margin: '1rem 0 2rem' }}>The article you are looking for doesn't exist or has been removed.</p>
      <Link to="/blog" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
        <ArrowLeft size={18} /> Back to Blog
      </Link>
    </div>
  );

  return (
    <div className="blog-detail-page" style={{ paddingTop: '2rem', paddingBottom: '5rem' }}>
      <SEO 
        title={post.title} 
        description={post.excerpt} 
        image={post.image}
      />
      
      <div className="container">
        <Link to="/blog" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#00b37a', textDecoration: 'none', marginBottom: '2rem', fontWeight: 600 }}>
          <ArrowLeft size={18} /> Back to Insights
        </Link>

        <article className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>

          
          <div style={{ padding: '3rem' }}>
            <div style={{ display: 'flex', gap: '1.5rem', color: '#6b7280', fontSize: '0.9rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Calendar size={16} /> {new Date(post.created_at).toLocaleDateString()}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><User size={16} /> {post.author}</span>
              <span style={{ padding: '0.2rem 0.8rem', background: 'rgba(0,179,122,0.1)', color: '#00b37a', borderRadius: '999px', fontWeight: 600 }}>{post.category}</span>
            </div>

            <h1 style={{ fontSize: '2.5rem', color: '#111827', marginBottom: '1.5rem', lineHeight: 1.2, fontWeight: 700 }}>{post.title}</h1>
            
            <div className="blog-body" style={{ color: '#374151', lineHeight: 1.8, fontSize: '1.1rem' }}>
              {post.body.split('\n').map((para, i) => (
                <p key={i} style={{ marginBottom: '1.5rem' }}>{para}</p>
              ))}
            </div>

            {post.tags && post.tags.length > 0 && (
              <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                {post.tags.map(tag => (
                  <span key={tag} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' }}>
                    <Tag size={14} /> {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </article>
      </div>
    </div>
  );
};

export default BlogDetail;
