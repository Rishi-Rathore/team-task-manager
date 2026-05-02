import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';

const CreateProjectModal = ({ onClose, onCreated }) => {
  const [form, setForm] = useState({ name: '', description: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setLoading(true);
    try {
      const res = await api.post('/projects', form);
      toast.success('Project created!');
      onCreated(res.data.project);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create project.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Create New Project</h3>
          <button className="btn-icon" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Project Name *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Website Redesign"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              required
              autoFocus
            />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-input"
              rows={3}
              placeholder="Brief description of the project..."
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              style={{ resize: 'vertical' }}
            />
          </div>
          <div className="flex gap-3 justify-end">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <span className="spinner" /> : null}
              {loading ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    api.get('/projects')
      .then((res) => setProjects(res.data.projects))
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

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Projects</h1>
          <p className="page-subtitle">{projects.length} project{projects.length !== 1 ? 's' : ''} found</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          New Project
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="empty-state">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
          </svg>
          <h3>No projects yet</h3>
          <p>Create your first project to get started.</p>
          <button className="btn btn-primary mt-4" onClick={() => setShowModal(true)}>
            Create Project
          </button>
        </div>
      ) : (
        <div className="projects-grid">
          {projects.map((project) => (
            <Link to={`/projects/${project._id}`} key={project._id} className="project-card">
              <div className="project-card-header">
                <div className="project-icon">
                  {project.name.charAt(0).toUpperCase()}
                </div>
                <span className={`badge ${project.myRole === 'Admin' ? 'badge-admin' : 'badge-member'}`}>
                  {project.myRole}
                </span>
              </div>
              <h3 className="project-name">{project.name}</h3>
              {project.description && (
                <p className="project-desc">{project.description}</p>
              )}
              <div className="project-meta">
                <span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                  {project.members?.length} member{project.members?.length !== 1 ? 's' : ''}
                </span>
                <span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                  {new Date(project.createdAt).toLocaleDateString()}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {showModal && (
        <CreateProjectModal
          onClose={() => setShowModal(false)}
          onCreated={(p) => setProjects((prev) => [p, ...prev])}
        />
      )}

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
        .projects-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1.25rem;
        }
        .project-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 1.25rem;
          box-shadow: var(--shadow);
          transition: all 0.2s;
          display: block;
        }
        .project-card:hover {
          box-shadow: var(--shadow-md);
          transform: translateY(-2px);
          border-color: var(--primary);
        }
        .project-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 0.875rem;
        }
        .project-icon {
          width: 40px; height: 40px;
          background: var(--primary-light);
          color: var(--primary-dark);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 1.1rem;
        }
        .project-name {
          font-size: 1rem;
          font-weight: 600;
          margin-bottom: 0.4rem;
        }
        .project-desc {
          font-size: 0.85rem;
          color: var(--text-muted);
          margin-bottom: 0.875rem;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .project-meta {
          display: flex;
          gap: 1rem;
          font-size: 0.8rem;
          color: var(--text-muted);
        }
        .project-meta span {
          display: flex;
          align-items: center;
          gap: 0.3rem;
        }
      `}</style>
    </div>
  );
}
