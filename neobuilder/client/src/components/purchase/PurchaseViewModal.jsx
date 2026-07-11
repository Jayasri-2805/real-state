import { X } from 'lucide-react';

function formatLabel(key) {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/(^\w)/, (c) => c.toUpperCase())
    .replace(/\bPm\b/i, 'PM')
    .replace(/\bPd\b/i, 'PD')
    .replace(/\bMd\b/i, 'MD');
}

export default function PurchaseViewModal({ title = 'View', data, onClose }) {
  if (!data) return null;

  const details = Object.entries(data).map(([key, value]) => ({
    label: formatLabel(key),
    value: value === undefined || value === null || value === '' ? '—' : String(value),
  }));

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel view-modal modal-narrow" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{title} Details</h3>
          <button className="icon-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        <div className="modal-body">
          <div className="details-grid">
            {details.map((item) => (
              <div key={item.label} className="detail-item">
                <span className="detail-label">{item.label}</span>
                <span className="detail-value">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
