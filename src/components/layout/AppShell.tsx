import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { TopBar } from './TopBar';
import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';
import { FloatingAIAssistantButton } from '../common/FloatingAIAssistantButton';

export const AppShell: React.FC = () => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <TopBar onToggleSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)} />

      <div className="flex-1 flex">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block shrink-0">
          <Sidebar />
        </div>

        {/* Mobile Slide-over Drawer */}
        {mobileSidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div
              className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
              onClick={() => setMobileSidebarOpen(false)}
            />
            <div className="relative w-72 max-w-[85vw] bg-white h-full shadow-2xl border-r border-slate-200 z-10 flex flex-col animate-in slide-in-from-left duration-200">
              <Sidebar onClose={() => setMobileSidebarOpen(false)} />
            </div>
          </div>
        )}

        {/* Main Routed Page Content */}
        <main className="flex-1 min-w-0 p-3 sm:p-6 lg:p-8 pb-24 lg:pb-8 overflow-y-auto max-w-7xl mx-auto w-full">
          <Outlet />
        </main>
      </div>

      {/* Floating AI Assistant for Students and Teachers */}
      <FloatingAIAssistantButton />

      {/* Mobile Bottom Navigation Bar */}
      <MobileNav />
    </div>
  );
};
