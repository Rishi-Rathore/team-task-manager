import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setError('Please fill in all fields.');
      return;
    }
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
            <rect width="24" height="24" rx="6" fill="#6366f1"/>
            <path d="M7 12l3 3 7-7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <h1>TaskFlow</h1>
        </div>
        <h2 className="auth-title">Welcome back</h2>
        <p className="auth-subtitle">Sign in to your account</p>

        {error && <div className="error-msg">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              name="email"
              className="form-input"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              name="password"
              className="form-input"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              autoComplete="current-password"
              required
            />
          </div>
          <button type="submit" className="btn btn-primary w-full" disabled={loading}>
            {loading ? <span className="spinner" /> : null}
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="auth-footer">
          Don't have an account?{' '}
          <Link to="/signup" className="auth-link">Create one</Link>
        </p>
      </div>

      <style>{`
        .auth-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 1rem;
        }
        .auth-card {
          background: white;
          border-radius: 16px;
          padding: 2.5rem;
          width: 100%;
          max-width: 420px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.15);
        }
        .auth-logo {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1.5rem;
        }
        .auth-logo h1 {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--primary);
        }
        .auth-title {
          font-size: 1.5rem;
          font-weight: 700;
          margin-bottom: 0.25rem;
        }
        .auth-subtitle {
          color: var(--text-muted);
          margin-bottom: 1.5rem;
          font-size: 0.9rem;
        }
        .auth-footer {
          text-align: center;
          margin-top: 1.25rem;
          font-size: 0.875rem;
          color: var(--text-muted);
        }
        .auth-link { color: var(--primary); font-weight: 500; }
        .auth-link:hover { text-decoration: underline; }
      `}</style>
    </div>
  );
}
