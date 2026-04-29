import React, { useRef, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { getBrands } from '../api/client';

const Partners = () => {
  const scrollRef = useRef(null);
  const [isPaused, setIsPaused] = useState(false);
  const [partners, setPartners] = useState([]);

  const fallbackPartners = [
    { name: "Cisco", logo: "/images/logos/cisco.svg" },
    { name: "Dell", logo: "/images/logos/dell.svg" },
    { name: "HP", logo: "/images/logos/hp.svg" },
    { name: "Kaspersky", logo: "/images/logos/kaspersky.svg" },
    { name: "Microsoft", logo: "/images/logos/microsoft.svg" },
    { name: "Hikvision", logo: "/images/logos/hikvision.svg" },
    { name: "Dahua", logo: "/images/logos/dahua.svg" },
    { name: "EZVIZ", logo: "/images/logos/ezviz.png" },
  ];

  useEffect(() => {
    getBrands()
      .then(data => {
        if (data && data.length > 0) {
          const visible = data.filter(b => b.show_on_page !== 0);
          setPartners(visible.length > 0 ? visible : fallbackPartners);
        } else {
          setPartners(fallbackPartners);
        }
      })
      .catch(() => setPartners(fallbackPartners));
  }, []);

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    const scrollStep = 1;
    const delay = 30;

    const scrollInterval = setInterval(() => {
      if (!isPaused) {
        if (scrollContainer.scrollLeft + scrollContainer.clientWidth >= scrollContainer.scrollWidth - 1) {
          scrollContainer.scrollLeft = 0;
        } else {
          scrollContainer.scrollLeft += scrollStep;
        }
      }
    }, delay);

    return () => clearInterval(scrollInterval);
  }, [isPaused]);

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  return (
    <section className="partners-section section-padding">
      <div className="container">
        <h2 className="section-title center">Brands & Partners</h2>
        <p className="subtitle center">
          Authorized suppliers of world-class technology products and partners with industry leaders.
        </p>
        
        <div 
          className="partners-slider-wrapper"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <button className="slider-btn prev" onClick={scrollLeft} aria-label="Scroll left">
            <ChevronLeft size={24} />
          </button>
          
          <div className="partners-scroll-container" ref={scrollRef}>
            <div className="partners-track">
              {[...partners, ...partners].map((partner, index) => (
                <div key={index} className="partner-card glass-card">
                  <div className="partner-logo">
                    <img 
                      src={partner.logo.startsWith('http') ? partner.logo : (partner.logo.startsWith('/images') ? partner.logo : `http://localhost:5000${partner.logo}`)} 
                      alt={`${partner.name} logo`} 
                    />
                    {partner.name === 'EZVIZ' && (
                      <span className="logo-text-suffix">EZVIZ</span>
                    )}
                  </div>
                  <span className="partner-name">{partner.name}</span>
                </div>
              ))}
            </div>
          </div>

          <button className="slider-btn next" onClick={scrollRight} aria-label="Scroll right">
            <ChevronRight size={24} />
          </button>
        </div>
      </div>
    </section>
  );
};

export default Partners;
