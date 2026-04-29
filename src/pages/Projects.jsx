import React, { useState, useEffect } from 'react';
import { Search, ExternalLink, Link, Folder, Code, Terminal, Cpu, Layout, Shield, Monitor, Smartphone, Database } from 'lucide-react';
import { getProjects } from '../api/client';
import SEO from '../components/SEO';

const ProjectCard = ({ title, category, description, tags, image, link, show_link, icon: Icon }) => (
  <div className="glass-card project-card animate-fade-in">
    {image ? (
      <img
        src={image.startsWith('http') ? image : (image.startsWith('/images') ? image : `http://localhost:5000${image}`)}
        alt={title}
        className="project-card-img"
      />
    ) : (
      <div className="project-icon-placeholder">
        <Icon size={36} className="text-primary" />
      </div>
    )}
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
          {loading ? <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>Loading projects...</div> :
           filteredProjects.length === 0 ? <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>No projects found in this category.</div> :
           filteredProjects.map((project, i) => (
            <ProjectCard key={project.id} {...project} icon={getIcon(project.category)} />
          ))}
        </div>

        <section className="project-stats glass-card">
          <div className="mini-stat">
            <h4>400+</h4>
            <p>Total Projects</p>
          </div>
          <div className="mini-stat">
            <h4>100%</h4>
            <p>Success Rate</p>
          </div>
          <div className="mini-stat">
            <h4>50+</h4>
            <p>Government Partners</p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Projects;
