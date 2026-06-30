import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency, formatDate, getCategoryMeta } from '../../utils/formatters';

export default function Dashboard() {
  const { user } = useAuth();
  const [summary, setSummary] = useState([]);
  const [recentExpenses, setRecentExpenses] = useState([]);
  const [trends, setTrends] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const now = new Date();
    const m = now.getMonth() + 1;
    const y = now.getFullYear();

    Promise.all([
      api.get(`/expenses/summary?month=${m}&year=${y}`),
      api.get('/expenses?limit=5'),
      api.get('/reports/trends?months=6'),
      api.get(`/budgets?month=${m}&year=${y}`),
    ]).then(([sum, exp, trend, bud]) => {
      setSummary(sum.data.data);
      setRecentExpenses(exp.data.data);
      setTrends(processTrends(trend.data.data));
      setBudgets(bud.data.data.filter(b => b.spent > 0));
    }).finally(() => setLoading(false));
  }, []);

  const processTrends = (raw) => {
    const map = {};
    raw.forEach(({ _id, total }) => {
      const key = `${_id.year}-${String(_id.month).padStart(2,'0')}`;
      if (!map[key]) map[key] = { month: key, income: 0, expenses: 0 };
      if (_id.type === 'income') map[key].income = total;
      else map[key].expenses = total;
    });
    return Object.values(map).sort((a, b) => a.month.localeCompare(b.month));
  };

  const totalExpenses = summary.filter(s => s._id.type === 'expense').reduce((a, s) => a + s.total, 0);
  const totalIncome = summary.filter(s => s._id.type === 'income').reduce((a, s) => a + s.total, 0);
  const net = totalIncome - totalExpenses;

  const pieData = summary.filter(s => s._id.type === 'expense').map(s => ({
    name: s._id.category, value: s.total, ...getCategoryMeta(s._id.category)
  }));

  if (loading) return <div style={{ color: 'var(--text-muted)', padding: 40 }}>Loading...</div>;

  const stats = [
    { label: 'Income', value: formatCurrency(totalIncome, user?.currency), color: 'var(--green)', icon: '📈' },
    { label: 'Expenses', value: formatCurrency(totalExpenses, user?.currency), color: 'var(--red)', icon: '📉' },
    { label: 'Net Savings', value: formatCurrency(net, user?.currency), color: net >= 0 ? 'var(--green)' : 'var(--red)', icon: '💰' },
    { label: 'Transactions', value: summary.reduce((a, s) => a + s.count, 0), color: 'var(--accent)', icon: '📋' },
  ];

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, marginBottom: 4 }}>Good {greeting()}, {user?.name?.split(' ')[0]} 👋</h1>
        <p style={{ color: 'var(--text-muted)' }}>Here's your financial snapshot for {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
      </div>

      {/* Stats */}
      <div className="grid-4" style={{ marginBottom: 24 }}>
        {stats.map(s => (
          <div key={s.label} className="card" style={{ position: 'relative', overflow: 'hidden' }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>{s.icon} {s.label}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: s.color, fontFamily: 'Space Grotesk' }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20, marginBottom: 20 }}>
        {/* Trend chart */}
        <div className="card">
          <h3 style={{ marginBottom: 20, fontSize: 15 }}>Income vs Expenses</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={trends}>
              <defs>
                <linearGradient id="gIncome" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22C55E" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gExpense" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" stroke="var(--text-dim)" tick={{ fontSize: 11 }} />
              <YAxis stroke="var(--text-dim)" tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)' }} />
              <Area type="monotone" dataKey="income" stroke="#22C55E" fill="url(#gIncome)" strokeWidth={2} />
              <Area type="monotone" dataKey="expenses" stroke="#EF4444" fill="url(#gExpense)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Category pie */}
        <div className="card">
          <h3 style={{ marginBottom: 20, fontSize: 15 }}>By Category</h3>
          {pieData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={140}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="value" paddingAngle={2}>
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', fontSize: 12 }} formatter={(v) => formatCurrency(v, user?.currency)} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ marginTop: 12 }}>
                {pieData.slice(0, 4).map(d => (
                  <div key={d.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: d.color }} />
                      <span style={{ color: 'var(--text-muted)' }}>{d.name}</span>
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 600 }}>{formatCurrency(d.value, user?.currency)}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="empty-state"><div className="icon">📊</div><p>No expenses yet</p></div>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Recent transactions */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: 15 }}>Recent Transactions</h3>
            <Link to="/expenses" style={{ fontSize: 12, color: 'var(--accent)' }}>View all →</Link>
          </div>
          {recentExpenses.length > 0 ? recentExpenses.map(exp => {
            const meta = getCategoryMeta(exp.category);
            return (
              <div key={exp._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--surface2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>{meta.icon}</div>
                  <div>
                    <div style={{ fontWeight: 500, fontSize: 13 }}>{exp.title}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{formatDate(exp.date)}</div>
                  </div>
                </div>
                <span style={{ fontWeight: 600, color: exp.type === 'income' ? 'var(--green)' : 'var(--red)', fontSize: 14 }}>
                  {exp.type === 'income' ? '+' : '-'}{formatCurrency(exp.amount, user?.currency)}
                </span>
              </div>
            );
          }) : (
            <div className="empty-state"><div className="icon">💳</div><p>No transactions yet</p></div>
          )}
        </div>

        {/* Budget alerts */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: 15 }}>Budget Status</h3>
            <Link to="/budget" style={{ fontSize: 12, color: 'var(--accent)' }}>Manage →</Link>
          </div>
          {budgets.length > 0 ? budgets.slice(0, 5).map(b => (
            <div key={b._id} style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 500 }}>{b.category}</span>
                <span style={{ fontSize: 12, color: b.percentage >= 90 ? 'var(--red)' : b.percentage >= 75 ? 'var(--yellow)' : 'var(--text-muted)' }}>
                  {b.percentage}%
                </span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{
                  width: `${Math.min(b.percentage, 100)}%`,
                  background: b.percentage >= 90 ? 'var(--red)' : b.percentage >= 75 ? 'var(--yellow)' : 'var(--accent)'
                }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{formatCurrency(b.spent, user?.currency)} spent</span>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>of {formatCurrency(b.limit, user?.currency)}</span>
              </div>
            </div>
          )) : (
            <div className="empty-state"><div className="icon">🎯</div><p>No budgets set yet</p></div>
          )}
        </div>
      </div>
    </div>
  );
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}
