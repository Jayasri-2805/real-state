import { useMemo, useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { Plus, Eye } from 'lucide-react';
import AddIndentModal from '../../components/purchase/AddIndentModal';
import PurchaseViewModal from '../../components/purchase/PurchaseViewModal';
import { sidebarGroups } from '../../config/mastersConfig';

const SAMPLE = [
  { sno: 1, date: '30/05/2026', pno: 'IPRCL/25/26/50', site: 'IPRCL', notes: 'Arch gate tiles work', status: 'PM Approved', raisedBy: 'PM', pmPdApproval: true, tenderApproval: false, purchaseApproval: false, mdApproval: false },
  { sno: 2, date: '29/05/2026', pno: 'IPRCL/25/26/49', site: 'IPRCL', notes: 'Painting work', status: 'PM Approved', raisedBy: 'PM', pmPdApproval: true, tenderApproval: false, purchaseApproval: false, mdApproval: false },
  { sno: 3, date: '29/05/2026', pno: 'IPRCL/25/26/48', site: 'IPRCL', notes: 'Admin building', status: 'PM Approved', raisedBy: 'PM', pmPdApproval: true, tenderApproval: false, purchaseApproval: false, mdApproval: false },
  { sno: 4, date: '28/05/2026', pno: 'KAL/25/26/47', site: 'Kalpakkam', notes: 'Steel requirement', status: 'PM Approved', raisedBy: 'PM', pmPdApproval: true, tenderApproval: false, purchaseApproval: false, mdApproval: false },
];

export default function RejectedPurchasePage() {
  const [search, setSearch] = useState('');
  const [showCount, setShowCount] = useState(10);
  const [showAdd, setShowAdd] = useState(false);
  const [showView, setShowView] = useState(false);
  const [viewData, setViewData] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [portalTarget, setPortalTarget] = useState(null);

  // navigation already displays group items; remove duplicate header chips
  const currentGroup = sidebarGroups.find((group) =>
    group.items?.some((item) => location.pathname.startsWith(item.path))
  );
  const groupItems = currentGroup?.items || [];

  useEffect(() => {
    setPortalTarget(document.getElementById('header-actions-target'));
  }, []);

  const [rows, setRows] = useState(SAMPLE);

  const filteredRows = useMemo(() => {
    if (!search) return rows;
    return rows.filter((r) => Object.values(r).join(' ').toLowerCase().includes(search.toLowerCase()));
  }, [search, rows]);

  return (
    <div className="page">
      {/* master group chips removed from header; use sidebar navigation instead */}

      {portalTarget && createPortal(
        <button className="header-add-rejected icon-only" aria-label="Add Rejected" onClick={() => setShowAdd(true)}>
          <span className="pulse-icon"><Plus size={14} /></span>
        </button>,
        portalTarget
      )}

      <div className="page-header">
        <div>
          <h1>Rejected Purchase</h1>
        </div>
      </div>

      <div className="table-card" style={{ padding: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <label>Show</label>
            <select className="form-select" value={showCount} onChange={(e) => setShowCount(Number(e.target.value))} style={{ width: 80 }}>
              <option>10</option>
              <option>25</option>
              <option>50</option>
            </select>
            <span>entries</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <label>Search:</label>
            <input value={search} onChange={(e) => setSearch(e.target.value)} className="form-input" style={{ width: 200 }} />
          </div>
        </div>

        <div style={{ overflowX: 'auto', width: '100%' }}>
          <table className="data-table rejected-table" style={{ minWidth: 1100, width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th>Sno</th>
                <th>Date</th>
                <th>PNo</th>
                <th>Site</th>
                <th>Notes</th>
                <th>Status</th>
                <th>Raised By</th>
                <th>PM/PD Approval</th>
                <th>Tender Approval</th>
                <th>Purchase Approval</th>
                <th>MD Approval</th>
                <th>View</th>
              </tr>
            </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.sno}>
                <td>{r.sno}</td>
                <td>{r.date}</td>
                <td>{r.pno}</td>
                <td>{r.site}</td>
                <td>{r.notes}</td>
                <td>{r.status}</td>
                <td>{r.raisedBy}</td>
                <td style={{ textAlign: 'center' }}>{r.pmPdApproval ? <span style={{ color: '#16a34a' }}>✔️</span> : <span style={{ color: '#ef4444' }}>⛔</span>}</td>
                <td style={{ textAlign: 'center' }}>{r.tenderApproval ? <span style={{ color: '#16a34a' }}>✔️</span> : <span style={{ color: '#ef4444' }}>⛔</span>}</td>
                <td style={{ textAlign: 'center' }}>{r.purchaseApproval ? <span style={{ color: '#16a34a' }}>✔️</span> : <span style={{ color: '#ef4444' }}>⛔</span>}</td>
                <td style={{ textAlign: 'center' }}>{r.mdApproval ? <span style={{ color: '#16a34a' }}>✔️</span> : <span style={{ color: '#ef4444' }}>⛔</span>}</td>
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
      {showAdd && (
        <AddIndentModal
          onClose={() => setShowAdd(false)}
          onSaved={(data) => {
            // create new row from form data and add to list
            const next = {
              sno: rows.length + 1,
              date: data.date || new Date().toLocaleDateString('en-GB'),
              pno: `NEW/${Date.now()}`,
              site: data.site || 'Unknown',
              notes: data.purpose || '',
              status: 'Rejected',
              raisedBy: 'User',
              pmPdApproval: false,
              tenderApproval: false,
              purchaseApproval: false,
              mdApproval: false,
            };
            setRows((prev) => [next, ...prev]);
            setShowAdd(false);
          }}
        />
      )}
      {showView && <PurchaseViewModal title="Rejected Purchase" data={viewData} onClose={() => setShowView(false)} />}
    </div>
  );
}
