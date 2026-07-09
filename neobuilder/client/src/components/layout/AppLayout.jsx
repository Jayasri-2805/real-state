import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function AppLayout() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [desktopSidebarCollapsed, setDesktopSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 900);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 900);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleToggle = () => {
    if (window.innerWidth <= 900) {
      setMobileSidebarOpen((prev) => !prev);
    } else {
      setDesktopSidebarCollapsed((prev) => !prev);
    }
  };

  return (
    <div className={`app-shell ${desktopSidebarCollapsed ? 'desktop-sidebar-collapsed' : ''} ${mobileSidebarOpen ? 'mobile-sidebar-open' : ''}`}>
      <Sidebar open={mobileSidebarOpen} onClose={() => setMobileSidebarOpen(false)} collapsed={desktopSidebarCollapsed && !isMobile} />
      <div className="app-main">
        <Topbar onMenuClick={handleToggle} />
        <main className="app-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
