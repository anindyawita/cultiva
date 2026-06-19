'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FlaskConical, Droplets, Zap, Thermometer, Wind, Sparkles, Layers } from 'lucide-react';

export default function PredictTab() {
  const [view, setView] = useState<'input' | 'result'>('input');
  const [loading, setLoading] = useState(false);
  
  // Slider states
  const [nitrogen, setNitrogen] = useState(85);
  const [phosphorus, setPhosphorus] = useState(42);
  const [potassium, setPotassium] = useState(48);
  const [ph, setPh] = useState(6.8);
  const [humidity, setHumidity] = useState(82);
  const [temperature, setTemperature] = useState(28.0);

  // New Soil Type State
  const [soilType, setSoilType] = useState('Loamy Soil');
  const soilOptions = ['Loamy Soil', 'Laterite/Red Soil', 'Sandy Soil', 'Clay Soil', 'Alluvial Soil', 'Black Soil'];
  // Result API State
  const [recommendationData, setRecommendationData] = useState<any>(null);

  // Panggil data sensor latest dari Backend
  const handleUseIoT = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:8000/api/sensor/soil/latest');
      const data = await res.json();
      
      if (data) {
        setNitrogen(data.nitrogen);
        setPhosphorus(data.phosphorus);
        setPotassium(data.potassium);
        setPh(data.ph);
        setHumidity(data.moisture); // Kelembapan tanah
        setTemperature(data.temperature);
      }
    } catch (err) {
      console.error("Gagal mengambil data IoT:", err);
    } finally {
      setLoading(false);
    }
  };

  // Hit Endpoint Crop Recommendation sewaktu Klik RESULT
  const handleGetRecommendation = async () => {
    try {
      setLoading(true);
      const todayStr = new Date().toISOString().split('T')[0]; // Format YYYY-MM-DD
      
      const payload = {
        n: Number(nitrogen),
        p: Number(phosphorus),
        k: Number(potassium),
        temperature: Number(temperature),
        humidity: Number(humidity),
        ph: Number(ph),
        soil_type: soilType,
        current_date: todayStr
      };

      console.log("Mengirim data ke Backend...", payload);

      const res = await fetch('http://localhost:8000/api/crop-recommendation/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const resultJson = await res.json();

      if (!res.ok) {
        const errorDetail = resultJson.detail 
          ? resultJson.detail.map((e: any) => `${e.loc.join('.')}: ${e.msg}`).join(', ')
          : "Validation Error";
        throw new Error(`HTTP ${res.status} - ${errorDetail}`);
      }
      console.log("Respon sukses dari Backend:", resultJson);
      
      if (resultJson.success) {
        setRecommendationData(resultJson.data);
        setView('result');
      } else {
        alert("Error dari AI model: " + resultJson.message);
      }
    } catch (err) {
      console.error("Gagal melakukan rekomendasi:", err);
      alert("Koneksi backend gagal.");
    } finally {
      setLoading(false);
    }
  };

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
                  <div className="iot-badge" onClick={handleUseIoT} style={{ cursor: 'pointer' }}><span className="iot-dot"></span> {loading ? "LOADING..." : "USE IOT"}</div>
                </div>

                <div className="sliders-container">
                  {/* Soil Type Selector Dropdown */}
                  <div className="slider-group" style={{ marginBottom: '1.5rem' }}>
                    <div className="slider-header" style={{ marginBottom: '0.5rem' }}>
                      <span className="slider-label"><Layers size={14}/> Soil Type</span>
                    </div>
                    <select 
                      value={soilType} 
                      onChange={(e) => setSoilType(e.target.value)}
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', background: '#222', color: '#fff', border: '1px solid #333', outline: 'none' }}
                    >
                      {soilOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </div>
                </div>

                <div className="sliders-container">
                  <div className="slider-group">
                    <div className="slider-header">
                      <span className="slider-label"><FlaskConical size={14}/> Nitrogen (N)</span>
                      <span className="slider-value text-green">{nitrogen} mg/kg</span>
                    </div>
                    <input type="range" min="0" max="200" value={nitrogen} onChange={(e) => setNitrogen(Number(e.target.value))} className="custom-slider" />
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
                    <input type="range" min="0" max="400" value={potassium} onChange={(e) => setPotassium(Number(e.target.value))} className="custom-slider" />
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

                <button className="result-btn" onClick={handleGetRecommendation} disabled={loading}>
                  {loading ? "PROCESSING..." : "RESULT"}
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
                  <div className="metric-value">{recommendationData?.input_used?.N}<span className="metric-unit">mg/kg</span></div>
                </div>
                <div className="metric-divider"></div>
                <div className="metric-col">
                  <div className="metric-label">PHOSPORUS</div>
                  <div className="metric-value">{recommendationData?.input_used?.P}<span className="metric-unit">mg/kg</span></div>
                </div>
                <div className="metric-divider"></div>
                <div className="metric-col">
                  <div className="metric-label">POTASSIUM</div>
                  <div className="metric-value">{recommendationData?.input_used?.K}<span className="metric-unit">mg/kg</span></div>
                </div>
              </div>
            </FadeUp>

            <FadeUp delay={0.3}>
              <div className="regional-trends-card">
                <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.5rem' }}>Regional Trends</h2>
                <ul className="trends-list">
                  <li><span className="trend-dot green"></span> {recommendationData?.crop} demand up 12% in Malang</li>
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
                  <div className="match-badge">{recommendationData?.match_percentage}% Match</div>
                </div>
                
                <div className="rice-card-content">
                  <h2 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '4px' }}>{recommendationData?.crop}</h2>
                  <p style={{ color: '#888', fontSize: '0.9rem', marginBottom: '1.5rem' }}>AI Recommended Plant</p>
                  
                  <div className="stat-bars">
                    <div className="stat-bar-group">
                      <div className="stat-bar-header">
                        <span className="stat-bar-label text-green">NITROGEN</span>
                        <span className="stat-bar-value">{recommendationData?.input_used.N}/150</span>
                      </div>
                      <div className="stat-bar-bg"><div className="stat-bar-fill" style={{ width: `${((recommendationData?.input_used?.N || 0) / 150) * 100}%` }}></div></div>
                    </div>
                    <div className="stat-bar-group">
                      <div className="stat-bar-header">
                        <span className="stat-bar-label text-yellow">PHOSPHORUS</span>
                        <span className="stat-bar-value">{recommendationData?.input_used?.P}/100</span>
                      </div>
                      <div className="stat-bar-bg"><div className="stat-bar-fill yellow" style={{ width: `${recommendationData?.input_used?.P || 0}%` }}></div></div>
                    </div>
                    <div className="stat-bar-group">
                      <div className="stat-bar-header">
                        <span className="stat-bar-label text-yellow">PH BALANCE</span>
                        <span className="stat-bar-value">{recommendationData?.input_used?.pH}</span>
                      </div>
                      <div className="stat-bar-bg"><div className="stat-bar-fill yellow" style={{ width: `${((recommendationData?.input_used?.pH || 0) / 14) * 100}%` }}></div></div>
                    </div>
                    <div className="stat-bar-group">
                      <div className="stat-bar-header">
                        <span className="stat-bar-label text-orange">HUMIDITY</span>
                        <span className="stat-bar-value">{recommendationData?.input_used?.humidity}%</span>
                      </div>
                      <div className="stat-bar-bg"><div className="stat-bar-fill orange" style={{ width: `${recommendationData?.input_used?.humidity || 0}%` }}></div></div>
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
    // <div className="tab-content pb-32">
    //   <AnimatePresence mode="wait">
    //     {view === 'input' ? (
    //       <motion.div key="input-view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
    //         <FadeUp delay={0.1}>
    //           <div className="section-label" style={{ marginBottom: '0.5rem', background: 'transparent', padding: 0, border: 'none', fontSize: '0.7rem' }}>
    //             CROP RECOMMENDATION ANALYSIS
    //           </div>
    //           <h1 className="dash-greeting" style={{ fontSize: '2.8rem', lineHeight: 1.1, marginBottom: '2rem' }}>
    //             Find Your<br/>Perfect <span style={{ color: 'var(--neon-green)' }}>Crop</span>
    //           </h1>
    //         </FadeUp>

    //         <FadeUp delay={0.2}>
    //           <div className="glass-card" style={{ padding: '2rem', borderRadius: '32px', background: '#111' }}>
    //             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
    //               <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Environmental<br/>Parameters</h2>
    //               <div className="iot-badge"><span className="iot-dot"></span> USE IOT</div>
    //             </div>

    //             <div className="sliders-container">
    //               <div className="slider-group">
    //                 <div className="slider-header">
    //                   <span className="slider-label"><FlaskConical size={14}/> Nitrogen (N)</span>
    //                   <span className="slider-value text-green">{nitrogen} mg/kg</span>
    //                 </div>
    //                 <input type="range" min="0" max="200" value={nitrogen} onChange={(e) => setNitrogen(Number(e.target.value))} className="custom-slider" />
    //               </div>

    //               <div className="slider-group">
    //                 <div className="slider-header">
    //                   <span className="slider-label"><Droplets size={14}/> Phosphorus (P)</span>
    //                   <span className="slider-value text-green">{phosphorus} mg/kg</span>
    //                 </div>
    //                 <input type="range" min="0" max="100" value={phosphorus} onChange={(e) => setPhosphorus(Number(e.target.value))} className="custom-slider" />
    //               </div>

    //               <div className="slider-group">
    //                 <div className="slider-header">
    //                   <span className="slider-label"><Zap size={14}/> Potassium (K)</span>
    //                   <span className="slider-value text-green">{potassium} mg/kg</span>
    //                 </div>
    //                 <input type="range" min="0" max="400" value={potassium} onChange={(e) => setPotassium(Number(e.target.value))} className="custom-slider" />
    //               </div>

    //               <div className="slider-group">
    //                 <div className="slider-header">
    //                   <span className="slider-label"><Thermometer size={14}/> pH Level</span>
    //                   <span className="slider-value text-green">{ph}</span>
    //                 </div>
    //                 <input type="range" min="0" max="14" step="0.1" value={ph} onChange={(e) => setPh(Number(e.target.value))} className="custom-slider" />
    //               </div>

    //               <div className="slider-group">
    //                 <div className="slider-header">
    //                   <span className="slider-label"><Wind size={14}/> Relative Humidity</span>
    //                   <span className="slider-value text-green">{humidity} %</span>
    //                 </div>
    //                 <input type="range" min="0" max="100" value={humidity} onChange={(e) => setHumidity(Number(e.target.value))} className="custom-slider" />
    //               </div>
    //             </div>

    //             <button className="result-btn" onClick={() => setView('result')}>
    //               RESULT
    //             </button>
    //           </div>
    //         </FadeUp>
    //       </motion.div>
    //     ) : (
    //       <motion.div key="result-view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
    //         <FadeUp delay={0.1}>
    //           <h1 className="dash-greeting" style={{ fontSize: '2.8rem', lineHeight: 1.1, marginBottom: '1rem' }}>
    //             Optimal <span style={{ color: 'var(--neon-green)' }}>Yield</span><br/>Forecast
    //           </h1>
    //           <p style={{ color: '#888', fontSize: '0.9rem', marginBottom: '2rem', lineHeight: 1.5 }}>
    //             Based on real-time soil analysis and local meteorological patterns, our AI suggests these high-performance crops for your field.
    //           </p>
    //         </FadeUp>

    //         <FadeUp delay={0.2}>
    //           <div className="metrics-header-row">
    //             <div className="metric-col">
    //               <div className="metric-label">NITROGEN</div>
    //               <div className="metric-value">85<span className="metric-unit">mg/kg</span></div>
    //             </div>
    //             <div className="metric-divider"></div>
    //             <div className="metric-col">
    //               <div className="metric-label">PHOSPORUS</div>
    //               <div className="metric-value">40<span className="metric-unit">mg/kg</span></div>
    //             </div>
    //             <div className="metric-divider"></div>
    //             <div className="metric-col">
    //               <div className="metric-label">POTASSIUM</div>
    //               <div className="metric-value">48<span className="metric-unit">mg/kg</span></div>
    //             </div>
    //           </div>
    //         </FadeUp>

    //         <FadeUp delay={0.3}>
    //           <div className="regional-trends-card">
    //             <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.5rem' }}>Regional Trends</h2>
    //             <ul className="trends-list">
    //               <li><span className="trend-dot green"></span> Rice demand up 12% in Malang</li>
    //               <li><span className="trend-dot yellow"></span> Rice prices projected to stabilize</li>
    //               <li><span className="trend-dot orange"></span> Unusual rain patterns expected in July</li>
    //             </ul>
    //           </div>
    //         </FadeUp>

    //         <FadeUp delay={0.4}>
    //           <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '2rem 0 1rem' }}>
    //             <Sparkles size={20} color="var(--neon-green)" />
    //             <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Top Recommendation<br/>Matches</h2>
    //           </div>
              
    //           <div className="rice-card">
    //             <div className="rice-image-container">
    //               <div className="match-badge">98% Match</div>
    //             </div>
                
    //             <div className="rice-card-content">
    //               <h2 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '4px' }}>Rice</h2>
    //               <p style={{ color: '#888', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Oryza sativa</p>
                  
    //               <div className="stat-bars">
    //                 <div className="stat-bar-group">
    //                   <div className="stat-bar-header">
    //                     <span className="stat-bar-label text-green">NITROGEN</span>
    //                     <span className="stat-bar-value">85/100</span>
    //                   </div>
    //                   <div className="stat-bar-bg"><div className="stat-bar-fill" style={{ width: '85%' }}></div></div>
    //                 </div>
    //                 <div className="stat-bar-group">
    //                   <div className="stat-bar-header">
    //                     <span className="stat-bar-label text-yellow">PHOSPHORUS</span>
    //                     <span className="stat-bar-value">40/100</span>
    //                   </div>
    //                   <div className="stat-bar-bg"><div className="stat-bar-fill yellow" style={{ width: '40%' }}></div></div>
    //                 </div>
    //                 <div className="stat-bar-group">
    //                   <div className="stat-bar-header">
    //                     <span className="stat-bar-label text-yellow">PH BALANCE</span>
    //                     <span className="stat-bar-value">6.8</span>
    //                   </div>
    //                   <div className="stat-bar-bg"><div className="stat-bar-fill yellow" style={{ width: '68%' }}></div></div>
    //                 </div>
    //                 <div className="stat-bar-group">
    //                   <div className="stat-bar-header">
    //                     <span className="stat-bar-label text-orange">HUMIDITY</span>
    //                     <span className="stat-bar-value">82%</span>
    //                   </div>
    //                   <div className="stat-bar-bg"><div className="stat-bar-fill orange" style={{ width: '82%' }}></div></div>
    //                 </div>
    //               </div>
    //             </div>
    //           </div>
    //         </FadeUp>
            
    //         <button className="back-btn" onClick={() => setView('input')} style={{ marginTop: '1rem', background: 'transparent', color: '#888', border: '1px solid #333', padding: '0.75rem 2rem', borderRadius: '100px', width: '100%' }}>
    //           Back to Analysis
    //         </button>
    //       </motion.div>
    //     )}
    //   </AnimatePresence>
    // </div>
  );
}
