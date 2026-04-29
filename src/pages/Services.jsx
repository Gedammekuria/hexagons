import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ShieldCheck, Network, Lock, Rocket, Globe, 
  CheckCircle2, ArrowRight, Monitor, Smartphone, 
  Code, LayoutDashboard, Headset, Wrench, Briefcase, 
  Settings, Camera, Flame, Fingerprint, Zap, Server, Database,
  Palette, Megaphone, Search, Share2, Printer, PenTool, Phone, Tv, Wifi
} from 'lucide-react';

const Services = () => {
  const { serviceId } = useParams();
  const id = serviceId || 'it-support';

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  const allServices = {
    'it-support': {
      title: "IT Support and Consulting",
      icon: ShieldCheck,
      color: "var(--primary)",
      image: "/images/it-support.png",
      tagline: "Strategic Technical Partnership",
      description: "Our IT Support and Consulting services provide the technical backbone your business needs to excel. We don't just fix problems — we prevent them through proactive management and expert strategic guidance. With over 15 years of experience, our team is your trusted technology partner from day one.",
      features: [
        { 
          title: "Continuous Help Desk Support", 
          desc: "Our dedicated help desk provides 24/7 multi-tiered technical assistance for your entire organization. We handle everything from basic password resets and software installation to advanced troubleshooting. By offering both immediate remote desktop support and priority on-site intervention, we ensure that technical hurdles never stand in the way of your team's productivity.",
          icon: Headset
        },
        { 
          title: "Technical Support", 
          desc: "We provide proactive, end-to-end management of your enterprise-level hardware and software assets. This includes 24/7 server health monitoring, automated security patch deployment, and rigorous performance tuning to prevent system crashes before they happen. We also manage hardware lifecycle planning and vendor relationships.",
          icon: Wrench
        },
        { 
          title: "Consulting", 
          desc: "Partner with our senior IT strategists to transform your technology from a cost center into a competitive advantage. We provide deep insights into digital transformation, cloud readiness assessments, and cybersecurity posture evaluations. We work alongside your leadership team to develop long-term IT roadmaps.",
          icon: Briefcase
        }
      ]
    },
    'networking': {
      title: "Networking and Infrastructure",
      icon: Network,
      color: "var(--secondary)",
      image: "/images/networking.png",
      tagline: "High-Performance Connectivity",
      description: "A robust network is the lifeblood of your digital organization. We design and implement future-proof network environments that ensure seamless communication, lightning-fast data transfer, and enterprise-grade security. Every solution we build is tailored to your organization's current needs while being engineered to scale effortlessly as you grow.",
      features: [
        { 
          title: "LAN/WAN Networking Design and Installation", 
          desc: "We provide complete design and professional implementation of secure, high-performance local and wide area network infrastructures tailored to your building and user density requirements.",
          icon: Network
        },
        { 
          title: "Networking Devices Configuration", 
          desc: "Expert configuration of enterprise-grade networking devices, including routers, switches, and firewalls, to ensure secure and efficient data routing across your organization.",
          icon: Settings
        },
        { 
          title: "Wi-Fi Installation", 
          desc: "Strategic deployment of high-speed wireless access points to provide seamless, high-capacity Wi-Fi coverage across your entire office or campus environment.",
          icon: Wifi
        },
        { 
          title: "Fiber Optics Installation", 
          desc: "Professional installation, splicing, and termination of fiber optic cabling to provide a high-bandwidth backbone for your modern data infrastructure.",
          icon: Zap
        },
        { 
          title: "PBAX Telephone System Installation", 
          desc: "Installation and configuration of advanced PBAX telephone systems, including IP-PBX and analog solutions, for reliable business communication.",
          icon: Phone
        },
        { 
          title: "Networked Dish Installation", 
          desc: "Professional distribution of satellite TV signals throughout your facility via your existing data network, perfect for corporate and hospitality environments.",
          icon: Tv
        }
      ]
    },
    'security': {
      title: "Security and Surveillance",
      icon: Lock,
      color: "var(--accent)",
      image: "/images/security.png",
      tagline: "Advanced Protection Systems",
      description: "Protecting your people, property, and proprietary data is our highest priority. We combine state-of-the-art hardware with intelligent digital monitoring for total perimeter and interior security. Our comprehensive security solutions are designed to deter, detect, and respond to threats at every level — giving you complete peace of mind.",
      features: [
        { 
          title: "CCTV Surveillance Installation", 
          desc: "We provide professional installation of high-definition IP and analog CCTV surveillance systems with full remote monitoring capabilities. Our solutions include indoor and outdoor cameras, NVR/DVR setup, intelligent motion detection, and night-vision coverage. We configure cloud-based and local recording systems that allow you to review footage from anywhere in the world via smartphone or computer. Our surveillance deployments cover all critical angles of your premises, including entrances, parking areas, server rooms, and sensitive workspaces. We also provide full maintenance contracts to ensure your system remains operational and up-to-date at all times.",
          icon: Camera
        },
        { 
          title: "Fire Alarm & Detection Systems", 
          desc: "Life safety is our highest responsibility. We design and install fully integrated fire detection and suppression systems that meet national and international safety standards. Our installations include advanced photoelectric smoke detectors, rate-of-rise heat sensors, beam detectors for large open spaces, and intelligent control panels with full alarm monitoring. We connect your fire system to automated notification services and integrate with building management systems for a complete safety ecosystem. Regular maintenance, testing, and compliance inspections are part of every service contract we offer, ensuring your system is always ready to respond to an emergency.",
          icon: Flame
        },
        { 
          title: "Biometric Attendance & Access Control", 
          desc: "Streamline your HR operations and secure sensitive areas with our state-of-the-art biometric and RFID-based time and attendance systems. We provide hardware installation, software configuration, and full integration with leading HR and payroll platforms. Our systems accurately track employee arrival and departure times, manage shift patterns, generate automated attendance reports, and eliminate buddy-punching completely. Beyond attendance, our access control solutions restrict entry to server rooms, executive offices, and data centers — ensuring only authorized personnel can access your most sensitive assets. Full audit trails are maintained for every access event.",
          icon: Fingerprint
        },
        { 
          title: "Electric Fence & Perimeter Security", 
          desc: "Secure your entire perimeter with high-voltage electric fencing solutions that provide a powerful, visible deterrent against intruders. Our installations include robust energizers calibrated to safe but effective voltage levels, alarm monitoring integration, warning signage, and durable, weather-resistant wire configurations. We design fence layouts to cover the complete perimeter of your property, including corners, gates, and vulnerable low points. Our systems can be integrated with your existing CCTV and alarm infrastructure to trigger automated alerts and camera activations upon any contact or breach, providing a comprehensive perimeter security ecosystem.",
          icon: Zap
        },
        { 
          title: "Electronic Door Lock Systems", 
          desc: "Replace traditional keys with intelligent, audit-trailed access control for your entry points. We install and configure a wide range of electronic door locks including biometric fingerprint readers, proximity card and key fob systems, PIN-code keypads, and smart mobile app-based access. Each door can be programmed with individual access permissions, time-of-day restrictions, and real-time monitoring. In the event of a security breach, specific doors can be locked down remotely and instantly. Our systems are ideal for office buildings, data centers, hotels, schools, and any environment requiring controlled and accountable access management.",
          icon: Lock
        }
      ]
    },
    'cybersecurity': {
      title: "Cybersecurity & Antivirus",
      icon: ShieldCheck,
      color: "#006d5d", // Kaspersky Green
      image: "/images/cybersecurity.png",
      tagline: "Industry-Leading Digital Protection",
      description: "As authorized suppliers of Kaspersky, we offer world-class cybersecurity solutions designed to protect your business from the most sophisticated digital threats. Our comprehensive protection covers everything from individual workstations to complex server environments, ensuring your data remains secure and your operations stay uninterrupted.",
      features: [
        { 
          title: "Endpoint Security Solutions", 
          desc: "We provide full-scale protection for all your business devices including desktops, laptops, and mobile devices. Our Kaspersky-powered endpoint security uses behavioral analysis and machine learning to detect and block malware, ransomware, and zero-day exploits before they can execute. We manage the entire deployment process, ensuring every device in your network is shielded by the latest security definitions and patches.",
          icon: ShieldCheck
        },
        { 
          title: "Server & Data Protection", 
          desc: "Your servers are the crown jewels of your IT infrastructure. We implement specialized Kaspersky solutions designed specifically for high-load server environments, providing real-time scanning and protection without compromising system performance. This includes protection for file servers, mail servers, and virtualization platforms, creating a multi-layered defense around your most critical data assets.",
          icon: Lock
        },
        { 
          title: "Centralized Security Management", 
          desc: "Take complete control of your organization's security posture with a centralized management console. We set up and configure your security dashboard, allowing your IT team to monitor threat detections, manage licenses, and push security updates across the entire organization from a single pane of glass. This ensures consistent security policies and rapid response to any emerging threats.",
          icon: Settings
        },
        { 
          title: "Security Audits & Licensing", 
          desc: "We handle the complexities of security licensing and compliance for you. As authorized suppliers, we ensure you always have the right licenses for your needs and that they are renewed on time to prevent any gaps in protection. Our team also conducts regular security audits to identify potential vulnerabilities in your network and recommends the best Kaspersky modules to address them.",
          icon: CheckCircle2
        }
      ]
    },
    'marketing-graphics': {
      title: "Digital Marketing and Graphics",
      icon: Palette,
      color: "var(--secondary)",
      image: "/images/digital-marketing.png",
      tagline: "Creative & Strategic Brand Growth",
      description: "Elevate your brand with our comprehensive digital marketing and graphics design services. From creating a unique brand identity to implementing high-impact digital strategies, we help you connect with your audience and drive meaningful growth in the digital landscape.",
      features: [
        { 
          title: "Logo Design", 
          desc: "We create distinctive, memorable logos that capture the essence of your brand. Our design process involves deep research into your industry and audience to deliver a visual identity that stands out and stands the test of time.",
          icon: Palette
        },
        { 
          title: "Brochures & Flyers", 
          desc: "Professional print and digital marketing materials that communicate your message effectively. We design high-quality brochures and flyers that engage customers and drive conversions for your products or services.",
          icon: Printer
        },
        { 
          title: "Business Cards Design", 
          desc: "Make a lasting first impression with professionally designed business cards. We focus on clean, modern aesthetics that reflect your professionalism and brand values.",
          icon: PenTool
        },
        { 
          title: "Social Media Marketing", 
          desc: "Strategic management of your social media presence to build community and brand awareness. We create engaging content, manage campaigns, and analyze performance across all major platforms.",
          icon: Share2
        },
        { 
          title: "Digital Marketing", 
          desc: "Comprehensive online marketing strategies including PPC, email marketing, and content strategy. We focus on data-driven approaches to reach your target audience and maximize your ROI.",
          icon: Megaphone
        },
        { 
          title: "Search Engine Optimization (SEO)", 
          desc: "Improve your website's visibility on search engines. We implement technical SEO, keyword optimization, and content strategies to drive organic traffic and improve your search rankings.",
          icon: Search
        }
      ]
    },
    'digital-services': {
      title: "Software and Web Development",
      icon: Rocket,
      color: "var(--secondary)",
      image: "/images/digital-services.png",
      tagline: "Bespoke Digital Transformation",
      description: "We transform your business vision into high-performance digital products. Our digital services team builds the scalable websites, mobile applications, and enterprise software that drive efficiency, customer engagement, and growth in the modern marketplace. Every solution we build is custom-crafted to your exact specifications and designed to grow alongside your business.",
      features: [
        { 
          title: "Website Development", 
          desc: "We design and develop high-performance, fully responsive websites that represent your brand with professionalism and authority. From clean corporate landing pages and dynamic portfolio sites to complex multi-vendor e-commerce platforms and booking systems, we build every site with a focus on speed, security, and user experience. We use modern frameworks and follow the latest SEO best practices to ensure your website not only looks stunning but also ranks well on search engines and converts visitors into loyal customers. Every project includes rigorous cross-browser and cross-device testing before launch.",
          icon: Monitor
        },
        { 
          title: "Mobile App Development", 
          desc: "Custom mobile application development for both iOS and Android platforms. We create intuitive, feature-rich apps that provide seamless and engaging user experiences. Our mobile development process covers everything from initial UX wireframing and UI design to back-end API integration, testing, and app store submission. Whether you need a customer-facing app to expand your reach, an internal operations tool to streamline workflows, or a complex platform with real-time data synchronization, our mobile team has the expertise to deliver a polished, high-quality product that your users will love to use every day.",
          icon: Smartphone
        },
        { 
          title: "Custom Software Development", 
          desc: "Bespoke software solutions engineered to solve your unique and complex business challenges. We analyze your existing workflows, identify inefficiencies, and design custom applications that automate manual processes, reduce human error, and dramatically improve operational efficiency. Our development team is experienced in building scalable, secure, and cross-platform desktop, web, and cloud-based applications using modern technology stacks. We follow agile development methodologies, providing you with regular progress updates and demos throughout the build process. Full source code, documentation, and post-launch support are always included.",
          icon: Code
        },
        { 
          title: "ERP System Development", 
          desc: "Enterprise Resource Planning systems are the command center of a modern business. We design and develop custom ERP solutions that integrate and intelligently manage all your core business processes on a single, unified platform. This includes inventory and supply chain management, financial accounting and reporting, Human Resources and payroll, customer relationship management (CRM), project management, and procurement. Unlike off-the-shelf software, our custom ERP is built to match your exact workflows, eliminating the need to adapt your business to your software. We provide complete implementation, data migration from legacy systems, staff training, and ongoing technical support.",
          icon: LayoutDashboard
        }
      ]
    },
    'web-hosting': {
      title: "Web Hosting and Domains",
      icon: Globe,
      color: "var(--primary)",
      image: "/images/networking.png",
      tagline: "Secure & Scalable Infrastructure",
      description: "Your website and applications deserve a reliable, fast, and secure home. Our hosting solutions provide the enterprise-grade performance, uptime guarantees, and local technical support required to maintain a professional digital presence without compromise. We offer tailored hosting plans for businesses of all sizes, from a simple company website to a high-traffic e-commerce platform.",
      features: [
        { 
          title: "High-Performance Web Hosting", 
          desc: "Our hosting infrastructure is powered by SSD storage and cloud-optimized server configurations that deliver lightning-fast page load times — a critical factor for both user experience and search engine ranking. We provide a 99.9% uptime Service Level Agreement (SLA), ensuring your business is always available to your customers, even during peak traffic periods. Our servers are housed in certified data centers with redundant power supplies, cooling systems, and network connections. We offer flexible hosting plans including shared hosting, virtual private servers (VPS), and dedicated server environments to match your performance requirements and budget.",
          icon: Server
        },
        { 
          title: "Managed Security & SSL Certificates", 
          desc: "Every hosting plan comes with free SSL/TLS certificate installation and automated renewal, ensuring your website displays the trusted padlock icon and encrypts all data transferred between your site and your visitors. We conduct daily automated backups and store copies in multiple geographic locations, so your data is always recoverable in the event of any incident. Our team handles all server-side security hardening, software updates, and vulnerability patching on your behalf. We also implement Web Application Firewalls (WAF), DDoS mitigation, and malware scanning to protect your site from the latest online threats without any effort required from you.",
          icon: Lock
        },
        { 
          title: "Domain & Email Hosting", 
          desc: "We provide complete domain registration and management services, helping you secure the perfect web address for your brand. Alongside your hosting, we offer professional business email hosting that gives you and your team personalized email addresses using your own domain name — a critical element of business credibility. Our email hosting includes generous storage, spam and malware filtering, webmail access from any browser, and full compatibility with all major email clients including Outlook, Gmail, and Apple Mail. We handle all DNS configuration, MX records, and SPF/DKIM setup to ensure reliable email delivery.",
          icon: Globe
        },
        { 
          title: "Local Technical Support & Migration", 
          desc: "Unlike global hosting providers who offer generic ticket-based support, we provide direct, personalized technical assistance for all your hosting needs. Our local team is available to assist with website migrations from other hosts, DNS configuration changes, email setup and troubleshooting, and database management. If you are moving an existing website to our platform, we manage the entire migration process with zero downtime, ensuring your site, databases, and emails are transferred seamlessly. We also provide ongoing performance monitoring and regular reports on your site's speed and availability, keeping you fully informed at all times.",
          icon: Database
        }
      ]
    }
  };

  const s = allServices[id] || allServices['it-support'];
  
  if (!serviceId) {
    return (
      <div className="services-overview-page">
        <div className="container">
          <header className="page-header center animate-fade-in">
            <span className="badge">Our Expertise</span>
            <h1 className="section-title">Select a Service</h1>
            <p className="subtitle">Discover our comprehensive range of specialized technology solutions.</p>
          </header>
          
          <div className="overview-selection-grid mt-4">
            {Object.keys(allServices).map((key) => {
              const item = allServices[key];
              const SvgIcon = item.icon;
              return (
                <Link to={`/services/${key}`} key={key} className="selection-card glass-card animate-fade-in">
                  <div className="selection-icon" style={{ backgroundColor: item.color }}>
                    <SvgIcon size={32} color="white" />
                  </div>
                  <h3>{item.title}</h3>
                  <p>{item.tagline}</p>
                  <span className="selection-link">
                    Explore Details <ArrowRight size={18} />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  const Icon = s.icon;

  return (
    <div className="service-single-page">
      {/* Service Hero */}
      <section className="service-hero" style={{ '--service-color': s.color }}>
        <div className="container">
          <div className="service-hero-content animate-fade-in">

            <span className="badge">Service Details</span>
            <h1>{s.title}</h1>
            <p className="lead">{s.tagline}</p>
          </div>
        </div>
      </section>

      {/* Service Content */}
      <section className="service-details-section section-padding">
        <div className="container">
          <div className="service-overview-layout animate-fade-in">
            <div className="service-overview-text">
              <h2>Overview</h2>
              <p>{s.description}</p>
            </div>
            {s.image && (
              <div className="service-overview-image">
                <img src={s.image} alt={s.title} />
              </div>
            )}
          </div>

          <div className="detailed-features-list mt-4">
            <h2>Our Specialized Solutions</h2>
            <div className="detailed-feature-grid">
              {s.features.map((f, i) => (
                <div key={i} className="detailed-feature-card glass-card animate-fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
                  <div className="feature-header">

                    <h3>{f.title}</h3>
                  </div>
                  <div className="feature-body">
                    <p>{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="service-cta-section glass-card mt-5 animate-fade-in">
            <div className="cta-content">
              <h2>Let's discuss your {s.title} requirements</h2>
              <p>Our experts are ready to build a customized solution for your business.</p>
              <div className="cta-btns">
                <Link to="/contact" className="btn btn-primary">Request <ArrowRight size={18} /></Link>

              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Services;
