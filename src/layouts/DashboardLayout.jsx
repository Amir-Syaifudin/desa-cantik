// src/layouts/DashboardLayout.jsx
import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import SidebarBPS from '@/components/shared/SidebarAdminBPS';
import SidebarPerangkat from '@/components/shared/SidebarPerangkatDesa';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';

export default function DashboardLayout() {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const isAdmin = location.pathname.startsWith('/admin');

  const title = isAdmin ? 'Admin BPS' : 'Desa Suka Maju';
  const subtitle = 'Desa Cantik';
  const userName = isAdmin ? 'Administrator' : 'Perangkat Desa';
  const userInitial = isAdmin ? 'A' : 'D';

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">

      {/* HEADER */}
      <Header
        title={title}
        subtitle={subtitle}
        userName={userName}
        userInitial={userInitial}
      />

      {/* MIDDLE SECTION */}
      <div className="flex flex-1 min-h-0">

        {/* SIDEBAR */}
        <div
        className="shrink-0 flex flex-col min-h-0 bg-white border-r"
          style={{
            width: isCollapsed ? '4rem' : '16rem',
            flexShrink: 0
          }}
        >
          {isAdmin ? (
            <SidebarBPS
              isCollapsed={isCollapsed}
              setIsCollapsed={setIsCollapsed}
            />
          ) : (
            <SidebarPerangkat
              isCollapsed={isCollapsed}
              setIsCollapsed={setIsCollapsed}
            />
          )}
        </div>

        {/* CONTENT */}
        <div className="flex-1 flex flex-col min-h-0">
          <main className="overflow-auto p-6">
            <Outlet /> 
          </main>
        </div>
      </div>

      {/* FOOTER */}
      <Footer scrollToVillages={() => {}} />

    </div>
  );
}
