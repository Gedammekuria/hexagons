import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, Code, Globe, Shield, Database, Layout, Users, X, CheckCircle2, Monitor, ShieldCheck, Palette, Server, Lock, Flame, Network, Camera, Fingerprint, Zap, Headset, Wrench, Briefcase, Settings, Smartphone, LayoutDashboard, Printer, Megaphone, PenTool, ChevronLeft, ChevronRight, MapPin, Phone, Tv, Wifi, Share2, Search, Folder, Eye } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { getContent, getProjects, getImageUrl } from '../api/client';
import SEO from '../components/SEO';
import Procedures from './Procedures';
import Team from './Team';
import Partners from '../components/Partners';
import { useSettings } from '../context/SettingsContext';

const ProjectCard = ({ title, category, description, tags, image, link, show_link, icon: Icon }) => (
  <div className="glass-card project-card animate-fade-in">
    <div className="project-image-container">
      {image ? (
        <img
          src={getImageUrl(image)}
          alt={title}
          className="project-card-img"
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
            View Project <ArrowRight size={14} />
          </a>
        </div>
      )}
    </div>
  </div>
);

const SubServiceList = ({ items }) => (
  <div className="sub-service-list" style={{ marginLeft: '1rem' }}>
    {items.map((item, i) => {
      const Icon = item.icon;
      return (
        <div key={i} className="sub-service-item-simple" style={{ padding: '0.1rem 0.4rem', fontSize: '0.8rem' }}>
          <div className="hexagon-icon-small" style={{ width: '18px', height: '18px' }}>
            <Icon size={12} />
          </div>
          <span>{item.title}</span>
        </div>
      );
    })}
  </div>
);

