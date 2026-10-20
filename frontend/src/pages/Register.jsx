import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, User, Mail, Lock, Phone, BookOpen, AlertCircle } from 'lucide-react';

export const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
    rollNumber: '',
    course: 'B.Tech CSE',
    batch: '2024-2028',
    phone: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const data = await register(formData);
      if (data.user.role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/my-fees', { replace: true });
      }
    } catch (err) {
      setError(err.message || 'Registration failed. Please check inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card register-card">
        <div className="auth-header">
          <div className="auth-icon-badge">
            <UserPlus size={26} />
          </div>
          <h2 className="auth-title">Create Account</h2>
          <p className="auth-subtitle">Register for the Fee Collection Portal</p>
        </div>

        {error && (
          <div className="alert alert-error">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="name">Full Name</label>
              <div className="input-with-icon">
                <User className="input-icon" size={18} />
                <input
                  id="name"
                  type="text"
                  name="name"
                  required
                  className="form-input"
                  placeholder="e.g. Rahul Sharma"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="email">Email Address</label>
              <div className="input-with-icon">
                <Mail className="input-icon" size={18} />
                <input
                  id="email"
                  type="email"
                  name="email"
                  required
                  className="form-input"
                  placeholder="student@college.edu"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="password">Password (min 6 chars)</label>
              <div className="input-with-icon">
                <Lock className="input-icon" size={18} />
                <input
                  id="password"
                  type="password"
                  name="password"
                  required
                  minLength={6}
                  className="form-input"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="role">Account Role</label>
              <select
                id="role"
                name="role"
                className="form-select"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="student">Student</option>
                <option value="admin">Accountant / Admin</option>
              </select>
            </div>
          </div>

          {formData.role === 'student' && (
            <div className="student-fields-box">
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label" htmlFor="rollNumber">Roll Number</label>
                  <input
                    id="rollNumber"
                    type="text"
                    name="rollNumber"
                    required
                    className="form-input"
                    placeholder="e.g. CS-101"
                    value={formData.rollNumber}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="course">Course / Department</label>
                  <div className="input-with-icon">
                    <BookOpen className="input-icon" size={18} />
                    <input
                      id="course"
                      type="text"
                      name="course"
                      required
                      className="form-input"
                      placeholder="e.g. B.Tech Computer Science"
                      value={formData.course}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label" htmlFor="batch">Academic Batch</label>
                  <input
                    id="batch"
                    type="text"
                    name="batch"
                    className="form-input"
                    placeholder="e.g. 2024-2028"
                    value={formData.batch}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="phone">Phone Number</label>
                  <div className="input-with-icon">
                    <Phone className="input-icon" size={18} />
                    <input
                      id="phone"
                      type="tel"
                      name="phone"
                      className="form-input"
                      placeholder="e.g. 9876543210"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary btn-block btn-lg"
          >
            {loading ? <span className="spinner-sm"></span> : 'Complete Registration'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Already have an account?{' '}
            <Link to="/login" className="link-highlight">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
