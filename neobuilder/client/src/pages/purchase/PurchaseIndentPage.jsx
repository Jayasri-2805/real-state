import { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Plus, Eye } from 'lucide-react';
import AddIndentModal from '../../components/purchase/AddIndentModal';
import PurchaseViewModal from '../../components/purchase/PurchaseViewModal';
import { useLocation, useNavigate } from 'react-router-dom';
import { sidebarGroups } from '../../config/mastersConfig';

const SAMPLE_ROWS = [
  {
    sno: 1,
    date: '12/06/2026',
    requiredDate: '13/06/2026',
    indentNo: 'CROK/25/26/52',
    site: 'CRO Kilpauk',
    type: 'Consumables',
    priority: 'Urgent',
    purpose: 'Test',
    materialReq: 'TEST',
    status: 'Raised',
    pmPdApproval: true,
    adminApproval: false,
    raisedBy: 'admin',
  },
  {
    sno: 2,
    date: '30/05/2026',
    requiredDate: '30/05/2026',
    indentNo: 'KAL/25/26/51',
    site: 'Kalpakkam',
    type: 'None',
    priority: 'Normal',
    purpose: 'Fg',
    materialReq: 'Fg',
    status: 'Raised',
    pmPdApproval: false,
    adminApproval: true,
    raisedBy: 'admin',
  },
];

