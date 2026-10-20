import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../../api/client';
import {
  CreditCard,
  User,
  BookOpen,
  Calendar,
  AlertCircle,
  CheckCircle,
  Receipt,
  FileCheck2,
} from 'lucide-react';

export const RecordPayment = () => {
  const navigate = useNavigate();

  const [students, setStudents] = useState([]);
  const [feeStructures, setFeeStructures] = useState([]);

  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedFee, setSelectedFee] = useState('');
  const [amountPaid, setAmountPaid] = useState('');
  const [paymentMode, setPaymentMode] = useState('UPI');
  const [transactionReference, setTransactionReference] = useState('');
  const [remarks, setRemarks] = useState('');
  const [paymentDate, setPaymentDate] = useState(() => new Date().toISOString().split('T')[0]);

  const [feeBalanceData, setFeeBalanceData] = useState(null);
  const [loadingBalance, setLoadingBalance] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadDropdowns() {
      try {
        const [studRes, feeRes] = await Promise.all([
          api.get('/api/auth/students'),
          api.get('/api/fees'),
        ]);

        if (studRes.success && studRes.data) {
          setStudents(studRes.data);
          if (studRes.data.length > 0) {
            setSelectedStudent(studRes.data[0]._id);
          }
        }

        if (feeRes.success && feeRes.data) {
          setFeeStructures(feeRes.data);
          if (feeRes.data.length > 0) {
            setSelectedFee(feeRes.data[0]._id);
          }
        }
      } catch (err) {
        setError('Failed to load students or fee structures: ' + err.message);
      }
    }

    loadDropdowns();
  }, []);

  useEffect(() => {
    async function checkStudentBalance() {
      if (!selectedStudent || !selectedFee) return;

      setLoadingBalance(true);
      try {
        const res = await api.get(`/api/payments/student/${selectedStudent}`);
        if (res.success && res.breakdown) {
          const match = res.breakdown.find(
            (b) => b.feeStructure._id === selectedFee
          );

          if (match) {
            setFeeBalanceData(match);
            if (!amountPaid || Number(amountPaid) > match.balance) {
              setAmountPaid(String(match.balance));
            }
          } else {
            const feeObj = feeStructures.find((f) => f._id === selectedFee);
            if (feeObj) {
              setFeeBalanceData({
                totalPayable: feeObj.totalAmount,
                amountPaid: 0,
                balance: feeObj.totalAmount,
              });
              setAmountPaid(String(feeObj.totalAmount));
            }
          }
        }
      } catch (err) {
        console.warn('Could not fetch student balance:', err.message);
      } finally {
        setLoadingBalance(false);
      }
    }

    checkStudentBalance();
  }, [selectedStudent, selectedFee]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const numericAmount = parseFloat(amountPaid);

    if (isNaN(numericAmount) || numericAmount <= 0) {
      setError('Payment amount must be greater than zero');
      return;
    }

    if (feeBalanceData && numericAmount > feeBalanceData.balance) {
      setError(
        `Payment (₹${numericAmount}) exceeds pending balance of ₹${feeBalanceData.balance}. Maximum allowable is ₹${feeBalanceData.balance}.`
      );
      return;
    }

    setSubmitting(true);

    try {
      const res = await api.post('/api/payments', {
        studentId: selectedStudent,
        feeStructureId: selectedFee,
        amountPaid: numericAmount,
        paymentMode,
        transactionReference: transactionReference.trim(),
        remarks: remarks.trim(),
        paymentDate,
      });

      if (res.success && res.receiptNo) {
        navigate(`/receipts/${res.receiptNo}`);
      }
    } catch (err) {
      setError(err.message || 'Failed to record payment');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-container" style={{ maxWidth: '800px' }}>
      <div className="form-card">
        <div className="form-card-header">
          <div className="icon-badge-round">
            <CreditCard size={28} />
          </div>
          <h1 className="page-title">Record Student Fee Payment</h1>
          <p className="page-subtitle">
            Enter payment received, auto-validate against pending balance, and generate official receipt
          </p>
        </div>

        {error && (
          <div className="alert alert-error">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="student-select">Select Student</label>
              <div className="input-with-icon">
                <User className="input-icon" size={18} />
                <select
                  id="student-select"
                  required
                  className="form-select"
                  value={selectedStudent}
                  onChange={(e) => setSelectedStudent(e.target.value)}
                >
                  {students.map((stud) => (
                    <option key={stud._id} value={stud._id}>
                      {stud.name} (Roll: {stud.rollNumber || 'N/A'}) - {stud.course}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="fee-select">Select Fee Structure</label>
              <div className="input-with-icon">
                <BookOpen className="input-icon" size={18} />
                <select
                  id="fee-select"
                  required
                  className="form-select"
                  value={selectedFee}
                  onChange={(e) => setSelectedFee(e.target.value)}
                >
                  {feeStructures.map((f) => (
                    <option key={f._id} value={f._id}>
                      {f.course} ({f.academicYear}) — ₹{Number(f.totalAmount).toLocaleString('en-IN')}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {feeBalanceData && (
            <div className="balance-indicator-box">
              <div className="balance-stat">
                <span className="balance-label">Total Fee:</span>
                <span className="balance-val">
                  ₹{Number(feeBalanceData.totalPayable).toLocaleString('en-IN')}
                </span>
              </div>
              <div className="balance-stat">
                <span className="balance-label">Already Paid:</span>
                <span className="balance-val text-green">
                  ₹{Number(feeBalanceData.amountPaid).toLocaleString('en-IN')}
                </span>
              </div>
              <div className="balance-stat">
                <span className="balance-label">Current Pending Balance:</span>
                <span className="balance-val text-danger">
                  ₹{Number(feeBalanceData.balance).toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          )}

          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="payment-amount">
                Amount Being Paid (₹) *
              </label>
              <div className="input-prefix-box">
                <span>₹</span>
                <input
                  id="payment-amount"
                  type="number"
                  required
                  min="1"
                  step="any"
                  max={feeBalanceData?.balance || undefined}
                  className="form-input"
                  placeholder="Enter amount (e.g. 25000)"
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(e.target.value)}
                />
              </div>
              {feeBalanceData && (
                <span className="text-muted text-xs block mt-1">
                  Maximum allowable payment for this structure is ₹{feeBalanceData.balance}
                </span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="payment-mode">Payment Mode *</label>
              <select
                id="payment-mode"
                required
                className="form-select"
                value={paymentMode}
                onChange={(e) => setPaymentMode(e.target.value)}
              >
                <option value="UPI">UPI (Google Pay, PhonePe, Paytm)</option>
                <option value="Cash">Cash (Counter Deposit)</option>
                <option value="Card">Debit / Credit Card (POS)</option>
                <option value="Net Banking">Net Banking / NEFT / RTGS</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="txn-ref">Transaction / Reference ID</label>
              <input
                id="txn-ref"
                type="text"
                className="form-input"
                placeholder={paymentMode === 'Cash' ? 'e.g. CASH-COUNTER-01' : 'e.g. UPI-TXN-98471928'}
                value={transactionReference}
                onChange={(e) => setTransactionReference(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="pay-date">Payment Date</label>
              <div className="input-with-icon">
                <Calendar className="input-icon" size={18} />
                <input
                  id="pay-date"
                  type="date"
                  required
                  className="form-input"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="pay-remarks">Remarks / Official Notes (Optional)</label>
            <input
              id="pay-remarks"
              type="text"
              className="form-input"
              placeholder="e.g. First installment deposited via UPI"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
            />
          </div>

          <div className="form-actions mt-4">
            <button
              type="submit"
              disabled={submitting || (feeBalanceData && feeBalanceData.balance <= 0)}
              className="btn btn-primary btn-lg"
            >
              <Receipt size={18} />
              {submitting ? 'Recording & Generating Receipt...' : 'Record Payment & Generate Receipt'}
            </button>
            <Link to="/admin/dashboard" className="btn btn-secondary btn-lg">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};
