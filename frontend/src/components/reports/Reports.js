import React, { useEffect, useState } from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid
} from 'recharts';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency, getCategoryMeta } from '../../utils/formatters';
import toast from 'react-hot-toast';

export default function Reports() {
  const { user } = useAuth();
  const now = new Date();
  const [period, setPeriod] = useState({ month: now.getMonth() + 1, year: now.getFullYear() });
  const [trends, setTrends] = useState([]);
  const [categories, setCategories] = useState([]);
  const [daily, setDaily] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get('/reports/trends?months=6'),
      api.get(`/reports/categories?month=${period.month}&year=${period.year}`),
      api.get(`/reports/daily?month=${period.month}&year=${period.year}`),
    ]).then(([t, c, d]) => {
      setTrends(processTrends(t.data.data));
      setCategories(c.data.data);
      setDaily(processDaily(d.data.data, period));
    }).catch(() => toast.error('Failed to load reports'))
      .finally(() => setLoading(false));
  }, [period]);

  const processTrends = (raw) => {
    const map = {};
    raw.forEach(({ _id, total }) => {
      const key = `${_id.year}-${String(_id.month).padStart(2,'0')}`;
      const label = new Date(_id.year, _id.month - 1).toLocaleDateString('en-US', { month: 'short' });
      if (!map[key]) map[key] = { month: label, income: 0, expenses: 0 };
      if (_id.type === 'income') map[key].income = total;
      else map[key].expenses = total;
    });
    return Object.values(map).sort((a, b) => a.month.localeCompare(b.month));
  };

  const processDaily = (raw, { month, year }) => {
    const daysInMonth = new Date(year, month, 0).getDate();
    const map = {};
    raw.forEach(({ _id, total }) => {
      if (!map[_id.day]) map[_id.day] = { day: _id.day, expense: 0, income: 0 };
      map[_id.day][_id.type] = total;
    });
    return Array.from({ length: daysInMonth }, (_, i) => ({
      day: i + 1,
      expense: map[i + 1]?.expense || 0,
      income: map[i + 1]?.income || 0,
    }));
  };

  const pieData = categories.map(c => ({
    name: c._id, value: c.total, ...getCategoryMeta(c._id)
  }));

  const totalExpenses = categories.reduce((a, c) => a + c.total, 0);

  const handleExport = async () => {
    try {
      const res = await api.get('/reports/export', { responseType: 'blob' });
      const url = URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a'); a.href = url; a.download = 'finance-report.csv'; a.click();
      toast.success('Exported!');
    } catch { toast.error('Export failed'); }
  };

  const ttStyle = { background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', fontSize: 12 };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, marginBottom: 4 }}>Reports</h1>
          <p style={{ color: 'var(--text-muted)' }}>Spending insights and trends</p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <select className="input" style={{ width: 180 }}
            value={`${period.year}-${period.month}`}
            onChange={e => { const [y, m] = e.target.value.split('-'); setPeriod({ month: +m, year: +y }); }}>
            {Array.from({ length: 12 }, (_, i) => {
              const d = new Date(now.getFullYear(), now.getMonth() - i);
              const val = `${d.getFullYear()}-${d.getMonth() + 1}`;
              return <option key={val} value={val}>{d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</option>;
            })}
          </select>
          <button className="btn btn-ghost" onClick={handleExport}>⬇ Export CSV</button>
        </div>
      </div>

      {loading ? <div style={{ color: 'var(--text-muted)', padding: 40 }}>Loading...</div> : (
        <>
          {/* Monthly Trends */}
          <div className="card" style={{ marginBottom: 20 }}>
            <h3 style={{ marginBottom: 20, fontSize: 15 }}>6-Month Income vs Expenses</h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={trends} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" stroke="var(--text-dim)" tick={{ fontSize: 12 }} />
                <YAxis stroke="var(--text-dim)" tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={ttStyle} formatter={v => formatCurrency(v, user?.currency)} />
                <Legend />
                <Bar dataKey="income" fill="#22C55E" radius={[4, 4, 0, 0]} name="Income" />
                <Bar dataKey="expenses" fill="#EF4444" radius={[4, 4, 0, 0]} name="Expenses" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 20, marginBottom: 20 }}>
            {/* Daily spending */}
            <div className="card">
              <h3 style={{ marginBottom: 20, fontSize: 15 }}>Daily Spending This Month</h3>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={daily}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="day" stroke="var(--text-dim)" tick={{ fontSize: 11 }} />
                  <YAxis stroke="var(--text-dim)" tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={ttStyle} formatter={v => formatCurrency(v, user?.currency)} />
                  <Line type="monotone" dataKey="expense" stroke="#EF4444" strokeWidth={2} dot={false} name="Expenses" />
                  <Line type="monotone" dataKey="income" stroke="#22C55E" strokeWidth={2} dot={false} name="Income" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Category breakdown */}
            <div className="card">
              <h3 style={{ marginBottom: 16, fontSize: 15 }}>Category Breakdown</h3>
              {pieData.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={160}>
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" outerRadius={70} dataKey="value" paddingAngle={2}>
                        {pieData.map((e, i) => <Cell key={i} fill={e.color} />)}
                      </Pie>
                      <Tooltip contentStyle={ttStyle} formatter={v => formatCurrency(v, user?.currency)} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{ marginTop: 12, maxHeight: 180, overflowY: 'auto' }}>
                    {categories.map(c => {
                      const meta = getCategoryMeta(c._id);
                      const pct = totalExpenses > 0 ? ((c.total / totalExpenses) * 100).toFixed(1) : 0;
                      return (
                        <div key={c._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: meta.color, flexShrink: 0 }} />
                            <span style={{ fontSize: 12 }}>{meta.icon} {c._id}</span>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: 12, fontWeight: 600 }}>{formatCurrency(c.total, user?.currency)}</div>
                            <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{pct}%</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                <div className="empty-state"><div className="icon">📊</div><p>No expenses this month</p></div>
              )}
            </div>
          </div>

          {/* Summary table */}
          <div className="card">
            <h3 style={{ marginBottom: 16, fontSize: 15 }}>Category Summary</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['Category', 'Transactions', 'Total Spent', '% of Total', 'Trend'].map(h => (
                    <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {categories.map(c => {
                  const meta = getCategoryMeta(c._id);
                  const pct = totalExpenses > 0 ? ((c.total / totalExpenses) * 100).toFixed(1) : 0;
                  return (
                    <tr key={c._id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '10px 12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: 18 }}>{meta.icon}</span>
                          <span style={{ fontSize: 13, fontWeight: 500 }}>{c._id}</span>
                        </div>
                      </td>
                      <td style={{ padding: '10px 12px', fontSize: 13, color: 'var(--text-muted)' }}>{c.count}</td>
                      <td style={{ padding: '10px 12px', fontSize: 13, fontWeight: 600 }}>{formatCurrency(c.total, user?.currency)}</td>
                      <td style={{ padding: '10px 12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div className="progress-bar" style={{ width: 80 }}>
                            <div className="progress-fill" style={{ width: `${pct}%`, background: meta.color }} />
                          </div>
                          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{pct}%</span>
                        </div>
                      </td>
                      <td style={{ padding: '10px 12px', fontSize: 18 }}>
                        {pct > 20 ? '🔴' : pct > 10 ? '🟡' : '🟢'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
