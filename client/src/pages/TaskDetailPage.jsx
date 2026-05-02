import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const statusBadge = (s) => {
  const map = { 'To Do': 'badge-todo', 'In Progress': 'badge-inprogress', Done: 'badge-done' };
  return <span className={`badge ${map[s] || ''}`}>{s}</span>;
};
const priorityBadge = (p) => {
  const map = { Low: 'badge-low', Medium: 'badge-medium', High: 'badge-high' };
  return <span className={`badge ${map[p] || ''}`}>{p}</span>;
};

export default function TaskDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    api.get(`/tasks/${id}`)
      .then((res) => setTask(res.data.task))
      .catch(() => {
        toast.error('Task not found.');
        navigate(-1);
      })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const handleStatusChange = async (status) => {
    setUpdating(true);
    try {
      const res = await api.put(`/tasks/${id}`, { status });
      setTask(res.data.task);
      toast.success('Status updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update.');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="page-loader">
        <div className="spinner spinner-dark" style={{ width: 36, height: 36 }} />
      </div>
    );
  }

  const isAssigned = task?.assignedTo?._id === user._id;
  const isOverdue = task?.dueDate && new Date(task.dueDate) < new Date() && task?.status !== 'Done';

  return (
    <div style={{ maxWidth: 700, margin: '0 auto' }}>
      <div className="flex items-center gap-3 mb-4">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
        <h1 style={{ fontSize: '1.3rem', fontWeight: 700 }}>Task Details</h1>
      </div>

      <div className="card">
        <div className="flex justify-between items-center mb-4" style={{ flexWrap: 'wrap', gap: '0.75rem' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>{task?.title}</h2>
          <div className="flex gap-2">
            {priorityBadge(task?.priority)}
            {statusBadge(task?.status)}
          </div>
        </div>

        {task?.description && (
          <div className="detail-section">
            <div className="detail-label">Description</div>
            <p style={{ fontSize: '0.9rem', lineHeight: 1.7 }}>{task.description}</p>
          </div>
        )}

        <div className="detail-grid">
          <div className="detail-item">
            <div className="detail-label">Project</div>
            <Link to={`/projects/${task?.project?._id}`} style={{ color: 'var(--primary)', fontWeight: 500 }}>
              {task?.project?.name}
            </Link>
          </div>
          <div className="detail-item">
            <div className="detail-label">Assigned To</div>
            <div>
              {task?.assignedTo ? (
                <div className="flex items-center gap-2">
                  <div className="avatar avatar-sm">{task.assignedTo.name?.charAt(0).toUpperCase()}</div>
                  <span style={{ fontSize: '0.9rem' }}>{task.assignedTo.name}</span>
                </div>
              ) : (
                <span className="text-muted">Unassigned</span>
              )}
            </div>
          </div>
          <div className="detail-item">
            <div className="detail-label">Created By</div>
            <span style={{ fontSize: '0.9rem' }}>{task?.createdBy?.name}</span>
          </div>
          <div className="detail-item">
            <div className="detail-label">Due Date</div>
            <span style={{ fontSize: '0.9rem', color: isOverdue ? '#ef4444' : 'inherit' }}>
              {task?.dueDate ? format(new Date(task.dueDate), 'MMMM d, yyyy') : '—'}
              {isOverdue && ' ⚠ Overdue'}
            </span>
          </div>
          <div className="detail-item">
            <div className="detail-label">Created</div>
            <span style={{ fontSize: '0.9rem' }}>
              {task?.createdAt ? format(new Date(task.createdAt), 'MMM d, yyyy') : '—'}
            </span>
          </div>
          <div className="detail-item">
            <div className="detail-label">Last Updated</div>
            <span style={{ fontSize: '0.9rem' }}>
              {task?.updatedAt ? format(new Date(task.updatedAt), 'MMM d, yyyy') : '—'}
            </span>
          </div>
        </div>

        {/* Status update for assigned member */}
        {isAssigned && (
          <div className="status-update-section">
            <div className="detail-label mb-2">Update Status</div>
            <div className="flex gap-2 flex-wrap">
              {['To Do', 'In Progress', 'Done'].map((s) => (
                <button
                  key={s}
                  className={`btn btn-sm ${task?.status === s ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => handleStatusChange(s)}
                  disabled={updating || task?.status === s}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <style>{`
        .back-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px; height: 32px;
          border-radius: 8px;
          border: 1px solid var(--border);
          background: var(--surface);
          color: var(--text-muted);
          cursor: pointer;
          flex-shrink: 0;
        }
        .back-btn:hover { background: var(--bg); color: var(--text); }
        .detail-section { margin-bottom: 1.25rem; }
        .detail-label {
          font-size: 0.78rem;
          font-weight: 600;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 0.35rem;
        }
        .detail-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.25rem;
          margin-bottom: 1.25rem;
        }
        .detail-item {}
        .status-update-section {
          border-top: 1px solid var(--border);
          padding-top: 1.25rem;
          margin-top: 0.5rem;
        }
        @media (max-width: 480px) {
          .detail-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
