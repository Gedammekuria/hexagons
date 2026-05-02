import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Hexagon, ChevronDown, ShieldCheck, Network, Lock, Server, Palette, Monitor, Globe } from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
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
              <div key={link.name} className={`nav-item-wrapper ${link.dropdown ? 'has-dropdown' : ''}`}>
                <Link
                  to={link.path}
                  className={`nav-link ${location.pathname === link.path ? 'active' : ''}`}
                  onClick={() => setIsOpen(false)}
                >
                  {link.name}
                  {link.dropdown && <ChevronDown size={14} className="dropdown-arrow" />}
                </Link>
                
                {link.dropdown && (
                  <div className="dropdown-menu mega-menu glass-card">
                    {link.dropdown.map((subItem) => {
                      const Icon = subItem.icon;
                      return (
                        <Link
                          key={subItem.name}
                          to={subItem.path}
                          className="dropdown-item mega-item"
                          onClick={() => setIsOpen(false)}
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
