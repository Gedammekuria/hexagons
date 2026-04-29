import React, { useState, useEffect, useRef } from 'react';
import { ArrowUp, MessageSquare, Bot, X, Send, Loader2, Trash2 } from 'lucide-react';
import WhatsAppButton from './WhatsAppButton';
import { chatWithAI } from '../api/client';

const FloatingActions = () => {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showAIChat, setShowAIChat] = useState(false);
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { type: 'ai', text: "Hello! I'm the Hexagon AI Agent. How can I help you today with our IT solutions?" }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const chatBodyRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [chatHistory, showAIChat]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || isTyping) return;

    const userMessage = { type: 'user', text: message };
    setChatHistory(prev => [...prev, userMessage]);
    const currentMessage = message;
    setMessage('');
    setIsTyping(true);

    try {
      const response = await chatWithAI(currentMessage, chatHistory);
      const aiResponse = { 
        type: 'ai', 
        text: response.text 
      };
      setChatHistory(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error('AI Error:', error);
      const errorResponse = { 
        type: 'ai', 
        text: "I'm having trouble connecting to my brain right now. Please try again or contact us directly at +251-944161572." 
      };
      setChatHistory(prev => [...prev, errorResponse]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* Left Side: Back to Top Button */}
      <div className="floating-left">
        <button 
          className={`floating-btn scroll-top-btn ${showScrollTop ? 'visible' : ''}`}
          onClick={scrollToTop}
          title="Back to Top"
        >
          <ArrowUp size={24} />
        </button>
      </div>

      {/* Right Side: AI Agent Button */}
      <div className="floating-right">
        <WhatsAppButton />
        <div className="ai-agent-container">
          {showAIChat && (
            <div className="ai-chat-bubble glass-card">
              <div className="ai-chat-header">
                <div className="header-info">
                  <Bot size={20} className="text-primary" />
                  <span>Hexagon AI Assistant</span>
                </div>
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <button 
                    className="close-btn" 
                    onClick={() => setChatHistory([{ type: 'ai', text: "Chat cleared. How else can I help you?" }])}
                    title="Clear Chat"
                    style={{ background: 'transparent', border: 'none', color: '#6b7280', cursor: 'pointer', padding: '0.2rem' }}
                  >
                    <Trash2 size={16} />
                  </button>
                  <button className="close-btn" onClick={() => setShowAIChat(false)}>
                    <X size={18} />
                  </button>
                </div>
              </div>
              <div className="ai-chat-body" ref={chatBodyRef}>
                {chatHistory.map((msg, index) => (
                  <div key={index} className={`message-wrapper ${msg.type}`}>
                    <div className="message-content">
                      <p>{msg.text}</p>
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="message-wrapper ai">
                    <div className="message-content typing">
                      <Loader2 size={16} className="animate-spin" />
                      <span>Hexagon AI is thinking...</span>
                    </div>
                  </div>
                )}
              </div>
              <form className="ai-chat-footer" onSubmit={handleSendMessage}>
                <input 
                  type="text" 
                  placeholder="Type your message..." 
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
                <button type="submit" className="btn-send" disabled={!message.trim()}>
                  <Send size={16} />
                </button>
              </form>
            </div>
          )}
          <button 
            className={`floating-btn ai-btn ${showAIChat ? 'active' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              setShowAIChat(!showAIChat);
            }}
            title="Talk to AI Assistant"
          >
            {showAIChat ? <X size={24} /> : <Bot size={24} />}
            {!showAIChat && <span className="pulse-dot"></span>}
          </button>
        </div>
      </div>
    </>
  );
};

export default FloatingActions;
