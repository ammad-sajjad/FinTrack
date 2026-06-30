import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency, CATEGORIES } from '../../utils/formatters';
import toast from 'react-hot-toast';

export default function Budget() {
  const { user } = useAuth();
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const now = new Date();
  const [period, setPeriod] = useState({ month: now.getMonth() + 1, year: now.getFullYear() });

  const fetch = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/budgets?month=${period.month}&year=${period.year}`);
      setBudgets(res.data.data);
    } catch {
      toast.error('Failed to load budgets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetch(); }, [period]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this budget?')) return;
    try {
      await api.delete(`/budgets/${id}`);
      toast.success('Budget deleted');
      fetch();
    } catch { toast.error('Delete failed'); }
  };

  const totalBudget = budgets.reduce((a, b) => a + b.limit, 0);
  const totalSpent = budgets.reduce((a, b) => a + b.spent, 0);
  const overBudget = budgets.filter(b => b.percentage >= 100);
  const nearLimit = budgets.filter(b => b.percentage >= b.alertThreshold && b.percentage < 100);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, marginBottom: 4 }}>Budgets</h1>
          <p style={{ color: 'var(--text-muted)' }}>Set limits and track spending by category</p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <select className="input" style={{ width: 160 }}
            value={`${period.year}-${period.month}`}
            onChange={e => {
              const [y, m] = e.target.value.split('-');
              setPeriod({ month: +m, year: +y });
            }}>
            {Array.from({ length: 6 }, (_, i) => {
              const d = new Date(now.getFullYear(), now.getMonth() - i);
              const val = `${d.getFullYear()}-${d.getMonth() + 1}`;
              return <option key={val} value={val}>{d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</option>;
            })}
          </select>
          <button className="btn btn-primary" onClick={() => { setEditing(null); setShowModal(true); }}>+ Set Budget</button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid-3" style={{ marginBottom: 24 }}>
        <div className="card">
          <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Total Budget</div>
          <div style={{ fontSize: 22, fontWeight: 700, fontFamily: 'Space Grotesk' }}>{formatCurrency(totalBudget, user?.currency)}</div>
        </div>
        <div className="card">
          <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Total Spent</div>
          <div style={{ fontSize: 22, fontWeight: 700, fontFamily: 'Space Grotesk', color: totalSpent > totalBudget ? 'var(--red)' : 'var(--text)' }}>
            {formatCurrency(totalSpent, user?.currency)}
          </div>
        </div>
        <div className="card">
          <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Remaining</div>
          <div style={{ fontSize: 22, fontWeight: 700, fontFamily: 'Space Grotesk', color: 'var(--green)' }}>
            {formatCurrency(Math.max(0, totalBudget - totalSpent), user?.currency)}
          </div>
        </div>
      </div>

      {/* Alerts */}
      {(overBudget.length > 0 || nearLimit.length > 0) && (
        <div style={{ marginBottom: 20 }}>
          {overBudget.map(b => (
            <div key={b._id} style={{ background: 'var(--red-soft)', border: '1px solid var(--red)', borderRadius: 'var(--radius-sm)', padding: '10px 16px', marginBottom: 8, fontSize: 13 }}>
              🚨 <strong>{b.category}</strong> is over budget! Spent {formatCurrency(b.spent, user?.currency)} of {formatCurrency(b.limit, user?.currency)}
            </div>
          ))}
          {nearLimit.map(b => (
            <div key={b._id} style={{ background: 'var(--yellow-soft)', border: '1px solid var(--yellow)', borderRadius: 'var(--radius-sm)', padding: '10px 16px', marginBottom: 8, fontSize: 13 }}>
              ⚠️ <strong>{b.category}</strong> is at {b.percentage}% of your budget
            </div>
          ))}
        </div>
      )}

      {/* Budget cards */}
      {loading ? (
        <div style={{ color: 'var(--text-muted)', padding: 40 }}>Loading...</div>
      ) : budgets.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="icon">🎯</div>
            <h3>No budgets set</h3>
            <p>Set spending limits for different categories to stay on track.</p>
            <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => setShowModal(true)}>Set your first budget</button>
          </div>
        </div>
      ) : (
        <div className="grid-2">
          {budgets.map(b => {
            const cat = CATEGORIES.find(c => c.name === b.category);
            const barColor = b.percentage >= 100 ? 'var(--red)' : b.percentage >= b.alertThreshold ? 'var(--yellow)' : 'var(--accent)';
            return (
              <div key={b._id} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ fontSize: 24 }}>{cat?.icon || '📦'}</div>
                    <div>
                      <div style={{ fontWeight: 600 }}>{b.category}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{b.period} budget</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => { setEditing(b); setShowModal(true); }}>✏️</button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(b._id)}>🗑</button>
                  </div>
                </div>
                <div style={{ marginBottom: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{formatCurrency(b.spent, user?.currency)} spent</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: barColor }}>{b.percentage}%</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${Math.min(b.percentage, 100)}%`, background: barColor }} />
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                  <span style={{ color: 'var(--text-muted)' }}>Limit: <strong style={{ color: 'var(--text)' }}>{formatCurrency(b.limit, user?.currency)}</strong></span>
                  <span style={{ color: b.remaining === 0 ? 'var(--red)' : 'var(--green)' }}>
                    {formatCurrency(b.remaining, user?.currency)} left
                  </span>
                </div>
                <div style={{ marginTop: 8, fontSize: 11, color: 'var(--text-dim)' }}>
                  Alert at {b.alertThreshold}% threshold
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <BudgetModal
          budget={editing}
          period={period}
          onClose={() => { setShowModal(false); setEditing(null); }}
          onSaved={() => { fetch(); setShowModal(false); setEditing(null); }}
          currency={user?.currency}
        />
      )}
    </div>
  );
}

