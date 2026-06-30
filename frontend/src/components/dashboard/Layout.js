import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const nav = [
  { to: '/', label: 'Dashboard', icon: '⬛', exact: true },
  { to: '/expenses', label: 'Transactions', icon: '💳' },
  { to: '/budget', label: 'Budgets', icon: '🎯' },
  { to: '/reports', label: 'Reports', icon: '📊' },
  { to: '/settings', label: 'Settings', icon: '⚙️' },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success('Signed out');
    navigate('/login');
  };

  return (
    <div style={styles.root}>
      <aside style={{ ...styles.sidebar, width: collapsed ? 64 : 220 }}>
        <div style={styles.logoRow}>
          {!collapsed && <span style={styles.logoText}>💰 FinTrack</span>}
          <button style={styles.collapseBtn} onClick={() => setCollapsed(!collapsed)}>
            {collapsed ? '▶' : '◀'}
          </button>
        </div>

        <nav style={styles.nav}>
          {nav.map(({ to, label, icon, exact }) => (
            <NavLink
              key={to}
              to={to}
              end={exact}
              style={({ isActive }) => ({
                ...styles.navLink,
                background: isActive ? 'var(--accent-soft)' : 'transparent',
                color: isActive ? 'var(--accent)' : 'var(--text-muted)',
                borderLeft: isActive ? '2px solid var(--accent)' : '2px solid transparent',
              })}
            >
              <span style={styles.navIcon}>{icon}</span>
              {!collapsed && <span>{label}</span>}
            </NavLink>
          ))}
        </nav>

        <div style={styles.userSection}>
          {!collapsed && (
            <div style={styles.userInfo}>
              <div style={styles.avatar}>{user?.name?.[0]?.toUpperCase()}</div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{user?.name}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{user?.currency}</div>
              </div>
            </div>
          )}
          <button onClick={handleLogout} style={styles.logoutBtn} title="Sign out">🚪</button>
        </div>
      </aside>

      <main style={styles.main}>
        <div className="page-enter">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

const styles = {
  root: { display: 'flex', minHeight: '100vh', background: 'var(--bg)' },
  sidebar: {
    background: 'var(--surface)',
    borderRight: '1px solid var(--border)',
    display: 'flex',
    flexDirection: 'column',
    transition: 'width 0.2s ease',
    position: 'sticky',
    top: 0,
    height: '100vh',
    overflow: 'hidden',
    flexShrink: 0,
  },
  logoRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '20px 16px',
    borderBottom: '1px solid var(--border)',
  },
  logoText: { fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 16 },
  collapseBtn: {
    background: 'transparent',
    color: 'var(--text-muted)',
    fontSize: 10,
    padding: '4px 6px',
    borderRadius: 4,
    cursor: 'pointer',
    border: '1px solid var(--border)',
    flexShrink: 0,
  },
  nav: { flex: 1, padding: '12px 0', overflowY: 'auto' },
  navLink: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '10px 16px',
    fontSize: 13,
    fontWeight: 500,
    transition: 'all 0.1s',
    whiteSpace: 'nowrap',
    textDecoration: 'none',
  },
  navIcon: { fontSize: 16, flexShrink: 0 },
  userSection: {
    padding: 12,
    borderTop: '1px solid var(--border)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  userInfo: { display: 'flex', alignItems: 'center', gap: 8, overflow: 'hidden' },
  avatar: {
    width: 32,
    height: 32,
    background: 'var(--accent)',
    color: '#fff',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
    fontSize: 14,
    flexShrink: 0,
  },
  logoutBtn: {
    background: 'transparent',
    fontSize: 16,
    cursor: 'pointer',
    flexShrink: 0,
    padding: 4,
  },
  main: { flex: 1, padding: 24, overflow: 'auto' },
};
