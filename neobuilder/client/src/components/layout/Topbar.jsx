import {
  Menu,
  ChevronLeft,
  ChevronRight,
  Search,
  Plus,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from 'react';

export default function Topbar({ onMenuClick, selectedNavGroup }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [showDefaultAdd, setShowDefaultAdd] = useState(false);
  const [showOtherMasterItems, setShowOtherMasterItems] = useState(false);
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [headerSearchValue, setHeaderSearchValue] = useState('');

  const segments = location.pathname.split('/').filter(Boolean);
  const page =
    segments.length > 0
      ? segments[segments.length - 1].replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
      : 'Dashboard';

  const groupItems = selectedNavGroup?.items || [];
  const visibleGroupItems = groupItems.slice(0, 11);
  const hiddenGroupItems = groupItems.slice(11);
  const hasHiddenItems = hiddenGroupItems.length > 0;
  const isSettingsPage = location.pathname.startsWith('/settings');
  const currentNavItem = groupItems.find((item) => item.path === location.pathname);
  const currentRouteIsHidden = currentNavItem && hiddenGroupItems.some((item) => item.path === currentNavItem.path);

  const masterLabelMap = {
    '/masters/site-types': 'Site Type',
    '/masters/sites': 'Sites',
    '/masters/item-categories': 'Category',
    '/masters/item-uoms': 'UOM',
    '/masters/items': 'Item Master',
    '/masters/works': 'Work',
    '/masters/labour-types': 'Labour',
    '/masters/vehicle-types': 'Vehicle',
    '/masters/trucks': 'Trucks',
    '/masters/filling-stations': 'Filling',
    '/masters/expenses': 'Expenses',
    '/masters/purchase-status': 'Purchase',
    '/masters/tax-masters': 'Tax',
    '/masters/other-charges-master': 'Charges',
    '/masters/product-types': 'Product',
    '/masters/priority-masters': 'Priority',
    '/masters/payment-types': 'Payment',
  };

  const getHeaderLabel = (item) => masterLabelMap[item.path] || item.label;

  const routeCrumbs = segments.map((segment, index) => {
    let label = segment.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    if (segment === 'masters' || segment === 'people') {
      label = selectedNavGroup?.title || 'Master';
    }
    if (segment === 'admin') label = 'Administration';
    if (segment === 'purchase') label = 'Purchase';
    if (segment === 'settings') label = 'Settings';
    return {
      path: '/' + segments.slice(0, index + 1).join('/'),
      label,
      isLast: index === segments.length - 1,
    };
  });

  const crumbs = groupItems.length
    ? (showOtherMasterItems
        ? hiddenGroupItems.map((item) => ({
            path: item.path,
            label: getHeaderLabel(item),
            isLast: item.path === location.pathname,
          }))
        : currentRouteIsHidden
          ? hiddenGroupItems.map((item) => ({
              path: item.path,
              label: getHeaderLabel(item),
              isLast: item.path === location.pathname,
            }))
          : visibleGroupItems.map((item) => ({
              path: item.path,
              label: getHeaderLabel(item),
              isLast: item.path === location.pathname,
            })))
    : routeCrumbs;
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

  useEffect(() => {
    if (!groupItems.some((item) => item.path === location.pathname)) {
      setShowOtherMasterItems(false);
    }
  }, [location.pathname, groupItems]);

  const handleSearchClick = () => {
    // Toggle inline header search. If already visible and has value, perform navigate.
    if (!showSearchInput) {
      setShowSearchInput(true);
      // focus will occur via effect when input mounts (poll for element)
      setTimeout(() => {
        const el = document.getElementById('header-inline-search');
        if (el) el.focus();
      }, 50);
      return;
    }

    if (headerSearchValue && headerSearchValue.trim()) {
      navigate(location.pathname + `?q=${encodeURIComponent(headerSearchValue.trim())}`);
      return;
    }

    // hide if empty
    setShowSearchInput(false);
  };

  // keep header input in sync with query param
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get('q') || '';
    setHeaderSearchValue(q);
    if (q) setShowSearchInput(true);
  }, [location.search]);

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
          <a
            href="/dashboard"
            className="breadcrumb-link"
            onClick={(e) => {
              e.preventDefault();
              navigate('/dashboard');
            }}
          >
            Home
          </a>
          {crumbs.length === 0 ? (
            <>
              <span>/</span>
              <strong>Dashboard</strong>
            </>
          ) : (
            <>
              {crumbs.map((crumb) => (
                <span key={crumb.path}>
                  <span>/</span>
                  {crumb.isLast ? (
                    <strong>{crumb.label}</strong>
                  ) : (
                    <a
                      href={crumb.path}
                      className="breadcrumb-link"
                      onClick={(e) => {
                        e.preventDefault();
                        navigate(crumb.path);
                      }}
                    >
                      {crumb.label}
                    </a>
                  )}
                </span>
              ))}
              {!showOtherMasterItems && hasHiddenItems && (
                <span>
                  <span>/</span>
                  <a
                    href="#"
                    className="breadcrumb-link"
                    onClick={(e) => {
                      e.preventDefault();
                      setShowOtherMasterItems(true);
                    }}
                  >
                    Other
                  </a>
                </span>
              )}
              {showOtherMasterItems && hasHiddenItems && (
                <span>
                  <span>/</span>
                  <a
                    href="#"
                    className="breadcrumb-link breadcrumb-link-master"
                    onClick={(e) => {
                      e.preventDefault();
                      setShowOtherMasterItems(false);
                    }}
                  >
                    Master
                  </a>
                </span>
              )}
            </>
          )}
        </div>
      </div>

      <div className="topbar-right">
        {!isSettingsPage && (
          <>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              {showSearchInput && (
                <div className="search-input" style={{ marginRight: 8 }}>
                  <Search size={14} />
                  <input
                    id="header-inline-search"
                    placeholder="Search..."
                    value={headerSearchValue}
                    onChange={(e) => setHeaderSearchValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        if (headerSearchValue && headerSearchValue.trim()) {
                          navigate(location.pathname + `?q=${encodeURIComponent(headerSearchValue.trim())}`);
                        }
                      } else if (e.key === 'Escape') {
                        setShowSearchInput(false);
                      }
                    }}
                  />
                </div>
              )}

              <button className="search-btn" onClick={handleSearchClick} aria-label="Search">
                <Search size={16} />
              </button>
            </div>
            <div id="header-actions-target" />

            {showDefaultAdd && (
              <button
                className="add-btn"
                onClick={() => navigate(location.pathname + '?add=1')}
                aria-label={`Add ${page}`}
                title={`Add ${page}`}
              >
                <Plus size={18} />
              </button>
            )}
          </>
        )}
      </div>
    </header>
  );
}