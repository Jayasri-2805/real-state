import { useState } from 'react';
import { X } from 'lucide-react';

export default function AddIndentModal({ initialData, onClose, onSaved }) {
  const [form, setForm] = useState({
    date: new Date().toLocaleDateString('en-GB'),
    site: initialData?.site || 'Kalpakkam',
    type: initialData?.type || 'Tendered',
    purpose: initialData?.purpose || '',
  });

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (onSaved) onSaved(form);
    else console.log('Submitting indent', form);
    onClose();
  }

  return (
    <div className="modal-overlay">
      <div className={`modal-panel modal-narrow`}>
        <div className="modal-header">
          <h3 style={{ margin: 0, color: 'var(--accent)' }}>Add New</h3>
          <button className="icon-btn" onClick={onClose}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label>Date</label>
              <input className="form-input" name="date" value={form.date} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>Type</label>
              <select className="form-select" name="type" value={form.type} onChange={handleChange}>
                <option>Tendered</option>
                <option>Non Tender</option>
              </select>
            </div>

            <div className="form-group">
              <label>Site</label>
              <select className="form-select" name="site" value={form.site} onChange={handleChange}>
                <option>Kalpakkam</option>
                <option>CRO Kilpauk</option>
              </select>
            </div>

            <div className="form-group">
              <label>Purpose Of Indent</label>
              <input className="form-input" name="purpose" value={form.purpose} onChange={handleChange} />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" style={{ background: '#22c55e', borderColor: '#22c55e' }}>Submit</button>
          </div>
        </form>
      </div>
    </div>
  );
}
