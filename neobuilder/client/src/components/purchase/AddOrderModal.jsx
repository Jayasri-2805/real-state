import { useState } from 'react';
import { X } from 'lucide-react';

export default function AddOrderModal({ initialData, onClose, onSaved }) {
  const [form, setForm] = useState({
    date: initialData?.date || new Date().toLocaleDateString('en-GB'),
    poNo: initialData?.poNo || '',
    indentNo: initialData?.indentNo || '',
    quoteRef: initialData?.quoteRef || '',
    site: initialData?.site || '',
    supplier: initialData?.supplier || '',
    total: initialData?.total || '',
    status: initialData?.status || 'Not Approved',
    mdApproved: initialData?.mdApproved ?? false,
    notes: initialData?.notes || '',
  });
  const title = initialData ? 'Update Purchase Order' : 'Add Purchase Order';
  const submitLabel = initialData ? 'Update' : 'Create';

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((s) => ({ ...s, [name]: type === 'checkbox' ? checked : value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (onSaved) onSaved(form);
    onClose();
  }

  return (
    <div className="modal-overlay">
      <div className={`modal-panel modal-narrow`}>
        <div className="modal-header">
          <h3 style={{ margin: 0, color: 'var(--accent)' }}>{title}</h3>
          <button className="icon-btn" onClick={onClose}><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label>Date</label>
              <input className="form-input" name="date" value={form.date} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>PO No</label>
              <input className="form-input" name="poNo" value={form.poNo} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>Indent No</label>
              <input className="form-input" name="indentNo" value={form.indentNo} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>Quote Ref No</label>
              <input className="form-input" name="quoteRef" value={form.quoteRef} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>Site</label>
              <input className="form-input" name="site" value={form.site} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>Supplier</label>
              <input className="form-input" name="supplier" value={form.supplier} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>Total</label>
              <input className="form-input" name="total" value={form.total} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>Status</label>
              <input className="form-input" name="status" value={form.status} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>
                <input type="checkbox" name="mdApproved" checked={form.mdApproved} onChange={handleChange} />
                {' '}MD Approved
              </label>
            </div>

            <div className="form-group">
              <label>Notes</label>
              <textarea className="form-input" name="notes" value={form.notes} onChange={handleChange} rows={4} />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" style={{ background: '#22c55e', borderColor: '#22c55e' }}>{submitLabel}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
