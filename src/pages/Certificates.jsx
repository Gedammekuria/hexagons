import React, { useState, useEffect } from 'react';
import { getCertificates } from '../api/client';
import { Award, ZoomIn, X, FileText } from 'lucide-react';

const Recommendations = () => {
  const [certs, setCerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    getCertificates()
      .then(setCerts)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh' }}>
      
      {/* Hero Section */}
      <section style={{ 
        padding: '4rem 2rem 2rem', 
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', 
        textAlign: 'center',
        color: 'white'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', padding: '0.75rem', background: 'rgba(0,179,122,0.1)', borderRadius: '1rem', color: '#00b37a', marginBottom: '1.5rem' }}>
            <Award size={32} />
          </div>
          <h1 style={{ fontSize: '3rem', fontWeight: 800, margin: '0 0 1rem' }}>Our Recommendations</h1>
          <p style={{ color: '#94a3b8', fontSize: '1.2rem', lineHeight: 1.6 }}>
            Hexagon is committed to maintaining the highest standards of quality and excellence. 
            Below are our official recommendations and professional credentials.
          </p>
        </div>
      </section>

      {/* Main Grid */}
      <section style={{ padding: '4rem 2rem', maxWidth: '1200px', margin: '0 auto' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '5rem', color: '#64748b' }}>Loading documents...</div>
        ) : certs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '5rem', background: 'white', borderRadius: '1.5rem', border: '1px solid #e2e8f0' }}>
            <FileText size={48} color="#cbd5e1" style={{ marginBottom: '1rem' }} />
            <h3 style={{ color: '#475569', fontSize: '1.25rem' }}>No certificates found</h3>
          </div>
        ) : (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
            gap: '2.5rem' 
          }}>
            {certs.map(c => (
              <div 
                key={c.id} 
                onClick={() => setSelected(c)}
                style={{ 
                  background: 'white', 
                  borderRadius: '1.25rem', 
                  overflow: 'hidden', 
                  boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)',
                  border: '1px solid #e2e8f0',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-8px)';
                  e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0,0,0,0.1)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(0,0,0,0.05)';
                }}
              >
                <div style={{ position: 'relative', paddingTop: '141.4%', background: '#f1f5f9' }}>
                  <img 
                    src={c.image} 
                    alt={c.title} 
                    onContextMenu={(e) => e.preventDefault()}
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} 
                  />
                  <div style={{ 
                    position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)', 
                    opacity: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'opacity 0.3s'
                  }} className="hover-overlay">
                    <ZoomIn color="white" size={32} />
                  </div>
                </div>
                <div style={{ padding: '1.5rem', textAlign: 'center' }}>
                  <h3 style={{ color: '#1e293b', margin: '0 0 0.5rem', fontSize: '1.1rem', fontWeight: 700 }}>{c.title}</h3>
                  {c.description && <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>{c.description}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Viewer Modal */}
      {selected && (
        <div style={{ 
          position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.95)', 
          zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '2rem'
        }}>
          <button 
            onClick={() => setSelected(null)}
            style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'white', border: 'none', borderRadius: '50%', width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          >
            <X size={24} />
          </button>
          
          {/* Download button removed as per request */}

          <div style={{ maxHeight: '90vh', maxWidth: '90vw', background: 'white', borderRadius: '0.5rem', padding: '0.5rem', overflow: 'auto' }}>
            <img src={selected.image} alt={selected.title} onContextMenu={(e) => e.preventDefault()} style={{ height: 'auto', maxWidth: '100%', display: 'block' }} />
          </div>
        </div>
      )}


      <style>{`
        .hover-overlay:hover { opacity: 1 !important; }
      `}</style>
    </div>
  );
};

export default Recommendations;
