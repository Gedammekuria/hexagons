import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ShieldCheck, Network, Lock, Rocket, Globe, 
  CheckCircle2, ArrowRight, Monitor, Smartphone, 
  Code, LayoutDashboard, Headset, Wrench, Briefcase, 
  Settings, Camera, Flame, Fingerprint, Zap, Server, Database,
  Palette, Megaphone, Search, Share2, Printer, PenTool, Phone, Tv, Wifi
} from 'lucide-react';

import { getServices } from '../api/client';
import * as LucideIcons from 'lucide-react';

const Services = () => {
  const { serviceId } = useParams();
  const id = serviceId; // Might be undefined
  const [services, setServices] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    getServices().then(data => {
      setServices(data);
    }).finally(() => setLoading(false));
  }, [id]);

  const getIcon = (name) => {
    const Icon = LucideIcons[name] || LucideIcons.Rocket;
    return Icon;
  };

  if (loading) return <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><LucideIcons.Loader2 className="animate-spin" /></div>;

  const currentService = services.find(s => s.slug === id);
  
  if (!id || !currentService) {
    return (
      <div className="services-overview-page">
        <div className="container">
          <header className="page-header center animate-fade-in">
            <span className="badge">Our Expertise</span>
            <h1 className="section-title">Our Services</h1>
            <p className="subtitle">Discover our comprehensive range of specialized technology solutions.</p>
          </header>
          
          <div className="overview-selection-grid mt-4">
            {services.map((item) => {
              const SvgIcon = getIcon(item.icon_name);
              return (
                <Link to={`/services/${item.slug}`} key={item.id} className="selection-card glass-card animate-fade-in">
                  <div className="selection-icon" style={{ backgroundColor: item.color }}>
                    <SvgIcon size={32} color="white" />
                  </div>
                  <h3>{item.title}</h3>
                  <p>{item.tagline}</p>
                  <span className="selection-link">
                    Explore Details <LucideIcons.ArrowRight size={18} />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  const s = currentService;
  const Icon = getIcon(s.icon_name);

  return (
    <div className="service-single-page">
      {/* Service Hero */}
      <section className="service-hero" style={{ '--service-color': s.color }}>
        <div className="container">
          <div className="service-hero-content animate-fade-in">

            <span className="badge">Service Details</span>
            <h1>{s.title}</h1>
            <p className="lead">{s.tagline}</p>
          </div>
        </div>
      </section>

      {/* Service Content */}
      <section className="service-details-section section-padding">
        <div className="container">
          <div className="service-overview-layout animate-fade-in">
            <div className="service-overview-text">
              <h2>Overview</h2>
              <p>{s.description}</p>
              <div className="service-commitment-box mt-3" style={{ borderLeft: `4px solid ${s.color}`, paddingLeft: '1.5rem', background: 'rgba(255,255,255,0.5)', padding: '1.25rem', borderRadius: '0 1rem 1rem 0' }}>
                <h4 style={{ color: s.color, marginBottom: '0.5rem', fontSize: '1rem' }}>Our Strategic Commitment</h4>
                <p style={{ fontSize: '0.9rem', fontStyle: 'italic', color: '#4b5563', margin: 0 }}>
                  We don't just provide services; we build long-term partnerships focused on your digital success and operational excellence.
                </p>
              </div>
            </div>
            {s.image && (
              <div className="service-overview-image">
                <img src={s.image} alt={s.title} />
              </div>
            )}
          </div>

          <div className="detailed-features-list mt-4">
            <h2 className="section-title left">Our Specialized Solutions</h2>
            <div className="detailed-feature-grid">
              {s.features.map((f, i) => {
                const FeatureIcon = getIcon(f.icon);
                return (
                  <div key={i} className="detailed-feature-card glass-card animate-fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
                    <div className="feature-header">
                      <div className="feature-icon" style={{ backgroundColor: 'rgba(37, 99, 235, 0.08)', color: 'var(--primary)' }}>
                        <FeatureIcon size={24} />
                      </div>
                      <h3>{f.title}</h3>
                    </div>
                    <div className="feature-body">
                      <p>{f.desc}</p>
                      {f.highlights && f.highlights.length > 0 && (
                        <ul className="feature-highlights" style={{ listStyle: 'none', padding: 0, paddingLeft: '0.75rem', marginTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                          {f.highlights.map((h, hi) => (
                            <li key={hi} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                              <CheckCircle2 size={16} style={{ color: '#10b981', marginTop: '0.2rem', flexShrink: 0 }} />
                              <span>{h}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="service-cta-section glass-card mt-5 animate-fade-in">
            <div className="cta-content">
              <h2>Let's discuss your {s.title} requirements</h2>
              <p>Our experts are ready to build a customized solution for your business.</p>
              <div className="cta-btns">
                <Link to="/contact" className="btn btn-primary">Request <ArrowRight size={18} /></Link>

              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Services;
