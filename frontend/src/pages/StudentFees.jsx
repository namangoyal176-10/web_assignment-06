import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api/client';
import {
  Receipt,
  AlertTriangle,
  CheckCircle2,
  Clock,
  DollarSign,
  Calendar,
  UserCheck,
  FileCheck,
} from 'lucide-react';

export const StudentFees = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStudentFees();
  }, [id]);

  const fetchStudentFees = async () => {
    setLoading(true);
    setError('');
    try {
      const endpoint = id ? `/api/payments/student/${id}` : '/api/payments/my-fees';
      const res = await api.get(endpoint);
      if (res.success) {
        setData(res);
      }
    } catch (err) {
      setError(err.message || 'Failed to load fee information');
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

  const { student, summary, breakdown = [], paymentHistory = [] } = data || {};

  return (
    <div className="page-container">
      <div className="profile-banner">
        <div className="profile-main">
          <div className="profile-avatar">
            {student?.name?.charAt(0).toUpperCase() || 'S'}
          </div>
          <div className="profile-text">
            <div className="profile-title-row">
              <h1 className="profile-name">{student?.name}</h1>
              <span className="badge badge-primary">Roll No: {student?.rollNumber || '53'}</span>
            </div>
            <p className="profile-meta">
              <span>{student?.course}</span> • <span>Batch: {student?.batch || '2024-2028'}</span> • <span>{student?.email}</span>
            </p>
          </div>
        </div>

        {id && (
          <div className="admin-view-tag">
            <UserCheck size={16} /> Admin Inspection Mode
          </div>
        )}
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon-wrapper bg-blue-subtle">
            <DollarSign className="text-blue" size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Total Fee Payable</span>
            <span className="stat-value">₹{(summary?.totalPayable || 0).toLocaleString('en-IN')}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper bg-green-subtle">
            <CheckCircle2 className="text-green" size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Total Amount Paid</span>
            <span className="stat-value text-green">₹{(summary?.totalPaid || 0).toLocaleString('en-IN')}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper bg-amber-subtle">
            <Clock className="text-amber" size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Outstanding Balance</span>
            <span className={`stat-value ${summary?.totalBalance > 0 ? 'text-danger' : 'text-green'}`}>
              ₹{(summary?.totalBalance || 0).toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      </div>

      <div className="section-block">
        <div className="section-header">
          <h2 className="section-heading">Course Fee Structures</h2>
          <span className="text-muted text-sm">{breakdown.length} Active Structure(s)</span>
        </div>

        {breakdown.length === 0 ? (
          <div className="empty-box">
            <FileCheck size={48} className="text-muted" />
            <p>No fee structures found for this course.</p>
          </div>
        ) : (
          <div className="grid-cards">
            {breakdown.map((item, idx) => {
              const fee = item.feeStructure;
              const formattedDueDate = new Date(fee.dueDate).toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              });

              return (
                <div key={idx} className={`fee-breakdown-card ${item.isOverdue ? 'border-overdue' : ''}`}>
                  <div className="fee-card-top">
                    <div>
                      <h3 className="fee-card-course">{fee.course}</h3>
                      <span className="fee-card-year">Academic Year: {fee.academicYear}</span>
                    </div>
                    <span
                      className={`status-pill ${
                        item.status === 'Paid'
                          ? 'status-paid'
                          : item.status === 'Partial'
                          ? 'status-partial'
                          : item.isOverdue
                          ? 'status-overdue'
                          : 'status-pending'
                      }`}
                    >
                      {item.isOverdue ? 'Overdue Defaulter' : item.status}
                    </span>
                  </div>

                  {fee.feeHeads && fee.feeHeads.length > 0 && (
                    <div className="fee-heads-list">
                      {fee.feeHeads.map((head, hIdx) => (
                        <div key={hIdx} className="head-item">
                          <span>{head.title}</span>
                          <span>₹{Number(head.amount).toLocaleString('en-IN')}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="fee-progress-bar">
                    <div
                      className="progress-fill"
                      style={{
                        width: `${Math.min(100, (item.amountPaid / (fee.totalAmount || 1)) * 100)}%`,
                      }}
                    ></div>
                  </div>

                  <div className="fee-amounts-row">
                    <div>
                      <span className="text-muted text-xs block">Total Due</span>
                      <strong>₹{fee.totalAmount.toLocaleString('en-IN')}</strong>
                    </div>
                    <div>
                      <span className="text-muted text-xs block">Paid</span>
                      <strong className="text-green">₹{item.amountPaid.toLocaleString('en-IN')}</strong>
                    </div>
                    <div>
                      <span className="text-muted text-xs block">Pending</span>
                      <strong className={item.balance > 0 ? 'text-danger' : 'text-green'}>
                        ₹{item.balance.toLocaleString('en-IN')}
                      </strong>
                    </div>
                  </div>

                  <div className="fee-card-footer">
                    <span className="due-date-label">
                      <Calendar size={14} /> Due: {formattedDueDate}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="section-block">
        <div className="section-header">
          <h2 className="section-heading">Payment History & Receipts</h2>
          <span className="text-muted text-sm">{paymentHistory.length} Recorded Payment(s)</span>
        </div>

        {paymentHistory.length === 0 ? (
          <div className="empty-box">
            <Receipt size={48} className="text-muted" />
            <p>No payments recorded yet.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Receipt No</th>
                  <th>Date</th>
                  <th>Fee Structure</th>
                  <th>Amount</th>
                  <th>Mode</th>
                  <th>Txn Reference</th>
                  <th className="text-center">Receipt Action</th>
                </tr>
              </thead>
              <tbody>
                {paymentHistory.map((p) => (
                  <tr key={p._id}>
                    <td>
                      <span className="tag-mono font-bold">{p.receiptNo}</span>
                    </td>
                    <td>
                      {new Date(p.paymentDate).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td>{p.feeStructure?.course || 'Academic Fees'}</td>
                    <td>
                      <strong className="text-green">
                        ₹{Number(p.amountPaid).toLocaleString('en-IN')}
                      </strong>
                    </td>
                    <td>
                      <span className="mode-badge">{p.paymentMode}</span>
                    </td>
                    <td>
                      <span className="text-muted text-xs">
                        {p.transactionReference || 'N/A'}
                      </span>
                    </td>
                    <td className="text-center">
                      <Link
                        to={`/receipts/${p.receiptNo}`}
                        className="btn btn-secondary btn-sm"
                      >
                        <Receipt size={14} /> View Receipt
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
