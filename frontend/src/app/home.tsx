'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell } from 'lucide-react';
import './home.css';

import BottomNav from '../components/BottomNav';
import HomeTab from '../components/tabs/HomeTab';
import PredictTab from '../components/tabs/PredictTab';
import MonitorTab from '../components/tabs/MonitorTab';
import ChatbotTab from '../components/tabs/ChatbotTab';
import ProfileTab from '../components/tabs/ProfileTab';
import SoilDashboard from '../components/tabs/SoilDashboard';

type Tab = 'home' | 'predict' | 'monitor' | 'chatbot' | 'profile' | 'soil';

export default function HomeDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('home');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'home': return <HomeTab key="home" />;
      case 'predict': return <PredictTab key="predict" />;
      case 'monitor': return <MonitorTab key="monitor" />;
      case 'chatbot': return <ChatbotTab key="chatbot" />;
      case 'profile': return <ProfileTab key="profile" />;
      case 'soil': return <SoilDashboard key="soil" />;
      default: return <HomeTab key="home" />;
    }
  };

  return (
    <div className="dashboard-container">
      {/* Global Top Bar */}
      <div className="dash-topbar">
        <div className="dash-logo" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <img src="/images/cultivalogo.png" alt="Cultiva Logo" style={{ height: '32px' }} />
          <span>Cultiva</span>
        </div>
        <Bell size={20} color="#fff" style={{ cursor: 'pointer' }} />
      </div>

      {/* Main Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          transition={{ duration: 0.3 }}
          style={{ width: '100%' }}
        >
          {renderTabContent()}
      {/* Persistent Bottom Nav */}
      <BottomNav />
    </div>
  );
}
