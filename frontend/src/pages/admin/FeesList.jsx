import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';
import { PlusCircle, Edit2, Trash2, Calendar, FileText, AlertCircle, CheckCircle } from 'lucide-react';

export const FeesList = () => {
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetchFees();
  }, []);

  const fetchFees = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/api/fees');
      if (res.success) {
        setFees(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load fee structures');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, courseName) => {
    if (!window.confirm(`Are you sure you want to delete the fee structure for "${courseName}"?`)) {
      return;
    }

    try {
      const res = await api.delete(`/api/fees/${id}`);
      if (res.success) {
        setSuccessMsg(`Fee structure deleted successfully.`);
        setFees(fees.filter((f) => f._id !== id));
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div className="page-container flex-center" style={{ minHeight: '60vh' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="dashboard-header-row">
        <div>
          <h1 className="page-title">Course Fee Structures</h1>
          <p className="page-subtitle">Manage tuition, exams, transport fees, amounts and due dates</p>
        </div>
        <Link to="/admin/fees/new" className="btn btn-primary">
          <PlusCircle size={18} /> Add New Fee Structure
        </Link>
      </div>

      {successMsg && (
        <div className="alert alert-success">
          <CheckCircle size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="alert alert-error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {fees.length === 0 ? (
        <div className="empty-box">
          <FileText size={48} className="text-muted" />
          <h3>No Fee Structures Found</h3>
          <p>Get started by defining tuition and fee heads for a course.</p>
          <Link to="/admin/fees/new" className="btn btn-primary" style={{ marginTop: '1rem' }}>
            <PlusCircle size={16} /> Create First Structure
          </Link>
        </div>
      ) : (
        <div className="grid-cards">
          {fees.map((fee) => (
            <div key={fee._id} className="fee-structure-card">
              <div className="card-top-header">
                <div>
                  <h3 className="card-course-title">{fee.course}</h3>
                  <span className="card-acad-year">{fee.academicYear}</span>
                </div>
                <div className="action-buttons-group">
                  <Link
                    to={`/admin/fees/${fee._id}/edit`}
                    className="icon-btn text-blue"
                    title="Edit Fee Structure"
                  >
                    <Edit2 size={16} />
                  </Link>
                  <button
                    onClick={() => handleDelete(fee._id, fee.course)}
                    className="icon-btn text-danger"
                    title="Delete Fee Structure"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {fee.description && (
                <p className="card-description">{fee.description}</p>
              )}

              {/* Fee Heads summary */}
              <div className="fee-heads-list">
                {fee.feeHeads?.map((head, idx) => (
                  <div key={idx} className="head-item">
                    <span>{head.title}</span>
                    <span>₹{Number(head.amount).toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>

              <div className="card-footer-info">
                <div>
                  <span className="text-muted text-xs block">Total Fee Amount</span>
                  <span className="total-fee-val">₹{Number(fee.totalAmount).toLocaleString('en-IN')}</span>
                </div>
                <div>
                  <span className="text-muted text-xs block">Payment Due Date</span>
                  <span className="due-date-val">
                    <Calendar size={14} />
                    {new Date(fee.dueDate).toLocaleDateString('en-IN')}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