const Home = () => {
  const { settings } = useSettings();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [featuredProjects, setFeaturedProjects] = useState([]);
  const location = useLocation();

  const getProjectIcon = (cat) => {
    if (cat?.includes('Software')) return Code;
    if (cat?.includes('Web')) return Monitor;
    if (cat?.includes('App')) return Smartphone;
    if (cat?.includes('Network')) return Network;
    if (cat?.includes('Security')) return ShieldCheck;
    if (cat?.includes('Marketing')) return Palette;
    return Folder;
  };


  const handleScrollToService = (e, id) => {
    if (e) e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      const offset = 100;
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
      window.scrollTo({
        top: elementPosition - offset,
        behavior: 'smooth'
      });
      
      const card = element.querySelector('.glass-card');
      if (card) {
        card.classList.add('active-highlight');
        setTimeout(() => card.classList.remove('active-highlight'), 2000);
      }
    }
  };

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '');
      setTimeout(() => handleScrollToService(null, id), 500);
    }
  }, [location]);

  useEffect(() => {
    document.title = "Hexagon Computer Systems";
  }, []);

  const itSupportServices = [
    { title: "Continuous Help Desk Support", icon: Headset },
    { title: "Technical Support", icon: Wrench },
    { title: "Consulting", icon: Briefcase }
  ];

  const networkingServices = [
    { title: "LAN/WAN Networking Design and Installation", icon: Network },
    { title: "Networking Devices Configuration", icon: Settings },
    { title: "Wi-Fi Installation", icon: Wifi },
    { title: "Fiber Optics Installation", icon: Zap },
    { title: "PBAX Telephone System Installation", icon: Phone },
    { title: "Networked Dish Installation", icon: Tv }
  ];

  const securityServices = [
    { title: "CCTV Surveillance Installation", icon: Camera },
    { title: "Fire Alarm & Detection Systems", icon: Flame },
    { title: "Biometric Attendance & Access Control", icon: Fingerprint },
    { title: "Electric Fence & Perimeter Security", icon: Zap },
    { title: "Electronic Door Lock Systems", icon: Lock }
  ];

  const cyberServices = [
    { title: "Endpoint Security Solutions", icon: ShieldCheck },
    { title: "Server & Data Protection", icon: Server },
    { title: "Centralized Security Management", icon: LayoutDashboard },
    { title: "Security Audits & Licensing", icon: CheckCircle2 }
  ];

  const marketingGraphicsServices = [
    { title: "Logo Design", icon: Palette },
    { title: "Brochures & Flyers", icon: Printer },
    { title: "Business Cards Design", icon: PenTool },
    { title: "Social Media Marketing", icon: Share2 },
    { title: "Digital Marketing", icon: Megaphone },
    { title: "Search Engine Optimization (SEO)", icon: Search }
  ];

  const digitalServices = [
    { title: "Website Development", icon: Monitor },
    { title: "Mobile App Development", icon: Smartphone },
    { title: "Custom Software Development", icon: Code },
    { title: "ERP System Development", icon: LayoutDashboard }
  ];

  const webHostingServices = [
    { title: "High-Performance Web Hosting", icon: Server },
    { title: "Managed Security & SSL Certificates", icon: Lock },
    { title: "Domain & Email Hosting", icon: Globe },
    { title: "Local Technical Support & Migration", icon: Database }
  ];

  const heroSlides = [
    { title: "Empowering Ethiopia's Digital Future", subtitle: "Hexagon Computer Systems delivers cutting-edge IT solutions.", image: "/images/it-support.png", link: "/services/it-support" },
    { title: "Enterprise Networking Solutions", subtitle: "Building robust, scalable, and secure network infrastructures.", image: "/images/networking.png", link: "/services/networking" },
    { title: "Advanced Security & Surveillance", subtitle: "State-of-the-art physical and digital security solutions.", image: "/images/security.png", link: "/services/security" },
    { title: "Comprehensive Cybersecurity", subtitle: "Protecting your digital assets with world-class security solutions.", image: "/images/cybersecurity.png", link: "/services/cybersecurity" },
    { title: "Digital Marketing & Graphics", subtitle: "Creative design and strategic marketing solutions.", image: "/images/digital-marketing.png", link: "/services/marketing-graphics" },
    { title: "Bespoke Software Development", subtitle: "Transforming your business vision into high-performance digital products.", image: "/images/digital-services.png", link: "/services/digital-services" },
    { title: "Reliable Web Hosting & Domains", subtitle: "Secure hosting with enterprise-grade performance and local support.", image: "/images/networking.png", link: "/services/web-hosting" }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [heroSlides.length]);

  const [heroContent, setHeroContent] = useState(null);
  const [aboutPreview, setAboutPreview] = useState(null);
  const [featured, setFeatured] = useState(null);
  const [overview, setOverview] = useState(null);
  const [proc, setProc] = useState(null);
  const [servIt, setServIt] = useState(null);
  const [servDig, setServDig] = useState(null);

  useEffect(() => {
    getContent('home', 'hero').then(res => setHeroContent(res.data)).catch(() => {});
    getContent('home', 'about_preview').then(res => setAboutPreview(res.data)).catch(() => {});
    getContent('home', 'featured').then(res => setFeatured(res.data)).catch(() => {});
    getContent('home', 'overview').then(res => setOverview(res.data)).catch(() => {});
    getContent('home', 'procedures').then(res => setProc(res.data)).catch(() => {});
    getContent('services', 'it_support').then(res => setServIt(res.data)).catch(() => {});
    getContent('services', 'digital_services').then(res => setServDig(res.data)).catch(() => {});
    
    // Fetch and filter featured projects
    getProjects().then(all => {
      setFeaturedProjects(all.filter(p => p.featured === 1 || p.featured === true));
    }).catch(() => {});
  }, []);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);

  return (
    <div className="home-page">
      <SEO 
        title="Home" 
        description="Hexagon Computer Systems is Ethiopia's premier IT solutions provider. We specialize in software development, networking, and cybersecurity solutions." 
      />
      <section className="hero">
        <div className="hero-slider">
          {heroSlides.map((slide, index) => (
            <div key={index} className={`hero-slide ${index === currentSlide ? 'active' : ''}`} style={{ backgroundImage: `url(${slide.image})` }}>
              <div className="hero-slide-overlay"></div>
            </div>
          ))}
        </div>
        <div className="container hero-container">
          <div className="hero-content animate-fade-in" key={currentSlide}>
            <h1 className="hero-title">{currentSlide === 0 && heroContent?.title ? heroContent.title : heroSlides[currentSlide].title}</h1>
            <p className="hero-subtitle">{currentSlide === 0 && heroContent?.subtitle ? heroContent.subtitle : heroSlides[currentSlide].subtitle}</p>
            <div className="hero-btns">
              <Link to={heroSlides[currentSlide].link} className="btn btn-primary">Explore Details <ArrowRight size={18} /></Link>
              <Link to="/contact" className="btn btn-outline">Get Started</Link>
            </div>
          </div>
          <div className="hero-arrows">
            <button className="arrow-btn prev" onClick={prevSlide}><ChevronLeft size={24} /></button>
            <button className="arrow-btn next" onClick={nextSlide}><ChevronRight size={24} /></button>
          </div>
        </div>
        <div className="hero-dots" style={{ position: 'absolute', bottom: '1.5rem', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '0.75rem', zIndex: 10 }}>
          {heroSlides.map((_, idx) => (
            <button 
              key={idx} 
              onClick={() => setCurrentSlide(idx)}
              style={{
                width: idx === currentSlide ? '2rem' : '0.6rem',
                height: '0.6rem',
                borderRadius: '1rem',
                background: idx === currentSlide ? '#00b37a' : 'rgba(255,255,255,0.4)',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
              }}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </section>

      <section className="overview-section section-padding" style={{ marginTop: '-3rem' }}>
        <div className="container">
          <h2 className="section-title">Company Overview</h2>
          <div className="overview-cards-grid">
            <div className="overview-item">
              <div className="overview-number">01</div>
              <Globe className="text-primary" size={40} />
              <h3>{overview?.card1_title || "Founded"}</h3>
              <p>{(overview?.card1_text || `Established in 2009.`).replace(/\b(19|20)\d{2}\b/g, settings?.founded_year || '2009')}</p>
            </div>
            <div className="overview-item">
              <div className="overview-number">02</div>
              <MapPin className="text-secondary" size={40} />
              <h3>{overview?.card2_title || "Our Office"}</h3>
              <p>{overview?.card2_text || settings?.address || "22 Mazoriya, MAF Bldg."}</p>
            </div>
            <div className="overview-item">
              <div className="overview-number">03</div>
              <Briefcase className="text-accent" size={40} />
              <h3>{overview?.card3_title || "Experience"}</h3>
              <p>{(overview?.card3_text || "15+ Years of industry leadership.").replace(/\b\d+\+?\s*[Yy]ears?\b/g, `${settings?.experience_years || '15+'} Years`)}</p>
            </div>
            <div className="overview-item">
              <div className="overview-number">04</div>
              <Code className="text-primary" size={40} />
              <h3>Website & Software Projects</h3>
              <p>{settings?.software_projects || '250+'} Successfully delivered.</p>
            </div>
            <div className="overview-item">
              <div className="overview-number">05</div>
              <Shield className="text-secondary" size={40} />
              <h3>Network & Security Projects</h3>
              <p>{settings?.network_projects || '180+'} Enterprise deployments.</p>
            </div>
            <div className="overview-item">
              <div className="overview-number">06</div>
              <Users className="text-accent" size={40} />
              <h3>Employees</h3>
              <p>{settings?.employees || '50+'} Dedicated professionals.</p>
            </div>
          </div>
        </div>
      </section>

      <Procedures />
      <Team />
      <Partners />

      <section className="home-services-section section-padding">
        <div className="container">
          <header className="page-header center">
            <h2 className="section-title">Our Services</h2>
          </header>
          
          <div className="services-key-bar">
            <a href="#it-support" className="key-service-item" onClick={(e) => handleScrollToService(e, 'it-support')}>
              <div className="service-icon-box"><ShieldCheck className="text-primary" size={32} /></div>
              <span>IT Support</span>
            </a>
            <a href="#networking" className="key-service-item" onClick={(e) => handleScrollToService(e, 'networking')}>
              <div className="service-icon-box"><Network className="text-secondary" size={32} /></div>
              <span>Networking</span>
            </a>
            <a href="#security" className="key-service-item" onClick={(e) => handleScrollToService(e, 'security')}>
              <div className="service-icon-box"><Lock className="text-accent" size={32} /></div>
              <span>Security</span>
            </a>
            <a href="#cyber-security" className="key-service-item" onClick={(e) => handleScrollToService(e, 'cyber-security')}>
              <div className="service-icon-box"><Server className="text-primary" size={32} /></div>
              <span>Cyber Security</span>
            </a>
            <a href="#marketing-graphics" className="key-service-item" onClick={(e) => handleScrollToService(e, 'marketing-graphics')}>
              <div className="service-icon-box"><Palette className="text-secondary" size={32} /></div>
              <span>Digital Marketing</span>
            </a>
            <a href="#digital-services" className="key-service-item" onClick={(e) => handleScrollToService(e, 'digital-services')}>
              <div className="service-icon-box"><Monitor className="text-primary" size={32} /></div>
              <span>Software & Web</span>
            </a>
            <a href="#web-hosting" className="key-service-item" onClick={(e) => handleScrollToService(e, 'web-hosting')}>
              <div className="service-icon-box"><Globe className="text-secondary" size={32} /></div>
              <span>Web Hosting</span>
            </a>
          </div>

          <div className="services-grid-main mt-5">
            <section id="it-support" className="service-section">
              <div className="service-category-info glass-card service-hover-card" style={{ padding: '1.25rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
                <div className="service-icon-main it-icon" style={{ marginBottom: '0.15rem', background: 'rgba(37, 99, 235, 0.1)', padding: '0.7rem', borderRadius: '1rem', transition: 'all 0.3s ease' }}>
                  <ShieldCheck className="text-primary" size={32} style={{ transition: 'all 0.3s ease' }} />
                </div>
                <div style={{ width: '100%' }}>
                  <h2 style={{ marginTop: 0, marginBottom: '0.15rem', fontSize: '1.35rem', lineHeight: '1.2' }}>IT Support and Consulting</h2>
                  <p style={{ lineHeight: '1.6', color: '#4b5563', marginBottom: '0.75rem', fontSize: '1rem' }}>
                    {servIt?.text || "Our IT Support and Consulting services provide technical backbone and expert strategic guidance."}
                  </p>
                  <SubServiceList items={itSupportServices} />
                  <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
                    <Link to="/services/it-support" className="btn-text" style={{ fontSize: '0.85rem' }}>View Detail <ArrowRight size={14} /></Link>
                  </div>
                </div>
              </div>
            </section>

            <section id="networking" className="service-section">
              <div className="service-category-info glass-card service-hover-card" style={{ padding: '1.25rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
                <div className="service-icon-main net-icon" style={{ marginBottom: '0.15rem', background: 'rgba(16, 185, 129, 0.1)', padding: '0.7rem', borderRadius: '1rem', transition: 'all 0.3s ease' }}>
                  <Network className="text-secondary" size={32} style={{ transition: 'all 0.3s ease' }} />
                </div>
                <div style={{ width: '100%' }}>
                  <h2 style={{ marginTop: 0, marginBottom: '0.15rem', fontSize: '1.35rem', lineHeight: '1.2' }}>Networking & Infrastructure</h2>
                  <p style={{ lineHeight: '1.6', color: '#4b5563', marginBottom: '0.75rem', fontSize: '1rem' }}>
                    Enterprise-grade network design and implementation tailored to scale effortlessly.
                  </p>
                  <SubServiceList items={networkingServices} />
                  <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
                    <Link to="/services/networking" className="btn-text" style={{ fontSize: '0.85rem' }}>View Detail <ArrowRight size={14} /></Link>
                  </div>
                </div>
              </div>
            </section>

            <section id="security" className="service-section">
              <div className="service-category-info glass-card service-hover-card" style={{ padding: '1.25rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
                <div className="service-icon-main sec-icon" style={{ marginBottom: '0.15rem', background: 'rgba(236, 72, 153, 0.1)', padding: '0.7rem', borderRadius: '1rem', transition: 'all 0.3s ease' }}>
                  <Lock className="text-accent" size={32} style={{ transition: 'all 0.3s ease' }} />
                </div>
                <div style={{ width: '100%' }}>
                  <h2 style={{ marginTop: 0, marginBottom: '0.15rem', fontSize: '1.35rem', lineHeight: '1.2' }}>Security and Surveillance</h2>
                  <p style={{ lineHeight: '1.6', color: '#4b5563', marginBottom: '0.75rem', fontSize: '1rem' }}>
                    Advanced physical security systems to protect your people, property, and data.
                  </p>
                  <SubServiceList items={securityServices} />
                  <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
                    <Link to="/services/security" className="btn-text" style={{ fontSize: '0.85rem' }}>View Detail <ArrowRight size={14} /></Link>
                  </div>
                </div>
              </div>
            </section>

            <section id="cyber-security" className="service-section">
              <div className="service-category-info glass-card service-hover-card" style={{ padding: '1.25rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
                <div className="service-icon-main cyber-icon" style={{ marginBottom: '0.15rem', background: 'rgba(37, 99, 235, 0.1)', padding: '0.7rem', borderRadius: '1rem', transition: 'all 0.3s ease' }}>
                  <Server className="text-primary" size={32} style={{ transition: 'all 0.3s ease' }} />
                </div>
                <div style={{ width: '100%' }}>
                  <h2 style={{ marginTop: 0, marginBottom: '0.15rem', fontSize: '1.35rem', lineHeight: '1.2' }}>Cybersecurity and Antivirus</h2>
                  <p style={{ lineHeight: '1.6', color: '#4b5563', marginBottom: '0.75rem', fontSize: '1rem' }}>
                    Authorized world-class cybersecurity solutions designed to protect from sophisticated threats.
                  </p>
                  <SubServiceList items={cyberServices} />
                  <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1.5rem' }}>
                    <Link to="/services/cybersecurity" className="btn-text" style={{ fontSize: '0.85rem' }}>View Detail <ArrowRight size={14} /></Link>
                  </div>
                </div>
              </div>
            </section>

            <section id="marketing-graphics" className="service-section">
              <div className="service-category-info glass-card service-hover-card" style={{ padding: '1.25rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
                <div className="service-icon-main mkt-icon" style={{ marginBottom: '0.15rem', background: 'rgba(16, 185, 129, 0.1)', padding: '0.7rem', borderRadius: '1rem', transition: 'all 0.3s ease' }}>
                  <Palette className="text-secondary" size={32} style={{ transition: 'all 0.3s ease' }} />
                </div>
                <div style={{ width: '100%' }}>
                  <h2 style={{ marginTop: 0, marginBottom: '0.15rem', fontSize: '1.35rem', lineHeight: '1.2' }}>Digital Marketing & Graphics</h2>
                  <p style={{ lineHeight: '1.6', color: '#4b5563', marginBottom: '0.75rem', fontSize: '1rem' }}>
                    Creative design and strategic digital marketing solutions to elevate your brand.
                  </p>
                  <SubServiceList items={marketingGraphicsServices} />
                  <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
                    <Link to="/services/marketing-graphics" className="btn-text" style={{ fontSize: '0.85rem' }}>View Detail <ArrowRight size={14} /></Link>
                  </div>
                </div>
              </div>
            </section>

            <section id="digital-services" className="service-section">
              <div className="service-category-info glass-card service-hover-card" style={{ padding: '1.25rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
                <div className="service-icon-main dig-icon" style={{ marginBottom: '0.15rem', background: 'rgba(37, 99, 235, 0.1)', padding: '0.7rem', borderRadius: '1rem', transition: 'all 0.3s ease' }}>
                  <Monitor className="text-primary" size={32} style={{ transition: 'all 0.3s ease' }} />
                </div>
                <div style={{ width: '100%' }}>
                  <h2 style={{ marginTop: 0, marginBottom: '0.15rem', fontSize: '1.35rem', lineHeight: '1.2' }}>Software & Web Development</h2>
                  <p style={{ lineHeight: '1.6', color: '#4b5563', marginBottom: '0.75rem', fontSize: '1rem' }}>
                    {servDig?.text || "Transforming your business vision into high-performance digital products."}
                  </p>
                  <SubServiceList items={digitalServices} />
                  <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
                    <Link to="/services/digital-services" className="btn-text" style={{ fontSize: '0.85rem' }}>View Detail <ArrowRight size={14} /></Link>
                  </div>
                </div>
              </div>
            </section>

            <section id="web-hosting" className="service-section">
              <div className="service-category-info glass-card service-hover-card" style={{ padding: '1.25rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
                <div className="service-icon-main host-icon" style={{ marginBottom: '0.15rem', background: 'rgba(16, 185, 129, 0.1)', padding: '0.7rem', borderRadius: '1rem', transition: 'all 0.3s ease' }}>
                  <Globe className="text-secondary" size={32} style={{ transition: 'all 0.3s ease' }} />
                </div>
                <div style={{ width: '100%' }}>
                  <h2 style={{ marginTop: 0, marginBottom: '0.15rem', fontSize: '1.35rem', lineHeight: '1.2' }}>Web Hosting and Domains</h2>
                  <p style={{ lineHeight: '1.6', color: '#4b5563', marginBottom: '0.75rem', fontSize: '1rem' }}>
                    Secure and reliable hosting solutions for your digital presence with local support.
                  </p>
                  <SubServiceList items={webHostingServices} />
                  <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
                    <Link to="/services/web-hosting" className="btn-text" style={{ fontSize: '0.85rem' }}>View Detail <ArrowRight size={14} /></Link>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </section>

      {featuredProjects.length > 0 && (
        <section id="featured-projects" className="featured-projects-section section-padding" style={{ background: 'linear-gradient(135deg, #f8fafc, #ffffff)', borderTop: '1px solid rgba(16, 185, 129, 0.1)' }}>
          <div className="container">
            <header className="page-header center">
              <h2 className="section-title">Featured Projects</h2>
              <p className="subtitle">Innovative solutions delivered with technical precision.</p>
            </header>
            
            <div className="projects-grid">
              {featuredProjects.map((project) => (
                <ProjectCard 
                  key={project.id} 
                  {...project} 
                  icon={getProjectIcon(project.category)} 
                />
              ))}
            </div>
            
            <div style={{ textAlign: 'center', marginTop: '2rem' }}>
              <Link to="/projects" className="btn btn-primary">View More Projects <ArrowRight size={18} /></Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;
