import React from 'react';
import { Phone, Mail, MapPin, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { FacebookIcon, InstagramIcon, TelegramIcon, TikTokIcon, XIcon, LinkedInIcon } from './BrandIcons';
import { useSettings } from '../context/SettingsContext';

const Footer = () => {
  const { settings } = useSettings();

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link to="/" className="logo">
              <img src="/images/hexagon-logo.png" alt="Hexagon Logo" className="footer-logo-img" />
            </Link>
            <p className="footer-desc">
              {settings?.company_tagline || "Building reliable technology solutions since 2009. From Addis Ababa to the world."}
            </p>
            <div className="footer-social-links">
              {settings?.facebook && <a href={settings.facebook} target="_blank" rel="noopener noreferrer" title="Facebook"><FacebookIcon size={18} /></a>}
              {settings?.twitter && <a href={settings.twitter} target="_blank" rel="noopener noreferrer" title="X (Twitter)"><XIcon size={18} /></a>}
              {settings?.instagram && <a href={settings.instagram} target="_blank" rel="noopener noreferrer" title="Instagram"><InstagramIcon size={18} /></a>}
              {settings?.telegram && <a href={settings.telegram} target="_blank" rel="noopener noreferrer" title="Telegram"><TelegramIcon size={18} /></a>}
              {settings?.linkedin && <a href={settings.linkedin} target="_blank" rel="noopener noreferrer" title="LinkedIn"><LinkedInIcon size={18} /></a>}
              {settings?.tiktok && <a href={settings.tiktok} target="_blank" rel="noopener noreferrer" title="TikTok"><TikTokIcon size={18} /></a>}
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
              <span>{settings?.phone || "+251-944161572"}</span>
            </div>
            <div className="footer-contact-item">
              <Mail size={16} className="text-primary" />
              <span>{settings?.email || "info@hexagonview.com"}</span>
            </div>
            <div className="footer-contact-item" style={{ alignItems: 'flex-start' }}>
              <MapPin size={16} className="text-primary" style={{ marginTop: '4px' }} />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span>{settings?.address || "22 Mazoriya, MAF Bldg, #402"}</span>
                {settings?.po_box && <span style={{ fontSize: '0.8rem', opacity: 0.8, marginTop: '2px' }}>{settings.po_box}</span>}
              </div>
            </div>
            <div className="footer-contact-item" style={{ alignItems: 'flex-start' }}>
              <Clock size={16} className="text-primary" style={{ marginTop: '4px' }} />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span>Working Hours</span>
                <span style={{ fontSize: '0.8rem', opacity: 0.8, marginTop: '2px' }}>{settings?.working_hours || "Mon – Fri: 8:00 AM – 6:00 PM"}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} {settings?.company_name || "Hexagon Computer Systems"}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
