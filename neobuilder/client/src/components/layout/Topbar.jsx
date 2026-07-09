import {
  Menu,
  ChevronLeft,
  ChevronRight,
  Search,
  Plus,
} from "lucide-react";
import { useLocation } from "react-router-dom";

export default function Topbar({ onMenuClick }) {
  const location = useLocation();

  const page =
    location.pathname
      .split("/")
      .filter(Boolean)
      .pop()
      ?.replace(/-/g, " ")
      ?.replace(/\b\w/g, (c) => c.toUpperCase()) || "Dashboard";

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button
          className="icon-btn mobile-only"
          onClick={onMenuClick}
        >
          <Menu size={20} />
        </button>

        <button
          className="nav-btn"
          onClick={() => window.history.back()}
        >
          <ChevronLeft size={18} />
        </button>

        <button
          className="nav-btn"
          onClick={() => window.history.forward()}
        >
          <ChevronRight size={18} />
        </button>

        <div className="breadcrumb">
          <span>Home</span>
          <span>/</span>
          <span>Masters</span>
          <span>/</span>
          <strong>{page}</strong>
        </div>
      </div>

      <div className="topbar-right">
        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder={`Search ${page.toLowerCase()}...`}
          />
        </div>

        <button className="add-btn">
          <Plus size={18} />
          Add {page}
        </button>
      </div>
    </header>
  );
}