import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handle = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.logo}>💰</div>
        <h1 style={styles.title}>FinTrack</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: 28, fontSize: 14 }}>
          Sign in to your account
        </p>
        <form onSubmit={handle}>
          <div className="form-group">
            <label className="label">Email</label>
            <input
              className="input"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label className="label">Password</label>
            <input
              className="input"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%', justifyContent: 'center', padding: '12px', marginTop: 8 }}
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: 20, color: 'var(--text-muted)', fontSize: 13 }}>
          No account?{' '}
          <Link to="/register" style={{ color: 'var(--accent)' }}>Create one</Link>
        </p>
        <div style={styles.demo}>
          <p style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 8 }}>Demo credentials</p>
          <code style={{ fontSize: 12, color: 'var(--text-muted)' }}>demo@fintrack.com / demo123</code>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--bg)',
    padding: 16
  },
  card: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    padding: '40px 36px',
    width: '100%',
    maxWidth: 400,
    textAlign: 'center'
  },
  logo: { fontSize: 40, marginBottom: 8 },
  title: { fontSize: 28, fontWeight: 700, marginBottom: 6 },
  demo: {
    marginTop: 24,
    padding: '12px 16px',
    background: 'var(--surface2)',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--border)'
  }
};
