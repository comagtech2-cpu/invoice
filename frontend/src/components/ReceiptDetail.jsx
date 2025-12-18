import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import receiptService from '../services/receiptService';

const ReceiptDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadReceipt();
  }, [id]);

  const loadReceipt = async () => {
    try {
      setLoading(true);
      const data = await receiptService.getReceipt(id);
      setReceipt(data);
    } catch (error) {
      setErrors({ general: error.error || 'Failed to load receipt' });
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this receipt?')) {
      try {
        await receiptService.deleteReceipt(id);
        navigate('/receipts');
      } catch (error) {
        setErrors({ general: error.error || 'Failed to delete receipt' });
      }
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return <div className="loading">Loading receipt...</div>;
  }

  if (!receipt) {
    return (
      <div className="invoice-detail-container">
        <div className="invoice-header">
          <h2>Receipt Not Found</h2>
          <button onClick={() => navigate('/receipts')} className="btn-secondary">
            Back to Receipts
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="invoice-detail-container">
      <div className="invoice-header">
        <h2>Receipt #{receipt.receipt_number}</h2>
        <div className="invoice-actions">
          <button onClick={handlePrint} className="btn-secondary">
            Print
          </button>
          <button onClick={handleDelete} className="btn-remove">
            Delete
          </button>
          <button onClick={() => navigate('/receipts')} className="btn-secondary">
            Back to Receipts
          </button>
        </div>
      </div>

      {errors.general && (
        <div className="alert alert-danger">
          {errors.general}
        </div>
      )}

      <div className="invoice-content">
        {/* Business Information */}
        <div className="business-info">
          <h3>{receipt.business_name}</h3>
        </div>

        {/* Client Information */}
        <div className="client-info">
          <h3>Received From:</h3>
          <p>{receipt.client_name}</p>
        </div>

        {/* Receipt Details */}
        <div className="invoice-details">
          <div className="detail-row">
            <span>Receipt Number:</span>
            <span>{receipt.receipt_number}</span>
          </div>
          <div className="detail-row">
            <span>Invoice Number:</span>
            <span>{receipt.invoice_number}</span>
          </div>
          <div className="detail-row">
            <span>Payment Date:</span>
            <span>{formatDate(receipt.payment_date)}</span>
          </div>
          <div className="detail-row">
            <span>Payment Method:</span>
            <span>{receipt.payment_method.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
          </div>
        </div>

        {/* Receipt Summary */}
        <div className="invoice-summary">
          <div className="summary-row total">
            <span>Amount Paid:</span>
            <span>${receipt.amount_paid.toFixed(2)}</span>
          </div>
        </div>

        {/* Notes */}
        {receipt.notes && (
          <div className="invoice-notes">
            <h3>Notes</h3>
            <p>{receipt.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReceiptDetail;