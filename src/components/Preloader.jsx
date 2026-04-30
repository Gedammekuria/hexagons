import React, { useState, useEffect } from 'react';
import { useSettings } from '../context/SettingsContext';

const Preloader = () => {
  const { settings } = useSettings();
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Start fading out after 1s to match progress animation
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    // Completely remove from DOM after fade animation
    const removeTimer = setTimeout(() => {
      setVisible(false);
    }, 1800);

    return () => {
      clearTimeout(timer);
      clearTimeout(removeTimer);
    };
  }, []);

  if (!visible) return null;

  const companyName = settings?.company_name || 'Hexagon Computer Systems';
  const firstWord = companyName.split(' ')[0];
  const restOfName = companyName.substring(firstWord.length).trim();

  return (
    <div className={`preloader-overlay ${!loading ? 'fade-out' : ''}`}>
      <div className="preloader-content">
        <div className="preloader-visual">
          <div className="revolving-ring"></div>
          <div className="preloader-logo-box full-logo">
            <img src="/images/hexagon-logo.png" alt="Hexagon Logo" className="preloader-logo-img" />
          </div>
        </div>
        
        <div className="preloader-text">
          <p className="welcome-text">WELCOME TO</p>
          <h1 className="brand-name" style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center' }}>
            <span className="hexagon-text" style={{ color: 'var(--primary)', WebkitTextFillColor: 'initial' }}>{firstWord}</span>
            <span className="systems-text">{restOfName}</span>
          </h1>
          <div className="loading-bar-container">
            <div className="loading-bar-progress"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Preloader;
