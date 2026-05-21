'use client';

import { useState, useEffect } from 'react';
import CultivaLanding from "./landingpage";
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

const LoginModal = ({ onLogin, onClose }: { onLogin: () => void, onClose: () => void }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'admin' && password === 'cultiva2026') {
      setError(false);
      onLogin();
    } else {
      setError(true);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}>
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
        style={{ background: 'rgba(10, 15, 10, 0.9)', border: '1px solid var(--border-glass)', padding: '3rem', borderRadius: '24px', width: '90%', maxWidth: '400px', position: 'relative', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
          <img src="/images/cultivalogo.png" alt="Logo" style={{ height: '28px' }} />
          <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '1.5rem', fontWeight: 800 }}>Cultiva</span>
        </div>

        <h2 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-main)', fontFamily: 'Space Grotesk, sans-serif' }}>Welcome Back</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2.5rem', fontSize: '0.9rem' }}>Sign in to access Cultiva AI platform.</p>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Username</label>
            <input type="text" value={username} onChange={e => setUsername(e.target.value)} style={{ width: '100%', padding: '0.8rem 1rem', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-glass)', borderRadius: '8px', color: 'white', outline: 'none' }} placeholder="admin" required />
          </div>
          <div>
            <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} style={{ width: '100%', padding: '0.8rem 1rem', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-glass)', borderRadius: '8px', color: 'white', outline: 'none' }} placeholder="cultiva2026" required />
          </div>
          {error && <div style={{ color: '#ff4444', fontSize: '0.85rem', marginTop: '-0.5rem' }}>Invalid username or password.</div>}
          <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '1rem', padding: '1rem' }}>Sign In</button>
        </form>
      </motion.div>
    </div>
  );
};

export default function App() {
  const router = useRouter();
  const [showLogin, setShowLogin] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  useEffect(() => {
    setMounted(true);
    localStorage.removeItem('cultiva_session');
    setIsCheckingSession(false);
  }, []);

  if (!mounted || isCheckingSession) {
    return <main style={{ background: '#000', minHeight: '100vh' }} />;
  }

  const handleLoginSuccess = () => {
    localStorage.setItem('cultiva_session', 'true');
    setShowLogin(false);
    setTimeout(() => {
      router.push('/home');
    }, 300);
  };

  return (
    <main style={{ background: '#000', minHeight: '100vh' }}>
      <AnimatePresence>
        {showLogin && (
          <LoginModal 
            onLogin={handleLoginSuccess} 
            onClose={() => setShowLogin(false)} 
          />
        )}
      </AnimatePresence>

      <CultivaLanding onGetStarted={() => setShowLogin(true)} />
    </main>
  );
}
