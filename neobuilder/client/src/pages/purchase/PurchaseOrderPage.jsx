import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Plus, Pencil } from 'lucide-react';
import AddOrderModal from '../../components/purchase/AddOrderModal';
import { useLocation, useNavigate } from 'react-router-dom';
import { sidebarGroups } from '../../config/mastersConfig';

export default function PurchaseOrderPage() {
  const [showAdd, setShowAdd] = useState(false);
  const [editOrder, setEditOrder] = useState(null);
  const [portalTarget, setPortalTarget] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const currentGroup = sidebarGroups.find((group) =>
    group.items?.some((item) => location.pathname.startsWith(item.path))
  );
  const groupItems = currentGroup?.items || [];

  useEffect(() => {
    setPortalTarget(document.getElementById('header-actions-target'));
  }, []);

  const initialRows = [
    { id: 1, date: '30/05/2026', poNo: 'ISRO-Tiruchendur/25-26/PO-24', indentNo: 'ISRO-Tiruchendur/25/26/45', quoteRef: '45.1', site: 'ISRO - Tiruchendur', supplier: 'Southern Aluminium Co', total: '29087', status: 'Approved', mdApproved: true },
    { id: 2, date: '30/05/2026', poNo: 'IPRCL/25-26/PO-23', indentNo: 'IPRCL/25/26/48', quoteRef: '48.01', site: 'IPRCL', supplier: 'ESWAR ENTERPRISES', total: '7306.56', status: 'Approved', mdApproved: true },
    { id: 3, date: '29/05/2026', poNo: 'KAL/25-26/PO-22', indentNo: 'KAL/25/26/47', quoteRef: '47.02', site: 'Kalpakkam', supplier: 'VRIDHII STEEL P LTD', total: '1085010', status: 'Approved', mdApproved: true },
    { id: 4, date: '29/05/2026', poNo: 'ISRO-Tiruchendur/25-26/PO-21', indentNo: 'ISRO-Tiruchendur/25/26/40', quoteRef: '40.1', site: 'ISRO - Tiruchendur', supplier: 'Unik Flyash Bricks & Tiles', total: '41440', status: 'Approved', mdApproved: true },
    { id: 5, date: '28/05/2026', poNo: 'MEPZ/25-26/PO-20', indentNo: 'MEPZ/25/26/46', quoteRef: '46.04', site: 'MEPZ', supplier: 'Sri Vinayaga Paints', total: '12248.4', status: 'Approved', mdApproved: true },
  ];

  const [rows, setRows] = useState(initialRows);

  function handleSaved(data) {
    if (editOrder) {
      setRows((p) => p.map((r) => r.id === editOrder.id ? {
        ...r,
        date: data.date,
        poNo: data.poNo || '',
        indentNo: data.indentNo || r.indentNo,
        quoteRef: data.quoteRef || r.quoteRef,
        site: data.site || r.site,
        supplier: data.supplier || r.supplier,
        total: data.total || r.total,
        status: data.status || r.status,
        mdApproved: data.mdApproved,
        notes: data.notes || r.notes,
      } : r));
      setEditOrder(null);
    } else {
      const newRow = {
        id: rows.length ? Math.max(...rows.map(r => r.id)) + 1 : 1,
        date: data.date,
        poNo: data.poNo || '',
        indentNo: data.indentNo || '-',
        quoteRef: data.quoteRef || '',
        site: data.site || '',
        supplier: data.supplier || '',
        total: data.total || '0',
        status: data.status || 'Not Approved',
        mdApproved: data.mdApproved,
        notes: data.notes || '',
      };
      setRows((p) => [newRow, ...p]);
    }
    setShowAdd(false);
  }

  return (
    <div className="page">
      {groupItems.length > 0 && (
        <div className="master-group-titles" style={{ marginBottom: '16px' }}>
          {groupItems.map((item) => (
            <button
              key={item.path}
              className={`master-group-title-btn ${location.pathname === item.path ? 'active' : ''}`}
              onClick={() => navigate(item.path)}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
      <div className="page-header">
        <div>
          <h1>Purchase Order</h1>
        </div>
      </div>

      {portalTarget && createPortal(
        <button className="header-add-rejected" onClick={() => setShowAdd(true)}>
          <span className="pulse-icon"><Plus size={14} /></span>
          Add Order
        </button>,
        portalTarget
      )}

      {showAdd && <AddOrderModal initialData={editOrder} onClose={() => { setShowAdd(false); setEditOrder(null); }} onSaved={handleSaved} />}

      <div className="table-card" style={{ padding: '12px 16px 8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>Show</span>
            <select className="form-select" style={{ width: 90 }}>
              <option>10</option>
              <option>25</option>
              <option>50</option>
            </select>
            <span>entries</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <label style={{ color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>Search:</label>
            <input className="form-input" style={{ width: 180, minWidth: 140 }} placeholder="Search..." />
          </div>
        </div>
        <div style={{ overflowX: 'auto', width: '100%' }}>
          <table className="data-table" style={{ minWidth: 1100, width: '100%' }}>
            <thead>
            <tr>
              <th>Sno</th>
              <th>Date</th>
              <th>Po.No</th>
              <th>Indent No</th>
              <th>Quote Ref No</th>
              <th>Site</th>
              <th>Supplier</th>
              <th>Total</th>
              <th>Status</th>
              <th>MD Approval</th>
              <th>Update</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, idx) => (
              <tr key={r.id}>
                <td>{idx + 1}</td>
                <td>{r.date}</td>
                <td>{r.poNo}</td>
                <td>{r.indentNo}</td>
                <td>{r.quoteRef}</td>
                <td>{r.site}</td>
                <td>{r.supplier}</td>
                <td>{r.total}</td>
                <td>{r.status}</td>
                <td style={{ textAlign: 'center' }}>{r.mdApproved ? '✔️' : '⛔'}</td>
                <td style={{ textAlign: 'center' }}>
                  <button className="icon-btn" onClick={() => { setEditOrder(r); setShowAdd(true); }}>
                    <Pencil size={16} />
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
