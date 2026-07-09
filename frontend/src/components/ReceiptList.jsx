import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import receiptService from '../services/receiptService';
import { formatCurrency } from '../utils/currency';
import Spinner from './ui/Spinner';
import ErrorBanner from './ui/ErrorBanner';
import HomeButton from './ui/HomeButton';

const ReceiptList = () => {
  const navigate = useNavigate();
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadReceipts();
  }, []);

  const loadReceipts = async () => {
    try {
      setLoading(true);
      const response = await receiptService.getAllReceipts();
      if (response.results) {
        setReceipts(response.results);
      } else {
        setReceipts(Array.isArray(response) ? response : []);
      }
    } catch (error) {
      const errMsg = (error && (error.detail || error.error || error.message)) || 'Failed to load receipts';
      setErrors({ general: errMsg });
      setReceipts([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return <Spinner label="Loading receipts..." />;
  }

  return (
    <div className="receipt-list-container p-4">
      <div className="invoice-header flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Receipts</h2>
        <div className="invoice-actions">
          <HomeButton />
        </div>
      </div>

      {errors.general && <ErrorBanner message={errors.general} />} 

      <div className="receipt-list">
        {receipts.length === 0 ? (
          <div className="empty-state">
            <p>No receipts found.</p>
          </div>
        ) : (
          <table className="invoice-table">
            <thead>
              <tr className="table-header">
                <th className="table-cell">Receipt #</th>
                <th className="table-cell">Invoice #</th>
                <th className="table-cell">Received From</th>
                <th className="table-cell">Date</th>
                <th className="table-cell">Amount</th>
                <th className="table-cell">Actions</th>
              </tr>
            </thead>
            <tbody>
              {receipts.map(r => (
                <tr key={r.id} className="table-row">
                  <td className="table-cell" data-label="Receipt #">{r.receipt_number}</td>
                  <td className="table-cell" data-label="Invoice #">{r.invoice_number}</td>
                  <td className="table-cell" data-label="Received From">{r.client_name}</td>
                  <td className="table-cell" data-label="Date">{formatDate(r.payment_date)}</td>
                  <td className="table-cell" data-label="Amount">{formatCurrency(r.amount_paid ?? 0, r.currency)}</td>
                  <td className="table-cell" data-label="Actions">
                    <button onClick={() => navigate(`/receipts/${r.id}`)} className="btn-secondary btn-small">View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ReceiptList;