function BudgetModal({ budget, period, onClose, onSaved, currency }) {
  const [form, setForm] = useState(budget ? {
    category: budget.category, limit: budget.limit, alertThreshold: budget.alertThreshold, period: budget.period
  } : { category: 'Food & Dining', limit: '', alertThreshold: 80, period: 'monthly' });
  const [loading, setLoading] = useState(false);

  const handle = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/budgets', { ...form, month: period.month, year: period.year });
      toast.success(budget ? 'Budget updated!' : 'Budget set!');
      onSaved();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
          <h2 style={{ fontSize: 18 }}>{budget ? 'Edit Budget' : 'Set Budget'}</h2>
          <button onClick={onClose} style={{ background: 'transparent', fontSize: 20, color: 'var(--text-muted)' }}>×</button>
        </div>
        <form onSubmit={handle}>
          <div className="form-group">
            <label className="label">Category</label>
            <select className="input" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
              {CATEGORIES.filter(c => c.name !== 'Income').map(c => <option key={c.name} value={c.name}>{c.icon} {c.name}</option>)}
            </select>
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label className="label">Limit ({currency})</label>
              <input className="input" type="number" placeholder="0.00" step="0.01" min="0" value={form.limit}
                onChange={e => setForm({ ...form, limit: e.target.value })} required />
            </div>
            <div className="form-group">
              <label className="label">Period</label>
              <select className="input" value={form.period} onChange={e => setForm({ ...form, period: e.target.value })}>
                <option value="monthly">Monthly</option>
                <option value="weekly">Weekly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="label">Alert Threshold: {form.alertThreshold}%</label>
            <input type="range" min="10" max="100" step="5" value={form.alertThreshold}
              onChange={e => setForm({ ...form, alertThreshold: +e.target.value })}
              style={{ width: '100%', accentColor: 'var(--accent)' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
              <span>10%</span><span>Alert when spending hits {form.alertThreshold}%</span><span>100%</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : 'Save Budget'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
