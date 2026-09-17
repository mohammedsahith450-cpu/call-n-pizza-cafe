import { useState, useEffect } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import restaurantConfig from '../config/restaurantConfig';
import { authService } from '../services/authService';
import './Admin.css';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(() => authService.isAuthenticated());

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Synchronize with auth service state changes (session restoration)
  useEffect(() => {
    const unsubscribe = authService.onAuthStateChange((session) => {
      setIsAuthenticated(Boolean(session));
    });
    return unsubscribe;
  }, []);

  // If already authenticated with Supabase, redirect immediately to /admin
  if (isAuthenticated) {
    return <Navigate to="/admin" replace />;
  }

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setIsSubmitting(true);

    try {
      const result = await authService.login(email, password);
      if (result.success) {
        navigate('/admin', { replace: true });
      } else {
        setLoginError(result.error || 'Authentication failed. Please check your credentials.');
      }
    } finally {
      setIsSubmitting(false);
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
            <label htmlFor="admin-email">Admin Email</label>
            <input
              type="email"
              id="admin-email"
              placeholder="e.g. admin@callnpizzacafe.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
              autoComplete="email"
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="admin-pass">Admin Password</label>
            <input
              type="password"
              id="admin-pass"
              placeholder="Enter your Supabase admin password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
              autoComplete="current-password"
              required
            />
          </div>

          {loginError && <p className="admin-error">{loginError}</p>}

          <button
            type="submit"
            className="admin-btn admin-btn--primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Verifying...' : 'Log In to Dashboard'}
          </button>
        </form>

        <p className="admin-login-hint">
          Secured by Supabase Authentication. Enter your registered admin credentials.
        </p>
        <Link to="/" className="admin-back-link">
          ← Return to Website
        </Link>
      </div>
    </main>
  );
}
