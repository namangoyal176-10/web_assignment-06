import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  GraduationCap,
  CreditCard,
  Receipt,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  FileText,
} from 'lucide-react';

export const Home = () => {
  const { isAuthenticated, isAdmin, isStudent } = useAuth();

  return (
    <div className="home-container">
      <section className="hero-section">
        <div className="assignment-badge">
          <span>Web Dev Assignment 6 • PS3</span>
          <span className="dot-sep">•</span>
          <span>Naman Goyal (Roll No: 53)</span>
        </div>

        <h1 className="hero-title">
          Fee Collection & <br />
          <span className="hero-gradient-text">Receipt Management System</span>
        </h1>

        <p className="hero-description">
          A full-stack MERN application for institutional tuition management, role-based
          fee structures, multi-mode payment recording, automated receipt generation, and real-time defaulters tracking.
        </p>

        <div className="hero-cta-group">
          {isAuthenticated ? (
            isAdmin ? (
              <Link to="/admin/dashboard" className="btn btn-primary btn-lg">
                Go to Admin Dashboard <ArrowRight size={18} />
              </Link>
            ) : (
              <Link to="/my-fees" className="btn btn-primary btn-lg">
                View My Fees & Receipts <ArrowRight size={18} />
              </Link>
            )
          ) : (
            <>
              <Link to="/login" className="btn btn-primary btn-lg">
                Sign In to Portal <ArrowRight size={18} />
              </Link>
              <Link to="/register" className="btn btn-secondary btn-lg">
                Register Student / Admin
              </Link>
            </>
          )}
        </div>
      </section>

      <section className="features-section">
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon bg-blue-subtle">
              <ShieldCheck className="text-blue" size={24} />
            </div>
            <h3 className="feature-title">Role-Based Access</h3>
            <p className="feature-desc">
              Protected authentication with JWT and bcrypt hashing. Strict separation between Student and Accountant roles.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon bg-purple-subtle">
              <FileText className="text-purple" size={24} />
            </div>
            <h3 className="feature-title">Dynamic Fee Heads</h3>
            <p className="feature-desc">
              Manage course-specific fee structures with custom fee heads (Tuition, Examination, Transport) and due dates.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon bg-green-subtle">
              <CreditCard className="text-green" size={24} />
            </div>
            <h3 className="feature-title">Payment Validation</h3>
            <p className="feature-desc">
              Support for Cash, UPI, and Card. Server rejects negative amounts, zero payments, and overpayments exceeding balance.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon bg-amber-subtle">
              <Receipt className="text-amber" size={24} />
            </div>
            <h3 className="feature-title">Printable Receipts</h3>
            <p className="feature-desc">
              Unique sequential receipt IDs (e.g. RCP-2026-0001) with clean, printable institutional receipt templates.
            </p>
          </div>
        </div>
      </section>

      <section className="submission-card-section">
        <div className="submission-card">
          <div className="sub-left">
            <h3>College Evaluation Ready</h3>
            <p>
              Developed by <strong>Naman Goyal</strong> (Roll: 53) using React, Vite, Node.js, Express, and MongoDB Atlas.
            </p>
          </div>
          <div className="sub-right">
            <span className="tech-chip">React + Vite</span>
            <span className="tech-chip">Node.js + Express</span>
            <span className="tech-chip">MongoDB Atlas</span>
            <span className="tech-chip">Vercel & Render</span>
          </div>
        </div>
      </section>
    </div>
  );
};
