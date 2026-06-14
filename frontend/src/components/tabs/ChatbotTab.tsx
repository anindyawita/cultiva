import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Paperclip } from 'lucide-react';
import { cultivaApi } from '../../lib/api';

interface Message {
  id: number;
  sender: string;
  time: string;
  text: string;
  isAi: boolean;
  hasChart?: boolean;
}

const FadeUp = ({ children, delay = 0 }: { children: React.ReactNode, delay?: number }) => (
  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay }}>
    {children}
  </motion.div>
);

export default function ChatbotTab() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      sender: 'AI ASSISTANT',
      time: '09:41 AM',
      text: "Hello! I'm Cultiva AI. I've just analyzed your sensor data. Your soil moisture is slightly below optimal at 18%. Shall we adjust the irrigation schedule or discuss nutrient application?",
      isAi: true
    }
  ]);
  const [input, setInput] = useState('');
  const [sessionId, setSessionId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Initialize session
    cultivaApi.newChatSession()
      .then((res) => {
        setSessionId(res.session_id);
      })
      .catch((err) => {
        console.error("Failed to start session:", err);
        setSessionId("session-" + Math.random().toString(36).substring(2, 9));
      });
  }, []);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    const userText = input;
    setInput('');

    // Append user message
    const userMsg: Message = {
      id: Date.now(),
      sender: 'YOU',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: userText,
      isAi: false
    };
    
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const response = await cultivaApi.chat({
        message: userText,
        session_id: sessionId || "default-session",
      }) as any;

      const aiMsg: Message = {
        id: Date.now() + 1,
        sender: 'AI ASSISTANT',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: response.reply,
        isAi: true
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (err: any) {
      console.error(err);
      const errorMsg: Message = {
        id: Date.now() + 1,
        sender: 'SYSTEM',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: "Sorry, I'm having trouble connecting to the server. Please check that the backend is running.",
        isAi: true
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="tab-content pb-32" style={{ display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 100px)' }}>
      
      <div className="chat-container">
        {messages.map((msg, index) => (
          <FadeUp key={msg.id} delay={index * 0.05}>
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

        {isLoading && (
          <FadeUp delay={0.1}>
            <div className="chat-bubble-wrapper ai">
              <div className="chat-bubble ai-bubble" style={{ opacity: 0.6 }}>
                Thinking...
              </div>
              <div className="chat-meta">Just now • AI ASSISTANT</div>
            </div>
          </FadeUp>
        )}
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
            disabled={isLoading}
          />
          <button className="send-btn" onClick={handleSend} disabled={isLoading}>
            <Send size={18} color="#000" style={{ marginLeft: '-2px' }} />
          </button>
        </div>
      </div>
    </div>
  );
}

