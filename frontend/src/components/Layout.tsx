import React, { useState } from 'react';
import Sidebar from './Sidebar';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="app-layout">
      <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />
      
      <div className={`main-content ${sidebarOpen ? 'main-content-shifted' : ''}`}>
        {children}
      </div>
    </div>
  );
};

export default Layout;
