import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { format, isPast } from 'date-fns';

const StatCard = ({ label, value, color, icon }) => (
  <div className="stat-card" style={{ borderTop: `3px solid ${color}` }}>
    <div className="stat-icon" style={{ background: color + '20', color }}>{icon}</div>
    <div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  </div>
);

const priorityBadge = (p) => {
  const map = { Low: 'badge-low', Medium: 'badge-medium', High: 'badge-high' };
  return <span className={`badge ${map[p] || ''}`}>{p}</span>;
};

const statusBadge = (s) => {
  const map = { 'To Do': 'badge-todo', 'In Progress': 'badge-inprogress', Done: 'badge-done' };
  return <span className={`badge ${map[s] || ''}`}>{s}</span>;
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard')
      .then((res) => setData(res.data.dashboard))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="page-loader">
        <div className="spinner spinner-dark" style={{ width: 36, height: 36 }} />
      </div>
    );
  }

  const d = data || {};

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Welcome back, {user?.name}! Here's your overview.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid-4 mb-4">
        <StatCard
          label="Total Projects"
          value={d.totalProjects ?? 0}
          color="#6366f1"
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
            </svg>
          }
        />
        <StatCard
          label="Total Tasks"
          value={d.totalTasks ?? 0}
          color="#3b82f6"
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
            </svg>
          }
        />
        <StatCard
          label="In Progress"
          value={d.tasksByStatus?.['In Progress'] ?? 0}
          color="#f59e0b"
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
          }
        />
        <StatCard
          label="Overdue"
          value={d.overdueCount ?? 0}
          color="#ef4444"
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          }
        />
      </div>

      <div className="dashboard-grid">
        {/* Tasks by Status */}
        <div className="card">
          <h3 className="section-title">Tasks by Status</h3>
          <div className="status-bars">
            {Object.entries(d.tasksByStatus || {}).map(([status, count]) => {
              const total = d.totalTasks || 1;
              const pct = Math.round((count / total) * 100);
              const colors = { 'To Do': '#94a3b8', 'In Progress': '#f59e0b', Done: '#10b981' };
              return (
                <div key={status} className="status-bar-item">
                  <div className="flex justify-between text-sm mb-1">
                    <span>{status}</span>
                    <span className="font-semibold">{count}</span>
                  </div>
                  <div className="progress-track">
                    <div
                      className="progress-fill"
                      style={{ width: `${pct}%`, background: colors[status] }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tasks per User */}
        <div className="card">
          <h3 className="section-title">Tasks per Member</h3>
          {d.tasksByUser?.length > 0 ? (
            <div className="user-task-list">
              {d.tasksByUser.map((item) => (
                <div key={item.user._id} className="user-task-item">
                  <div className="avatar avatar-sm">{item.user.name?.charAt(0).toUpperCase()}</div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold">{item.user.name}</div>
                    <div className="text-sm text-muted">{item.user.email}</div>
                  </div>
                  <span className="task-count-badge">{item.count} tasks</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted text-sm">No assigned tasks yet.</p>
          )}
        </div>

        {/* Recent Tasks */}
        <div className="card">
          <h3 className="section-title">Recent Tasks</h3>
          {d.recentTasks?.length > 0 ? (
            <div className="task-list">
              {d.recentTasks.map((task) => (
                <div key={task._id} className="task-list-item">
                  <div className="flex-1">
                    <div className="text-sm font-semibold">{task.title}</div>
                    <div className="text-sm text-muted">{task.project?.name}</div>
                  </div>
                  <div className="flex gap-2 items-center">
                    {priorityBadge(task.priority)}
                    {statusBadge(task.status)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted text-sm">No tasks yet.</p>
          )}
        </div>

        {/* Overdue Tasks */}
        <div className="card">
          <h3 className="section-title" style={{ color: '#ef4444' }}>
            ⚠ Overdue Tasks ({d.overdueCount ?? 0})
          </h3>
          {d.overdueTasks?.length > 0 ? (
            <div className="task-list">
              {d.overdueTasks.map((task) => (
                <div key={task._id} className="task-list-item overdue-item">
                  <div className="flex-1">
                    <div className="text-sm font-semibold">{task.title}</div>
                    <div className="text-sm text-muted">
                      Due: {task.dueDate ? format(new Date(task.dueDate), 'MMM d, yyyy') : 'N/A'}
                    </div>
                  </div>
                  {priorityBadge(task.priority)}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted text-sm" style={{ color: '#10b981' }}>
              ✓ No overdue tasks!
            </p>
          )}
        </div>
      </div>

      <style>{`
        .page-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
          gap: 1rem;
        }
        .page-title { font-size: 1.5rem; font-weight: 700; }
        .page-subtitle { color: var(--text-muted); font-size: 0.9rem; margin-top: 0.25rem; }
        .stat-card {
          background: var(--surface);
          border-radius: var(--radius);
          border: 1px solid var(--border);
          padding: 1.25rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          box-shadow: var(--shadow);
        }
        .stat-icon {
          width: 44px; height: 44px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .stat-value { font-size: 1.75rem; font-weight: 700; line-height: 1; }
        .stat-label { font-size: 0.8rem; color: var(--text-muted); margin-top: 0.25rem; }
        .dashboard-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.25rem;
        }
        .section-title { font-size: 1rem; font-weight: 600; margin-bottom: 1rem; }
        .status-bar-item { margin-bottom: 0.875rem; }
        .progress-track {
          height: 8px;
          background: var(--bg);
          border-radius: 4px;
          overflow: hidden;
        }
        .progress-fill {
          height: 100%;
          border-radius: 4px;
          transition: width 0.5s ease;
          min-width: 4px;
        }
        .user-task-list { display: flex; flex-direction: column; gap: 0.75rem; }
        .user-task-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.5rem;
          border-radius: 8px;
          background: var(--bg);
        }
        .task-count-badge {
          background: var(--primary-light);
          color: var(--primary-dark);
          padding: 0.2rem 0.6rem;
          border-radius: 999px;
          font-size: 0.75rem;
          font-weight: 600;
          white-space: nowrap;
        }
        .task-list { display: flex; flex-direction: column; gap: 0.5rem; }
        .task-list-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.75rem;
          padding: 0.625rem 0.75rem;
          border-radius: 8px;
          background: var(--bg);
          flex-wrap: wrap;
        }
        .overdue-item { background: #fef2f2; }
        @media (max-width: 768px) {
          .dashboard-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
