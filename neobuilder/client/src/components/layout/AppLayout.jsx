import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { sidebarGroups } from '../../config/mastersConfig';

export default function AppLayout() {
  const location = useLocation();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [desktopSidebarCollapsed, setDesktopSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 900);
  const [selectedNavGroup, setSelectedNavGroup] = useState(() => {
    return (
      sidebarGroups.find((group) =>
        group.items?.some((item) => location.pathname.startsWith(item.path))
      ) || null
    );
  });

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 900);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const group = sidebarGroups.find((group) =>
      group.items?.some((item) => location.pathname.startsWith(item.path))
    );
    setSelectedNavGroup(group || null);
  }, [location.pathname]);

  const handleToggle = () => {
    if (window.innerWidth <= 900) {
      setMobileSidebarOpen((prev) => !prev);
    } else {
      setDesktopSidebarCollapsed((prev) => !prev);
    }
  };

  return (
    <div className={`app-shell ${desktopSidebarCollapsed ? 'desktop-sidebar-collapsed' : ''} ${mobileSidebarOpen ? 'mobile-sidebar-open' : ''}`}>
      <Sidebar
        open={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
        collapsed={desktopSidebarCollapsed && !isMobile}
        onGroupSelect={setSelectedNavGroup}
      />
      <div className="app-main">
        <Topbar onMenuClick={handleToggle} selectedNavGroup={selectedNavGroup} />
        <main className="app-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
