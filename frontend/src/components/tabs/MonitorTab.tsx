import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Droplets, LineChart, Loader2, FlaskConical, CheckCircle2, Sun } from 'lucide-react';
import { useSoil } from '@/lib/SoilContext';
import { cultivaApi } from '@/lib/api';

export default function MonitorTab() {
  const { soil } = useSoil();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [view, setView] = useState<'dashboard' | 'schedule'>('dashboard');

  const [timelineTasks, setTimelineTasks] = useState([
    {
      id: 1, time: '08:00 AM', type: 'Irrigation', title: 'Lettuce', desc: 'Optimal flow: 2.4L/min for nutrient absorption.', icon: <Droplets size={16} />, completed: false
    },
    {
      id: 2, time: '10:30 AM', type: 'Fertilizer Application', title: 'Tomato', desc: 'Injecting NPK 10-10-10 mixture for flowering stage.', icon: <FlaskConical size={16} />, completed: false
    },
    {
      id: 3, time: '06:00 PM', type: 'PH Calibration', title: 'Main Reservoir System', icon: <CheckCircle2 size={16} />, completed: true
    },
    {
      id: 4, time: '02:00 PM', type: 'UV Light Adjustment', title: 'Lettuce', desc: "Switching to 'Blue Bloom' spectrum for leaf density.", icon: <Sun size={16} />, completed: false
    }
  ]);

  useEffect(() => {
    let active = true;
    const fetchData = async () => {
      setLoading(true);
      try {
        // Assume planted date is 30 days ago
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const plantedDateStr = thirtyDaysAgo.toISOString().split('T')[0];

        const res = await cultivaApi.monitoring({
          crop_type: "Lettuce",
          location: "Malang,ID",
          planted_date: plantedDateStr,
          N: soil.nitrogen || 80,
          P: soil.phosphorus || 40,
          K: soil.potassium || 50,
          temperature: soil.temperature || 28,
        });
        if (active) {
          setData(res);
        }
      } catch (err) {
        console.error("Failed to fetch monitoring data from backend:", err);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      active = false;
    };
  }, [soil.nitrogen, soil.phosphorus, soil.potassium, soil.temperature]);

  const toggleTimelineTask = (id: number) => {
    setTimelineTasks(timelineTasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const markAllComplete = () => {
    setTimelineTasks(timelineTasks.map(t => ({ ...t, completed: true })));
  };

  const FadeUp = ({ children, delay = 0, keyStr }: { children: React.ReactNode, delay?: number, keyStr?: string }) => (
    <motion.div
      key={keyStr}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, delay }}
    >
      {children}
    </motion.div>
  );

  const overallHealth = data?.overall_health_score ?? 94;
  const cropHealth = data?.crop_health_score ?? 92;
  const daysToHarvest = data?.days_to_harvest ?? 12;
  const phVal = soil.connected ? soil.ph.toFixed(1) : "6.2";
  const moistureVal = soil.connected ? `${Math.round(soil.moisture)}%` : "88%";
  const npkStatus = data?.npk_status ?? "Optimum";
  const predictionText = data?.prediction_summary ?? "Harvest is on track due to optimal moisture levels and consistent nutrient delivery cycles over the last 72 hours.";

  const milestones = data?.system_milestones || [
    { title: "Weekly Water Irrigation", status: "completed", time_offset: "Completed" },
    { title: "Nutrient Cycle Flush", status: "pending", time_offset: "Scheduled • In 2h" },
    { title: "Predicted Harvest", status: "future", time_offset: "Projected • In 12 days" }
  ];

  return (
    <div className="tab-content pb-32">
      <AnimatePresence mode="wait">
        {view === 'dashboard' ? (
          <motion.div key="view-dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <FadeUp delay={0.1}>
              <div className="glass-card" style={{ padding: '2rem', marginBottom: '2rem', borderRadius: '32px', position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <div className="iot-badge" style={{ background: 'rgba(57, 255, 20, 0.15)', color: 'var(--neon-green)', padding: '6px 12px' }}>
                    <span className="iot-dot"></span> OPTIMAL STATUS
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {loading && <Loader2 size={12} className="animate-spin" style={{ color: 'var(--neon-green)' }} />}
                    <span style={{ fontSize: '0.75rem', color: '#888' }}>
                      {soil.connected ? "Synced with IoT" : "Using Simulated Data"}
                    </span>
                  </div>
                </div>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 800, lineHeight: 1.1 }}>
                  Farm Health
                </h1>
                <div style={{ fontSize: '4.5rem', fontWeight: 800, color: 'var(--neon-green)', lineHeight: 1 }}>
                  {overallHealth} <span style={{ fontSize: '2rem', color: 'var(--neon-green)' }}>%</span>
                </div>
              </div>
            </FadeUp>

            <FadeUp delay={0.2}>
              <div className="section-header-dash">
                <h2 className="section-title-dash" style={{ fontSize: '1.2rem', fontWeight: 700 }}>Active Crops</h2>
                <button
                  onClick={() => setView('schedule')}
                  className="section-link"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', outline: 'none' }}
                >
                  VIEW ALL <ChevronRight size={14} />
                </button>
              </div>

              <div className="glass-card p-0" style={{ padding: '1rem', borderRadius: '32px', marginBottom: '2rem' }}>
                <div className="lettuce-bg-monitor"></div>
                
                <div style={{ padding: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                    <div>
                      <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '4px' }}>Lettuce</h3>
                      <div style={{ color: 'var(--neon-green)', fontWeight: 600, fontSize: '0.9rem' }}>{cropHealth}% Health</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.7rem', color: '#888', textTransform: 'uppercase', letterSpacing: '1px' }}>HARVEST<br/>PREDICTION</div>
                      <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>{daysToHarvest}<span style={{ fontSize: '0.9rem', color: '#888', fontWeight: 500 }}>DAYS</span></div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div className="metric-badge">
                      <div className="metric-badge-label">PH LEVEL</div>
                      <div className="metric-badge-value">
                        <span className={`trend-dot ${phVal === "—" ? "yellow" : "green"}`}></span> {phVal}
                      </div>
                    </div>
                    <div className="metric-badge">
                      <div className="metric-badge-label">MOISTURE</div>
                      <div className="metric-badge-value">
                        <span className="trend-dot green"></span> {moistureVal}
                      </div>
                    </div>
                    <div className="metric-badge">
                      <div className="metric-badge-label">NPK INDEX</div>
                      <div className="metric-badge-value">
                        <span className={`trend-dot ${npkStatus.toLowerCase().includes("deficient") ? "yellow" : "green"}`}></span> {npkStatus}
                      </div>
                    </div>
                  </div>

                  <div className="prediction-box">
                    <LineChart size={20} color="var(--neon-green)" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <p style={{ fontSize: '0.85rem', color: '#ccc', lineHeight: 1.5 }}>
                      <span style={{ color: 'var(--neon-green)', fontWeight: 600 }}>Prediction:</span> {predictionText}
                    </p>
                  </div>

                  <div className="section-label" style={{ marginTop: '2rem', marginBottom: '1rem', background: 'transparent', padding: 0, border: 'none', fontSize: '0.7rem', letterSpacing: '2px' }}>
                    SYSTEM MILESTONES
                  </div>

                  <div className="milestone-timeline">
                    {milestones.map((m: any, idx: number) => (
                      <div key={idx} className={`milestone-item ${m.status || 'pending'}`}>
                        <div className="milestone-dot"><div className="inner-dot"></div></div>
                        <div className="milestone-content">
                          <div className="milestone-title">{m.title}</div>
                          <div className="milestone-desc">{m.time_offset}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </FadeUp>
          </motion.div>
        ) : (
          <motion.div key="view-schedule" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <FadeUp delay={0.1}>
              <button 
                onClick={() => setView('dashboard')}
                style={{ background: 'transparent', border: 'none', color: '#888', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem', cursor: 'pointer' }}
              >
                <ChevronRight size={16} style={{ transform: 'rotate(180deg)' }} /> Back
              </button>
              <div className="section-label" style={{ marginBottom: '0.5rem', background: 'transparent', padding: 0, border: 'none', fontSize: '0.7rem' }}>
                ECOSYSTEM CONTROL
              </div>
              <h1 className="dash-greeting" style={{ fontSize: '2.8rem', lineHeight: 1.1, marginBottom: '0.5rem' }}>
                Your <span style={{ color: 'var(--neon-green)' }}>Schedule</span>
              </h1>
              <p style={{ color: '#888', fontSize: '0.85rem', marginBottom: '2rem' }}>
                Optimization of life cycles for Your Plants
              </p>
            </FadeUp>

            <FadeUp delay={0.2}>
              <div className="summary-card">
                <div className="summary-item">
                  <div className="summary-value">84%</div>
                  <div className="summary-label">HEALTH INDEX</div>
                </div>
                <div className="summary-divider"></div>
                <div className="summary-item">
                  <div className="summary-value text-green">06</div>
                  <div className="summary-label">TASKS TODAY</div>
                </div>
              </div>
            </FadeUp>

            <FadeUp delay={0.3}>
              <div className="schedule-header">
                <div>
                  <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '4px' }}>Today's<br/>Schedule</h2>
                  <div className="date-badge">24 May 2026</div>
                </div>
                <button className="mark-complete-btn" onClick={markAllComplete}>Mark all<br/>complete</button>
              </div>

              <div className="timeline-container">
                {timelineTasks.map(task => (
                  <div key={task.id} className="timeline-item">
                    <div className="timeline-line" style={{ background: task.completed ? 'var(--neon-green)' : '#222' }}></div>
                    <div className={`timeline-icon ${task.completed ? 'completed' : ''}`}>
                      {task.icon}
                    </div>
                    <div className="timeline-content" onClick={() => toggleTimelineTask(task.id)}>
                      <div className="timeline-meta">
                        <span className="timeline-time">{task.time}</span>
                        <span className="timeline-dot">•</span>
                        <span className="timeline-type">{task.type}</span>
                      </div>
                      <h3 className="timeline-title">{task.title}</h3>
                      {task.desc && <p className="timeline-desc">{task.desc}</p>}
                      
                      <div className={`task-radio ${task.completed ? 'completed' : ''}`}>
                        {task.completed && <div className="task-radio-inner"></div>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="section-label" style={{ marginTop: '2.5rem', marginBottom: '1rem', background: 'transparent', padding: 0, border: 'none', fontSize: '0.7rem' }}>
                MANAGED UNITS
              </div>
              <div className="managed-units">
                <div className="unit-card lettuce-bg">
                  <div className="unit-card-overlay"></div>
                  <div className="unit-card-content">
                    <h3 className="unit-title">Lettuce</h3>
                    <div className="unit-progress-container">
                      <div className="unit-progress-bar">
                        <div className="unit-progress-fill" style={{ width: '92%' }}></div>
                      </div>
                      <div className="unit-status">92% STABLE</div>
                    </div>
                  </div>
                </div>
                
                <div className="unit-card tomato-bg">
                  <div className="unit-card-overlay"></div>
                  <div className="unit-card-content">
                    <h3 className="unit-title">Tomato</h3>
                    <div className="unit-progress-container">
                      <div className="unit-progress-bar">
                        <div className="unit-progress-fill" style={{ width: '78%' }}></div>
                      </div>
                      <div className="unit-status">78% FLOWERING</div>
                    </div>
                  </div>
                </div>
              </div>
            </FadeUp>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
