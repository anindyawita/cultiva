'use client';

import React from 'react';
import { Bell } from 'lucide-react';
import '../home.css';
import BottomNav from '../../components/BottomNav';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const session = localStorage.getItem('cultiva_session');
    if (session !== 'true') {
      router.push('/');
    } else {
      setIsAuthenticated(true);
    }
  }, [router]);

  if (!isAuthenticated) return null;

  return (
    <div className="dashboard-container">
      {/* Global Top Bar */}
      <div className="dash-topbar">
        <div className="dash-logo">
          <img src="/images/cultivalogo.png" alt="Cultiva Logo" />
          <span>Cultiva</span>
        </div>
        <Bell size={20} color="#fff" style={{ cursor: 'pointer' }} />
      </div>

      {/* Main Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={pathname}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          transition={{ duration: 0.25 }}
          style={{ width: '100%' }}
        >
          {children}
        </motion.div>
      </AnimatePresence>

      {/* Persistent Bottom Nav */}
      <BottomNav />
    </div>
  );
}

