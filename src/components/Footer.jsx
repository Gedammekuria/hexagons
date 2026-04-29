import React from 'react';
import { Phone, Mail, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { FacebookIcon, InstagramIcon, TelegramIcon, TikTokIcon, XIcon, LinkedInIcon } from './BrandIcons';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link to="/" className="logo">
              <img src="/images/hexagon-logo.png" alt="Hexagon Logo" className="footer-logo-img" />
            </Link>
            <p className="footer-desc">
              Building reliable technology solutions since 2009. From Addis Ababa to the world.
            </p>
            <div className="footer-social-links">
              <a href="#" title="Facebook"><FacebookIcon size={18} /></a>
              <a href="#" title="X (Twitter)"><XIcon size={18} /></a>
              <a href="#" title="Instagram"><InstagramIcon size={18} /></a>
              <a href="#" title="TikTok"><TikTokIcon size={18} /></a>
              <a href="#" title="Telegram"><TelegramIcon size={18} /></a>
              <a href="#" title="LinkedIn"><LinkedInIcon size={18} /></a>
            </div>
          </div>

          <div className="footer-links">
            <h4>Quick Links</h4>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/services/it-support">Services</Link></li>
              <li><Link to="/projects">Projects</Link></li>
              <li><Link to="/blog">Blog</Link></li>
              <li><Link to="/contact">Contact</Link></li>
            </ul>
          </div>

          <div className="footer-links">
            <h4>Our Services</h4>
            <ul>
              <li><Link to="/services/it-support">IT Support and Consulting</Link></li>
              <li><Link to="/services/networking">Networking and Infrastructure</Link></li>
              <li><Link to="/services/security">Security and Surveillance</Link></li>
              <li><Link to="/services/cybersecurity">Cybersecurity & Antivirus</Link></li>
              <li><Link to="/services/marketing-graphics">Digital Marketing and Graphics</Link></li>
              <li><Link to="/services/digital-services">Software and Web Development</Link></li>
              <li><Link to="/services/web-hosting">Web Hosting and Domains</Link></li>
            </ul>
          </div>

          <div className="footer-contact">
            <h4>Contact Info</h4>
            <div className="footer-contact-item">
              <Phone size={16} className="text-primary" />
              <span>+251-944161572</span>
            </div>
            <div className="footer-contact-item">
              <Mail size={16} className="text-primary" />
              <span>info@hexagonview.com</span>
            </div>
            <div className="footer-contact-item" style={{ alignItems: 'flex-start' }}>
              <MapPin size={16} className="text-primary" style={{ marginTop: '4px' }} />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span>22 Mazoriya, MAF Bldg, #402</span>
                <span style={{ fontSize: '0.8rem', opacity: 0.8, marginTop: '2px' }}>P.O. Box: 15,444, Addis Ababa, Ethiopia</span>
              </div>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} Hexagon Computer Systems. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
