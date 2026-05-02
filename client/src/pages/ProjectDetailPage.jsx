import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

// ─── Helpers ────────────────────────────────────────────────────────────────
const statusBadge = (s) => {
  const map = { 'To Do': 'badge-todo', 'In Progress': 'badge-inprogress', Done: 'badge-done' };
  return <span className={`badge ${map[s] || ''}`}>{s}</span>;
};
const priorityBadge = (p) => {
  const map = { Low: 'badge-low', Medium: 'badge-medium', High: 'badge-high' };
  return <span className={`badge ${map[p] || ''}`}>{p}</span>;
};

// ─── Task Form Modal ─────────────────────────────────────────────────────────
const TaskModal = ({ projectId, members, task, onClose, onSaved }) => {
  const isEdit = !!task;
  const [form, setForm] = useState({
    title: task?.title || '',
    description: task?.description || '',
    assignedTo: task?.assignedTo?._id || '',
    priority: task?.priority || 'Medium',
    status: task?.status || 'To Do',
    dueDate: task?.dueDate ? task.dueDate.split('T')[0] : '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...form, project: projectId };
      if (!payload.assignedTo) delete payload.assignedTo;
      if (!payload.dueDate) delete payload.dueDate;

      let res;
      if (isEdit) {
        res = await api.put(`/tasks/${task._id}`, payload);
      } else {
        res = await api.post('/tasks', payload);
      }
      toast.success(isEdit ? 'Task updated!' : 'Task created!');
      onSaved(res.data.task, isEdit);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save task.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 560 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{isEdit ? 'Edit Task' : 'Create Task'}</h3>
          <button className="btn-icon" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Title *</label>
            <input
              type="text"
              className="form-input"
              placeholder="Task title"
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              required
              autoFocus
            />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-input"
              rows={3}
              placeholder="Task description..."
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              style={{ resize: 'vertical' }}
            />
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Priority</label>
              <select
                className="form-select"
                value={form.priority}
                onChange={(e) => setForm((p) => ({ ...p, priority: e.target.value }))}
              >
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select
                className="form-select"
                value={form.status}
                onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}
              >
                <option>To Do</option>
                <option>In Progress</option>
                <option>Done</option>
              </select>
            </div>
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Assign To</label>
              <select
                className="form-select"
                value={form.assignedTo}
                onChange={(e) => setForm((p) => ({ ...p, assignedTo: e.target.value }))}
              >
                <option value="">Unassigned</option>
                {members.map((m) => (
                  <option key={m.user._id} value={m.user._id}>
                    {m.user.name} ({m.role})
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Due Date</label>
              <input
                type="date"
                className="form-input"
                value={form.dueDate}
                onChange={(e) => setForm((p) => ({ ...p, dueDate: e.target.value }))}
              />
            </div>
          </div>
          <div className="flex gap-3 justify-end">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <span className="spinner" /> : null}
              {loading ? 'Saving...' : isEdit ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Add Member Modal ────────────────────────────────────────────────────────
const AddMemberModal = ({ projectId, onClose, onAdded }) => {
  const [form, setForm] = useState({ email: '', role: 'Member' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post(`/projects/${projectId}/members`, form);
      toast.success('Member added successfully!');
      onAdded(res.data.project);
      onClose();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to add member.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Add Member</h3>
          <button className="btn-icon" onClick={onClose}>✕</button>
        </div>

        {/* Info box */}
        <div style={{
          background: '#eff6ff',
          border: '1px solid #bfdbfe',
          borderRadius: 8,
          padding: '0.75rem 1rem',
          marginBottom: '1rem',
          fontSize: '0.82rem',
          color: '#1d4ed8',
          lineHeight: 1.6,
        }}>
          <strong>ℹ️ Note:</strong> The person must first <strong>Sign Up</strong> on TaskFlow before you can add them as a member.
        </div>

        {error && (
          <div className="error-msg" style={{ marginBottom: '1rem' }}>
            {error.includes('not found') || error.includes('not found')
              ? '❌ User not found — Make sure this person has signed up on TaskFlow first.'
              : error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Registered Email *</label>
            <input
              type="email"
              className="form-input"
              placeholder="member@example.com"
              value={form.email}
              onChange={(e) => { setForm((p) => ({ ...p, email: e.target.value })); setError(''); }}
              required
              autoFocus
            />
          </div>
          <div className="form-group">
            <label className="form-label">Role</label>
            <select
              className="form-select"
              value={form.role}
              onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}
            >
              <option value="Member">Member — Can view & update assigned tasks</option>
              <option value="Admin">Admin — Can manage all tasks & members</option>
            </select>
          </div>
          <div className="flex gap-3 justify-end">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <span className="spinner" /> : null}
              {loading ? 'Adding...' : 'Add Member'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function ProjectDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('tasks');
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');

  const isAdmin = project?.myRole === 'Admin';

  const fetchData = useCallback(async () => {
    try {
      const [projRes, taskRes] = await Promise.all([
        api.get(`/projects/${id}`),
        api.get(`/tasks/project/${id}`),
      ]);
      setProject(projRes.data.project);
      setTasks(taskRes.data.tasks);
    } catch (err) {
      toast.error('Failed to load project.');
      navigate('/projects');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleDeleteProject = async () => {
    if (!window.confirm('Delete this project and all its tasks? This cannot be undone.')) return;
    try {
      await api.delete(`/projects/${id}`);
      toast.success('Project deleted.');
      navigate('/projects');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete project.');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      setTasks((prev) => prev.filter((t) => t._id !== taskId));
      toast.success('Task deleted.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete task.');
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!window.confirm('Remove this member from the project?')) return;
    try {
      const res = await api.delete(`/projects/${id}/members/${userId}`);
      setProject(res.data.project);
      toast.success('Member removed.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove member.');
    }
  };

  const handleTaskSaved = (task, isEdit) => {
    if (isEdit) {
      setTasks((prev) => prev.map((t) => (t._id === task._id ? task : t)));
    } else {
      setTasks((prev) => [task, ...prev]);
    }
  };

  const filteredTasks = tasks.filter((t) => {
    if (filterStatus && t.status !== filterStatus) return false;
    if (filterPriority && t.priority !== filterPriority) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="page-loader">
        <div className="spinner spinner-dark" style={{ width: 36, height: 36 }} />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="proj-header">
        <div className="flex items-center gap-3">
          <Link to="/projects" className="back-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="page-title">{project?.name}</h1>
              <span className={`badge ${isAdmin ? 'badge-admin' : 'badge-member'}`}>
                {project?.myRole}
              </span>
            </div>
            {project?.description && (
              <p className="page-subtitle">{project.description}</p>
            )}
          </div>
        </div>
        {isAdmin && (
          <button className="btn btn-danger btn-sm" onClick={handleDeleteProject}>
            Delete Project
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button
          className={`tab ${activeTab === 'tasks' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('tasks')}
        >
          Tasks ({tasks.length})
        </button>
        <button
          className={`tab ${activeTab === 'members' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('members')}
        >
          Members ({project?.members?.length})
        </button>
      </div>

      {/* Tasks Tab */}
      {activeTab === 'tasks' && (
        <div>
          <div className="tasks-toolbar">
            <div className="flex gap-2 flex-wrap">
              <select
                className="form-select"
                style={{ width: 'auto' }}
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="">All Status</option>
                <option>To Do</option>
                <option>In Progress</option>
                <option>Done</option>
              </select>
              <select
                className="form-select"
                style={{ width: 'auto' }}
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
              >
                <option value="">All Priority</option>
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
            </div>
            {isAdmin && (
              <button className="btn btn-primary btn-sm" onClick={() => { setEditingTask(null); setShowTaskModal(true); }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                Add Task
              </button>
            )}
          </div>

          {filteredTasks.length === 0 ? (
            <div className="empty-state">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
              </svg>
              <h3>No tasks found</h3>
              <p>{isAdmin ? 'Create the first task for this project.' : 'No tasks assigned to you yet.'}</p>
            </div>
          ) : (
            <div className="task-table-wrap">
              <table className="task-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Assigned To</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Due Date</th>
                    {isAdmin && <th>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {filteredTasks.map((task) => {
                    const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'Done';
                    return (
                      <tr key={task._id} className={isOverdue ? 'overdue-row' : ''}>
                        <td>
                          <div className="task-title-cell">
                            <span className="task-title">{task.title}</span>
                            {task.description && (
                              <span className="task-desc-preview">{task.description}</span>
                            )}
                          </div>
                        </td>
                        <td>
                          {task.assignedTo ? (
                            <div className="assignee">
                              <div className="avatar avatar-sm">{task.assignedTo.name?.charAt(0).toUpperCase()}</div>
                              <span className="text-sm">{task.assignedTo.name}</span>
                            </div>
                          ) : (
                            <span className="text-muted text-sm">Unassigned</span>
                          )}
                        </td>
                        <td>{priorityBadge(task.priority)}</td>
                        <td>
                          {!isAdmin && task.assignedTo?._id === user._id ? (
                            <StatusDropdown task={task} onUpdate={(updated) => {
                              setTasks((prev) => prev.map((t) => t._id === updated._id ? updated : t));
                            }} />
                          ) : (
                            statusBadge(task.status)
                          )}
                        </td>
                        <td>
                          {task.dueDate ? (
                            <span className={isOverdue ? 'overdue-date' : 'text-sm'}>
                              {format(new Date(task.dueDate), 'MMM d, yyyy')}
                              {isOverdue && ' ⚠'}
                            </span>
                          ) : (
                            <span className="text-muted text-sm">—</span>
                          )}
                        </td>
                        {isAdmin && (
                          <td>
                            <div className="flex gap-2">
                              <button
                                className="btn-icon"
                                title="Edit"
                                onClick={() => { setEditingTask(task); setShowTaskModal(true); }}
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                </svg>
                              </button>
                              <button
                                className="btn-icon"
                                title="Delete"
                                style={{ color: '#ef4444' }}
                                onClick={() => handleDeleteTask(task._id)}
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <polyline points="3 6 5 6 21 6"/>
                                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                                  <path d="M10 11v6"/><path d="M14 11v6"/>
                                  <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                                </svg>
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Members Tab */}
      {activeTab === 'members' && (
        <div>
          <div className="tasks-toolbar">
            <h3 className="font-semibold">Team Members</h3>
            {isAdmin && (
              <button className="btn btn-primary btn-sm" onClick={() => setShowMemberModal(true)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                Add Member
              </button>
            )}
          </div>
          {isAdmin && (
            <div style={{
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: 8,
              padding: '0.75rem 1rem',
              marginBottom: '1rem',
              fontSize: '0.82rem',
              color: '#15803d',
            }}>
              💡 <strong>To add a member:</strong> The person must first create an account at <strong>/signup</strong>, then enter their registered email here.
            </div>
          )}
          <div className="members-list">
            {project?.members?.map((m) => (
              <div key={m.user._id} className="member-card">
                <div className="avatar">{m.user.name?.charAt(0).toUpperCase()}</div>
                <div className="flex-1">
                  <div className="font-semibold">{m.user.name}</div>
                  <div className="text-sm text-muted">{m.user.email}</div>
                </div>
                <span className={`badge ${m.role === 'Admin' ? 'badge-admin' : 'badge-member'}`}>
                  {m.role}
                </span>
                {isAdmin && m.user._id !== user._id && (
                  <button
                    className="btn-icon"
                    style={{ color: '#ef4444' }}
                    title="Remove member"
                    onClick={() => handleRemoveMember(m.user._id)}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      {showTaskModal && (
        <TaskModal
          projectId={id}
          members={project?.members || []}
          task={editingTask}
          onClose={() => { setShowTaskModal(false); setEditingTask(null); }}
          onSaved={handleTaskSaved}
        />
      )}
      {showMemberModal && (
        <AddMemberModal
          projectId={id}
          onClose={() => setShowMemberModal(false)}
          onAdded={(updatedProject) => setProject(updatedProject)}
        />
      )}

      <style>{`
        .proj-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
          gap: 1rem;
        }
        .page-title { font-size: 1.4rem; font-weight: 700; }
        .page-subtitle { color: var(--text-muted); font-size: 0.875rem; margin-top: 0.2rem; }
        .back-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px; height: 32px;
          border-radius: 8px;
          border: 1px solid var(--border);
          background: var(--surface);
          color: var(--text-muted);
          flex-shrink: 0;
        }
        .back-btn:hover { background: var(--bg); color: var(--text); }
        .tabs {
          display: flex;
          gap: 0;
          border-bottom: 2px solid var(--border);
          margin-bottom: 1.25rem;
        }
        .tab {
          padding: 0.6rem 1.25rem;
          font-size: 0.9rem;
          font-weight: 500;
          color: var(--text-muted);
          background: none;
          border: none;
          border-bottom: 2px solid transparent;
          margin-bottom: -2px;
          transition: all 0.15s;
        }
        .tab:hover { color: var(--text); }
        .tab-active { color: var(--primary); border-bottom-color: var(--primary); }
        .tasks-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1rem;
          flex-wrap: wrap;
          gap: 0.75rem;
        }
        .task-table-wrap {
          overflow-x: auto;
          border-radius: var(--radius);
          border: 1px solid var(--border);
          box-shadow: var(--shadow);
        }
        .task-table {
          width: 100%;
          border-collapse: collapse;
          background: var(--surface);
        }
        .task-table th {
          padding: 0.75rem 1rem;
          text-align: left;
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--text-muted);
          background: var(--bg);
          border-bottom: 1px solid var(--border);
          white-space: nowrap;
        }
        .task-table td {
          padding: 0.875rem 1rem;
          border-bottom: 1px solid var(--border);
          vertical-align: middle;
        }
        .task-table tr:last-child td { border-bottom: none; }
        .task-table tr:hover td { background: var(--bg); }
        .overdue-row td { background: #fff5f5; }
        .task-title-cell { display: flex; flex-direction: column; gap: 0.2rem; }
        .task-title { font-size: 0.9rem; font-weight: 500; }
        .task-desc-preview {
          font-size: 0.78rem;
          color: var(--text-muted);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 200px;
        }
        .assignee { display: flex; align-items: center; gap: 0.5rem; }
        .overdue-date { color: #ef4444; font-size: 0.875rem; font-weight: 500; }
        .members-list { display: flex; flex-direction: column; gap: 0.75rem; }
        .member-card {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem 1.25rem;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          box-shadow: var(--shadow);
        }
      `}</style>
    </div>
  );
}

// Inline status dropdown for members
function StatusDropdown({ task, onUpdate }) {
  const [loading, setLoading] = useState(false);

  const handleChange = async (e) => {
    const status = e.target.value;
    setLoading(true);
    try {
      const res = await api.put(`/tasks/${task._id}`, { status });
      onUpdate(res.data.task);
      toast.success('Status updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <select
      className="form-select"
      style={{ width: 'auto', fontSize: '0.8rem', padding: '0.3rem 0.6rem' }}
      value={task.status}
      onChange={handleChange}
      disabled={loading}
    >
      <option>To Do</option>
      <option>In Progress</option>
      <option>Done</option>
    </select>
  );
}
