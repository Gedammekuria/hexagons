import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Hexagon, ChevronDown, ShieldCheck, Network, Lock, Server, Palette, Monitor, Globe } from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileDropdown, setMobileDropdown] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About Us', path: '/about' },
    { 
      name: 'Services', 
      path: '/services/it-support',
      dropdown: [
        { name: 'IT Support & Consulting', desc: 'Expert technical guidance and support', path: '/services/it-support', icon: ShieldCheck },
        { name: 'Networking & Infrastructure', desc: 'Enterprise network design & scale', path: '/services/networking', icon: Network },
        { name: 'Security & Surveillance', desc: 'Advanced physical security systems', path: '/services/security', icon: Lock },
        { name: 'Cybersecurity & Antivirus', desc: 'World-class digital threat defense', path: '/services/cybersecurity', icon: Server },
        { name: 'Digital Marketing & Graphics', desc: 'Creative design & strategic SEO', path: '/services/marketing-graphics', icon: Palette },
        { name: 'Software & Web Development', desc: 'Custom applications & systems', path: '/services/digital-services', icon: Monitor },
        { name: 'Web Hosting & Domains', desc: 'Secure enterprise-grade hosting', path: '/services/web-hosting', icon: Globe },
      ]
    },
    { name: 'Projects', path: '/projects' },
    { name: 'Recommendations', path: '/certificates' },
    { name: 'Blog', path: '/blog' },
    { name: 'Contact Us', path: '/contact' },
  ];

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="container">
        <div className="nav-content">
          <Link to="/" className="logo">
            <img src="/images/hexagon-logo.png" alt="Hexagon Logo" style={{ height: '45px' }} />
          </Link>

          <div className={`nav-links ${isOpen ? 'open' : ''}`}>
            {navLinks.map((link) => (
              <div key={link.name} className={`nav-item-wrapper ${link.dropdown ? 'has-dropdown' : ''} ${mobileDropdown === link.name ? 'mobile-expanded' : ''}`}>
                <div className="nav-link-container" style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                  <Link
                    to={link.path}
                    className={`nav-link ${location.pathname.startsWith(link.path) ? 'active' : ''}`}
                    style={{ flex: 1 }}
                    onClick={() => setIsOpen(false)}
                  >
                    {link.name}
                  </Link>
                  {link.dropdown && (
                    <button 
                      className="dropdown-toggle-btn" 
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setMobileDropdown(mobileDropdown === link.name ? null : link.name);
                      }}
                      style={{ padding: '0.5rem', background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}
                    >
                      <ChevronDown size={20} className={`dropdown-arrow ${mobileDropdown === link.name ? 'rotated' : ''}`} />
                    </button>
                  )}
                </div>
                
                {link.dropdown && (
                  <div className={`dropdown-menu mega-menu glass-card ${mobileDropdown === link.name ? 'show-mobile' : ''}`}>
                    {link.dropdown.map((subItem) => {
                      const Icon = subItem.icon;
                      return (
                        <Link
                          key={subItem.name}
                          to={subItem.path}
                          className="dropdown-item mega-item"
                          onClick={() => {
                            setIsOpen(false);
                            setMobileDropdown(null);
                          }}
                        >
                          {Icon && (
                            <div className="mega-icon">
                              <Icon size={20} />
                            </div>
                          )}
                          <div className="mega-text">
                            <span className="mega-title">{subItem.name}</span>
                            {subItem.desc && <span className="mega-desc">{subItem.desc}</span>}
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>

          <button className="mobile-toggle" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
