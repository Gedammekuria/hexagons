import React, { useState, useEffect } from 'react';
import { Search, ExternalLink, Link, Folder, Code, Terminal, Cpu, Layout, Shield, Monitor, Smartphone, Database, Eye } from 'lucide-react';
import { getProjects, getImageUrl } from '../api/client';
import SEO from '../components/SEO';
import { CardSkeleton } from '../components/Skeleton';
import { X } from 'lucide-react';

const ProjectCard = ({ title, category, description, tags, image, link, show_link, icon: Icon }) => (
  <div className="glass-card project-card animate-fade-in">
    <div className="project-image-container">
      {image ? (
        <img
          src={getImageUrl(image)}
          alt={title}
          className="project-card-img"
          loading="lazy"
        />
      ) : (
        <div className="project-icon-placeholder">
          <Icon size={36} className="text-primary" />
        </div>
      )}
      <div className="project-overlay">
        {link ? (
          <a href={link} target="_blank" rel="noopener noreferrer" className="overlay-content" style={{ textDecoration: 'none' }}>
            <Eye size={28} />
            <span>View Project</span>
          </a>
        ) : (
          <div className="overlay-content">
            <Icon size={28} />
            <span>{category}</span>
          </div>
        )}
      </div>
    </div>
    <div className="project-card-body">
      <span className="project-category">{category}</span>
      <h3>{title}</h3>
      <p>{description}</p>
      <div className="project-tags">
        {(tags || []).map((tag, i) => (
          <span key={i} className="tag">{tag}</span>
        ))}
      </div>
      {(link && (show_link === true || show_link === 1)) && (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 'auto', paddingTop: '1rem' }}>
          <a href={link} target="_blank" rel="noopener noreferrer" className="project-link" style={{ margin: 0 }}>
            View Project <ExternalLink size={14} />
          </a>
        </div>
      )}
    </div>
  </div>
);

const Projects = () => {
  const [projects, setProjects] = React.useState([]);
  const [filteredProjects, setFilteredProjects] = React.useState([]);
  const [categories, setCategories] = React.useState(['All']);
  const [selectedCategory, setSelectedCategory] = React.useState('All');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [loading, setLoading] = React.useState(true);
  const [selectedProject, setSelectedProject] = React.useState(null);

  React.useEffect(() => {
    getProjects()
      .then(data => {
        setProjects(data);
        setFilteredProjects(data);
        const uniqueCats = ['All', ...new Set(data.map(p => p.category))];
        setCategories(uniqueCats);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  React.useEffect(() => {
    let filtered = projects;
    
    // Apply category filter
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }
    
    // Apply search filter
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        p.title.toLowerCase().includes(q) || 
        p.description.toLowerCase().includes(q)
      );
    }
    
    setFilteredProjects(filtered);
  }, [selectedCategory, searchQuery, projects]);

  const getIcon = (cat) => {
    if (cat?.includes('Software')) return Cpu;
    if (cat?.includes('Web')) return Monitor;
    if (cat?.includes('App')) return Smartphone;
    if (cat?.includes('Network')) return Terminal;
    if (cat?.includes('Security')) return Shield;
    if (cat?.includes('Marketing') || cat?.includes('Graphics')) return Layout;
    if (cat?.includes('Consulting')) return Monitor;
    if (cat?.includes('Hosting') || cat?.includes('Database')) return Database;
    return Folder;
  };

  return (
    <div className="projects-page">
      <SEO 
        title="Our Projects" 
        description="Explore Hexagon's portfolio of successful projects in software development, networking, and security across Ethiopia." 
      />
      <div className="container">
        <header className="page-header center">
          <h1 className="section-title">Our Featured Projects</h1>
          <p className="subtitle">Real-world impact delivered through technical excellence.</p>
        </header>

        <div className="filter-controls">
          <div className="search-box">
            <Search size={20} className="search-icon" />
            <input 
              type="text" 
              placeholder="Search projects..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="filter-bar">
            {categories.map(cat => (
              <button 
                key={cat} 
                className={`filter-btn ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="projects-grid">
          {loading ? (
            [1, 2, 3, 4, 5, 6].map(i => <CardSkeleton key={i} />)
          ) :
           filteredProjects.length === 0 ? <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>No projects found in this category.</div> :
           filteredProjects.map((project, i) => (
            <div key={project.id} onClick={() => setSelectedProject(project)} style={{ cursor: 'pointer' }}>
              <ProjectCard {...project} icon={getIcon(project.category)} />
            </div>
          ))}
        </div>


      </div>

      {selectedProject && (
        <div 
          className="modal-overlay" 
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', backdropFilter: 'blur(8px)' }} 
          onClick={() => setSelectedProject(null)}
        >
          <div 
            className="modal-content glass-card" 
            style={{ background: '#ffffff', width: '100%', maxWidth: '900px', maxHeight: '90vh', overflowY: 'auto', borderRadius: '1.5rem', position: 'relative', padding: 0, border: 'none', animation: 'slideUp 0.3s ease-out' }} 
            onClick={e => e.stopPropagation()}
          >
            <button 
              onClick={() => setSelectedProject(null)} 
              style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: 'rgba(255,255,255,0.9)', border: '1px solid #e5e7eb', color: '#111827', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
            >
              <X size={20} />
            </button>

            {selectedProject.image && (
              <div style={{ width: '100%', height: '350px', overflow: 'hidden' }}>
                <img src={getImageUrl(selectedProject.image)} alt={selectedProject.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            )}

            <div style={{ padding: '2.5rem' }}>
              <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem' }}>
                <span className="project-category" style={{ position: 'static', background: 'rgba(37, 99, 235, 0.1)', padding: '0.3rem 0.8rem', borderRadius: '999px' }}>{selectedProject.category}</span>
              </div>
              
              <h2 style={{ fontSize: '2rem', margin: '0 0 1.25rem', color: '#111827' }}>{selectedProject.title}</h2>
              
              <div style={{ color: '#4b5563', lineHeight: 1.8, fontSize: '1.05rem', marginBottom: '2rem' }}>
                {selectedProject.description}
              </div>

              {selectedProject.tags && selectedProject.tags.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', marginBottom: '2.5rem', padding: '1.5rem', background: '#f8fafc', borderRadius: '1rem' }}>
                  <span style={{ width: '100%', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: '#94a3b8', marginBottom: '0.25rem', display: 'block' }}>Technologies Used</span>
                  {selectedProject.tags.map(tag => (
                    <span key={tag} className="tag" style={{ background: '#fff', border: '1px solid #e2e8f0', color: '#475569', padding: '0.3rem 0.8rem' }}>{tag}</span>
                  ))}
                </div>
              )}

              {selectedProject.link && (
                <a href={selectedProject.link} target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem' }}>
                  Visit Live Project <ExternalLink size={18} />
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default Projects;
