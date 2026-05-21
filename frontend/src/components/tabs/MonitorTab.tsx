import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, Droplets, LineChart } from 'lucide-react';

export default function MonitorTab() {
  const FadeUp = ({ children, delay = 0 }: { children: React.ReactNode, delay?: number }) => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay }}>
      {children}
    </motion.div>
  );

  return (
    <div className="tab-content pb-32">
      <FadeUp delay={0.1}>
        <div className="glass-card" style={{ padding: '2rem', marginBottom: '2rem', borderRadius: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div className="iot-badge" style={{ background: 'rgba(57, 255, 20, 0.15)', color: 'var(--neon-green)', padding: '6px 12px' }}>
              <span className="iot-dot"></span> OPTIMAL STATUS
            </div>
            <span style={{ fontSize: '0.75rem', color: '#888' }}>Last synced 2m ago</span>
          </div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, lineHeight: 1.1 }}>
            Farm Health
          </h1>
          <div style={{ fontSize: '4.5rem', fontWeight: 800, color: 'var(--neon-green)', lineHeight: 1 }}>
            94 <span style={{ fontSize: '2rem', color: 'var(--neon-green)' }}>%</span>
          </div>
        </div>
      </FadeUp>

      <FadeUp delay={0.2}>
        <div className="section-header-dash">
          <h2 className="section-title-dash" style={{ fontSize: '1.2rem', fontWeight: 700 }}>Active Crops</h2>
          <a href="#" className="section-link">VIEW ALL <ChevronRight size={14} /></a>
        </div>

        <div className="glass-card p-0" style={{ padding: '1rem', borderRadius: '32px', marginBottom: '2rem' }}>
          <div className="lettuce-bg-monitor"></div>
          
          <div style={{ padding: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
              <div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '4px' }}>Lettuce</h3>
                <div style={{ color: 'var(--neon-green)', fontWeight: 600, fontSize: '0.9rem' }}>92% Health</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.7rem', color: '#888', textTransform: 'uppercase', letterSpacing: '1px' }}>HARVEST<br/>PREDICTION</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>12<span style={{ fontSize: '0.9rem', color: '#888', fontWeight: 500 }}>DAYS</span></div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
              <div className="metric-badge">
                <div className="metric-badge-label">PH LEVEL</div>
                <div className="metric-badge-value"><span className="trend-dot green"></span> 6.2</div>
              </div>
              <div className="metric-badge">
                <div className="metric-badge-label">MOISTURE</div>
                <div className="metric-badge-value"><span className="trend-dot green"></span> 88%</div>
              </div>
              <div className="metric-badge">
                <div className="metric-badge-label">NPK INDEX</div>
                <div className="metric-badge-value"><span className="trend-dot green"></span> Optimum</div>
              </div>
            </div>

            <div className="prediction-box">
              <LineChart size={20} color="var(--neon-green)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <p style={{ fontSize: '0.85rem', color: '#ccc', lineHeight: 1.5 }}>
                <span style={{ color: 'var(--neon-green)', fontWeight: 600 }}>Prediction:</span> Harvest is on track due to optimal moisture levels and consistent nutrient delivery cycles over the last 72 hours.
              </p>
            </div>

            <div className="section-label" style={{ marginTop: '2rem', marginBottom: '1rem', background: 'transparent', padding: 0, border: 'none', fontSize: '0.7rem', letterSpacing: '2px' }}>
              SYSTEM MILESTONES
            </div>

            <div className="milestone-timeline">
              <div className="milestone-item completed">
                <div className="milestone-dot"><div className="inner-dot"></div></div>
                <div className="milestone-content">
                  <div className="milestone-title">Weekly Water Irrigation</div>
                  <div className="milestone-desc">Completed</div>
                </div>
              </div>
              <div className="milestone-item pending">
                <div className="milestone-dot"><div className="inner-dot"></div></div>
                <div className="milestone-content">
                  <div className="milestone-title">Nutrient Cycle Flush</div>
                  <div className="milestone-desc">Scheduled • In 2h</div>
                </div>
              </div>
              <div className="milestone-item future">
                <div className="milestone-dot"><div className="inner-dot"></div></div>
                <div className="milestone-content">
                  <div className="milestone-title">Predicted Harvest</div>
                  <div className="milestone-desc">Projected • In 12 days</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </FadeUp>

      <FadeUp delay={0.3}>
        <div className="section-header-dash" style={{ marginBottom: '1rem' }}>
          <h2 className="section-title-dash" style={{ fontSize: '1.1rem', fontWeight: 700, lineHeight: 1.3 }}>FERTILIZER<br/>RECOMMENDATION</h2>
          <a href="#" className="section-link">VIEW ALL <ChevronRight size={14} /></a>
        </div>
        
        <div className="fertilizer-card">
          <div className="ai-rec-badge">AI RECOMMENDED</div>
          <h2 style={{ fontSize: '3rem', fontWeight: 800, lineHeight: 1.1, marginBottom: '0.5rem', color: 'var(--neon-green)' }}>NPK</h2>
          <h3 style={{ fontSize: '2.5rem', fontWeight: 700, lineHeight: 1, marginBottom: '1.5rem', color: 'var(--neon-green)' }}>15-15-15</h3>
          <p style={{ fontSize: '0.95rem', lineHeight: 1.6, color: '#e0e0e0', maxWidth: '280px' }}>
            Premium balanced nutrient blend optimized for peak vegetative growth in your specific soil profile.
          </p>
        </div>
      </FadeUp>
    </div>
  );
}
