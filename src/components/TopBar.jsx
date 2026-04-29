import React, { useState, useEffect } from 'react';
import { Phone, Mail, Clock } from 'lucide-react';
import { FacebookIcon, InstagramIcon, TelegramIcon, TikTokIcon, XIcon, LinkedInIcon } from './BrandIcons';

const TopBar = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedTime = currentTime.toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit',
    hour12: true 
  });

  const formattedDate = currentTime.toLocaleDateString([], { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric' 
  });

  return (
    <div className="top-bar">
      <div className="container">
        <div className="top-bar-content">
          <div className="contact-info">
            <a href="tel:+251944161572" className="info-item">
              <Phone size={14} />
              <span>+251-944161572</span>
            </a>
            <a href="mailto:info@hexagonview.com" className="info-item">
              <Mail size={14} />
              <span>info@hexagonview.com</span>
            </a>
          </div>
          <div className="top-bar-right">
            <div className="social-links">
              <a href="#" title="Facebook"><FacebookIcon size={14} /></a>
              <a href="#" title="X (Twitter)"><XIcon size={14} /></a>
              <a href="#" title="Instagram"><InstagramIcon size={14} /></a>
              <a href="#" title="TikTok"><TikTokIcon size={14} /></a>
              <a href="#" title="Telegram"><TelegramIcon size={14} /></a>
              <a href="#" title="LinkedIn"><LinkedInIcon size={14} /></a>
            </div>
            <div className="live-clock">
              <Clock size={12} className="text-accent" />
              <span>{formattedDate} | {formattedTime}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopBar;
