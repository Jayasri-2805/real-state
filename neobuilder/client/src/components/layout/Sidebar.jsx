import { useEffect, useRef, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import * as Icons from 'lucide-react';
import { Building2, ChevronDown, X } from 'lucide-react';
import { sidebarGroups } from '../../config/mastersConfig';
import { useAuth } from '../../contexts/AuthContext';
const companyLogoSrc = new URL('/images/logo.png', import.meta.url).href;

function DynamicIcon({ name, size = 16, className }) {
  const IconComp = Icons[name] || Icons.Circle;
  return <IconComp size={size} className={className} />;
}

function GroupPanel({ isOpen, children }) {
  const innerRef = useRef(null);
  const [maxHeight, setMaxHeight] = useState(isOpen ? 'none' : '0px');

  useEffect(() => {
    const el = innerRef.current;
    if (!el) return;
    if (isOpen) {
      const height = el.scrollHeight;
      setMaxHeight(height + 'px');
      const timeout = setTimeout(() => setMaxHeight('none'), 220);
      return () => clearTimeout(timeout);
    }
    setMaxHeight(el.scrollHeight + 'px');
    requestAnimationFrame(() => setMaxHeight('0px'));
  }, [isOpen]);

  return (
    <div className="sidebar-group-panel" style={{ maxHeight }}>
      <div className="sidebar-group-items" ref={innerRef}>
        {children}
      </div>
    </div>
  );
}

export default function Sidebar({ open, onClose, collapsed, onGroupSelect }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTooltip, setActiveTooltip] = useState({ text: '', top: 0 });

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleCompanyProfileClick = () => {
    navigate('/settings/company-profile');
  };

  const canView = (moduleKey) => {
    if (!user) return false;
    if (!moduleKey) return true;
    if (user.isOwner) return true;
    return Boolean(user.role?.permissions?.[moduleKey]?.view);
  };

  const [expanded, setExpanded] = useState(() => {
    const initial = {};
    sidebarGroups.forEach((group) => {
      initial[group.title] = group.items ? group.items.some((item) => location.pathname.startsWith(item.path)) : false;
    });
    return initial;
  });
  const [masterTab, setMasterTab] = useState('main');
  const [masterSubOpen, setMasterSubOpen] = useState({ main: true, other: false });

  useEffect(() => {
    setExpanded((prev) => {
      const next = {};
      sidebarGroups.forEach((group) => {
        next[group.title] = group.items ? group.items.some((item) => location.pathname.startsWith(item.path)) : false;
      });
      return next;
    });
  }, [location.pathname]);

  const toggleGroup = (title) => {
    const group = sidebarGroups.find((group) => group.title === title);
    if (group) {
      onGroupSelect?.(group);
    }

    const visibleItems = group?.items?.filter((item) => canView(item.moduleKey)) || [];
    if (group && visibleItems.length > 0) {
      const firstItem = title === 'Master'
        ? visibleItems.find((item) => item.path === '/masters/site-types') || visibleItems[0]
        : visibleItems[0];
      onClose?.();
      navigate(firstItem.path);
      return;
    }

    setExpanded((prev) => {
      const isOpening = !prev[title];
      const next = {};
      sidebarGroups.forEach((group) => {
        next[group.title] = group.title === title ? isOpening : false;
      });
      return next;
    });
  };

  const getCompanyInitials = (name) => {
    if (!name) return 'CO';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  const defaultLogoUrl = new URL('/images/logo.png', import.meta.url).href;
  const companyLogoUrl = user?.company?.logo?.url
    ? `${import.meta.env.VITE_API_URL}${user.company.logo.url}`
    : defaultLogoUrl;
  const sidebarBrandLogoUrl = defaultLogoUrl;

  return (
    <>
      {open && <div className="sidebar-backdrop" onClick={onClose} />}
      <aside className={`sidebar ${open ? 'open' : ''} ${collapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-brand" style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '8px 12px 4px', height: 'auto', borderBottom: 'none', position: 'relative' }}>
          <button className="sidebar-close" onClick={onClose} aria-label="Close menu" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
            <X size={18} />
          </button>
        </div>
        <nav className="sidebar-nav" onScroll={() => setActiveTooltip({ text: '', top: 0 })}>
          {sidebarGroups.map((group) => {
            if (group.isDirect) {
              if (!canView(group.moduleKey)) return null;
              const isActive = location.pathname.startsWith(group.path);
              return (
                <div key={group.title} className="sidebar-group" style={{ marginBottom: '12px' }}>
                  <NavLink
                    to={group.path}
                    className={() => `sidebar-group-title ${isActive ? 'active' : ''}`}
                    onClick={onClose}
                    data-tooltip={group.title}
                    onMouseEnter={(e) => {
                      if (!collapsed) return;
                      const rect = e.currentTarget.getBoundingClientRect();
                      setActiveTooltip({ text: group.title, top: rect.top + rect.height / 2 - 17 });
                    }}
                    onMouseLeave={() => setActiveTooltip({ text: '', top: 0 })}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      textDecoration: 'none',
                      textAlign: 'left',
                      width: '100%',
                      margin: 0,
                    }}
                  >
                    <div className="sidebar-group-title-left">
                      {group.icon && <DynamicIcon name={group.icon} size={15} className="sidebar-group-icon" />}
                      <span>{group.title}</span>
                    </div>
                  </NavLink>
                </div>
              );
            }

            const visibleItems = group.items ? group.items.filter((item) => canView(item.moduleKey)) : [];
            if (visibleItems.length === 0) return null;
            const isOpen = Boolean(expanded[group.title]);
            return (
              <div key={group.title} className="sidebar-group">
                <button
                  type="button"
                  className={`sidebar-group-title ${isOpen ? 'is-open' : ''}`}
                  onClick={() => toggleGroup(group.title)}
                  data-tooltip={group.title}
                  onMouseEnter={(e) => {
                    if (!collapsed) return;
                    const rect = e.currentTarget.getBoundingClientRect();
                    setActiveTooltip({ text: group.title, top: rect.top + rect.height / 2 - 17 });
                  }}
                  onMouseLeave={() => setActiveTooltip({ text: '', top: 0 })}
                >
                  <div className="sidebar-group-title-left">
                    <span>{group.title}</span>
                  </div>
                </button>

                <GroupPanel isOpen={isOpen}>
                  {group.title === 'Master' ? (
                    (() => {
                      const mainItems = visibleItems.slice(0, 11);
                      const otherItems = visibleItems.slice(11);
                      return (
                        <>
                          <div>
                            <button
                              type="button"
                              className={`sidebar-group-title ${masterSubOpen.main ? 'is-open' : ''}`}
                              onClick={() => {
                                const next = !masterSubOpen.main;
                                setMasterSubOpen((p) => ({ ...p, main: next }));
                                if (next) {
                                  // when opening Main, tell parent which items to show in header
                                  onGroupSelect?.({ ...group, items: mainItems });
                                }
                              }}
                              style={{ width: '100%', textAlign: 'left', padding: '8px 10px', marginBottom: 6 }}
                            >
                              <div className="sidebar-group-title-left">
                                <span>Main</span>
                              </div>
                            </button>
                            <GroupPanel isOpen={masterSubOpen.main}>
                              {mainItems.map((item) => (
                                <NavLink
                                  key={item.path}
                                  to={item.path}
                                  className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                                  onClick={() => { onClose(); }}
                                  style={{ textDecoration: 'none' }}
                                >
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    {item.icon && <DynamicIcon name={item.icon} size={14} className="sidebar-link-icon" />}
                                    <span>{item.label}</span>
                                  </div>
                                </NavLink>
                              ))}
                            </GroupPanel>

                            <button
                              type="button"
                              className={`sidebar-group-title ${masterSubOpen.other ? 'is-open' : ''}`}
                              onClick={() => {
                                const next = !masterSubOpen.other;
                                setMasterSubOpen((p) => ({ ...p, other: next }));
                                if (next) {
                                  onGroupSelect?.({ ...group, items: otherItems });
                                }
                              }}
                              style={{ width: '100%', textAlign: 'left', padding: '8px 10px', marginTop: 8 }}
                            >
                              <div className="sidebar-group-title-left">
                                <span>Other</span>
                              </div>
                            </button>
                            <GroupPanel isOpen={masterSubOpen.other}>
                              {otherItems.map((item) => (
                                <NavLink
                                  key={item.path}
                                  to={item.path}
                                  className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                                  onClick={() => { onClose(); }}
                                  style={{ textDecoration: 'none' }}
                                >
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    {item.icon && <DynamicIcon name={item.icon} size={14} className="sidebar-link-icon" />}
                                    <span>{item.label}</span>
                                  </div>
                                </NavLink>
                              ))}
                            </GroupPanel>
                          </div>
                        </>
                      );
                    })()
                  ) : (
                    visibleItems.map((item) => (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                        onClick={() => { onClose(); }}
                        style={{ textDecoration: 'none' }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          {item.icon && <DynamicIcon name={item.icon} size={14} className="sidebar-link-icon" />}
                          <span>{item.label}</span>
                        </div>
                      </NavLink>
                    ))
                  )}
                </GroupPanel>
              </div>
            );
          })}
        </nav>

        <div style={{ padding: '0 12px 24px' }}>
          <button
            type="button"
            className="sidebar-link"
            onClick={async () => {
              await handleLogout();
              onClose();
            }}
            data-tooltip="Secure Logout"
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: '10px', marginTop: '12px', padding: '10px', color: '#ef4444' }}
          >
            <DynamicIcon name="LogOut" size={15} className="sidebar-link-icon" style={{ color: '#ef4444' }} />
            <span style={{ color: '#ef4444' }}>Secure Logout</span>
          </button>
        </div>

        <div className="sidebar-avatar-footer">
          <button className="sidebar-avatar-button" type="button" onClick={handleCompanyProfileClick}>
            <div className="sidebar-avatar-wrapper">
              <div className="sidebar-avatar-large">
                <img
                  src={companyLogoUrl}
                  alt="Company Profile"
                />
                <div className="sidebar-avatar-small">
                  <img src={companyLogoSrc} alt="Company Logo" />
                </div>
              </div>
            </div>
          </button>
        </div>

        {collapsed && activeTooltip.text && (
          <div className="sidebar-custom-tooltip" style={{ top: `${activeTooltip.top}px` }}>
            {activeTooltip.text}
          </div>
        )}
      </aside>
    </>
  );
}
