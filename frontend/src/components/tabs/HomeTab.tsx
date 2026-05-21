import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Droplets, FlaskConical, CheckCircle2, Sun,
  MapPin, ChevronRight, X, Beaker, Leaf
} from 'lucide-react';

interface Task {
  id: number;
  time: string;
  type: string;
  title: string;
  desc?: string;
  icon: React.ReactNode;
  completed: boolean;
}

export default function HomeTab() {
  const [view, setView] = useState<'dashboard' | 'schedule'>('dashboard');
  const [alertVisible, setAlertVisible] = useState(true);

  // Daily Tasks state for the dashboard view
  const [dailyTasks, setDailyTasks] = useState([
    { id: 1, title: 'Water Corn', desc: '08:00 AM • SMART IRRIGATION', icon: <Droplets size={16} color="var(--neon-green)" />, completed: false },
    { id: 2, title: 'Check pH for Cabbage', desc: 'AI Alert: High acidity risk', icon: <Beaker size={16} color="#f97316" />, completed: false }
  ]);

  // Schedule timeline state for the schedule view
  const [timelineTasks, setTimelineTasks] = useState<Task[]>([
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

  const toggleDailyTask = (id: number) => {
    setDailyTasks(dailyTasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

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

  return (
    <div className="tab-content pb-32">
      <AnimatePresence mode="wait">
        {view === 'dashboard' ? (
          <motion.div key="view-dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {/* Dashboard View */}
            <FadeUp delay={0.1}>
              <div className="section-label" style={{ marginBottom: '0.5rem', background: 'transparent', padding: 0, border: 'none', fontSize: '0.65rem' }}>
                MONDAY, 24 MAY
              </div>
              <h1 className="dash-greeting" style={{ fontSize: '2.2rem', lineHeight: 1.1, marginBottom: '0.5rem' }}>
                Welcome, Agronomist
              </h1>
              <p style={{ color: 'var(--neon-green)', fontSize: '0.85rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                <MapPin size={14} /> Malang, Indonesia
              </p>
            </FadeUp>

            <FadeUp delay={0.2}>
              <div className="weather-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '3rem', fontWeight: 800, lineHeight: 1 }}>28°<span style={{ fontSize: '1rem', color: 'var(--neon-green)', fontWeight: 600, marginLeft: '8px' }}>Sunny</span></div>
                    <div style={{ display: 'flex', gap: '2rem', marginTop: '1.5rem' }}>
                      <div>
                        <div style={{ fontSize: '0.6rem', color: '#888', letterSpacing: '1px' }}>HUMIDITY</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>64%</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.6rem', color: '#888', letterSpacing: '1px' }}>RAIN</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>12%</div>
                      </div>
                    </div>
                  </div>
                  <div className="weather-icon-large">
                    <Sun size={40} color="var(--neon-green)" />
                  </div>
                </div>
              </div>
            </FadeUp>

            <AnimatePresence>
              {alertVisible && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }} 
                  animate={{ opacity: 1, height: 'auto' }} 
                  exit={{ opacity: 0, height: 0 }}
                  style={{ overflow: 'hidden' }}
                >
                  <FadeUp delay={0.3}>
                    <div className="alert-card">
                      <div className="alert-icon">
                        <Leaf size={16} color="#000" />
                      </div>
                      <div className="alert-content">
                        Rain expected tomorrow,<br/>delay watering for Cabbage.
                      </div>
                      <button className="alert-close" onClick={() => setAlertVisible(false)}>
                        <X size={16} color="#000" />
                      </button>
                    </div>
                  </FadeUp>
                </motion.div>
              )}
            </AnimatePresence>

            <FadeUp delay={0.4}>
              <div className="section-header-dash" style={{ marginTop: '2rem', marginBottom: '1rem' }}>
                <h2 className="section-title-dash">Active Crops</h2>
                <a href="#" className="section-link">View all <ChevronRight size={14} /></a>
              </div>
              
              {/* Horizontal Slider for Active Crops */}
              <div className="active-crops-slider">
                {/* Sweet Corn Card */}
                <div className="crop-slider-card">
                  <div className="crop-image corn-bg">
                    <div className="crop-badge healthy"><span className="trend-dot"></span> HEALTHY</div>
                  </div>
                  <div className="crop-slider-info">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                      <div>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Sweet Corn</h3>
                        <p style={{ fontSize: '0.75rem', color: '#888' }}>Section A-12</p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--neon-green)' }}>14</div>
                        <div style={{ fontSize: '0.55rem', color: '#888', textTransform: 'uppercase', letterSpacing: '1px' }}>Days to Harvest</div>
                      </div>
                    </div>
                    <div className="crop-slider-progress">
                      <div className="crop-slider-fill" style={{ width: '60%' }}></div>
                    </div>
                    <div className="crop-slider-action">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', fontWeight: 600 }}>
                        <Droplets size={14} color="var(--neon-green)" /> Fertilize today
                      </div>
                      <ChevronRight size={16} color="#666" />
                    </div>
                  </div>
                </div>

                {/* Cabbage Card */}
                <div className="crop-slider-card">
                  <div className="crop-image cabbage-bg">
                    <div className="crop-badge danger"><span className="trend-dot red"></span> CHECK SOIL</div>
                  </div>
                  <div className="crop-slider-info">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                      <div>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Cabbage</h3>
                        <p style={{ fontSize: '0.75rem', color: '#888' }}>North Sector</p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ef4444' }}>High</div>
                        <div style={{ fontSize: '0.55rem', color: '#888', textTransform: 'uppercase', letterSpacing: '1px' }}>Acidity Risk</div>
                      </div>
                    </div>
                    <div className="crop-slider-progress">
                      <div className="crop-slider-fill red" style={{ width: '30%' }}></div>
                    </div>
                    <div className="crop-slider-action">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', fontWeight: 600 }}>
                        <Beaker size={14} color="#ef4444" /> Check pH levels
                      </div>
                      <ChevronRight size={16} color="#666" />
                    </div>
                  </div>
                </div>
              </div>
            </FadeUp>

            <FadeUp delay={0.5}>
              <div className="section-header-dash" style={{ marginTop: '2rem', marginBottom: '1rem' }}>
                <h2 className="section-title-dash">Daily Tasks</h2>
                <button className="section-link" style={{ background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => setView('schedule')}>
                  View Schedule <ChevronRight size={14} />
                </button>
              </div>

              <div className="daily-tasks-list">
                {dailyTasks.map(task => (
                  <div key={task.id} className="daily-task-item" onClick={() => toggleDailyTask(task.id)}>
                    <div className="daily-task-icon-wrapper">
                      {task.icon}
                    </div>
                    <div className="daily-task-content">
                      <h4 className="daily-task-title">{task.title}</h4>
                      <p className="daily-task-desc">{task.desc}</p>
                    </div>
                    <div className={`custom-checkbox ${task.completed ? 'checked' : ''}`}>
                      {task.completed && <CheckCircle2 size={16} color="var(--neon-green)" />}
                    </div>
                  </div>
                ))}
              </div>
            </FadeUp>

          </motion.div>
        ) : (
          <motion.div key="view-schedule" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            {/* Old Schedule View */}
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
