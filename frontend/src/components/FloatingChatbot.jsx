import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

const FloatingChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hi Abhinav! Need help with a DSA problem or connecting your LeetCode handle?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // Points to your Gemini AI route in the backend
      const res = await axios.post('http://localhost:5000/api/ai/chat', { message: input });
      setMessages(prev => [...prev, { role: 'assistant', content: res.data.reply }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: "I'm having trouble connecting to the brain. Check your backend!" }]);
    }
    setLoading(false);
  };

  return (
    /* Z-INDEX IS SET TO 9999 TO ENSURE IT FLOATS ABOVE EVERYTHING */
    <div style={{ position: 'fixed', bottom: '30px', right: '30px', zIndex: 9999, fontFamily: 'Inter, sans-serif' }}>
      
      {/* Chat Window */}
      {isOpen && (
        <div style={{
          width: '350px',
          height: '500px',
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          border: '1px solid #e5e7eb',
          marginBottom: '20px'
        }}>
          {/* Header with Gemini Gradient */}
          <div style={{
            background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
            padding: '20px',
            color: 'white',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <div style={{ fontWeight: '800', fontSize: '1.1rem' }}>DevLeap AI</div>
              <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>Powered by Gemini 1.5</div>
            </div>
            <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
          </div>

          {/* Messages Area */}
          <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '15px', backgroundColor: '#f9fafb' }}>
            {messages.map((msg, i) => (
              <div key={i} style={{
                alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                backgroundColor: msg.role === 'user' ? '#2563eb' : '#fff',
                color: msg.role === 'user' ? '#fff' : '#1f2937',
                padding: '12px 16px',
                borderRadius: '15px',
                border: msg.role === 'user' ? 'none' : '1px solid #e5e7eb',
                maxWidth: '85%',
                fontSize: '0.9rem',
                lineHeight: '1.4',
                boxShadow: '0 2px 5px rgba(0,0,0,0.02)'
              }}>
                {msg.content}
              </div>
            ))}
            {loading && <div style={{ color: '#9ca3af', fontSize: '0.8rem' }}>AI is thinking...</div>}
            <div ref={chatEndRef} />
          </div>

          {/* Input Area */}
          <div style={{ padding: '15px', borderTop: '1px solid #e5e7eb', display: 'flex', gap: '10px' }}>
            <input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ask anything..."
              style={{ flex: 1, border: '1px solid #e5e7eb', borderRadius: '10px', padding: '10px', outline: 'none', fontSize: '0.9rem' }}
            />
            <button 
              onClick={handleSendMessage}
              style={{ background: '#2563eb', color: 'white', border: 'none', borderRadius: '10px', padding: '0 15px', cursor: 'pointer' }}
            >
              Send
            </button>
          </div>
        </div>
      )}

      {/* Floating Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '65px',
          height: '65px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
          border: 'none',
          cursor: 'pointer',
          boxShadow: '0 10px 25px rgba(37, 99, 235, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'transform 0.2s'
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
      >
        {isOpen ? (
           <span style={{ fontSize: '24px', color: 'white' }}>✕</span>
        ) : (
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
        )}
      </button>
    </div>
  );
};

export default FloatingChatbot;