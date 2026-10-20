import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, Mail, Lock, AlertCircle, Sparkles } from 'lucide-react';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await login(email, password);
      const redirectPath =
        location.state?.from?.pathname ||
        (data.user.role === 'admin' ? '/admin/dashboard' : '/my-fees');
      navigate(redirectPath, { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillCredentials = (userType) => {
    if (userType === 'admin') {
      setEmail('admin@college.edu');
      setPassword('admin123');
    } else {
      setEmail('naman.roll53@college.edu');
      setPassword('naman123');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-icon-badge">
            <LogIn size={26} />
          </div>
          <h2 className="auth-title">Welcome Back</h2>
          <p className="auth-subtitle">Sign in to your Fee Management portal</p>
        </div>

        {error && (
          <div className="alert alert-error">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label" htmlFor="email-input">Email Address</label>
            <div className="input-with-icon">
              <Mail className="input-icon" size={18} />
              <input
                id="email-input"
                type="email"
                required
                className="form-input"
                placeholder="you@college.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password-input">Password</label>
            <div className="input-with-icon">
              <Lock className="input-icon" size={18} />
              <input
                id="password-input"
                type="password"
                required
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary btn-block btn-lg"
          >
            {loading ? <span className="spinner-sm"></span> : 'Sign In'}
          </button>
        </form>

        <div className="demo-credentials-box">
          <div className="demo-header">
            <Sparkles size={14} />
            <span>Quick fill for testing:</span>
          </div>
          <div className="demo-buttons">
            <button
              type="button"
              className="chip-btn"
              onClick={() => fillCredentials('student')}
            >
              Fill Student (Roll 53)
            </button>
            <button
              type="button"
              className="chip-btn"
              onClick={() => fillCredentials('admin')}
            >
              Fill Admin / Accountant
            </button>
          </div>
        </div>

        <div className="auth-footer">
          <p>
            Don't have an account yet?{' '}
            <Link to="/register" className="link-highlight">
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