export default function PurchaseIndentPage() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showView, setShowView] = useState(false);
  const [viewData, setViewData] = useState(null);
  const [initialData, setInitialData] = useState(null);
  const [search, setSearch] = useState('');
  const [rows] = useState(SAMPLE_ROWS);
  const [portalTarget, setPortalTarget] = useState(null);
  const [showCount, setShowCount] = useState(10);
  const [filters, setFilters] = useState({
    indentNo: 'All',
    site: 'All',
    type: 'All',
    priority: 'All',
    purpose: 'All',
    materialReq: 'All',
    status: 'All',
    raisedBy: 'All',
  });

  const navigate = useNavigate();
  const location = useLocation();

  // navigation already displays group items; remove duplicate header chips
  const currentGroup = sidebarGroups.find((group) =>
    group.items?.some((item) => location.pathname.startsWith(item.path))
  );
  const groupItems = currentGroup?.items || [];

  const uniqueOptions = useMemo(() => {
    const opts = {
      indentNo: new Set(),
      site: new Set(),
      type: new Set(),
      priority: new Set(),
      purpose: new Set(),
      materialReq: new Set(),
      status: new Set(),
      raisedBy: new Set(),
    };

    rows.forEach((r) => {
      Object.keys(opts).forEach((k) => opts[k].add(r[k] || ''));
    });

    return Object.fromEntries(
      Object.entries(opts).map(([k, s]) => [k, ['All', ...Array.from(s).filter(Boolean)]])
    );
  }, [rows]);

  const filteredRows = useMemo(() => {
    return rows.filter((r) => {
      if (search && !Object.values(r).join(' ').toLowerCase().includes(search.toLowerCase())) return false;
      for (const key of Object.keys(filters)) {
        const val = filters[key];
        if (val && val !== 'All' && String(r[key]) !== String(val)) return false;
      }
      return true;
    });
  }, [rows, filters, search]);

  useEffect(() => {
    setPortalTarget(document.getElementById('header-actions-target'));
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const shouldOpen = params.get('add') === '1' || (location.state && location.state.openAdd);
    if (shouldOpen) {
      setInitialData(location.state?.initialData || null);
      setShowAddModal(true);
      if (params.get('add') === '1') {
        params.delete('add');
        const query = params.toString();
        navigate(location.pathname + (query ? `?${query}` : ''), { replace: true });
      }
    }
  }, [location.search, location.state, location.pathname, navigate]);

  return (
    <div className="page">
      {/* master group chips removed from header; use sidebar navigation instead */}
      <div className="page-header">
        <div>
          <h1>Purchase Indent</h1>
        </div>
      </div>

      {portalTarget && createPortal(
        <button className="header-add-rejected icon-only" aria-label="Add Indent" onClick={() => setShowAddModal(true)}>
          <span className="pulse-icon"><Plus size={14} /></span>
        </button>,
        portalTarget
      )}

      <div className="table-card" style={{ padding: '12px 16px 8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>Show</span>
            <select className="form-select" style={{ width: 90 }} value={showCount} onChange={(e) => setShowCount(Number(e.target.value))}>
              <option>10</option>
              <option>25</option>
              <option>50</option>
            </select>
            <span>entries</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <label style={{ color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>Search:</label>
            <input className="form-input" style={{ width: 180, minWidth: 140 }} placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>

        {showAddModal && (
          <AddIndentModal
            initialData={initialData}
            onClose={() => {
              setShowAddModal(false);
              if (location.search.includes('add=1')) {
                const params = new URLSearchParams(location.search);
                params.delete('add');
                const q = params.toString();
                navigate(location.pathname + (q ? `?${q}` : ''), { replace: true });
              }
            }}
          />
        )}
        {showView && (
          <PurchaseViewModal
            title="Indent"
            data={viewData}
            onClose={() => setShowView(false)}
          />
        )}

        <div style={{ overflowX: 'auto', width: '100%' }}>
          <table className="data-table" style={{ minWidth: 1200, width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th>Sno</th>
                <th>Date</th>
                <th>Required Date</th>
                <th>Indent No</th>
                <th>Site</th>
                <th>Type</th>
                <th>Priority</th>
                <th>Purpose</th>
                <th>Material Req</th>
                <th>Status</th>
                <th>PM/PD Approval</th>
                <th>Admin Approval</th>
                <th>View</th>
              </tr>
              <tr className="filters-row">
                <th />
                <th><input className="form-input" placeholder="Date" /></th>
                <th><input className="form-input" placeholder="Required" /></th>
                <th>
                  <select className="form-select" value={filters.indentNo} onChange={(e) => setFilters((s) => ({ ...s, indentNo: e.target.value }))}>
                    {uniqueOptions.indentNo.map((o) => <option key={o}>{o}</option>)}
                  </select>
                </th>
                <th>
                  <select className="form-select" value={filters.site} onChange={(e) => setFilters((s) => ({ ...s, site: e.target.value }))}>
                    {uniqueOptions.site.map((o) => <option key={o}>{o}</option>)}
                  </select>
                </th>
                <th>
                  <select className="form-select" value={filters.type} onChange={(e) => setFilters((s) => ({ ...s, type: e.target.value }))}>
                    {uniqueOptions.type.map((o) => <option key={o}>{o}</option>)}
                  </select>
                </th>
                <th>
                  <select className="form-select" value={filters.priority} onChange={(e) => setFilters((s) => ({ ...s, priority: e.target.value }))}>
                    {uniqueOptions.priority.map((o) => <option key={o}>{o}</option>)}
                  </select>
                </th>
                <th>
                  <select className="form-select" value={filters.purpose} onChange={(e) => setFilters((s) => ({ ...s, purpose: e.target.value }))}>
                    {uniqueOptions.purpose.map((o) => <option key={o}>{o}</option>)}
                  </select>
                </th>
                <th>
                  <select className="form-select" value={filters.materialReq} onChange={(e) => setFilters((s) => ({ ...s, materialReq: e.target.value }))}>
                    {uniqueOptions.materialReq.map((o) => <option key={o}>{o}</option>)}
                  </select>
                </th>
                <th>
                  <select className="form-select" value={filters.status} onChange={(e) => setFilters((s) => ({ ...s, status: e.target.value }))}>
                    {uniqueOptions.status.map((o) => <option key={o}>{o}</option>)}
                  </select>
                </th>
                <th>
                  <select className="form-select" value={filters.raisedBy} onChange={(e) => setFilters((s) => ({ ...s, raisedBy: e.target.value }))}>
                    {uniqueOptions.raisedBy.map((o) => <option key={o}>{o}</option>)}
                  </select>
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((r) => (
                <tr key={r.sno}>
                  <td>{r.sno}</td>
                  <td>{r.date}</td>
                  <td>{r.requiredDate}</td>
                  <td>{r.indentNo}</td>
                  <td>{r.site}</td>
                  <td>{r.type}</td>
                  <td className={`priority-cell ${r.priority === 'Urgent' ? 'urgent' : r.priority === 'Normal' ? 'normal' : ''}`} style={{ fontWeight: 600 }}>{r.priority}</td>
                  <td>{r.purpose}</td>
                  <td>{r.materialReq}</td>
                  <td>{r.status}</td>
                  <td style={{ textAlign: 'center' }}>{r.pmPdApproval ? '✔️' : '⛔'}</td>
                  <td style={{ textAlign: 'center' }}>{r.adminApproval ? '✔️' : '⛔'}</td>
                  <td style={{ textAlign: 'center' }}>
                  <button className="icon-btn" onClick={() => { setViewData(r); setShowView(true); }}>
                    <Eye size={18} />
                  </button>
                </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
