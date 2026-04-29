import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { submitInquiry } from '../api/client';
import SEO from '../components/SEO';
import { useToast } from '../components/Toast';

const Contact = () => {
  const [selectedService, setSelectedService] = useState('');
  const [selectedSubServices, setSelectedSubServices] = useState([]);
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', phone: '', company: '', location: '', message: ''
  });
  const [loading, setLoading]   = useState(false);
  const [success, setSuccess]   = useState(false);
  const [error, setError]       = useState('');
  const { addToast }            = useToast();
  
  const servicesData = {
    "IT Support and Consulting": [
      "Continuous Help Desk Support", 
      "Technical Support", 
      "Consulting"
    ],
    "Networking and Infrastructure": [
      "LAN/WAN Networking Design and Installation", 
      "Networking Devices Configuration", 
      "Wi-Fi Installation", 
      "Fiber Optics Installation",
      "PBAX Telephone System Installation",
      "Networked Dish Installation"
    ],
    "Security and Surveillance": [
      "CCTV Surveillance Installation", 
      "Fire Alarm & Detection Systems", 
      "Biometric Attendance & Access Control", 
      "Electric Fence & Perimeter Security",
      "Electronic Door Lock Systems"
    ],
    "Cybersecurity & Antivirus": [
      "Endpoint Security Solutions",
      "Server & Data Protection",
      "Centralized Security Management",
      "Security Audits & Licensing"
    ],
    "Digital Marketing and Graphics": [
      "Logo Design", 
      "Brochures & Flyers", 
      "Business Cards Design", 
      "Social Media Marketing", 
      "Digital Marketing",
      "Search Engine Optimization (SEO)"
    ],
    "Software and Web Development": [
      "Website Development", 
      "Mobile App Development", 
      "Custom Software Development", 
      "ERP System Development"
    ],
    "Web Hosting and Domains": [
      "High-Performance Web Hosting", 
      "Managed Security & SSL Certificates", 
      "Domain & Email Hosting", 
      "Local Technical Support & Migration"
    ]
  };

  const handleServiceChange = (service) => {
    setSelectedService(service);
    setSelectedSubServices([]);
  };

  const toggleSubService = (sub) => {
    setSelectedSubServices(prev =>
      prev.includes(sub) ? prev.filter(s => s !== sub) : [...prev, sub]
    );
  };

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await submitInquiry({
        ...formData,
        service: selectedService,
        subServices: selectedSubServices,
      });
      addToast('Your inquiry has been sent successfully!', 'success');
      setSuccess(true);
      setFormData({ firstName: '', lastName: '', email: '', phone: '', company: '', location: '', message: '' });
      setSelectedService('');
      setSelectedSubServices([]);
    } catch (err) {
      const errMsg = err.message || 'Something went wrong. Please try again.';
      setError(errMsg);
      addToast(errMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contact-page">
      <SEO 
        title="Contact Us" 
        description="Get in touch with Hexagon Computer Systems for expert IT solutions, software development, and networking services in Addis Ababa, Ethiopia." 
      />
      <div className="container">
        <header className="page-header center">
          <h1 className="section-title">Contact Us</h1>
          <p className="subtitle">Let's discuss your next big idea.</p>
        </header>

        <div className="contact-grid">
          {/* Contact Info */}
          <div className="contact-info-panel animate-fade-in">
            <div className="glass-card info-card">
              <h3>Get In Touch</h3>
              <p>We are available for consultations and support during business hours.</p>

              <div className="contact-methods">
                <div className="method-item">
                  <div className="hexagon-icon-small">
                    <Phone size={18} />
                  </div>
                  <div>
                    <h4>Phone</h4>
                    <p>+251-944161572</p>
                  </div>
                </div>

                <div className="method-item">
                  <div className="hexagon-icon-small">
                    <Mail size={18} />
                  </div>
                  <div>
                    <h4>Email</h4>
                    <p>info@hexagonview.com</p>
                  </div>
                </div>

                <div className="method-item">
                  <div className="hexagon-icon-small">
                    <MapPin size={18} />
                  </div>
                  <div>
                    <h4>Address</h4>
                    <p>22 Mazoriya, MAF Building, 4th FL, #402, Addis Ababa, Ethiopia</p>
                    <p style={{ marginTop: '0.2rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>P.O. Box: 15,444, Addis Ababa, Ethiopia</p>
                  </div>
                </div>
              </div>

              <div className="map-wrapper" style={{ marginTop: '2rem' }}>
                <div 
                  className="map-container" 
                  style={{ 
                    height: '400px', 
                    width: '100%', 
                    borderRadius: '1.25rem', 
                    overflow: 'hidden', 
                    border: '1px solid var(--glass-border)',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                    position: 'relative',
                    background: '#f1f5f9'
                  }}
                >
                  <iframe 
                    src="https://maps.google.com/maps?q=MAF%20Building,%2022%20Mazoriya,%20Addis%20Ababa,%20Ethiopia&t=&z=17&ie=UTF8&iwloc=&output=embed" 
                    width="100%" 
                    height="100%" 
                    style={{ border: 0, display: 'block' }} 
                    allowFullScreen="" 
                    title="Hexagon Office Location"
                  ></iframe>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="contact-form-panel animate-fade-in" style={{ animationDelay: '0.2s' }}>
            {success ? (
              <div className="glass-card contact-form" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: '1rem', minHeight: '340px' }}>
                <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(0,179,122,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CheckCircle2 size={40} color="var(--primary)" />
                </div>
                <h3 style={{ margin: 0 }}>Inquiry Sent!</h3>
                <p style={{ color: 'var(--text-muted)', maxWidth: 340 }}>
                  Thank you! We've received your inquiry and will get back to you within 24 business hours.
                </p>
                <button className="btn btn-outline" onClick={() => setSuccess(false)}>
                  Send Another Request
                </button>
              </div>
            ) : (
              <form className="glass-card contact-form" onSubmit={handleSubmit}>
                <h3>Send a Message</h3>

                {error && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '0.75rem', color: '#ef4444', marginBottom: '1rem', fontSize: '0.9rem' }}>
                    <AlertCircle size={18} /> {error}
                  </div>
                )}

                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="firstName">First Name</label>
                    <input type="text" id="firstName" placeholder="First Name" value={formData.firstName} onChange={handleChange} required />
                  </div>
                  <div className="form-group">
                    <label htmlFor="lastName">Last Name</label>
                    <input type="text" id="lastName" placeholder="Last Name" value={formData.lastName} onChange={handleChange} required />
                  </div>
                  <div className="form-group">
                    <label htmlFor="email">Email Address</label>
                    <input type="email" id="email" placeholder="john@example.com" value={formData.email} onChange={handleChange} required />
                  </div>
                  <div className="form-group">
                    <label htmlFor="phone">Phone Number</label>
                    <input type="tel" id="phone" placeholder="+251 ..." value={formData.phone} onChange={handleChange} required />
                  </div>
                  <div className="form-group">
                    <label htmlFor="company">Company Name (Optional)</label>
                    <input type="text" id="company" placeholder="Your Company" value={formData.company} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label htmlFor="location">Location</label>
                    <input type="text" id="location" placeholder="City, Area" value={formData.location} onChange={handleChange} required />
                  </div>
                </div>

                <div className="form-group mt-3">
                  <label htmlFor="service">Select Services</label>
                  <select id="service" value={selectedService} onChange={(e) => handleServiceChange(e.target.value)} required>
                    <option value="">-- Choose a Category --</option>
                    {Object.keys(servicesData).map(service => (
                      <option key={service} value={service}>{service}</option>
                    ))}
                  </select>
                </div>

                {selectedService && (
                  <div className="form-group mt-3 animate-fade-in">
                    <label>Select Sub Services (Multiple Selection Available)</label>
                    <div className="checkbox-grid">
                      {servicesData[selectedService].map(sub => (
                        <div
                          key={sub}
                          className={`checkbox-item ${selectedSubServices.includes(sub) ? 'active' : ''}`}
                          onClick={() => toggleSubService(sub)}
                        >
                          <div className="checkbox-box">
                            {selectedSubServices.includes(sub) && <CheckCircle2 size={16} />}
                          </div>
                          <span>{sub}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="form-group mt-3">
                  <label htmlFor="message">How can we help?</label>
                  <textarea id="message" rows="4" placeholder="Tell us about your project..." value={formData.message} onChange={handleChange}></textarea>
                </div>

                <button type="submit" className="btn btn-primary full-width" disabled={loading} style={{ opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}>
                  {loading ? (
                    <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> Sending...</>
                  ) : (
                    <>Send Request <Send size={18} /></>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
