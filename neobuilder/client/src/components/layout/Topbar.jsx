import {
  Menu,
  ChevronLeft,
  ChevronRight,
  Search,
  Plus,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from 'react';

export default function Topbar({ onMenuClick }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [showDefaultAdd, setShowDefaultAdd] = useState(false);

  const page =
    location.pathname
      .split("/")
      .filter(Boolean)
      .pop()
      ?.replace(/-/g, " ")
      ?.replace(/\b\w/g, (c) => c.toUpperCase()) || "Dashboard";
  const segments = location.pathname.split('/').filter(Boolean);
  const crumbs = segments.slice(1).map((s) =>
    s.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
  );

  useEffect(() => {
    const target = document.getElementById('header-actions-target');
    if (!target) {
      setShowDefaultAdd(true);
      return;
    }
    const update = () => setShowDefaultAdd(target.childElementCount === 0);
    update();
    const obs = new MutationObserver(update);
    obs.observe(target, { childList: true, subtree: false });
    return () => obs.disconnect();
  }, [location.pathname]);

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="icon-btn mobile-only" onClick={onMenuClick}>
          <Menu size={20} />
        </button>

        <button className="nav-btn" onClick={() => window.history.back()}>
          <ChevronLeft size={18} />
        </button>

        <button className="nav-btn" onClick={() => window.history.forward()}>
          <ChevronRight size={18} />
        </button>

        <div className="breadcrumb">
          <span>Home</span>
          {crumbs.length === 0 ? (
            <>
              <span>/</span>
              <strong>Dashboard</strong>
            </>
          ) : (
            crumbs.map((c, i) => (
              <span key={i}>
                <span>/</span>
                {i === crumbs.length - 1 ? <strong>{c}</strong> : <span>{c}</span>}
              </span>
            ))
          )}
        </div>
      </div>

      <div className="topbar-right">
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input type="text" placeholder={`Search ${page.toLowerCase()}...`} />
        </div>

        {/* target for pages to portal-in custom header actions */}
        <div id="header-actions-target" />

        {showDefaultAdd && (
          <button className="add-btn" onClick={() => navigate(location.pathname + '?add=1')}>
            <Plus size={18} />
            Add {page}
          </button>
        )}
      </div>
    </header>
  );
}