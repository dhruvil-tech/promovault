import React, { useEffect, useState } from 'react';
import { userAPI } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import Topbar from '../../components/Topbar';
import { roleBadge } from '../../components/Badges';
import toast from 'react-hot-toast';

const EMPTY_FORM = { name:'', email:'', password:'', role:'customer' };

export default function UserManagement() {
  const { user: me } = useAuth();
  const [users, setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal]   = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [form, setForm]     = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');

  const load = () => userAPI.getAll().then(r => setUsers(r.data.data)).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const openCreate = () => { setForm(EMPTY_FORM); setEditUser(null); setError(''); setModal(true); };
  const openEdit   = (u)  => { setForm({ name:u.name, email:u.email, password:'', role:u.role }); setEditUser(u); setError(''); setModal(true); };

  const handleSave = async () => {
    setError('');
    if (!form.name || !form.email) return setError('Name and email are required.');
    if (!editUser && !form.password) return setError('Password is required for new users.');
    setSaving(true);
    try {
      if (editUser) {
        const payload = { name: form.name, email: form.email, role: form.role };
        await userAPI.update(editUser._id, payload);
        toast.success('User updated!');
      } else {
        await userAPI.create(form);
        toast.success('User created!');
      }
      setModal(false);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Remove user "${name}"?`)) return;
    try {
      await userAPI.remove(id);
      toast.success(`User "${name}" removed.`);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  if (loading) return <><Topbar title="User Management"><button className="btn btn-accent" onClick={openCreate}>+ Add User</button></Topbar><div className="loader-wrap"><div className="loader" /></div></>;

  return (
    <>
      <Topbar title="User Management">
        <button className="btn btn-accent" onClick={openCreate}>+ Add User</button>
      </Topbar>
      <div className="content-area">
        <div className="table-card">
          <table>
            <thead>
              <tr><th>Name</th><th>Email</th><th>Role</th><th>Joined</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u._id}>
                  <td><strong>{u.name}</strong></td>
                  <td className="text-muted">{u.email}</td>
                  <td>{roleBadge(u.role)}</td>
                  <td className="text-muted" style={{fontSize:12}}>{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td>
                    {u.isActive !== false
                      ? <span className="badge badge-success">Active</span>
                      : <span className="badge badge-danger">Inactive</span>}
                  </td>
                  <td style={{display:'flex', gap:6}}>
                    <button className="btn btn-sm" onClick={() => openEdit(u)}>Edit</button>
                    {u._id !== me._id && (
                      <button className="btn btn-sm btn-danger" onClick={() => handleDelete(u._id, u.name)}>Remove</button>
                    )}
                    {u._id === me._id && <span style={{fontSize:11,color:'var(--text3)',padding:'5px 0'}}>You</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <div className="modal-overlay" onClick={e => e.target.className === 'modal-overlay' && setModal(false)}>
          <div className="modal">
            <button className="modal-close" onClick={() => setModal(false)}>✕</button>
            <div className="modal-title">{editUser ? `Edit: ${editUser.name}` : 'Add New User'}</div>
            {error && <div className="error-msg">{error}</div>}
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input className="form-input" placeholder="John Doe" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-input" type="email" placeholder="john@example.com" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
            </div>
            {!editUser && (
              <div className="form-group">
                <label className="form-label">Password</label>
                <input className="form-input" type="password" placeholder="Min 6 characters" value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
              </div>
            )}
            <div className="form-group">
              <label className="form-label">Role</label>
              <select className="form-input" value={form.role} onChange={e => setForm({...form, role: e.target.value})}>
                <option value="customer">Customer</option>
                <option value="manager">Marketing Manager</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="form-actions">
              <button className="btn" onClick={() => setModal(false)}>Cancel</button>
              <button className="btn btn-accent" onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : editUser ? 'Save Changes' : 'Add User'}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
