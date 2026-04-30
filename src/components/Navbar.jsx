import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Hexagon, ChevronDown } from 'lucide-react';

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
        { name: 'IT Support and Consulting', path: '/services/it-support' },
        { name: 'Networking and Infrastructure', path: '/services/networking' },
        { name: 'Security and Surveillance', path: '/services/security' },
        { name: 'Cybersecurity & Antivirus', path: '/services/cybersecurity' },
        { name: 'Digital Marketing and Graphics', path: '/services/marketing-graphics' },
        { name: 'Software and Web Development', path: '/services/digital-services' },
        { name: 'Web Hosting and Domains', path: '/services/web-hosting' },
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
                  <div className="dropdown-menu glass-card">
                    {link.dropdown.map((subItem) => (
                      <Link
                        key={subItem.name}
                        to={subItem.path}
                        className="dropdown-item"
                        onClick={() => setIsOpen(false)}
                      >
                        {subItem.name}
                      </Link>
                    ))}
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
