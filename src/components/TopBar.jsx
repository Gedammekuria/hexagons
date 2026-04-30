import React, { useState, useEffect } from 'react';
import { Phone, Mail, Clock } from 'lucide-react';
import { FacebookIcon, InstagramIcon, TelegramIcon, TikTokIcon, XIcon, LinkedInIcon } from './BrandIcons';
import { useSettings } from '../context/SettingsContext';

const TopBar = () => {
  const { settings } = useSettings();
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
            {settings?.phone && (
              <a href={`tel:${settings.phone}`} className="info-item">
                <Phone size={14} />
                <span>{settings.phone}</span>
              </a>
            )}
            {settings?.email && (
              <a href={`mailto:${settings.email}`} className="info-item">
                <Mail size={14} />
                <span>{settings.email}</span>
              </a>
            )}
          </div>
          <div className="top-bar-right">
            <div className="social-links">
              {settings?.facebook && <a href={settings.facebook} target="_blank" rel="noopener noreferrer" title="Facebook"><FacebookIcon size={14} /></a>}
              {settings?.twitter && <a href={settings.twitter} target="_blank" rel="noopener noreferrer" title="X (Twitter)"><XIcon size={14} /></a>}
              {settings?.instagram && <a href={settings.instagram} target="_blank" rel="noopener noreferrer" title="Instagram"><InstagramIcon size={14} /></a>}
              {settings?.telegram && <a href={settings.telegram} target="_blank" rel="noopener noreferrer" title="Telegram"><TelegramIcon size={14} /></a>}
              {settings?.linkedin && <a href={settings.linkedin} target="_blank" rel="noopener noreferrer" title="LinkedIn"><LinkedInIcon size={14} /></a>}
              {settings?.tiktok && <a href={settings.tiktok} target="_blank" rel="noopener noreferrer" title="TikTok"><TikTokIcon size={14} /></a>}
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
