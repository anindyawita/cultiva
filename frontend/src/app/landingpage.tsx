'use client';

import React, { useEffect, useState } from 'react';
import { motion, useScroll, useTransform, useMotionValue, useSpring, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, Play, Sprout, Calendar, FlaskConical, Bot, 
  Radio, ScanSearch, CloudSun, CheckCircle2,
  Globe, MessageSquare, Mail, Send, Activity, Droplets, Thermometer
} from 'lucide-react';
import './landingpage.css';
import SoilDashboard from "@/components/tabs/SoilDashboard";

// Simple and foolproof fade up animation moved outside to prevent remounting
const FadeUp = ({ children, delay = 0 }: { children: React.ReactNode, delay?: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-50px" }}
    transition={{ duration: 0.6, ease: "easeOut", delay }}
  >
    {children}
  </motion.div>
);

export default function CultivaLanding({ onGetStarted }: { onGetStarted?: () => void }) {
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 1000], [0, 200]);
  const y2 = useTransform(scrollY, [0, 1000], [0, -100]);

  const [activeStage, setActiveStage] = useState(0);

  const stages = [
    { title: "Pre-Planting", feature: "AI Crop Recommendation", desc: "Predicts the most profitable crop based on your exact soil chemistry and climate.", icon: <Sprout size={24} /> },
    { title: "Irrigation", feature: "Smart Water Scheduling", desc: "Optimizes water usage using real-time soil moisture telemetry.", icon: <Droplets size={24} /> },
    { title: "Fertilizer", feature: "Precision NPK Mapping", desc: "Calculates exact nutrient requirements to maximize growth and minimize waste.", icon: <FlaskConical size={24} /> },
    { title: "Monitoring", feature: "IoT Health Tracking", desc: "Continuous surveillance of plant vitality and environmental stress factors.", icon: <Activity size={24} /> },
    { title: "Harvesting", feature: "Yield Prediction", desc: "Forecasts exact harvest dates and expected tonnage.", icon: <Calendar size={24} /> }
  ];

  // 3D Parallax Mouse Setup
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const rotateX = useTransform(mouseY, [-300, 300], [15, -15]);
  const rotateY = useTransform(mouseX, [-300, 300], [-15, 15]);

  const smoothRotateX = useSpring(rotateX, { stiffness: 70, damping: 20 });
  const smoothRotateY = useSpring(rotateY, { stiffness: 70, damping: 20 });

  // 3D Parallax Mouse Setup for CTA
  const ctaMouseX = useMotionValue(0);
  const ctaMouseY = useMotionValue(0);

  const handleCtaMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    ctaMouseX.set(x);
    ctaMouseY.set(y);
  };

  const handleCtaMouseLeave = () => {
    ctaMouseX.set(0);
    ctaMouseY.set(0);
  };

  const ctaRotateX = useTransform(ctaMouseY, [-300, 300], [10, -10]);
  const ctaRotateY = useTransform(ctaMouseX, [-300, 300], [-10, 10]);

  const smoothCtaRotateX = useSpring(ctaRotateX, { stiffness: 60, damping: 20 });
  const smoothCtaRotateY = useSpring(ctaRotateY, { stiffness: 60, damping: 20 });

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div style={{ position: 'relative', zIndex: 0 }}>
      <div className="grid-bg" />
      <motion.div style={{ y: y1 }} className="ambient-orb orb-1" />
      <motion.div style={{ y: y2 }} className="ambient-orb orb-2" />

      {/* Navbar */}
      <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="logo">
          <img src="/images/cultivalogo.png" alt="Cultiva Logo" style={{ height: '32px' }} /> Cultiva
        </div>
        <div className="nav-links">
          <a href="#features">Features</a>
          <a href="#workflow">Workflow</a>
          <a href="#technology">Technology</a>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn-primary" onClick={onGetStarted}>Sign In</button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero" id="home">
        <div className="hero-video-wrapper">
          <video autoPlay loop muted playsInline className="hero-video-bg">
            <source src="/herosection.mp4" type="video/mp4" />
          </video>
          <div className="hero-overlay" />
        </div>
        
        <div className="hero-inner">
          <div className="hero-content">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
            >
              <span className="section-label">All-In-One Platform</span>
              <h1 className="hero-title">
                Master the Entire <span className="logo-accent">Agricultural Cycle</span>
              </h1>
              <p className="hero-subtitle">
                Experience the future of precision agriculture with Cultiva.<br/>We optimize your entire farming cycle to maximize crop yield.
              </p>
              <div className="hero-actions">
                <button className="btn-primary" onClick={onGetStarted}>
                  Get Started <ArrowRight size={18} />
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 3D Interactive Cycle Section */}
      <section className="section-container" id="interactive-cycle" style={{ paddingBottom: '2rem' }}>
        <FadeUp delay={0.2}>
          <div className="section-header" style={{ marginBottom: '2rem' }}>
            <span className="section-label">Interactive Cycle</span>
            <h2 className="section-title">The 5 Stages of Cultivation</h2>
            <p className="section-subtitle">Explore our AI capabilities across the entire farming lifecycle.</p>
          </div>
          
          <div className="interactive-cycle-container">
            {/* 3D Interaction Wrapper */}
            <div onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} style={{ perspective: 1200, width: '450px', height: '450px' }}>
              {/* 3D Parallax Wrapper */}
              <motion.div
                style={{
                  rotateX: smoothRotateX, 
                  rotateY: smoothRotateY, 
                  transformStyle: "preserve-3d",
                  width: '100%', height: '100%'
                }}
              >
                {/* Smooth Opening Wrapper */}
                <motion.div 
                  initial={{ y: 50, scale: 0.8, opacity: 0 }}
                  whileInView={{ y: 0, scale: 1, opacity: 1 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 1.2, type: "spring", bounce: 0.3 }}
                style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
              {/* The Outer Glowing Ring */}
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                style={{ position: 'absolute', inset: 0, border: '1px solid var(--border-glass)', borderRadius: '50%' }}
              />
              <motion.div 
                animate={{ rotate: -360 }}
                transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
                style={{ position: 'absolute', inset: '30px', border: '1px solid rgba(57,255,20,0.05)', borderRadius: '50%' }}
              />
              
              {/* The 5 Stage Nodes */}
              {stages.map((stage, i) => {
                const angle = (i * (360 / 5)) * (Math.PI / 180) - Math.PI / 2;
                const radius = 225; // Half of 450px width
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;

                return (
                  <div 
                    key={i}
                    onMouseEnter={() => setActiveStage(i)}
                    style={{
                      position: 'absolute',
                      transform: `translate(${x}px, ${y}px)`,
                      cursor: 'pointer',
                      zIndex: 20
                    }}
                  >
                    <motion.div 
                      animate={{
                        scale: activeStage === i ? 1.3 : 1,
                        boxShadow: activeStage === i ? '0 0 25px var(--neon-green)' : '0 0 0px transparent'
                      }}
                      style={{
                        width: '56px', height: '56px',
                        background: activeStage === i ? 'var(--neon-green)' : 'var(--dark-surface-glass)',
                        color: activeStage === i ? '#000' : 'var(--text-muted)',
                        border: `1px solid ${activeStage === i ? 'var(--neon-green)' : 'var(--border-glass)'}`,
                        borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'all 0.3s'
                      }}
                    >
                      {stage.icon}
                    </motion.div>
                    {/* Tooltip Label */}
                    <div style={{ 
                      position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)', 
                      marginTop: '12px', fontSize: '0.85rem', fontWeight: 600, 
                      color: activeStage === i ? 'var(--neon-green)' : 'var(--text-muted)',
                      whiteSpace: 'nowrap', transition: 'all 0.3s',
                      background: 'var(--dark-surface-glass)', padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--border-glass)',
                      opacity: activeStage === i ? 1 : 0.7
                    }}>
                      {stage.title}
                    </div>
                  </div>
                );
              })}

              {/* The Central Glassmorphism App Interface */}
              <div style={{
                position: 'absolute',
                width: '300px', height: '300px',
                background: 'rgba(10, 15, 10, 0.7)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                border: '1px solid var(--border-glass)',
                borderRadius: '50%',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                padding: '2.5rem', textAlign: 'center',
                boxShadow: 'inset 0 0 50px rgba(57,255,20,0.08), 0 20px 50px rgba(0,0,0,0.6)'
              }}>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeStage}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8, position: 'absolute' }}
                    transition={{ duration: 0.3 }}
                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}
                  >
                    <div style={{ color: 'var(--neon-green)', marginBottom: '1rem', transform: 'scale(1.8)' }}>
                      {stages[activeStage].icon}
                    </div>
                    <div style={{ color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '4px', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                      Aspect
                    </div>
                    <div style={{ fontSize: '4.5rem', fontWeight: 800, fontFamily: 'Space Grotesk, sans-serif', color: 'var(--text-main)', lineHeight: 1 }}>
                      0{activeStage + 1}
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
              </motion.div>
            </motion.div>
          </div>

            {/* Dynamic Stage Insights Panel */}
            <div className="stage-insights-panel">
              <AnimatePresence mode="popLayout">
                <motion.div
                  key={activeStage}
                  initial={{ opacity: 0, filter: 'blur(8px)', scale: 0.98 }}
                  animate={{ opacity: 1, filter: 'blur(0px)', scale: 1 }}
                  exit={{ opacity: 0, filter: 'blur(8px)', scale: 0.98 }}
                  transition={{ duration: 0.3 }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1.5rem' }}>
                    <div style={{ color: 'var(--neon-green)', background: 'var(--dark-surface-glass)', padding: '1rem', borderRadius: '16px', border: '1px solid var(--border-glass)' }}>
                      {stages[activeStage].icon}
                    </div>
                    <div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 600, marginBottom: '0.25rem' }}>
                        {stages[activeStage].title} Aspect
                      </div>
                      <h3 style={{ fontSize: '1.8rem', fontWeight: 800, fontFamily: 'Space Grotesk, sans-serif', color: 'var(--text-main)', margin: 0 }}>
                        {stages[activeStage].feature}
                      </h3>
                    </div>
                  </div>
                  
                  <p style={{ color: '#d1d1d1', fontSize: '1.1rem', lineHeight: 1.7, marginBottom: '1rem' }}>
                    {stages[activeStage].desc}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </FadeUp>
      </section>

      {/* Features Bento Grid */}
      <section className="section-container" id="features">
        <div className="section-header">
          <span className="section-label">Platform Features</span>
          <h2 className="section-title">Intelligence at Every Layer</h2>
          <p className="section-subtitle">Seven powerful AI modules working in harmony to optimize every decision point in your farming operations.</p>
        </div>

        <div className="bento-grid">
          <FadeUp delay={0.1}>
            <div className="glass-card span-2" style={{ height: '100%' }}>
              <div className="bento-icon"><Sprout size={28} /></div>
              <h3 className="bento-title">AI Crop Recommendation</h3>
              <p className="bento-desc">Based on sophisticated Machine Learning, this module analyzes over 40 environmental variables like soil chemistry, climate patterns, and market prices to recommend the most profitable crop for your specific land conditions.</p>
            </div>
          </FadeUp>

          <FadeUp delay={0.2}>
            <div className="glass-card" style={{ height: '100%' }}>
              <div className="bento-icon"><Calendar size={28} /></div>
              <h3 className="bento-title">Harvest Prediction</h3>
              <p className="bento-desc">Predictive analytics utilizing 10 years of regional data to forecast exact harvest dates.</p>
            </div>
          </FadeUp>

          <FadeUp delay={0.3}>
            <div className="glass-card" style={{ height: '100%' }}>
              <div className="bento-icon"><FlaskConical size={28} /></div>
              <h3 className="bento-title">Smart Fertilizer</h3>
              <p className="bento-desc">Precision nutrient mapping based on real-time soil condition data for optimal NPK application.</p>
            </div>
          </FadeUp>

          <FadeUp delay={0.4}>
            <div className="glass-card" style={{ height: '100%' }}>
              <div className="bento-icon"><Bot size={28} /></div>
              <h3 className="bento-title">AI Consultation Assistant</h3>
              <p className="bento-desc">Your 24/7 digital agronomist powered by a specialized LLM trained on advanced agricultural science.</p>
            </div>
          </FadeUp>

          <FadeUp delay={0.5}>
            <div className="glass-card" style={{ height: '100%' }}>
              <div className="bento-icon"><Radio size={28} /></div>
              <h3 className="bento-title">IoT Monitoring</h3>
              <p className="bento-desc">Distributed sensor network tracking humidity, temperature, and soil conditions in real-time.</p>
            </div>
          </FadeUp>

          <FadeUp delay={0.6}>
            <div className="glass-card span-2" style={{ height: '100%' }}>
              <div className="bento-icon"><ScanSearch size={28} /></div>
              <h3 className="bento-title">Disease Detection & Prevention</h3>
              <p className="bento-desc">Computer Vision powered leaf analysis detects over 150 crop diseases from a single smartphone photo, providing smart prevention insights before widespread damage occurs.</p>
            </div>
          </FadeUp>

          <FadeUp delay={0.7}>
            <div className="glass-card" style={{ height: '100%' }}>
              <div className="bento-icon"><CloudSun size={28} /></div>
              <h3 className="bento-title">Real-time Weather & Soil Analytics</h3>
              <p className="bento-desc">Hyperlocal 7-day weather forecasting fused with underground telemetry for complete environmental awareness.</p>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* How It Works */}
      <section className="section-container" id="workflow">
        <div className="section-header">
          <span className="section-label">Workflow</span>
          <h2 className="section-title">From Data to Harvest</h2>
          <p className="section-subtitle">A seamless, automated pipeline transforming raw field data into actionable intelligence.</p>
        </div>

        <div className="workflow-container">
          <div className="workflow-line" />
          
          {[
            { num: '01', title: 'Input Data', desc: 'IoT Sensors & Satellites' },
            { num: '02', title: 'AI Analysis', desc: 'Machine Learning Models' },
            { num: '03', title: 'Recommendation Engine', desc: 'Personalized Action Plans' },
            { num: '04', title: 'Smart Monitoring', desc: 'Real-time Alerts' },
            { num: '05', title: 'Harvest Optimization', desc: 'Maximum Yield' }
          ].map((step, index) => (
            <FadeUp key={index} delay={index * 0.15}>
              <div className="workflow-step" style={{ width: '100%' }}>
                <div className="step-circle">{step.num}</div>
                <h4 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>{step.title}</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{step.desc}</p>
              </div>
            </FadeUp>
          ))}
        </div>
      </section>

      {/* Tech Badges Showcase */}
      <section className="section-container" id="technology" style={{ padding: '2rem', marginTop: '4rem', marginBottom: '4rem' }}>
        <h4 style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '2rem', fontWeight: 600, letterSpacing: '2px' }}>POWERED BY CUTTING-EDGE TECHNOLOGY</h4>
        <div className="tech-track">
          <div className="tech-track-inner">
            {[
              'Artificial Intelligence', 'Machine Learning', 'IoT Integration', 
              'Computer Vision', 'Predictive Analytics', 'Smart Farming System', 'Real-Time Data Processing',
              'Artificial Intelligence', 'Machine Learning', 'IoT Integration',
              'Computer Vision', 'Predictive Analytics', 'Smart Farming System', 'Real-Time Data Processing'
            ].map((tech, i) => (
              <div key={i} className="tech-badge">
                <CheckCircle2 size={16} color="var(--neon-green)" /> {tech}
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* 3D CTA Closing Section */}
      <section className="section-container" style={{ padding: '4rem 2rem 8rem', perspective: 1200 }}>
        <motion.div 
          onMouseMove={handleCtaMouseMove}
          onMouseLeave={handleCtaMouseLeave}
          style={{ 
            rotateX: smoothCtaRotateX, 
            rotateY: smoothCtaRotateY,
            transformStyle: "preserve-3d" 
          }}
          className="cta-3d-card"
        >
          <div className="cta-glow" />
          <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', fontWeight: 800, fontFamily: 'Space Grotesk, sans-serif', marginBottom: '1.5rem', position: 'relative', zIndex: 2 }}>
            Ready to Cultivate the <span className="logo-accent">Future?</span>
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.15rem', maxWidth: '600px', margin: '0 auto 3rem', lineHeight: 1.7, position: 'relative', zIndex: 2 }}>
            Join the next generation of precision agriculture. Maximize yield, minimize waste, and operate with intelligence.
          </p>
          <button className="btn-primary" onClick={onGetStarted} style={{ fontSize: '1.1rem', padding: '1rem 2.5rem', position: 'relative', zIndex: 2 }}>
            Get Started Now <ArrowRight size={20} />
          </button>
        </motion.div>
      </section>

      {/* Soil Monitoring Dashboard */}
      <section className="section-container">
        <div className="section-header">
          <span className="section-label">IoT Monitoring</span>
          <h2 className="section-title">Real-Time Soil Monitoring</h2>
          <p className="section-subtitle">
            Monitor soil moisture and temperature directly from field sensors.
          </p>
        </div>

        <SoilDashboard />
      </section>

      {/* Footer */}
      <footer>
        <div className="footer-content">
          <div>
            <div className="logo" style={{ marginBottom: '1.5rem' }}>
              <img src="/images/cultivalogo.png" alt="Cultiva Logo" style={{ height: '32px' }} /> Cultiva
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '1rem', maxWidth: '350px', lineHeight: 1.6 }}>
              Building the future of sustainable, intelligent, and highly-optimized global agriculture.
            </p>
          </div>
          
          <div>
            <h4 style={{ marginBottom: '1.5rem', fontSize: '1.2rem', fontWeight: 700 }}>Platform</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <a href="#features" style={{ color: 'var(--text-muted)', textDecoration: 'none', transition: 'color 0.2s' }}>Features</a>
              <a href="#technology" style={{ color: 'var(--text-muted)', textDecoration: 'none', transition: 'color 0.2s' }}>Technology</a>
            </div>
          </div>
        </div>
        
        <div style={{ maxWidth: '1320px', margin: '4rem auto 0', paddingTop: '2rem', borderTop: '1px solid var(--border-glass)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>© 2026 Cultiva AI. All rights reserved.</p>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <a href="#" style={{ color: 'var(--text-main)', opacity: 0.7, transition: 'opacity 0.2s' }}><Globe size={20} /></a>
            <a href="#" style={{ color: 'var(--text-main)', opacity: 0.7, transition: 'opacity 0.2s' }}><MessageSquare size={20} /></a>
            <a href="#" style={{ color: 'var(--text-main)', opacity: 0.7, transition: 'opacity 0.2s' }}><Mail size={20} /></a>
          </div>
        </div>
      </footer>
    </div>
  );
}