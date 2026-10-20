import React from 'react';
import { Printer, ArrowLeft, CheckCircle, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const ReceiptView = ({ payment }) => {
  const navigate = useNavigate();

  if (!payment) return null;

  const {
    receiptNo,
    amountPaid,
    paymentMode,
    paymentDate,
    transactionReference,
    remarks,
    student,
    feeStructure,
    recordedBy,
  } = payment;

  const formattedDate = new Date(paymentDate).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="receipt-wrapper">
      <div className="receipt-actions no-print">
        <button onClick={() => navigate(-1)} className="btn btn-secondary">
          <ArrowLeft size={16} /> Back
        </button>
        <button onClick={handlePrint} className="btn btn-primary">
          <Printer size={16} /> Print / Save as PDF
        </button>
      </div>

      <div className="receipt-paper" id="printable-receipt">
        <div className="receipt-header">
          <div className="institution-info">
            <h1 className="inst-title">APEX INSTITUTE OF ENGINEERING & TECHNOLOGY</h1>
            <p className="inst-sub">Office of the Accounts & Fee Administration</p>
            <p className="inst-meta">Affiliated to State Technical University • Campus Code: 053</p>
          </div>
          <div className="receipt-badge-box">
            <span className="receipt-badge-title">OFFICIAL FEE RECEIPT</span>
            <span className="receipt-number">{receiptNo}</span>
            <div className="verified-tag">
              <ShieldCheck size={14} />
              <span>RECORDED & VERIFIED</span>
            </div>
          </div>
        </div>

        <div className="receipt-divider"></div>

        <div className="receipt-meta-grid">
          <div className="meta-card">
            <h3 className="meta-card-title">Student Information</h3>
            <table className="meta-table">
              <tbody>
                <tr>
                  <th>Student Name:</th>
                  <td><strong>{student?.name || 'N/A'}</strong></td>
                </tr>
                <tr>
                  <th>Roll Number:</th>
                  <td><span className="tag-mono">{student?.rollNumber || '53'}</span></td>
                </tr>
                <tr>
                  <th>Course / Branch:</th>
                  <td>{student?.course || feeStructure?.course || 'B.Tech CSE'}</td>
                </tr>
                <tr>
                  <th>Academic Batch:</th>
                  <td>{student?.batch || '2024-2028'}</td>
                </tr>
                <tr>
                  <th>Email:</th>
                  <td>{student?.email || 'N/A'}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="meta-card">
            <h3 className="meta-card-title">Transaction Details</h3>
            <table className="meta-table">
              <tbody>
                <tr>
                  <th>Payment Date:</th>
                  <td>{formattedDate}</td>
                </tr>
                <tr>
                  <th>Payment Mode:</th>
                  <td><span className="mode-badge">{paymentMode}</span></td>
                </tr>
                <tr>
                  <th>Reference / Txn ID:</th>
                  <td><span className="tag-mono">{transactionReference || 'N/A (Cash/Direct)'}</span></td>
                </tr>
                <tr>
                  <th>Academic Session:</th>
                  <td>{feeStructure?.academicYear || '2026-2027'}</td>
                </tr>
                <tr>
                  <th>Collected By:</th>
                  <td>{recordedBy?.name || 'Accounts Officer'}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="receipt-heads-section">
          <h3 className="section-title">Fee Particulars</h3>
          <table className="fee-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Fee Component / Head</th>
                <th className="text-right">Component Amount</th>
              </tr>
            </thead>
            <tbody>
              {feeStructure?.feeHeads && feeStructure.feeHeads.length > 0 ? (
                feeStructure.feeHeads.map((head, idx) => (
                  <tr key={idx}>
                    <td>{idx + 1}</td>
                    <td>{head.title}</td>
                    <td className="text-right">₹{Number(head.amount).toLocaleString('en-IN')}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td>1</td>
                  <td>{feeStructure?.course} Academic Fees</td>
                  <td className="text-right">
                    ₹{Number(feeStructure?.totalAmount || 0).toLocaleString('en-IN')}
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan="2" className="text-right"><strong>Total Course Fee:</strong></td>
                <td className="text-right">
                  <strong>₹{Number(feeStructure?.totalAmount || 0).toLocaleString('en-IN')}</strong>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div className="payment-total-box">
          <div className="total-left">
            <div className="paid-status-pill">
              <CheckCircle size={18} /> Payment Received
            </div>
            {remarks && (
              <p className="payment-remarks">
                <strong>Remarks / Notes:</strong> {remarks}
              </p>
            )}
          </div>
          <div className="total-right">
            <span className="total-label">Amount Paid:</span>
            <span className="total-amount-display">
              ₹{Number(amountPaid).toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        <div className="receipt-footer">
          <div className="footer-left">
            <p className="notice-text">
              * This is a computer-generated fee receipt under PS3 Fee Management System (Naman Goyal, Roll 53).
            </p>
            <p className="notice-sub">Keep this receipt safe for admission and examination clearance.</p>
          </div>
          <div className="footer-right signatures">
            <div className="sig-line">
              <div className="sig-line-bar"></div>
              <span>Student / Depositor Signature</span>
            </div>
            <div className="sig-line">
              <div className="sig-line-bar"></div>
              <span>Authorized Accounts Officer</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
