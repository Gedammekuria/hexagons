import React from 'react';
import { WhatsAppIcon } from './BrandIcons';

const WhatsAppButton = () => {
  const phoneNumber = "251944161572";
  const message = "Hello Hexagon, I'm interested in your services!";
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  return (
    <a 
      href={whatsappUrl} 
      className="whatsapp-float" 
      target="_blank" 
      rel="noopener noreferrer"
      aria-label="Contact us on WhatsApp"
    >
      <WhatsAppIcon size={28} />
      <span className="whatsapp-tooltip">Chat with us</span>
    </a>
  );
};

export default WhatsAppButton;
