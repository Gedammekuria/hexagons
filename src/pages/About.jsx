import React, { useState, useEffect, useRef } from 'react';
import { Target, Eye, BookMarked, Zap, Users, Scale, Lock, Handshake, Monitor, Network, Code, Database, Globe, Play, Pause, Quote, MapPin, Briefcase, Shield } from 'lucide-react';
import { getContent } from '../api/client';
import SEO from '../components/SEO';
import { useSettings } from '../context/SettingsContext';

const About = () => {
  const { settings } = useSettings();
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef(null);

  const toggleVideo = () => {
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const [story, setStory] = useState(null);
  const [founder, setFounder] = useState(null);
  const [vm, setVm] = useState(null);
  const [overview, setOverview] = useState(null);

  useEffect(() => {
    getContent('about', 'story').then(res => setStory(res.data)).catch(() => {});
    getContent('about', 'founder').then(res => setFounder(res.data)).catch(() => {});
    getContent('about', 'vision_mission').then(res => setVm(res.data)).catch(() => {});
    getContent('home', 'overview').then(res => setOverview(res.data)).catch(() => {});
  }, []);

  return (
    <div className="about-page">
      <SEO 
        title="About Us" 
        description={`Learn about ${settings?.company_name || 'Hexagon Computer Systems'}, founded in ${settings?.founded_year || '2009'}. Our mission is to provide quality IT and communication consulting to businesses in Ethiopia.`} 
      />
      <div className="container">
        <header className="page-header center">
          <h1 className="section-title">{story?.title || 'About Hexagon'}</h1>
        </header>


        <section className="about-intro-section">
          <div className="about-intro-grid">
            {/* LEFT: About Text */}
            <div className="about-text animate-fade-in">
              <span className="badge">{settings?.experience_years || '15+'} Years in Business</span>
              <h2>{story?.title || 'About Hexagon'}</h2>
              <p>
                {(story?.paragraph1 || `Hexagon Computer Systems is a ${settings?.experience_years || '15+'} years old technology company established in ${settings?.founded_year || '2009'}.
                With a team of well-equipped professionals, we endeavor to provide high level technology
                support to our clients.`)
                  .replace(/\b(19|20)\d{2}\b/g, settings?.founded_year || '2009')
                  .replace(/\b\d+\+?\s+years?\b/gi, `${settings?.experience_years || '15+'} years`)
                  .replace(/Hexagon Computer Systems/gi, settings?.company_name || 'Hexagon Computer Systems')}
              </p>
              <p>
                {story?.paragraph2 || `Our team of professionals, sharing knowledge and working together, chose the symbol of
                the 'Hexagon'. A hexagon is a mathematical shape: a six-sided polygon; the same shape
                that honey bees use to build strong hives and use efficiently to produce honey and
                sustain the life of the colony.`}
              </p>
              <p>
                Depending on the size and field of your organization, we have different products and
                services to meet your requirements. We provide the optimum and customized solutions made
                for your organization.
              </p>
              <div className="about-stats">
                <div className="mini-stat">
                  <h3>{settings?.founded_year || "2009"}</h3>
                  <p>Founded</p>
                </div>
                <div className="mini-stat">
                  <h3>{settings?.experience_years || "15+"}</h3>
                  <p>Years Experience</p>
                </div>
                <div className="mini-stat">
                  <h3>{settings?.employees || "50+"}</h3>
                  <p>Employees</p>
                </div>
              </div>
            </div>

            {/* RIGHT: Company Overview Cards */}
            <div className="about-overview-cards animate-fade-in">
              <span className="badge">Company Overview</span>
              <h2>Our Track Record</h2>
              <div className="overview-cards-side">
                <div className="overview-side-item glass-card">
                  <div className="overview-number">01</div>
                  <Globe className="text-primary" size={28} />
                  <div>
                    <h4>{overview?.card1_title || "Founded"}</h4>
                    <p>{(overview?.card1_text || `Established in ${settings?.founded_year || '2009'}.`).replace(/\b(19|20)\d{2}\b/g, settings?.founded_year || '2009')}</p>
                  </div>
                </div>
                <div className="overview-side-item glass-card">
                  <div className="overview-number">02</div>
                  <MapPin className="text-secondary" size={28} />
                  <div>
                    <h4>{overview?.card2_title || "Our Office"}</h4>
                    <p>{overview?.card2_text || settings?.address || "22 Mazoriya, MAF Bldg."}</p>
                  </div>
                </div>
                <div className="overview-side-item glass-card">
                  <div className="overview-number">03</div>
                  <Briefcase className="text-accent" size={28} />
                  <div>
                    <h4>{overview?.card3_title || "Experience"}</h4>
                    <p>{(overview?.card3_text || "15+ Years of industry leadership.").replace(/\b\d+\+?\s*[Yy]ears?\b/g, `${settings?.experience_years || '15+'} Years`)}</p>
                  </div>
                </div>
                <div className="overview-side-item glass-card">
                  <div className="overview-number">04</div>
                  <Code className="text-primary" size={28} />
                  <div>
                    <h4>{overview?.card4_title || "Software Projects"}</h4>
                    <p>{(overview?.card4_text || "250+ Successfully delivered.").replace(/\b\d+\+?\b/g, `${settings?.software_projects || '250+'}`)}</p>
                  </div>
                </div>
                <div className="overview-side-item glass-card">
                  <div className="overview-number">05</div>
                  <Shield className="text-secondary" size={28} />
                  <div>
                    <h4>{overview?.card5_title || "Network & Security"}</h4>
                    <p>{(overview?.card5_text || "180+ Enterprise deployments.").replace(/\b\d+\+?\b/g, `${settings?.network_projects || '180+'}`)}</p>
                  </div>
                </div>
                <div className="overview-side-item glass-card">
                  <div className="overview-number">06</div>
                  <Users className="text-accent" size={28} />
                  <div>
                    <h4>{overview?.card6_title || "Employees"}</h4>
                    <p>{(overview?.card6_text || "50+ Dedicated professionals.").replace(/\b\d+\+?\b/g, `${settings?.employees || '50+'}`)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Vision / Mission / Values */}
        <section className="about-content">
          <div className="vision-grid mt-5">
              <div className="glass-card vision-card">
                <Target size={40} className="text-secondary" />
                <h3>Our Mission</h3>
                <ul className="core-values-list">
                  <li>
                    <div className="hexagon-icon-small"><Target size={14} /></div>
                    <span>{vm?.mission_text || 'Provide quality IT and communication consulting to businesses in Ethiopia and beyond'}</span>
                  </li>
                  <li>
                    <div className="hexagon-icon-small"><Users size={14} /></div>
                    <span>Serve an ever-broadening group of quality businesses and industries</span>
                  </li>
                  <li>
                    <div className="hexagon-icon-small"><Handshake size={14} /></div>
                    <span>Reach out to the Ethiopian people in positive, life-improving ways</span>
                  </li>
                </ul>
              </div>
              <div className="glass-card vision-card">
                <Eye size={40} className="text-primary" />
                <h3>Our Vision</h3>
                <ul className="core-values-list">
                  <li>
                    <div className="hexagon-icon-small"><Eye size={14} /></div>
                    <span>{vm?.vision_text || 'Provide cutting-edge service and products for all the disciplines of information technology and communication'}</span>
                  </li>
                  <li>
                    <div className="hexagon-icon-small"><Monitor size={14} /></div>
                    <span>Computer and network maintenance and repair</span>
                  </li>
                  <li>
                    <div className="hexagon-icon-small"><Network size={14} /></div>
                    <span>Network planning and construction</span>
                  </li>
                  <li>
                    <div className="hexagon-icon-small"><Code size={14} /></div>
                    <span>Software development</span>
                  </li>
                  <li>
                    <div className="hexagon-icon-small"><Database size={14} /></div>
                    <span>Data recovery</span>
                  </li>
                  <li>
                    <div className="hexagon-icon-small"><Globe size={14} /></div>
                    <span>Digital marketing and web design</span>
                  </li>
                </ul>
              </div>
              <div className="glass-card vision-card">
                <BookMarked size={40} style={{ color: '#10b981' }} />
                <h3>Core Values</h3>
                <ul className="core-values-list">
                  <li>
                    <div className="hexagon-icon-small"><Zap size={14} /></div>
                    <span>Prompt and efficient delivery of products and services</span>
                  </li>
                  <li>
                    <div className="hexagon-icon-small"><Users size={14} /></div>
                    <span>Solid and dependable teamwork</span>
                  </li>
                  <li>
                    <div className="hexagon-icon-small"><Scale size={14} /></div>
                    <span>Professional, personal and fiscal discipline based on the highest standard of ethical business practice</span>
                  </li>
                  <li>
                    <div className="hexagon-icon-small"><Lock size={14} /></div>
                    <span>Confidentiality: Your data and other confidential information are safe with us – We guarantee it!</span>
                  </li>
                </ul>
              </div>
            </div>
        </section>

        <section className="founder-section grid-2">
          <div className="about-text animate-fade-in">
            <span className="badge">Our Leadership</span>
            <h2>{founder?.title || "Founder's Statement"}</h2>
            <p>
              {(founder?.text1 || `Ephrem Abreha is the visionary behind Hexagon Computer Systems.
              With over ${settings?.experience_years || '15+'} years of industry leadership, Ephrem founded Hexagon with a goal to
              revolutionize the Ethiopian technology landscape.`)
                .replace(/\b\d+\+?\s+years?\b/gi, `${settings?.experience_years || '15+'} years`)
                .replace(/Hexagon Computer Systems/gi, settings?.company_name || 'Hexagon Computer Systems')}
            </p>
            <p>
              {founder?.text2 || `His commitment to building humble, supportive, and trustworthy engineering teams
              has been the cornerstone of our success. Under his guidance, Hexagon has grown
              from a small startup to a multi-disciplinary tech powerhouse, serving both
              private and governmental sectors with unwavering integrity.`}
            </p>
          </div>
          <div className="about-image glass-card">
            <div className="hexagon-bg-decoration"></div>
            <img src="/images/ephrem abreha.jpg" alt="Ephrem Abreha - Founder" loading="lazy" />
            <div className="founder-caption">
              <strong>Ephrem Abreha</strong> | <span>Founder</span>
            </div>
          </div>
        </section>



        <section className="who-we-are-section grid-2">
          <div className="about-text animate-fade-in">
            <span className="badge">Our Identity</span>
            <h2>Who We Are</h2>
            <p className="lead-text">
              We are a group of young and dynamic people who love to combine our talents and skills in order to help companies to get more business.
            </p>
            <div className="philosophy-box glass-card">
              <Quote size={24} className="text-primary quote-icon" />
              <p>
                Not by using sneaky tricks into getting more clients, but by helping companies to show how amazing they actually are.
              </p>
            </div>
          </div>
          <div className="about-video-space glass-card animate-fade-in">
            <div className="video-placeholder" onClick={toggleVideo} style={{ cursor: 'pointer' }}>
              <div className={`video-overlay ${isPlaying ? 'playing' : ''}`}>
                <button className="video-play-btn large">
                  {isPlaying ? <Pause size={30} fill="white" /> : <Play size={30} fill="white" />}
                </button>
              </div>
              {!isPlaying && (
                <img
                  src="/images/it-support.png"
                  alt="Our Team at Work"
                  className="video-thumbnail"
                  style={{ position: 'absolute', inset: 0, zIndex: 1 }}
                  loading="lazy"
                />
              )}
              <video
                ref={videoRef}
                className="video-element"
                playsInline
                loop
                muted={!isPlaying}
              >
                <source src="https://www.w3schools.com/html/mov_bbb.mp4" type="video/mp4" />
              </video>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default About;
