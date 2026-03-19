import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const ROLE_DEFAULTS = { customer: '/dashboard', manager: '/manager/dashboard', admin: '/admin/dashboard' };

export default function AuthPage() {
  const [tab, setTab]         = useState('login');
  const [role, setRole]       = useState('customer');
  const [regRole, setRegRole] = useState('customer');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  // Login fields
  const [email, setEmail]     = useState('');
  const [pass, setPass]       = useState('');

  // Register fields
  const [name, setName]       = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPass, setRegPass] = useState('');

  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !pass) return setError('Please enter email and password.');
    setLoading(true);
    try {
      const user = await login(email, pass);
      if (user.role !== role) {
        setError(`This account is registered as "${user.role}", not "${role}".`);
        setLoading(false);
        return;
      }
      toast.success(`Welcome back, ${user.name.split(' ')[0]}! 👋`);
      navigate(ROLE_DEFAULTS[user.role] || '/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    if (!name || !regEmail || !regPass) return setError('All fields are required.');
    if (regPass.length < 6) return setError('Password must be at least 6 characters.');
    setLoading(true);
    try {
      const user = await register({ name, email: regEmail, password: regPass, role: regRole });
      toast.success('Account created! Welcome 🎉');
      navigate(ROLE_DEFAULTS[user.role] || '/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-bg" />
      <div className="auth-grid" />
      <div className="auth-card">
        <div className="auth-logo"><span className="dot" /> PromoVault</div>
        <p className="auth-sub">Coupon &amp; Discount Management System</p>

        <div className="auth-tabs">
          <button className={`auth-tab${tab==='login'?' active':''}`}    onClick={() => { setTab('login');    setError(''); }}>Sign In</button>
          <button className={`auth-tab${tab==='register'?' active':''}`} onClick={() => { setTab('register'); setError(''); }}>Register</button>
        </div>

        {error && <div className="error-msg">{error}</div>}

        {/* ── Login ── */}
        {tab === 'login' && (
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label">Login As</label>
              <div className="role-selector">
                {['customer','manager','admin'].map(r => (
                  <button key={r} type="button" className={`role-btn${role===r?' active':''}`} onClick={() => setRole(r)}>
                    <span className="role-icon">{ {customer:'👤',manager:'📊',admin:'🔐'}[r] }</span>
                    {r.charAt(0).toUpperCase()+r.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-input" type="email" placeholder="you@example.com" value={email} onChange={e=>setEmail(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input className="form-input" type="password" placeholder="••••••••" value={pass} onChange={e=>setPass(e.target.value)} />
            </div>
            <button className="btn-primary" type="submit" disabled={loading}>{loading ? 'Signing in…' : 'Sign In →'}</button>
            {/* <div className="demo-creds">
              <strong>Demo credentials:</strong><br />
              Customer: customer@demo.com / pass123<br />
              Manager: manager@demo.com / pass123<br />
              Admin: admin@demo.com / pass123
            </div> */}
          </form>
        )}

        {/* ── Register ── */}
        {tab === 'register' && (
          <form onSubmit={handleRegister}>
            <div className="form-group">
              <label className="form-label">Register As</label>
              <div className="role-selector">
                {['customer','manager'].map(r => (
                  <button key={r} type="button" className={`role-btn${regRole===r?' active':''}`} onClick={() => setRegRole(r)}>
                    <span className="role-icon">{ {customer:'👤',manager:'📊'}[r] }</span>
                    {r.charAt(0).toUpperCase()+r.slice(1)}
                  </button>
                ))}
                <button type="button" className="role-btn" style={{opacity:.4,cursor:'not-allowed'}}>
                  <span className="role-icon">🔐</span> Admin
                </button>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input className="form-input" type="text" placeholder="John Doe" value={name} onChange={e=>setName(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-input" type="email" placeholder="you@example.com" value={regEmail} onChange={e=>setRegEmail(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input className="form-input" type="password" placeholder="Min 6 characters" value={regPass} onChange={e=>setRegPass(e.target.value)} />
            </div>
            <button className="btn-primary" type="submit" disabled={loading}>{loading ? 'Creating…' : 'Create Account →'}</button>
          </form>
        )}
      </div>
    </div>
  );
}
