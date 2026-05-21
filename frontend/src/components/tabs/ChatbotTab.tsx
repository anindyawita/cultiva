import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Paperclip } from 'lucide-react';

export default function ChatbotTab() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'AI ASSISTANT',
      time: '09:41 AM',
      text: "Hello! I'm Cultiva AI. I've just analyzed your sensor data. Your soil moisture is slightly below optimal at 18%. Shall we adjust the irrigation schedule or discuss nutrient application?",
      isAi: true
    },
    {
      id: 2,
      sender: 'YOU',
      time: '09:43 AM',
      text: "How is the Moisture level looking for the corn crop?",
      isAi: false
    },
    {
      id: 3,
      sender: 'AI ASSISTANT',
      time: '09:44 AM',
      text: "Current moist level is 47%. While stable, we're seeing a slight downward trend compared to last Tuesday's data. Here is the visual breakdown:",
      isAi: true,
      hasChart: true
    }
  ]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages([
      ...messages,
      { id: Date.now(), sender: 'YOU', time: 'Just now', text: input, isAi: false }
    ]);
    setInput('');
  };

  const FadeUp = ({ children, delay = 0 }: { children: React.ReactNode, delay?: number }) => (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay }}>
      {children}
    </motion.div>
  );

  return (
    <div className="tab-content pb-32" style={{ display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 100px)' }}>
      
      <div className="chat-container">
        {messages.map((msg, index) => (
          <FadeUp key={msg.id} delay={index * 0.1}>
            <div className={`chat-bubble-wrapper ${msg.isAi ? 'ai' : 'user'}`}>
              <div className={`chat-bubble ${msg.isAi ? 'ai-bubble' : 'user-bubble'}`}>
                {msg.text}
              </div>
              <div className="chat-meta">
                {msg.time} • {msg.sender}
              </div>

              {msg.hasChart && (
                <div className="chat-chart-card">
                  <div style={{ fontSize: '0.75rem', color: '#888', letterSpacing: '1px', marginBottom: '4px' }}>NITROGEN STABILITY</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--neon-green)', marginBottom: '1.5rem' }}>Optimal Range</div>
                  
                  <div className="bar-chart-container">
                    <div className="bar-wrapper">
                      <div className="bar-fill" style={{ height: '35%' }}></div>
                      <span className="bar-label">MON</span>
                    </div>
                    <div className="bar-wrapper">
                      <div className="bar-fill" style={{ height: '45%' }}></div>
                      <span className="bar-label">TUE</span>
                    </div>
                    <div className="bar-wrapper">
                      <div className="bar-fill active" style={{ height: '70%' }}></div>
                      <span className="bar-label text-green">WED (TODAY)</span>
                    </div>
                    <div className="bar-wrapper">
                      <div className="bar-fill" style={{ height: '60%' }}></div>
                      <span className="bar-label">THU</span>
                    </div>
                    <div className="bar-wrapper">
                      <div className="bar-fill" style={{ height: '40%' }}></div>
                      <span className="bar-label">FRI</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </FadeUp>
        ))}
      </div>

      <div className="chat-input-area">
        <div className="chat-input-wrapper">
          <button className="attach-btn">
            <Paperclip size={18} />
          </button>
          <input 
            type="text" 
            className="chat-input" 
            placeholder="Ask about your crops..." 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <button className="send-btn" onClick={handleSend}>
            <Send size={18} color="#000" style={{ marginLeft: '-2px' }} />
          </button>
        </div>
      </div>
    </div>
  );
}
