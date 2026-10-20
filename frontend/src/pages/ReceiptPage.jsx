import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api/client';
import { ReceiptView } from '../components/ReceiptView';
import { AlertCircle, ArrowLeft } from 'lucide-react';

export const ReceiptPage = () => {
  const { receiptNo } = useParams();
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchReceipt() {
      setLoading(true);
      setError('');
      try {
        const res = await api.get(`/api/payments/receipt/${receiptNo}`);
        if (res.success && res.data) {
          setPayment(res.data);
        } else {
          setError(res.message || 'Receipt not found');
        }
      } catch (err) {
        setError(err.message || 'Failed to load receipt details');
      } finally {
        setLoading(false);
      }
    }

    if (receiptNo) {
      fetchReceipt();
    }
  }, [receiptNo]);

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
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
        <div style={{ marginTop: '1.5rem' }}>
          <Link to="/" className="btn btn-secondary">
            <ArrowLeft size={16} /> Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <ReceiptView payment={payment} />
    </div>
  );
};
