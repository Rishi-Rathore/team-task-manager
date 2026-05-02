import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const NavItem = ({ to, icon, label }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `nav-item ${isActive ? 'nav-item-active' : ''}`
    }
  >
    <span className="nav-icon">{icon}</span>
    <span>{label}</span>
  </NavLink>
);

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <div className="layout">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <rect width="24" height="24" rx="6" fill="#6366f1"/>
              <path d="M7 12l3 3 7-7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>TaskFlow</span>
          </div>
          <button className="sidebar-close" onClick={() => setSidebarOpen(false)}>✕</button>
        </div>

        <nav className="sidebar-nav">
          <NavItem
            to="/dashboard"
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
              </svg>
            }
            label="Dashboard"
          />
          <NavItem
            to="/projects"
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
              </svg>
            }
            label="Projects"
          />
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="avatar">{user?.name?.charAt(0).toUpperCase()}</div>
            <div>
              <div className="user-name">{user?.name}</div>
              <div className="user-email">{user?.email}</div>
            </div>
          </div>
          <button className="btn btn-secondary btn-sm w-full mt-2" onClick={handleLogout}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Logout
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main content */}
      <main className="main-content">
        <header className="topbar">
          <button className="btn-icon mobile-menu-btn" onClick={() => setSidebarOpen(true)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="6" x2="21" y2="6"/>
              <line x1="3" y1="12" x2="21" y2="12"/>
              <line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
          <div className="topbar-right">
            <div className="avatar avatar-sm">{user?.name?.charAt(0).toUpperCase()}</div>
            <span className="text-sm font-semibold">{user?.name}</span>
          </div>
        </header>
        <div className="page-content">
          <Outlet />
        </div>
      </main>

      <style>{`
        .layout {
          display: flex;
          min-height: 100vh;
        }
        .sidebar {
          width: 240px;
          background: var(--surface);
          border-right: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          position: fixed;
          top: 0; left: 0; bottom: 0;
          z-index: 100;
          transition: transform 0.25s ease;
        }
        .sidebar-header {
          padding: 1.25rem 1rem;
          border-bottom: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .logo {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          font-size: 1.1rem;
          font-weight: 700;
          color: var(--primary);
        }
        .sidebar-close { display: none; background: none; border: none; font-size: 1rem; color: var(--text-muted); }
        .sidebar-nav {
          flex: 1;
          padding: 1rem 0.75rem;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }
        .nav-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.6rem 0.875rem;
          border-radius: 8px;
          font-size: 0.9rem;
          font-weight: 500;
          color: var(--text-muted);
          transition: all 0.15s;
        }
        .nav-item:hover { background: var(--bg); color: var(--text); }
        .nav-item-active { background: var(--primary-light); color: var(--primary-dark); }
        .sidebar-footer {
          padding: 1rem;
          border-top: 1px solid var(--border);
        }
        .user-info {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 0.5rem;
        }
        .avatar {
          width: 36px; height: 36px;
          background: var(--primary);
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 0.9rem;
          flex-shrink: 0;
        }
        .avatar-sm { width: 30px; height: 30px; font-size: 0.8rem; }
        .user-name { font-size: 0.875rem; font-weight: 600; }
        .user-email { font-size: 0.75rem; color: var(--text-muted); }
        .main-content {
          flex: 1;
          margin-left: 240px;
          display: flex;
          flex-direction: column;
          min-height: 100vh;
        }
        .topbar {
          background: var(--surface);
          border-bottom: 1px solid var(--border);
          padding: 0.75rem 1.5rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: sticky;
          top: 0;
          z-index: 50;
        }
        .topbar-right { display: flex; align-items: center; gap: 0.75rem; }
        .mobile-menu-btn { display: none; }
        .page-content { padding: 1.5rem; flex: 1; }
        .sidebar-overlay { display: none; }

        @media (max-width: 768px) {
          .sidebar { transform: translateX(-100%); }
          .sidebar-open { transform: translateX(0); }
          .sidebar-close { display: block; }
          .sidebar-overlay {
            display: block;
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.4);
            z-index: 99;
          }
          .main-content { margin-left: 0; }
          .mobile-menu-btn { display: flex; }
        }
      `}</style>
    </div>
  );
}
