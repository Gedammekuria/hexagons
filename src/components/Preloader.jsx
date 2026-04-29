import React, { useState, useEffect } from 'react';

const Preloader = () => {
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
          <h1 className="brand-name">
            <span className="hexagon-text">HEXAGON</span>
            <span className="systems-text">SYSTEMS</span>
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
