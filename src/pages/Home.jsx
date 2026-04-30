import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, Code, Globe, Shield, Database, Layout, Users, X, CheckCircle2, Monitor, ShieldCheck, Palette, Server, Lock, Flame, Network, Camera, Fingerprint, Zap, Headset, Wrench, Briefcase, Settings, Smartphone, LayoutDashboard, Printer, Megaphone, PenTool, ChevronLeft, ChevronRight, MapPin, Phone, Tv, Wifi, Share2, Search, Folder } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { getContent, getProjects, getImageUrl } from '../api/client';
import SEO from '../components/SEO';
import Procedures from './Procedures';
import Team from './Team';
import Partners from '../components/Partners';
import { useSettings } from '../context/SettingsContext';

const ProjectCard = ({ title, category, description, tags, image, link, show_link, icon: Icon }) => (
  <div className="glass-card project-card animate-fade-in">
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

  const SubServiceList = ({ items }) => (
    <div className="sub-service-list" style={{ marginLeft: '2rem' }}>
      {items.map((item, i) => {
        const Icon = item.icon;
        return (
          <div key={i} className="sub-service-item-simple">
            <div className="hexagon-icon-small">
              <Icon size={16} />
            </div>
            <span>{item.title}</span>
          </div>
        );
      })}
    </div>
  );

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
              <div className="service-category-info glass-card" style={{ padding: 0, overflow: 'hidden', gap: 0 }}>
                <img src="/images/it-support.png" alt="IT Support" style={{ width: '100%', height: '160px', objectFit: 'cover', display: 'block' }} loading="lazy" />
                <div style={{ padding: '0.5rem 1.5rem 1.5rem 1.5rem' }}>
                  <h2 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.25rem', whiteSpace: 'nowrap' }}>IT Support and Consulting</h2>
                  <p style={{ lineHeight: '1.6', color: '#4b5563', marginBottom: '1.5rem' }}>
                    {servIt?.text || "Our IT Support and Consulting services provide the technical backbone your business needs to excel. We prevent problems through proactive management and expert strategic guidance."}
                  </p>
                  <SubServiceList items={itSupportServices} />
                  <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1.5rem' }}>
                    <Link to="/services/it-support" className="btn-text">View Detail <ArrowRight size={16} /></Link>
                  </div>
                </div>
              </div>
            </section>

            <section id="networking" className="service-section">
              <div className="service-category-info glass-card reverse" style={{ padding: 0, overflow: 'hidden', gap: 0 }}>
                <img src="/images/networking.png" alt="Networking" style={{ width: '100%', height: '160px', objectFit: 'cover', display: 'block' }} loading="lazy" />
                <div style={{ padding: '0.5rem 1.5rem 1.5rem 1.5rem' }}>
                  <h2 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.25rem', whiteSpace: 'nowrap' }}>Networking and Infrastructure</h2>
                  <p style={{ lineHeight: '1.6', color: '#4b5563', marginBottom: '1.5rem' }}>
                    Enterprise-grade network infrastructure design and implementation tailored to your organization's current needs while being engineered to scale effortlessly as you grow.
                  </p>
                  <SubServiceList items={networkingServices} />
                  <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1.5rem' }}>
                    <Link to="/services/networking" className="btn-text">View Detail <ArrowRight size={16} /></Link>
                  </div>
                </div>
              </div>
            </section>

            <section id="security" className="service-section">
              <div className="service-category-info glass-card" style={{ padding: 0, overflow: 'hidden', gap: 0 }}>
                <img src="/images/security.png" alt="Security" style={{ width: '100%', height: '160px', objectFit: 'cover', display: 'block' }} loading="lazy" />
                <div style={{ padding: '0.5rem 1.5rem 1.5rem 1.5rem' }}>
                  <h2 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.25rem', whiteSpace: 'nowrap' }}>Security and Surveillance</h2>
                  <p style={{ lineHeight: '1.6', color: '#4b5563', marginBottom: '1.5rem' }}>
                    Advanced physical security and surveillance systems to protect your people, property, and proprietary data with state-of-the-art hardware and intelligent digital monitoring.
                  </p>
                  <SubServiceList items={securityServices} />
                  <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1.5rem' }}>
                    <Link to="/services/security" className="btn-text">View Detail <ArrowRight size={16} /></Link>
                  </div>
                </div>
              </div>
            </section>

            <section id="cyber-security" className="service-section">
              <div className="service-category-info glass-card reverse" style={{ padding: 0, overflow: 'hidden', gap: 0 }}>
                <img src="/images/cybersecurity.png" alt="Cyber Security" style={{ width: '100%', height: '160px', objectFit: 'cover', display: 'block' }} loading="lazy" />
                <div style={{ padding: '0.5rem 1.5rem 1.5rem 1.5rem' }}>
                  <h2 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.25rem', whiteSpace: 'nowrap' }}>Cybersecurity and Antivirus</h2>
                  <p style={{ lineHeight: '1.6', color: '#4b5563', marginBottom: '1.5rem' }}>
                    Comprehensive digital protection for your business assets. As authorized suppliers, we offer world-class cybersecurity solutions designed to protect your business from sophisticated digital threats.
                  </p>
                  <SubServiceList items={cyberServices} />
                  <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1.5rem' }}>
                    <Link to="/services/cybersecurity" className="btn-text">View Detail <ArrowRight size={16} /></Link>
                  </div>
                </div>
              </div>
            </section>

            <section id="marketing-graphics" className="service-section">
              <div className="service-category-info glass-card" style={{ padding: 0, overflow: 'hidden', gap: 0 }}>
                <img src="/images/digital-marketing.png" alt="Digital Marketing" style={{ width: '100%', height: '160px', objectFit: 'cover', display: 'block' }} loading="lazy" />
                <div style={{ padding: '0.5rem 1.5rem 1.5rem 1.5rem' }}>
                  <h2 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.25rem', whiteSpace: 'nowrap' }}>Digital Marketing and Graphics</h2>
                  <p style={{ lineHeight: '1.6', color: '#4b5563', marginBottom: '1.5rem' }}>
                    Creative design and strategic digital marketing solutions to elevate your brand. We help you connect with your audience and drive meaningful growth in the digital landscape.
                  </p>
                  <SubServiceList items={marketingGraphicsServices} />
                  <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1.5rem' }}>
                    <Link to="/services/marketing-graphics" className="btn-text">View Detail <ArrowRight size={16} /></Link>
                  </div>
                </div>
              </div>
            </section>

            <section id="digital-services" className="service-section">
              <div className="service-category-info glass-card reverse" style={{ padding: 0, overflow: 'hidden', gap: 0 }}>
                <img src="/images/digital-services.png" alt="Digital Services" style={{ width: '100%', height: '160px', objectFit: 'cover', display: 'block' }} loading="lazy" />
                <div style={{ padding: '0.5rem 1.5rem 1.5rem 1.5rem' }}>
                  <h2 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.25rem', whiteSpace: 'nowrap' }}>Software and Web Development</h2>
                  <p style={{ lineHeight: '1.6', color: '#4b5563', marginBottom: '1.5rem' }}>
                    {servDig?.text || "We transform your business vision into high-performance digital products. Our digital services team builds scalable websites, mobile applications, and enterprise software."}
                  </p>
                  <SubServiceList items={digitalServices} />
                  <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1.5rem' }}>
                    <Link to="/services/digital-services" className="btn-text">View Detail <ArrowRight size={16} /></Link>
                  </div>
                </div>
              </div>
            </section>

            <section id="web-hosting" className="service-section">
              <div className="service-category-info glass-card" style={{ padding: 0, overflow: 'hidden', gap: 0 }}>
                <img src="/images/networking.png" alt="Web Hosting" style={{ width: '100%', height: '160px', objectFit: 'cover', display: 'block' }} loading="lazy" />
                <div style={{ padding: '0.5rem 1.5rem 1.5rem 1.5rem' }}>
                  <h2 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.25rem', whiteSpace: 'nowrap' }}>Web Hosting and Domains</h2>
                  <p style={{ lineHeight: '1.6', color: '#4b5563', marginBottom: '1.5rem' }}>
                    Secure and reliable hosting solutions for your digital presence. Our hosting provides enterprise-grade performance, uptime guarantees, and local technical support.
                  </p>
                  <SubServiceList items={webHostingServices} />
                  <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1.5rem' }}>
                    <Link to="/services/web-hosting" className="btn-text">View Detail <ArrowRight size={16} /></Link>
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
