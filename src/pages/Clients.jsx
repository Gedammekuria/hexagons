import React, { useRef, useEffect, useState } from 'react';
import { Building2, Globe, Hotel, ChevronLeft, ChevronRight } from 'lucide-react';
import { getClients } from '../api/client';

const Clients = () => {
  const scrollRef = useRef(null);
  const [isPaused, setIsPaused] = useState(false);
  const [clients, setClients] = useState([]);

  const fallbackClients = [
    { name: "Spanish Cooperation", url: "https://www.cooperacionespanola.es/", logo: "/images/clients/aecid.png", icon: Globe },
    { name: "Yuluchelyano Trading PLC", url: "https://yuluchelyano.com/", logo: "/images/clients/yuluchelyano.png", icon: Building2 },
    { name: "OCP Ethiopia", url: "https://www.ocpafrica.com/", logo: "/images/clients/ocp.svg", icon: Globe },
    { name: "Amibara", url: "#", logo: "/images/clients/amibara.png", icon: Building2 },
    { name: "DebreDamo Hotel", url: "#", logo: "/images/clients/debredamo.png", icon: Hotel },
    { name: "Gollagul", url: "#", logo: null, icon: Building2 },
    { name: "Emirates", url: "https://www.emirates.com/", logo: "/images/clients/emirates.svg", icon: Globe },
    { name: "Oasis Hotel", url: "#", logo: null, icon: Hotel }
  ];

  useEffect(() => {
    getClients()
      .then(data => {
        if (data && data.length > 0) {
          const visible = data.filter(c => c.show_on_page !== 0);
          setClients(visible.length > 0 ? visible : fallbackClients);
        } else {
          setClients(fallbackClients);
        }
      })
      .catch(() => setClients(fallbackClients));
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
    <section className="clients-section section-padding" style={{ paddingTop: '0' }}>
      <div className="container">
        <header className="page-header center">
          <h2 className="section-title">Our Clients</h2>
          <p className="subtitle">
            We are proud to collaborate with and provide specialized IT solutions to industry-leading organizations and businesses.
          </p>
        </header>

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
              {[...clients, ...clients].map((client, index) => {
                const Icon = client.icon || Building2;
                return (
                  <div key={index} className="partner-card glass-card compact">
                    <div className="partner-logo">
                      {client.logo ? (
                        <img 
                          src={client.logo.startsWith('http') ? client.logo : (client.logo.startsWith('/images') ? client.logo : `http://localhost:5000${client.logo}`)} 
                          alt={`${client.name} logo`} 
                        />
                      ) : (
                        <Icon size={48} className="text-primary" />
                      )}
                    </div>
                    <span className="partner-name">{client.name}</span>
                  </div>
                );
              })}
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

export default Clients;
