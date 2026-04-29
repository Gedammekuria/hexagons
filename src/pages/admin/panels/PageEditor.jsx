import React, { useState, useEffect } from 'react';
import { getAllContent, saveContent } from '../../../api/client';
import { Save, Loader2, FileEdit, Info, Layout, Users, Target, Eye, Shield, Cpu, MessageSquare, ChevronRight } from 'lucide-react';

const PageEditor = ({ token }) => {
  const [content, setContent] = useState({});
  const [loading, setLoading] = useState(true);
  const [activePage, setActivePage] = useState('home');
  const [saving, setSaving] = useState(null); 
  const [msg, setMsg] = useState('');

  const pages = [
    {
      id: 'home',
      label: 'Home Page',
      icon: Layout,
      sections: [
        { id: 'hero', label: 'Hero Section', fields: [
          { key: 'title', label: 'Hero Title', type: 'text', default: "Empowering Ethiopia's Digital Future" },
          { key: 'subtitle', label: 'Hero Subtitle', type: 'textarea', default: "Hexagon Computer Systems delivers cutting-edge IT solutions, from robust software development to enterprise-grade network security." }
        ]},
        { id: 'about_preview', label: 'About Preview', fields: [
          { key: 'badge', label: 'Badge Text', type: 'text', default: "15+ Years in Business" },
          { key: 'title', label: 'Section Title', type: 'text', default: "About Hexagon" },
          { key: 'text', label: 'Description', type: 'textarea', default: "Hexagon Computer Systems is a 15 years old technology company established in 2009. With a team of well-equipped professionals, we endeavor to provide high level technology support to our clients." }
        ]},
        { id: 'overview', label: 'Company Overview Cards', fields: [
          { key: 'card1_title', label: 'Card 1 Title', type: 'text', default: "Founded" },
          { key: 'card1_text', label: 'Card 1 Text', type: 'text', default: "Established in 2009, with experienced IT Persons." },
          { key: 'card2_title', label: 'Card 2 Title', type: 'text', default: "Our Office" },
          { key: 'card2_text', label: 'Card 2 Text', type: 'text', default: "22 Mazoriya, MAF Bldg office #402." },
          { key: 'card3_title', label: 'Card 3 Title', type: 'text', default: "Experience" },
          { key: 'card3_text', label: 'Card 3 Text', type: 'text', default: "15+ Years of industry leadership." }
        ]},
        { id: 'procedures', label: 'Our Procedures (Steps)', fields: [
          { key: 'step1_title', label: 'Step 1: Find', type: 'text', default: "Find" },
          { key: 'step1_text', label: 'Step 1 Description', type: 'textarea', default: "We start by understanding your needs through deep analysis." },
          { key: 'step2_title', label: 'Step 2: Design', type: 'text', default: "Design" },
          { key: 'step2_text', label: 'Step 2 Description', type: 'textarea', default: "Our experts create a detailed blueprint for your solution." }
        ]},
        { id: 'featured', label: 'Featured Work', fields: [
          { key: 'title', label: 'Project Title', type: 'text', default: "Advanced ERP for Public Sector" },
          { key: 'text', label: 'Description', type: 'textarea', default: "We recently completed a comprehensive Enterprise Resource Planning system for a major governmental agency." }
        ]}
      ]
    },
    {
      id: 'about',
      label: 'About Page',
      icon: Users,
      sections: [
        { id: 'story', label: 'Our Story', fields: [
          { key: 'title', label: 'Section Title', type: 'text', default: "About Hexagon" },
          { key: 'paragraph1', label: 'Paragraph 1', type: 'textarea', default: "Hexagon Computer Systems is a 15 years old technology company established in 2009." },
          { key: 'paragraph2', label: 'Paragraph 2', type: 'textarea', default: "Our team of professionals, sharing knowledge and working together, chose the symbol of the ‘Hexagon’." }
        ]},
        { id: 'founder', label: 'Founder Statement', fields: [
          { key: 'title', label: 'Section Title', type: 'text', default: "Founder's Statement" },
          { key: 'text1', label: 'Part 1', type: 'textarea', default: "Ephrem Abreha is the visionary behind Hexagon Computer Systems." },
          { key: 'text2', label: 'Part 2', type: 'textarea', default: "His commitment to building humble, supportive, and trustworthy engineering teams has been the cornerstone." }
        ]},
        { id: 'vision_mission', label: 'Vision & Mission', fields: [
          { key: 'mission_text', label: 'Our Mission', type: 'textarea', default: "Provide quality IT and communication consulting to businesses in Ethiopia and beyond." },
          { key: 'vision_text', label: 'Our Vision', type: 'textarea', default: "Provide cutting-edge service and products for all the disciplines of information technology." }
        ]}
      ]
    },
    {
      id: 'services',
      label: 'Services Page',
      icon: Cpu,
      sections: [
        { id: 'intro', label: 'Intro Section', fields: [
          { key: 'title', label: 'Page Title', type: 'text', default: "Our Services" },
          { key: 'subtitle', label: 'Subtitle', type: 'textarea', default: "Comprehensive IT solutions tailored for your business growth." }
        ]},
        { id: 'it_support', label: 'IT Support Section', fields: [
          { key: 'title', label: 'Section Title', type: 'text', default: "IT Support and Consulting" },
          { key: 'text', label: 'Description', type: 'textarea', default: "Professional IT assistance and strategic consulting." },
          { key: 'item1_title', label: 'Sub-service 1 Title', type: 'text', default: "Help desk support" },
          { key: 'item1_text', label: 'Sub-service 1 Text', type: 'textarea', default: "24/7 technical assistance for your organization." },
          { key: 'item2_title', label: 'Sub-service 2 Title', type: 'text', default: "Technical Support" },
          { key: 'item2_text', label: 'Sub-service 2 Text', type: 'textarea', default: "End-to-end management of hardware and software." }
        ]},
        { id: 'digital_services', label: 'Digital Services (Software)', fields: [
          { key: 'title', label: 'Section Title', type: 'text', default: "Software & Web Development" },
          { key: 'text', label: 'Description', type: 'textarea', default: "Custom digital products including Web, Mobile, and ERP systems." },
          { key: 'item1_title', label: 'Sub-service 1: Web', type: 'text', default: "Website Development" },
          { key: 'item1_text', label: 'Web Description', type: 'textarea', default: "High-performance, responsive websites." },
          { key: 'item2_title', label: 'Sub-service 2: App', type: 'text', default: "App Development" },
          { key: 'item2_text', label: 'App Description', type: 'textarea', default: "Custom mobile application development." }
        ]},
        { id: 'networking', label: 'Networking Section', fields: [
          { key: 'title', label: 'Section Title', type: 'text', default: "Networking & Infrastructure" },
          { key: 'text', label: 'Description', type: 'textarea', default: "Building robust, scalable, and secure network infrastructures." },
          { key: 'item1_title', label: 'Sub-service 1', type: 'text', default: "LAN/WAN Design" },
          { key: 'item2_title', label: 'Sub-service 2', type: 'text', default: "Wi-Fi Installation" }
        ]},
        { id: 'security', label: 'Security Section', fields: [
          { key: 'title', label: 'Section Title', type: 'text', default: "Security & Surveillance" },
          { key: 'text', label: 'Description', type: 'textarea', default: "Physical security solutions to protect your assets." },
          { key: 'item1_title', label: 'Sub-service 1', type: 'text', default: "CCTV Installation" },
          { key: 'item2_title', label: 'Sub-service 2', type: 'text', default: "Fire Alarm" }
        ]}
      ]
    },
    {
      id: 'contact',
      label: 'Contact Page',
      icon: MessageSquare,
      sections: [
        { id: 'intro', label: 'Intro Section', fields: [
          { key: 'title', label: 'Page Title', type: 'text', default: "Contact Us" },
          { key: 'subtitle', label: 'Subtitle', type: 'textarea', default: "Have a project in mind? Reach out to our team of experts." }
        ]}
      ]
    }
  ];

  useEffect(() => {
    getAllContent().then(data => {
      setContent(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleUpdate = (page, section, key, value) => {
    setContent(prev => ({
      ...prev,
      [page]: {
        ...prev[page],
        [section]: {
          ...(prev[page]?.[section] || {}),
          [key]: value
        }
      }
    }));
  };

  const handleSave = async (page, section) => {
    const sectionData = content[page]?.[section] || {};
    setSaving(`${page}-${section}`);
    try {
      await saveContent(token, page, section, sectionData);
      setMsg('Saved successfully!');
      setTimeout(() => setMsg(''), 3000);
    } catch (e) {
      setMsg('Error: ' + e.message);
    } finally {
      setSaving(null);
    }
  };

  if (loading) return <div style={{ color: '#6b7280', padding: '3rem', textAlign: 'center' }}>Loading content…</div>;

  const activePageData = pages.find(p => p.id === activePage);

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
      {/* Sidebar navigation for pages */}
      <div style={{ width: 220, borderRight: '1px solid #e5e7eb', background: '#f9fafb', display: 'flex', flexDirection: 'column', padding: '1.5rem 0.75rem' }}>
        <h3 style={{ fontSize: '0.75rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem', paddingLeft: '0.5rem' }}>Website Pages</h3>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          {pages.map(page => {
            const Icon = page.icon;
            const isActive = activePage === page.id;
            return (
              <button 
                key={page.id} 
                onClick={() => setActivePage(page.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem',
                  borderRadius: '0.5rem', border: 'none', cursor: 'pointer', textAlign: 'left',
                  background: isActive ? '#ffffff' : 'transparent',
                  color: isActive ? '#00b37a' : '#4b5563',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: '0.875rem',
                  boxShadow: isActive ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  transition: 'all 0.2s'
                }}
              >
                <Icon size={18} />
                {page.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Main editor area */}
      <div style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
          <div>
            <h2 style={{ color: '#111827', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {(() => {
                const PageIcon = activePageData.icon;
                return <PageIcon size={24} color="#00b37a" />;
              })()}
              {activePageData.label} Content
            </h2>
            <p style={{ color: '#6b7280', margin: '0.25rem 0 0', fontSize: '0.9rem' }}>Edit the text sections of your {activePageData.label}.</p>
          </div>
          {msg && <span style={{ background: msg.startsWith('E') ? '#fee2e2' : '#dcfce7', color: msg.startsWith('E') ? '#ef4444' : '#16a34a', padding: '0.5rem 1rem', borderRadius: '0.5rem', fontSize: '0.85rem', fontWeight: 500 }}>{msg}</span>}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {activePageData.sections.map(section => (
            <div key={section.id} style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '0.75rem', overflow: 'hidden', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
              <div style={{ padding: '1rem 1.25rem', background: '#f9fafb', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 style={{ margin: 0, fontSize: '0.9rem', color: '#111827', fontWeight: 600 }}>{section.label}</h4>
                <button 
                  onClick={() => handleSave(activePageData.id, section.id)}
                  disabled={saving === `${activePageData.id}-${section.id}`}
                  style={{ 
                    display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.45rem 1rem', 
                    background: '#00b37a', color: 'white', border: 'none', borderRadius: '0.4rem', 
                    cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, transition: 'opacity 0.2s'
                  }}
                >
                  {saving === `${activePageData.id}-${section.id}` ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                  Save Changes
                </button>
              </div>
              <div style={{ padding: '1.25rem' }}>
                {section.fields.map(field => (
                  <div key={field.key} style={{ marginBottom: '1.25rem' }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#4b5563', marginBottom: '0.5rem' }}>{field.label}</label>
                    {field.type === 'textarea' ? (
                      <textarea 
                        rows={field.rows || 3}
                        value={content[activePageData.id]?.[section.id]?.[field.key] ?? field.default}
                        onChange={(e) => handleUpdate(activePageData.id, section.id, field.key, e.target.value)}
                        style={{ width: '100%', padding: '0.8rem', borderRadius: '0.5rem', border: '1px solid #d1d5db', fontSize: '0.9rem', outline: 'none', fontFamily: 'inherit', lineHeight: 1.5 }}
                        placeholder={`Enter ${field.label}...`}
                      />
                    ) : (
                      <input 
                        type="text"
                        value={content[activePageData.id]?.[section.id]?.[field.key] ?? field.default}
                        onChange={(e) => handleUpdate(activePageData.id, section.id, field.key, e.target.value)}
                        style={{ width: '100%', padding: '0.8rem', borderRadius: '0.5rem', border: '1px solid #d1d5db', fontSize: '0.9rem', outline: 'none' }}
                        placeholder={`Enter ${field.label}...`}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: '3rem', padding: '1.25rem', background: '#eff6ff', borderRadius: '0.75rem', border: '1px solid #dbeafe', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
          <Info size={18} color="#3b82f6" style={{ marginTop: '0.2rem' }} />
          <p style={{ margin: 0, color: '#1e40af', fontSize: '0.85rem', lineHeight: 1.5 }}>
            <strong>Pro Tip:</strong> You can edit multiple sections and then save each one. Changes will be visible on your website immediately after clicking "Save Changes".
          </p>
        </div>
      </div>
    </div>
  );
};

export default PageEditor;
