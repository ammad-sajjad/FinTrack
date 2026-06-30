import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export default function Settings() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({ name: user?.name || '', currency: user?.currency || 'USD', monthlyBudget: user?.monthlyBudget || '' });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);

  const handleProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.put('/auth/profile', form);
      updateUser(res.data.user);
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 style={{ fontSize: 24, marginBottom: 4 }}>Settings</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: 28 }}>Manage your account and preferences</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Profile */}
        <div className="card">
          <h3 style={{ marginBottom: 20, fontSize: 15 }}>Profile</h3>
          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <div style={{
              width: 72, height: 72, background: 'var(--accent)', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 28, fontWeight: 700, color: '#fff', margin: '0 auto 12px'
            }}>
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div style={{ fontWeight: 600 }}>{user?.name}</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{user?.email}</div>
          </div>
          <form onSubmit={handleProfile}>
            <div className="form-group">
              <label className="label">Full Name</label>
              <input className="input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="form-group">
              <label className="label">Currency</label>
              <select className="input" value={form.currency} onChange={e => setForm({ ...form, currency: e.target.value })}>
                <option value="USD">USD — US Dollar</option>
                <option value="EUR">EUR — Euro</option>
                <option value="GBP">GBP — British Pound</option>
                <option value="JPY">JPY — Japanese Yen</option>
                <option value="PKR">PKR — Pakistani Rupee</option>
                <option value="INR">INR — Indian Rupee</option>
                <option value="CAD">CAD — Canadian Dollar</option>
                <option value="AUD">AUD — Australian Dollar</option>
              </select>
            </div>
            <div className="form-group">
              <label className="label">Monthly Budget Goal</label>
              <input className="input" type="number" placeholder="0.00" value={form.monthlyBudget}
                onChange={e => setForm({ ...form, monthlyBudget: e.target.value })} />
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
              {loading ? 'Saving...' : 'Save Profile'}
            </button>
          </form>
        </div>

        {/* Info cards */}
        <div>
          <div className="card" style={{ marginBottom: 16 }}>
            <h3 style={{ marginBottom: 16, fontSize: 15 }}>About FinTrack</h3>
            <div style={{ color: 'var(--text-muted)', fontSize: 13, lineHeight: 1.7 }}>
              <p style={{ marginBottom: 8 }}>FinTrack is your personal finance companion. Track income and expenses, set budgets with alerts, and gain insights into your spending habits.</p>
              <p>Built with React, Node.js, and MongoDB.</p>
            </div>
          </div>

          <div className="card" style={{ marginBottom: 16 }}>
            <h3 style={{ marginBottom: 16, fontSize: 15 }}>Features</h3>
            {[
              ['💳', 'Transaction tracking', 'Log income and expenses with categories'],
              ['🎯', 'Budget alerts', 'Get notified when approaching limits'],
              ['📊', 'Spending analytics', 'Visualize trends and patterns'],
              ['⬇', 'Export reports', 'Download CSV reports anytime'],
            ].map(([icon, title, desc]) => (
              <div key={title} style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
                <span style={{ fontSize: 20, flexShrink: 0 }}>{icon}</span>
                <div>
                  <div style={{ fontWeight: 500, fontSize: 13 }}>{title}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="card">
            <h3 style={{ marginBottom: 12, fontSize: 15 }}>Data</h3>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12 }}>
              Export all your financial data as a CSV file at any time from the Transactions or Reports page.
            </p>
            <div style={{ fontSize: 12, color: 'var(--text-dim)', padding: '8px 12px', background: 'var(--surface2)', borderRadius: 'var(--radius-sm)' }}>
              Your data is stored securely and never shared with third parties.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
