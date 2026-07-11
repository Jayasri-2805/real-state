import { useEffect, useState, useCallback } from 'react';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import { roleApi } from '../../api/masterApi';
import { useToast } from '../../contexts/ToastContext';
import { useConfirm } from '../../contexts/ConfirmContext';
import EmptyState from '../../components/common/EmptyState';
import StatusBadge from '../../components/common/StatusBadge';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../../api/authApi';
import { setAccessToken } from '../../api/axiosClient';

function UserFormModal({ user, roles, onClose, onSaved, toast }) {
  const isEdit = Boolean(user?._id);
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    password: '',
    roleId: user?.role?._id || user?.role || '',
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (isEdit) {
        await axiosClient.put(`/users/${user._id}`, { name: form.name, roleId: form.roleId });
        toast.success('User updated successfully');
      } else {
        await axiosClient.post('/users', form);
        toast.success('User invited successfully');
      }
      onSaved();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save user');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-panel">
        <div className="modal-header">
          <h3>{isEdit ? 'Edit User' : 'Add User'}</h3>
          <button className="icon-btn" onClick={onClose}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-grid">
              <div className="form-group">
                <label>Name<span className="required-mark">*</span></label>
                <input className="form-input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Email<span className="required-mark">*</span></label>
                <input className="form-input" type="email" required disabled={isEdit} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              {!isEdit && (
                <div className="form-group">
                  <label>Temporary Password<span className="required-mark">*</span></label>
                  <input className="form-input" type="password" required minLength={8} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
                </div>
              )}
              <div className="form-group">
                <label>Role<span className="required-mark">*</span></label>
                <select className="form-select" required value={form.roleId} onChange={(e) => setForm({ ...form, roleId: e.target.value })}>
                  <option value="">Select role</option>
                  {roles.map((r) => (
                    <option key={r._id} value={r._id}>{r.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function UsersPage() {
  const toast = useToast();
  const confirm = useConfirm();
  const { user: authUser, logout, setUser } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [usersRes, rolesRes] = await Promise.all([axiosClient.get('/users'), roleApi.list()]);
      setUsers(usersRes.data.data || []);
      setRoles(rolesRes.data.data || []);
    } catch {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleToggleStatus = async (user) => {
    try {
      const nextStatus = user.status === 'Active' ? 'Inactive' : 'Active';
      await axiosClient.patch(`/users/${user._id}/status`, { status: nextStatus });
      toast.success('Status updated');
      // If the current user's status was changed to non-active, force logout
      if (authUser && authUser.id === user._id && nextStatus !== 'Active') {
        await logout();
        navigate('/login');
        return;
      }

      // If the current user's status was changed from Inactive -> Active, require manual login and redirect to profile after sign in
      if (authUser && authUser.id === user._id && nextStatus === 'Active') {
        await logout();
        localStorage.setItem('requireLoginAfterReactivation', '1');
        toast.info('Account reactivated — please sign in again');
        navigate('/login', { state: { from: '/settings/company-profile' } });
        return;
      }
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    }
  };

  const handleDelete = async (user) => {
    const ok = await confirm({ title: 'Remove User', message: `Remove ${user.name} from this company?`, confirmText: 'Remove' });
    if (!ok) return;
    try {
      await axiosClient.delete(`/users/${user._id}`);
      toast.success('User removed');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove user');
    }
  };

  return (
    <div className="page">
      <div style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '16px' }}>
        <span>Home</span> / <span style={{ color: 'var(--text)' }}>Users</span>
      </div>

      <div className="page-header">
        <div>
          <h1>Users</h1>
          <p className="page-subtitle">Manage user accounts and role assignments</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditingUser(null); setModalOpen(true); }}>
          <Plus size={16} /> Add User
        </button>
      </div>

      <div className="table-card">
        {loading ? (
          <div className="table-loading">Loading…</div>
        ) : users.length === 0 ? (
          <EmptyState title="No users yet" description="Invite your team to get started." />
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th className="col-actions">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id}>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td>{u.role?.name || '—'}</td>
                    <td>
                      <button className="badge-btn" onClick={() => handleToggleStatus(u)}>
                        <StatusBadge status={u.status} />
                      </button>
                    </td>
                    <td className="col-actions">
                      <button className="icon-btn" onClick={() => { setEditingUser(u); setModalOpen(true); }}><Pencil size={15} /></button>
                      <button className="icon-btn danger" onClick={() => handleDelete(u)}><Trash2 size={15} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalOpen && (
        <UserFormModal
          user={editingUser}
          roles={roles}
          toast={toast}
          onClose={() => setModalOpen(false)}
          onSaved={() => { setModalOpen(false); fetchData(); }}
        />
      )}
    </div>
  );
}
