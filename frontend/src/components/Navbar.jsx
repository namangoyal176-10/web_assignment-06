import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  CreditCard,
  LayoutDashboard,
  Receipt,
  PlusCircle,
  FileText,
  LogOut,
  Menu,
  X,
  GraduationCap,
} from 'lucide-react';

export const Navbar = () => {
  const { user, isAuthenticated, isAdmin, isStudent, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-brand" onClick={closeMenu}>
          <div className="brand-icon-wrapper">
            <GraduationCap className="brand-icon" size={24} />
          </div>
          <div className="brand-text">
            <span className="brand-title">FeeFlow</span>
            <span className="brand-subtitle">Roll 53 • Naman Goyal</span>
          </div>
        </Link>

        <button
          className="mobile-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <div className={`nav-links ${mobileMenuOpen ? 'active' : ''}`}>
          {isAuthenticated ? (
            <>
              {isAdmin && (
                <>
                  <NavLink
                    to="/admin/dashboard"
                    className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                    onClick={closeMenu}
                  >
                    <LayoutDashboard size={18} />
                    <span>Dashboard</span>
                  </NavLink>
                  <NavLink
                    to="/admin/fees"
                    end
                    className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                    onClick={closeMenu}
                  >
                    <FileText size={18} />
                    <span>Fee Structures</span>
                  </NavLink>
                  <NavLink
                    to="/admin/fees/new"
                    className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                    onClick={closeMenu}
                  >
                    <PlusCircle size={18} />
                    <span>Add Structure</span>
                  </NavLink>
                  <NavLink
                    to="/admin/payments/new"
                    className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                    onClick={closeMenu}
                  >
                    <CreditCard size={18} />
                    <span>Record Payment</span>
                  </NavLink>
                </>
              )}

              {isStudent && (
                <NavLink
                  to="/my-fees"
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                  onClick={closeMenu}
                >
                  <Receipt size={18} />
                  <span>My Fees & Receipts</span>
                </NavLink>
              )}

              <div className="nav-user-section">
                <div className="user-badge">
                  <div className="avatar-circle">
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="user-details">
                    <span className="user-name">{user?.name}</span>
                    <span className={`user-role-tag ${user?.role}`}>
                      {user?.role === 'admin' ? 'Accountant / Admin' : `Student (Roll ${user?.rollNumber || '53'})`}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="btn-logout"
                  title="Sign out of system"
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </div>
            </>
          ) : (
            <div className="nav-auth-buttons">
              <NavLink
                to="/login"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                onClick={closeMenu}
              >
                Sign In
              </NavLink>
              <Link
                to="/register"
                className="btn btn-primary btn-sm"
                onClick={closeMenu}
              >
                Create Account
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
