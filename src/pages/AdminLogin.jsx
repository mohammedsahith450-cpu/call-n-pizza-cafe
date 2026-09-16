import { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import restaurantConfig from '../config/restaurantConfig';
import { authService } from '../services/authService';
import './Admin.css';

export default function AdminLogin() {
  const navigate = useNavigate();
  const isAuthenticated = authService.isAuthenticated();

  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // If already authenticated, redirect immediately to /admin
  if (isAuthenticated) {
    return <Navigate to="/admin" replace />;
  }

  const handleLogin = (e) => {
    e.preventDefault();
    const result = authService.login(password);
    if (result.success) {
      setLoginError('');
      navigate('/admin', { replace: true });
    } else {
      setLoginError(result.error || 'Invalid password.');
    }
  };

  return (
    <main className="admin-page admin-login-wrapper" id="admin-login-page">
      <div className="admin-login-card">
        <img
          src={restaurantConfig.logo}
          alt={restaurantConfig.name}
          className="admin-login-logo"
        />
        <h2 className="admin-login-title">Admin Dashboard</h2>
        <p className="admin-login-subtitle">Call N Pizza Cafe Management</p>

        <form onSubmit={handleLogin} className="admin-login-form">
          <div className="form-group">
            <label htmlFor="admin-pass">Admin Password / PIN</label>
            <input
              type="password"
              id="admin-pass"
              placeholder="Enter password (demo: press Enter)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
              autoFocus
            />
          </div>
          {loginError && <p className="admin-error">{loginError}</p>}
          <button type="submit" className="admin-btn admin-btn--primary">
            Log In to Dashboard
          </button>
        </form>

        <p className="admin-login-hint">
          Tip: Leave blank or enter <code>admin</code> for demo access.
        </p>
        <Link to="/" className="admin-back-link">
          ← Return to Website
        </Link>
      </div>
    </main>
  );
}
