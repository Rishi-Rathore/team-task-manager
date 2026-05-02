import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import ProjectsPage from './pages/ProjectsPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import TaskDetailPage from './pages/TaskDetailPage';

// Layout
import Layout from './components/Layout';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="page-loader">
        <div className="spinner spinner-dark" style={{ width: 36, height: 36 }} />
      </div>
    );
  }
  return user ? children : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <Navigate to="/dashboard" replace /> : children;
};

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Navigate to="/dashboard" replace />} />
    <Route
      path="/login"
      element={<PublicRoute><LoginPage /></PublicRoute>}
    />
    <Route
      path="/signup"
      element={<PublicRoute><SignupPage /></PublicRoute>}
    />
    <Route
      path="/"
      element={<PrivateRoute><Layout /></PrivateRoute>}
    >
      <Route path="dashboard" element={<DashboardPage />} />
      <Route path="projects" element={<ProjectsPage />} />
      <Route path="projects/:id" element={<ProjectDetailPage />} />
      <Route path="tasks/:id" element={<TaskDetailPage />} />
    </Route>
    <Route path="*" element={<Navigate to="/dashboard" replace />} />
  </Routes>
);

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              borderRadius: '10px',
              fontSize: '0.875rem',
            },
          }}
        />
      </BrowserRouter>
    </AuthProvider>
  );
}
