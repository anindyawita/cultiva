import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FlaskConical, Droplets, Zap, Thermometer, Wind, Sparkles } from 'lucide-react';

export default function PredictTab() {
  const [view, setView] = useState<'input' | 'result'>('input');
  
  // Slider states
  const [nitrogen, setNitrogen] = useState(85);
  const [phosphorus, setPhosphorus] = useState(42);
  const [potassium, setPotassium] = useState(48);
  const [ph, setPh] = useState(6.8);
  const [humidity, setHumidity] = useState(82);

  const FadeUp = ({ children, delay = 0, keyStr }: { children: React.ReactNode, delay?: number, keyStr?: string }) => (
    <motion.div 
      key={keyStr}
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5, delay }}
    >
      {children}
    </motion.div>
  );

  return (
    <div className="tab-content pb-32">
      <AnimatePresence mode="wait">
        {view === 'input' ? (
          <motion.div key="input-view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <FadeUp delay={0.1}>
              <div className="section-label" style={{ marginBottom: '0.5rem', background: 'transparent', padding: 0, border: 'none', fontSize: '0.7rem' }}>
                CROP RECOMMENDATION ANALYSIS
              </div>
              <h1 className="dash-greeting" style={{ fontSize: '2.8rem', lineHeight: 1.1, marginBottom: '2rem' }}>
                Find Your<br/>Perfect <span style={{ color: 'var(--neon-green)' }}>Crop</span>
              </h1>
            </FadeUp>

            <FadeUp delay={0.2}>
              <div className="glass-card" style={{ padding: '2rem', borderRadius: '32px', background: '#111' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                  <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Environmental<br/>Parameters</h2>
                  <div className="iot-badge"><span className="iot-dot"></span> USE IOT</div>
                </div>

                <div className="sliders-container">
                  <div className="slider-group">
                    <div className="slider-header">
                      <span className="slider-label"><FlaskConical size={14}/> Nitrogen (N)</span>
                      <span className="slider-value text-green">{nitrogen} mg/kg</span>
                    </div>
                    <input type="range" min="0" max="150" value={nitrogen} onChange={(e) => setNitrogen(Number(e.target.value))} className="custom-slider" />
                  </div>

                  <div className="slider-group">
                    <div className="slider-header">
                      <span className="slider-label"><Droplets size={14}/> Phosphorus (P)</span>
                      <span className="slider-value text-green">{phosphorus} mg/kg</span>
                    </div>
                    <input type="range" min="0" max="100" value={phosphorus} onChange={(e) => setPhosphorus(Number(e.target.value))} className="custom-slider" />
                  </div>

                  <div className="slider-group">
                    <div className="slider-header">
                      <span className="slider-label"><Zap size={14}/> Potassium (K)</span>
                      <span className="slider-value text-green">{potassium} mg/kg</span>
                    </div>
                    <input type="range" min="0" max="100" value={potassium} onChange={(e) => setPotassium(Number(e.target.value))} className="custom-slider" />
                  </div>

                  <div className="slider-group">
                    <div className="slider-header">
                      <span className="slider-label"><Thermometer size={14}/> pH Level</span>
                      <span className="slider-value text-green">{ph}</span>
                    </div>
                    <input type="range" min="0" max="14" step="0.1" value={ph} onChange={(e) => setPh(Number(e.target.value))} className="custom-slider" />
                  </div>

                  <div className="slider-group">
                    <div className="slider-header">
                      <span className="slider-label"><Wind size={14}/> Relative Humidity</span>
                      <span className="slider-value text-green">{humidity} %</span>
                    </div>
                    <input type="range" min="0" max="100" value={humidity} onChange={(e) => setHumidity(Number(e.target.value))} className="custom-slider" />
                  </div>
                </div>

                <button className="result-btn" onClick={() => setView('result')}>
                  RESULT
                </button>
              </div>
            </FadeUp>
          </motion.div>
        ) : (
          <motion.div key="result-view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <FadeUp delay={0.1}>
              <h1 className="dash-greeting" style={{ fontSize: '2.8rem', lineHeight: 1.1, marginBottom: '1rem' }}>
                Optimal <span style={{ color: 'var(--neon-green)' }}>Yield</span><br/>Forecast
              </h1>
              <p style={{ color: '#888', fontSize: '0.9rem', marginBottom: '2rem', lineHeight: 1.5 }}>
                Based on real-time soil analysis and local meteorological patterns, our AI suggests these high-performance crops for your field.
              </p>
            </FadeUp>

            <FadeUp delay={0.2}>
              <div className="metrics-header-row">
                <div className="metric-col">
                  <div className="metric-label">NITROGEN</div>
                  <div className="metric-value">85<span className="metric-unit">mg/kg</span></div>
                </div>
                <div className="metric-divider"></div>
                <div className="metric-col">
                  <div className="metric-label">PHOSPORUS</div>
                  <div className="metric-value">40<span className="metric-unit">mg/kg</span></div>
                </div>
                <div className="metric-divider"></div>
                <div className="metric-col">
                  <div className="metric-label">POTASSIUM</div>
                  <div className="metric-value">48<span className="metric-unit">mg/kg</span></div>
                </div>
              </div>
            </FadeUp>

            <FadeUp delay={0.3}>
              <div className="regional-trends-card">
                <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.5rem' }}>Regional Trends</h2>
                <ul className="trends-list">
                  <li><span className="trend-dot green"></span> Rice demand up 12% in Malang</li>
                  <li><span className="trend-dot yellow"></span> Rice prices projected to stabilize</li>
                  <li><span className="trend-dot orange"></span> Unusual rain patterns expected in July</li>
                </ul>
              </div>
            </FadeUp>

            <FadeUp delay={0.4}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '2rem 0 1rem' }}>
                <Sparkles size={20} color="var(--neon-green)" />
                <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Top Recommendation<br/>Matches</h2>
              </div>
              
              <div className="rice-card">
                <div className="rice-image-container">
                  <div className="match-badge">98% Match</div>
                </div>
                
                <div className="rice-card-content">
                  <h2 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '4px' }}>Rice</h2>
                  <p style={{ color: '#888', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Oryza sativa</p>
                  
                  <div className="stat-bars">
                    <div className="stat-bar-group">
                      <div className="stat-bar-header">
                        <span className="stat-bar-label text-green">NITROGEN</span>
                        <span className="stat-bar-value">85/100</span>
                      </div>
                      <div className="stat-bar-bg"><div className="stat-bar-fill" style={{ width: '85%' }}></div></div>
                    </div>
                    <div className="stat-bar-group">
                      <div className="stat-bar-header">
                        <span className="stat-bar-label text-yellow">PHOSPHORUS</span>
                        <span className="stat-bar-value">40/100</span>
                      </div>
                      <div className="stat-bar-bg"><div className="stat-bar-fill yellow" style={{ width: '40%' }}></div></div>
                    </div>
                    <div className="stat-bar-group">
                      <div className="stat-bar-header">
                        <span className="stat-bar-label text-yellow">PH BALANCE</span>
                        <span className="stat-bar-value">6.8</span>
                      </div>
                      <div className="stat-bar-bg"><div className="stat-bar-fill yellow" style={{ width: '68%' }}></div></div>
                    </div>
                    <div className="stat-bar-group">
                      <div className="stat-bar-header">
                        <span className="stat-bar-label text-orange">HUMIDITY</span>
                        <span className="stat-bar-value">82%</span>
                      </div>
                      <div className="stat-bar-bg"><div className="stat-bar-fill orange" style={{ width: '82%' }}></div></div>
                    </div>
                  </div>
                </div>
              </div>
            </FadeUp>
            
            <button className="back-btn" onClick={() => setView('input')} style={{ marginTop: '1rem', background: 'transparent', color: '#888', border: '1px solid #333', padding: '0.75rem 2rem', borderRadius: '100px', width: '100%' }}>
              Back to Analysis
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
