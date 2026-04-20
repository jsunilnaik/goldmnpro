'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import BottomTabBar from '@/components/layout/BottomTabBar';
import SplashScreen from '@/components/common/SplashScreen';
import BlockedRegion from '@/components/common/BlockedRegion';
import BroadcastModal from '@/components/common/BroadcastModal';
import { MiningProvider } from '@/context/MiningContext';

export default function DashboardLayout({ children }) {
  const { loading, user, isBlocked } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (loading) {
    return <SplashScreen />;
  }

  // HARD BLOCK CHECK: If region is blocked, show overlay
  if (isBlocked && user?.role !== 'admin') {
     return <BlockedRegion city={user?.city} />;
  }

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="flex min-h-screen bg-dark-950 overflow-x-hidden w-full">
      {/* Geo-Targeted Announcements */}
      <BroadcastModal />

      {/* Desktop & Mobile Drawer Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen min-w-0 overflow-x-hidden md:pl-64">
        {/* Mobile Header */}
        <Header />

        {/* Page Content */}
        <div className="flex-1 px-4 md:px-8 py-4 md:py-6 pb-24 md:pb-6 max-w-7xl mx-auto w-full min-w-0">
          <MiningProvider>
            {children}
          </MiningProvider>
        </div>

        {/* Mobile Bottom Tab Bar */}
        <BottomTabBar toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
      </main>
    </div>
  );
}