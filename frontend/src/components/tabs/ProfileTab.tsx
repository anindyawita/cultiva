import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, LayoutGrid, Tractor, MapPin, User, Edit2 } from 'lucide-react';

export default function ProfileTab() {
  const FadeUp = ({ children, delay = 0 }: { children: React.ReactNode, delay?: number }) => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay }}>
      {children}
    </motion.div>
  );

  return (
    <div className="tab-content pb-32">
      <FadeUp delay={0.1}>
        <div className="profile-header">
          <div className="profile-avatar">
            <User className="profile-avatar-icon" />
          </div>
          <h1 className="profile-name">Yusuf Aji</h1>
          <p className="profile-role">Farmer</p>
          <button className="edit-profile-btn">
            <Edit2 size={12} /> Edit Farm Details
          </button>
          <button 
            onClick={() => { localStorage.removeItem('cultiva_session'); window.location.href = '/'; }} 
            style={{ marginTop: '1rem', background: 'transparent', border: '1px solid #444', color: '#888', padding: '6px 12px', borderRadius: '20px', fontSize: '0.75rem', cursor: 'pointer' }}
          >
            Logout
          </button>
        </div>
      </FadeUp>

      <FadeUp delay={0.2}>
        <div className="section-header-dash" style={{ marginBottom: '1rem' }}>
          <h2 className="section-title-dash" style={{ fontSize: '1.2rem', fontWeight: 700 }}>My Farm</h2>
          <div className="live-status-badge">
            <div className="live-status-dot"></div> LIVE STATUS
          </div>
        </div>

        <div className="farm-metrics-grid">
          <div className="farm-metric-card">
            <LayoutGrid size={24} className="farm-metric-icon" />
            <div className="farm-metric-value">2</div>
            <div className="farm-metric-label">ACTIVE CROP</div>
          </div>
          <div className="farm-metric-card">
            <Tractor size={24} className="farm-metric-icon" />
            <div className="farm-metric-value">2</div>
            <div className="farm-metric-label">HECTARES</div>
          </div>
        </div>
      </FadeUp>

      <FadeUp delay={0.3}>
        <div className="section-label" style={{ marginBottom: '1rem', background: 'transparent', padding: 0, border: 'none', fontSize: '0.7rem' }}>
          PRIMARY LOCATION
        </div>
        <div className="location-card">
          <div className="location-icon-wrapper">
            <MapPin size={20} />
          </div>
          <div className="location-content">
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '4px' }}>Malang Regency</h3>
            <p style={{ fontSize: '0.8rem', color: '#888' }}>Indonesia</p>
          </div>
        </div>
      </FadeUp>

      <FadeUp delay={0.4}>
        <div className="section-header-dash" style={{ marginBottom: '1rem' }}>
          <h2 className="section-title-dash" style={{ fontSize: '1.2rem', fontWeight: 700 }}>Current Cultivations</h2>
          <a href="#" className="section-link">View All <ChevronRight size={14} /></a>
        </div>

        <div className="cultivation-list">
          <div className="cultivation-item">
            <div className="cultivation-thumb" style={{ backgroundImage: "url('/images/cabbage.png')" }}></div>
            <div className="cultivation-info">
              <h3 className="cultivation-title">Lettuce</h3>
              <div className="cultivation-progress-wrapper">
                <div className="cultivation-progress-bar">
                  <div className="cultivation-progress-fill" style={{ width: '82%' }}></div>
                </div>
                <span className="cultivation-progress-text">82% Growth Progress</span>
              </div>
            </div>
          </div>

          <div className="cultivation-item">
            <div className="cultivation-thumb" style={{ backgroundImage: "url('/images/tomato.png')" }}></div>
            <div className="cultivation-info">
              <h3 className="cultivation-title">Tomato</h3>
              <div className="cultivation-progress-wrapper">
                <div className="cultivation-progress-bar">
                  <div className="cultivation-progress-fill" style={{ width: '45%' }}></div>
                </div>
                <span className="cultivation-progress-text">45% Growth Progress</span>
              </div>
            </div>
          </div>
        </div>
      </FadeUp>
    </div>
  );
}
