import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import AppFooter from '../components/AppFooter';

const AppLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-container">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="app-main">
        <Navbar onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />
        <main className="page-container">
          <Outlet />
        </main>
        <AppFooter />
      </div>
    </div>
  );
};

export default AppLayout;

