'use client';

import React from 'react';
import { Home as HomeIcon, LineChart, BarChart2, Bot, User } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function BottomNav() {
  const pathname = usePathname();

  const tabs = [
    { id: '/home', icon: <HomeIcon size={20} />, label: 'HOME' },
    { id: '/predict', icon: <LineChart size={20} />, label: 'PREDICT' },
    { id: '/monitor', icon: <BarChart2 size={20} />, label: 'MONITOR' },
    { id: '/chatbot', icon: <Bot size={20} />, label: 'CHATBOT' },
    { id: '/profile', icon: <User size={20} />, label: 'PROFILE' },
  ];

  return (
    <div className="bottom-nav">
      {tabs.map((tab) => (
        <Link 
          href={tab.id}
          key={tab.id}
          className={`nav-item ${pathname === tab.id ? 'active' : ''}`}
          style={{ textDecoration: 'none' }}
        >
          {tab.icon}
          {tab.label}
          {pathname === tab.id && (
            <motion.div 
              layoutId="nav-indicator"
              className="nav-indicator"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
          )}
        </Link>
      ))}
    </div>
  );
}
