import React, { useState, useEffect } from 'react';
import { Search, PenTool, CheckCircle, Hammer } from 'lucide-react';
import { getContent } from '../api/client';

const ProcedureStep = ({ icon: Icon, title, description, stepNumber }) => (
  <div 
    className="procedure-step animate-fade-in" 
    style={{ animationDelay: `${(parseInt(stepNumber) - 1) * 0.4}s` }}
  >
    <div className="step-number">{stepNumber}</div>
    <div className="hexagon-icon-large relative">
      <Icon size={40} style={{ position: 'relative', zIndex: 10, color: 'var(--primary)' }} />
    </div>
    <div className="step-content">
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  </div>
);

const Procedures = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    getContent('home', 'procedures').then(res => setData(res.data)).catch(() => {});
  }, []);

  const steps = [
    {
      title: data?.step1_title || "Find",
      description: data?.step1_text || "Find out what you are looking for. Gather information, take data and complete requirement analysis to ensure we align with your vision.",
      icon: Search
    },
    {
      title: data?.step2_title || "Design",
      description: data?.step2_text || "Design and plan the solution and present to you. Take comments and design again until the blueprint is perfect for your business.",
      icon: PenTool
    },
    {
      title: data?.step3_title || "Confirmation",
      description: data?.step3_text || "We take confirmation from you about the project specifications and roadmap before actual implementation starts.",
      icon: CheckCircle
    },
    {
      title: data?.step4_title || "Build",
      description: data?.step4_text || "Start the actual work and complete implementation. This includes thorough training and technical documentation for your team.",
      icon: Hammer
    }
  ];

  return (
    <div className="procedures-page">
      <div className="container">
        <header className="page-header center" style={{ paddingTop: '0rem' }}>
          <h1 className="section-title">Our Procedures</h1>
          <p className="subtitle">A structured approach to delivering excellence consistently.</p>
        </header>

        <div className="procedures-timeline">
          {steps.map((step, i) => (
            <ProcedureStep key={i} {...step} stepNumber={`0${i + 1}`} />
          ))}
        </div>

      </div>
    </div>
  );
};

export default Procedures;
