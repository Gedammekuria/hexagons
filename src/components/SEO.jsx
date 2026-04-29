import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const SEO = ({ title, description, keywords }) => {
  const location = useLocation();

  useEffect(() => {
    const baseTitle = "Hexagon Computer Systems";
    const fullTitle = title ? `${title} | ${baseTitle}` : baseTitle;
    document.title = fullTitle;

    // Meta Description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.name = 'description';
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', description || "Hexagon Computer Systems provides world-class IT support, networking, cybersecurity, and software development services in Ethiopia.");

    // Meta Keywords
    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (!metaKeywords) {
      metaKeywords = document.createElement('meta');
      metaKeywords.name = 'keywords';
      document.head.appendChild(metaKeywords);
    }
    metaKeywords.setAttribute('content', keywords || "IT solutions, software development, networking, cybersecurity, Ethiopia");

    // OG Tags
    const updateOg = (property, content) => {
      let el = document.querySelector(`meta[property="${property}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute('property', property);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    updateOg('og:title', fullTitle);
    updateOg('og:description', description || "Expert IT support and software solutions.");
    updateOg('og:url', window.location.href);

    // JSON-LD Structured Data
    const schemaData = {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      "name": "Hexagon Computer Systems",
      "image": window.location.origin + "/images/hexagon-logo.png",
      "@id": window.location.origin,
      "url": window.location.origin,
      "telephone": "+251-944161572",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "22 Mazoriya, MAF Building, 4th FL, #402",
        "addressLocality": "Addis Ababa",
        "addressCountry": "ET"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": 9.0192,
        "longitude": 38.7895
      },
      "openingHoursSpecification": {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday"
        ],
        "opens": "08:00",
        "closes": "18:00"
      },
      "sameAs": [
        "https://www.facebook.com/hexagonview",
        "https://www.linkedin.com/company/hexagon-computer-systems"
      ]
    };

    let script = document.getElementById('json-ld');
    if (!script) {
      script = document.createElement('script');
      script.id = 'json-ld';
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }
    script.text = JSON.stringify(schemaData);

  }, [title, description, keywords, location]);

  return null;
};

export default SEO;
