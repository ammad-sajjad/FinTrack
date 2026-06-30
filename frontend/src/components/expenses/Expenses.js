import React, { useEffect, useState, useCallback } from 'react';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency, formatDate, getCategoryMeta, CATEGORIES } from '../../utils/formatters';
import toast from 'react-hot-toast';

export default function Expenses() {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [filters, setFilters] = useState({ category: '', type: '', search: '', page: 1 });

  const fetchExpenses = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: 15, ...filters });
      Object.keys(filters).forEach(k => !filters[k] && params.delete(k));
      const res = await api.get(`/expenses?${params}`);
      setExpenses(res.data.data);
      setPagination(res.data.pagination);
    } catch {
      toast.error('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchExpenses(); }, [fetchExpenses]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this transaction?')) return;
    try {
      await api.delete(`/expenses/${id}`);
      toast.success('Deleted');
      fetchExpenses();
    } catch {
      toast.error('Delete failed');
    }
  };

  const handleExport = async () => {
    try {
      const res = await api.get('/reports/export', { responseType: 'blob' });
      const url = URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url; a.download = 'finance-report.csv'; a.click();
      toast.success('Report exported!');
    } catch {
      toast.error('Export failed');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, marginBottom: 4 }}>Transactions</h1>
          <p style={{ color: 'var(--text-muted)' }}>{pagination.total} total records</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-ghost btn-sm" onClick={handleExport}>⬇ Export CSV</button>
          <button className="btn btn-primary" onClick={() => { setEditing(null); setShowModal(true); }}>+ Add Transaction</button>
        </div>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <input className="input" style={{ flex: 1, minWidth: 200 }} placeholder="Search transactions..."
            value={filters.search} onChange={e => setFilters({ ...filters, search: e.target.value, page: 1 })} />
          <select className="input" style={{ width: 180 }} value={filters.category}
            onChange={e => setFilters({ ...filters, category: e.target.value, page: 1 })}>
            <option value="">All Categories</option>
            {CATEGORIES.map(c => <option key={c.name} value={c.name}>{c.icon} {c.name}</option>)}
          </select>
          <select className="input" style={{ width: 140 }} value={filters.type}
            onChange={e => setFilters({ ...filters, type: e.target.value, page: 1 })}>
            <option value="">All Types</option>
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
          {(filters.search || filters.category || filters.type) && (
            <button className="btn btn-ghost btn-sm" onClick={() => setFilters({ category: '', type: '', search: '', page: 1 })}>✕ Clear</button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              {['Transaction', 'Category', 'Date', 'Type', 'Amount', ''].map(h => (
                <th key={h} style={{ padding: '12px 20px', textAlign: 'left', fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</td></tr>
            ) : expenses.length === 0 ? (
              <tr><td colSpan={6}><div className="empty-state"><div className="icon">💳</div><p>No transactions found</p></div></td></tr>
            ) : expenses.map(exp => {
              const meta = getCategoryMeta(exp.category);
              return (
                <tr key={exp._id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.1s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--surface2)'}
                  onMouseLeave={e => e.currentTarget.style.background = ''}>
                  <td style={{ padding: '12px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--surface2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>{meta.icon}</div>
                      <div>
                        <div style={{ fontWeight: 500, fontSize: 13 }}>{exp.title}</div>
                        {exp.notes && <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{exp.notes}</div>}
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '12px 20px', fontSize: 13, color: 'var(--text-muted)' }}>{exp.category}</td>
                  <td style={{ padding: '12px 20px', fontSize: 13, color: 'var(--text-muted)' }}>{formatDate(exp.date)}</td>
                  <td style={{ padding: '12px 20px' }}>
                    <span className={`badge badge-${exp.type}`}>{exp.type}</span>
                  </td>
                  <td style={{ padding: '12px 20px', fontWeight: 600, color: exp.type === 'income' ? 'var(--green)' : 'var(--red)' }}>
                    {exp.type === 'income' ? '+' : '-'}{formatCurrency(exp.amount, user?.currency)}
                  </td>
                  <td style={{ padding: '12px 20px' }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => { setEditing(exp); setShowModal(true); }}>✏️</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(exp._id)}>🗑</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {pagination.pages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, padding: 16, borderTop: '1px solid var(--border)' }}>
            <button className="btn btn-ghost btn-sm" disabled={filters.page <= 1}
              onClick={() => setFilters(f => ({ ...f, page: f.page - 1 }))}>← Prev</button>
            <span style={{ padding: '5px 12px', fontSize: 13, color: 'var(--text-muted)' }}>
              Page {filters.page} of {pagination.pages}
            </span>
            <button className="btn btn-ghost btn-sm" disabled={filters.page >= pagination.pages}
              onClick={() => setFilters(f => ({ ...f, page: f.page + 1 }))}>Next →</button>
          </div>
        )}
      </div>

      {showModal && (
        <ExpenseModal
          expense={editing}
          onClose={() => { setShowModal(false); setEditing(null); }}
          onSaved={() => { fetchExpenses(); setShowModal(false); setEditing(null); }}
          currency={user?.currency}
        />
      )}
    </div>
  );
}

function ExpenseModal({ expense, onClose, onSaved, currency }) {
  const [form, setForm] = useState(expense ? {
    title: expense.title, amount: expense.amount, category: expense.category,
    type: expense.type, date: expense.date?.split('T')[0], notes: expense.notes || ''
  } : {
    title: '', amount: '', category: 'Food & Dining', type: 'expense',
    date: new Date().toISOString().split('T')[0], notes: ''
  });
  const [loading, setLoading] = useState(false);

  const handle = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (expense) {
        await api.put(`/expenses/${expense._id}`, form);
        toast.success('Updated!');
      } else {
        const res = await api.post('/expenses', form);
        if (res.data.alert) {
          const { alert } = res.data;
          toast.error(`⚠️ Budget alert: ${alert.category} at ${alert.percentage}%!`, { duration: 5000 });
        } else {
          toast.success('Transaction added!');
        }
      }
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
          <h2 style={{ fontSize: 18 }}>{expense ? 'Edit Transaction' : 'New Transaction'}</h2>
          <button onClick={onClose} style={{ background: 'transparent', fontSize: 20, color: 'var(--text-muted)' }}>×</button>
        </div>
        <form onSubmit={handle}>
          <div className="form-group">
            <label className="label">Type</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {['expense', 'income'].map(t => (
                <button key={t} type="button"
                  style={{
                    flex: 1, padding: '10px', borderRadius: 'var(--radius-sm)', fontWeight: 500, fontSize: 14, cursor: 'pointer',
                    background: form.type === t ? (t === 'expense' ? 'var(--red-soft)' : 'var(--green-soft)') : 'var(--surface2)',
                    color: form.type === t ? (t === 'expense' ? 'var(--red)' : 'var(--green)') : 'var(--text-muted)',
                    border: `1px solid ${form.type === t ? (t === 'expense' ? 'var(--red)' : 'var(--green)') : 'var(--border)'}`
                  }}
                  onClick={() => setForm({ ...form, type: t, category: t === 'income' ? 'Income' : 'Food & Dining' })}>
                  {t === 'expense' ? '📉 Expense' : '📈 Income'}
                </button>
              ))}
            </div>
          </div>
          <div className="form-group">
            <label className="label">Title</label>
            <input className="input" placeholder="e.g. Grocery shopping" value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })} required />
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label className="label">Amount</label>
              <input className="input" type="number" placeholder="0.00" step="0.01" min="0.01" value={form.amount}
                onChange={e => setForm({ ...form, amount: e.target.value })} required />
            </div>
            <div className="form-group">
              <label className="label">Date</label>
              <input className="input" type="date" value={form.date}
                onChange={e => setForm({ ...form, date: e.target.value })} required />
            </div>
          </div>
          <div className="form-group">
            <label className="label">Category</label>
            <select className="input" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
              {CATEGORIES.filter(c => form.type === 'income' ? c.name === 'Income' : c.name !== 'Income')
                .map(c => <option key={c.name} value={c.name}>{c.icon} {c.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="label">Notes (optional)</label>
            <input className="input" placeholder="Add a note..." value={form.notes}
              onChange={e => setForm({ ...form, notes: e.target.value })} />
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : expense ? 'Update' : 'Add Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
