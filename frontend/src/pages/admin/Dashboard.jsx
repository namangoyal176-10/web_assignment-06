import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';
import {
  TrendingUp,
  AlertTriangle,
  CreditCard,
  Users,
  Calendar,
  PlusCircle,
  Receipt,
  ArrowRight,
  ShieldAlert,
  Wallet,
  DollarSign,
} from 'lucide-react';

export const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/api/payments/dashboard');
      if (res.success) {
        setData(res);
      }
    } catch (err) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container flex-center" style={{ minHeight: '60vh' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="alert alert-error">
          <AlertTriangle size={20} />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  const { stats, paymentModeBreakdown = {}, overdueDefaulters = [], recentPayments = [] } = data || {};

  return (
    <div className="page-container">
      <div className="dashboard-header-row">
        <div>
          <h1 className="page-title">Accounts Administration Dashboard</h1>
          <p className="page-subtitle">Real-time fee collection analytics, defaulters & transactions</p>
        </div>
        <div className="header-actions">
          <Link to="/admin/payments/new" className="btn btn-primary">
            <CreditCard size={18} /> Record Payment
          </Link>
          <Link to="/admin/fees/new" className="btn btn-secondary">
            <PlusCircle size={18} /> Add Fee Structure
          </Link>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon-wrapper bg-green-subtle">
            <TrendingUp className="text-green" size={26} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Total Fees Collected</span>
            <span className="stat-value text-green">
              ₹{(stats?.totalCollected || 0).toLocaleString('en-IN')}
            </span>
            <span className="stat-sub">{stats?.totalTransactions || 0} Transactions</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper bg-red-subtle">
            <ShieldAlert className="text-danger" size={26} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Total Pending Fees</span>
            <span className="stat-value text-danger">
              ₹{(stats?.totalPending || 0).toLocaleString('en-IN')}
            </span>
            <span className="stat-sub">{overdueDefaulters.length} Overdue Dues</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper bg-blue-subtle">
            <DollarSign className="text-blue" size={26} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Total Expected Assessment</span>
            <span className="stat-value">
              ₹{(stats?.totalExpected || 0).toLocaleString('en-IN')}
            </span>
            <span className="stat-sub">{stats?.totalFeeStructures || 0} Fee Structures</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper bg-purple-subtle">
            <Users className="text-purple" size={26} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Enrolled Students</span>
            <span className="stat-value">{stats?.totalStudents || 0}</span>
            <span className="stat-sub">Registered in system</span>
          </div>
        </div>
      </div>

      <div className="section-block">
        <div className="section-header">
          <h2 className="section-heading">Collections by Payment Mode</h2>
        </div>
        <div className="modes-grid">
          {Object.entries(paymentModeBreakdown).map(([mode, amount]) => (
            <div key={mode} className="mode-card">
              <div className="mode-card-header">
                <Wallet size={18} className="text-primary" />
                <span className="mode-name">{mode}</span>
              </div>
              <span className="mode-amount">₹{Number(amount).toLocaleString('en-IN')}</span>
              <div className="mode-progress">
                <div
                  className="mode-progress-fill"
                  style={{
                    width: `${stats?.totalCollected > 0 ? (amount / stats.totalCollected) * 100 : 0}%`,
                  }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="section-block">
        <div className="section-header">
          <div className="header-with-badge">
            <h2 className="section-heading">Overdue Defaulters Alert List</h2>
            <span className="badge badge-danger">{overdueDefaulters.length} Unresolved</span>
          </div>
          <p className="section-sub">Students with pending fee balances past the due date deadline</p>
        </div>

        {overdueDefaulters.length === 0 ? (
          <div className="empty-box success-box">
            <TrendingUp size={40} className="text-green" />
            <p>Great! No overdue fee defaulters at this time.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Roll No</th>
                  <th>Course / Program</th>
                  <th>Fee Title</th>
                  <th>Due Date</th>
                  <th>Total Fee</th>
                  <th>Amount Paid</th>
                  <th>Pending Due</th>
                  <th className="text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {overdueDefaulters.map((item, idx) => (
                  <tr key={idx} className="defaulter-row">
                    <td><strong>{item.name}</strong></td>
                    <td><span className="tag-mono">{item.rollNumber || 'N/A'}</span></td>
                    <td>{item.course}</td>
                    <td>{item.feeTitle}</td>
                    <td>
                      <span className="text-danger flex-align gap-1 font-medium">
                        <Calendar size={14} />
                        {new Date(item.dueDate).toLocaleDateString('en-IN')}
                      </span>
                    </td>
                    <td>₹{Number(item.totalFee).toLocaleString('en-IN')}</td>
                    <td className="text-green">₹{Number(item.amountPaid).toLocaleString('en-IN')}</td>
                    <td>
                      <strong className="text-danger">
                        ₹{Number(item.pendingAmount).toLocaleString('en-IN')}
                      </strong>
                    </td>
                    <td className="text-center">
                      <Link
                        to={`/admin/students/${item.studentId}/fees`}
                        className="btn btn-secondary btn-sm"
                      >
                        Inspect Fees <ArrowRight size={14} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="section-block">
        <div className="section-header">
          <h2 className="section-heading">Recent Fee Transactions</h2>
          <span className="text-muted text-sm">Showing last {recentPayments.length} transactions</span>
        </div>

        {recentPayments.length === 0 ? (
          <div className="empty-box">
            <Receipt size={40} className="text-muted" />
            <p>No transactions recorded yet.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Receipt No</th>
                  <th>Student Name</th>
                  <th>Roll No</th>
                  <th>Date</th>
                  <th>Amount Paid</th>
                  <th>Payment Mode</th>
                  <th>Txn Ref</th>
                  <th className="text-center">View Receipt</th>
                </tr>
              </thead>
              <tbody>
                {recentPayments.map((p) => (
                  <tr key={p._id}>
                    <td><span className="tag-mono font-bold">{p.receiptNo}</span></td>
                    <td>{p.student?.name || 'N/A'}</td>
                    <td><span className="tag-mono">{p.student?.rollNumber || '53'}</span></td>
                    <td>
                      {new Date(p.paymentDate).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td>
                      <strong className="text-green">
                        ₹{Number(p.amountPaid).toLocaleString('en-IN')}
                      </strong>
                    </td>
                    <td><span className="mode-badge">{p.paymentMode}</span></td>
                    <td><span className="text-xs text-muted">{p.transactionReference || 'N/A'}</span></td>
                    <td className="text-center">
                      <Link
                        to={`/receipts/${p.receiptNo}`}
                        className="btn btn-secondary btn-sm"
                      >
                        <Receipt size={14} /> View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
