import React, { useState, useEffect } from 'react';
import { Calendar, User, ArrowRight, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getPublicBlog } from '../api/client';
import SEO from '../components/SEO';

const BlogPost = ({ title, excerpt, created_at, author, category, image, slug }) => (
  <article className="blog-card glass-card">
    <Link to={`/blog/${slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
      <div className="blog-image-placeholder" style={image ? { backgroundImage: `url(${image})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}>
        <span className="blog-category">{category}</span>
      </div>
      <div className="blog-content">
        <div className="blog-meta">
          <span><Calendar size={14} /> {new Date(created_at).toLocaleDateString()}</span>
          <span><User size={14} /> {author}</span>
        </div>
        <h3>{title}</h3>
        <p>{excerpt}</p>
      </div>
    </Link>
  </article>
);

const Blog = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPublicBlog()
      .then(res => setPosts(res.posts || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

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
          <div style={{ textAlign: 'center', padding: '4rem', color: 'rgba(255,255,255,0.5)' }}>
            <Loader2 className="spinner" size={32} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }} />
            <p>Loading posts...</p>
          </div>
        ) : posts.length === 0 ? (
          <section className="blog-notice glass-card" style={{ textAlign: 'center' }}>
            <p>More articles will be uploaded soon by the administration.</p>
          </section>
        ) : (
          <div className="blog-grid">
            {posts.map((post) => (
              <BlogPost key={post.id} {...post} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Blog;
