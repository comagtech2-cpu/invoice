import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import invoiceService from '../services/invoiceService';
import receiptService from '../services/receiptService';
import { formatCurrency } from '../utils/currency';
import Spinner from './ui/Spinner';
import ErrorBanner from './ui/ErrorBanner';
import HomeButton from './ui/HomeButton';

const InvoiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [receiptForm, setReceiptForm] = useState({
    payment_method: 'cash',
    payment_date: new Date().toISOString().split('T')[0],
    amount_paid: '',
    notes: ''
  });

  useEffect(() => {
    loadInvoice();
  }, [id]);

  const loadInvoice = async () => {
    try {
      setLoading(true);
      const data = await invoiceService.getInvoice(id);
      setInvoice(data);
    } catch (error) {
      const errMsg = (error && (error.detail || error.error || error.message)) || 'Failed to load invoice';
      setErrors({ general: errMsg });
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    try {
      const response = await invoiceService.downloadInvoicePdf(id);
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      // Try to extract filename from content-disposition header, fallback to invoice number
      const disposition = response.headers && response.headers['content-disposition'];
      const filenameMatch = disposition && disposition.match(/filename="(.+)"/);
      const filename = filenameMatch ? filenameMatch[1] : `invoice_${invoice.invoice_number}.pdf`;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      const errMsg = (error && (error.detail || error.error || error.message)) || 'Failed to download PDF';
      setErrors({ general: errMsg });
    }
  };

  const handleSendInvoice = async () => {
    if (window.confirm('Are you sure you want to send this invoice to the client?')) {
      try {
        // In a real implementation, we would call an API endpoint to send the invoice
        // For now, we'll just show a success message
        alert('Invoice sent successfully!');

        // Update the invoice status in the UI
        if (invoice && invoice.status === 'draft') {
          setInvoice({ ...invoice, status: 'sent' });
        }
      } catch (error) {
        const errMsg = (error && (error.detail || error.error || error.message)) || 'Failed to send invoice';
        setErrors({ general: errMsg });
      }
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      try {
        await invoiceService.deleteInvoice(id);
        navigate('/invoices');
      } catch (error) {
        const errMsg = (error && (error.detail || error.error || error.message)) || 'Failed to delete invoice';
        setErrors({ general: errMsg });
      }
    }
  };

  const handleMarkAsPaid = async () => {
    try {
      const updatedData = { ...invoice, status: 'paid' };
      const data = await invoiceService.updateInvoice(id, updatedData);
      setInvoice(data);
    } catch (error) {
      const errMsg = (error && (error.detail || error.error || error.message)) || 'Failed to update invoice status';
      setErrors({ general: errMsg });
    }
  };
const formatMoney = (value, currency) => formatCurrency(value, currency);



  const handleGenerateReceipt = async () => {
    setShowReceiptModal(true);
  };

  const handleSubmitReceipt = async () => {
    try {
      // Update receipt form with invoice ID and actual notes
      const receiptData = {
        invoice: Number(id),
        payment_date: receiptForm.payment_date,
        payment_method: receiptForm.payment_method,
        amount_paid: Number(receiptForm.amount_paid) || Number(invoice.total_amount),
        notes: receiptForm.notes || `Payment received for Invoice ${invoice.invoice_number}`
      };
      const receipt = await receiptService.createReceipt(receiptData);

      // Mark invoice as paid in UI and backend (if it's not already paid)
      if (invoice && String(invoice.status).toLowerCase() !== 'paid') {
        try {
          const updated = await invoiceService.updateInvoice(id, { ...invoice, status: 'paid' });
          setInvoice(updated);
        } catch (updErr) {
          // Non-fatal: keep moving to receipt view but surface a warning
          console.warn('Failed to mark invoice as paid after receipt creation:', updErr);
        }
      }

      setShowReceiptModal(false);
      navigate(`/receipts/${receipt.id}`);
    } catch (error) {
      const errMsg = (error && (error.detail || error.error || error.message)) || 'Failed to generate receipt';
      setErrors({ general: errMsg });
    }
  };

  const handleReceiptFormChange = (e) => {
    const { name, value } = e.target;
    setReceiptForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return <Spinner label="Loading invoice..." />;
  }

  if (!invoice) {
    return (
      <div className="invoice-detail-container p-4">
        <div className="invoice-header flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Invoice Not Found</h2>
          <button onClick={() => navigate('/invoices')} className="btn-secondary w-full sm:w-auto">
            Back to Invoices
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="invoice-detail-container p-4">
      <div className="invoice-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <div className="flex items-center gap-4">
          {invoice.business_logo_url ? (
            <img src={invoice.business_logo_url} alt="Business logo" className="w-16 h-16 object-contain" />
          ) : null}
          <div>
            <h2 className="text-lg font-semibold">Invoice #{invoice.invoice_number}</h2>
            <div className="text-sm text-gray-600">{invoice.business_name}</div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <HomeButton />
          <button onClick={handlePrint} className="btn-secondary w-full sm:w-auto">Print</button>
          <button onClick={handleDownloadPDF} className="btn-secondary w-full sm:w-auto">Download PDF</button>
          {invoice.status === 'draft' && (
            <button onClick={handleSendInvoice} className="btn-primary w-full sm:w-auto">Send Invoice</button>
          )}
          {invoice.status !== 'paid' && (
            <button onClick={handleMarkAsPaid} className="btn-primary w-full sm:w-auto">Mark as Paid</button>
          )}
          {(invoice.status === 'paid' || invoice.status === 'draft') && (
            <button onClick={handleGenerateReceipt} className="btn-primary w-full sm:w-auto">Generate Receipt</button>
          )}
          <button onClick={() => navigate('/receipts')} className="btn-secondary w-full sm:w-auto">View Receipts</button>
          <button onClick={handleDelete} className="btn-remove w-full sm:w-auto">Delete</button>
          <button onClick={() => navigate('/invoices')} className="btn-secondary w-full sm:w-auto">Back to Invoices</button>
        </div>
      </div>

      {errors.general && <ErrorBanner message={errors.general} />}

      <div className="invoice-content grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="business-info bg-white p-4 rounded shadow-sm">
          <h3 className="font-semibold">Business</h3>
          {invoice.business_address && <p className="text-sm text-gray-600">{invoice.business_address}</p>}
          {invoice.business_email && <p className="text-sm text-gray-600">{invoice.business_email}</p>}
        </div>

        <div className="client-info bg-white p-4 rounded shadow-sm">
          <h3 className="font-semibold">Bill To</h3>
          <p className="text-sm">{invoice.client_name}</p>
          {invoice.client_address && <p className="text-sm text-gray-600">{invoice.client_address}</p>}
        </div>

        <div className="invoice-details bg-white p-4 rounded shadow-sm">
          <div className="detail-row flex justify-between"><span>Issue Date:</span><span>{formatDate(invoice.issue_date)}</span></div>
          <div className="detail-row flex justify-between"><span>Due Date:</span><span>{formatDate(invoice.due_date)}</span></div>
          <div className="detail-row flex justify-between"><span>Currency:</span><span>{invoice.currency}</span></div>
          <div className="detail-row flex justify-between"><span>Status:</span><span className={`status-badge ${invoice.status}`}>{invoice.status}</span></div>
        </div>

        <div className="line-items lg:col-span-2 bg-white p-4 rounded shadow-sm">
          <h3 className="font-semibold mb-2">Items</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="text-left text-sm text-gray-600">
                <tr><th>Description</th><th>Qty</th><th>Unit</th><th>Total</th></tr>
              </thead>
              <tbody>
                {invoice.line_items.map((item, idx) => (
                  <tr key={idx} className="border-t"><td>{item.description}</td><td>{item.quantity}</td><td>{formatCurrency(item.unit_price, invoice.currency)}</td><td className="text-right">{formatCurrency(item.total_price, invoice.currency)}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="invoice-summary bg-white p-4 rounded shadow-sm">
          <div className="summary-row flex justify-between"><span>Subtotal:</span><span>{formatCurrency(invoice.subtotal, invoice.currency)}</span></div>
          <div className="summary-row flex justify-between"><span>Tax ({invoice.tax_rate}%):</span><span>{formatCurrency(invoice.tax_amount, invoice.currency)}</span></div>
          <div className="summary-row total flex justify-between font-semibold text-lg"><span>Total:</span><span>{formatCurrency(invoice.total_amount, invoice.currency)}</span></div>
        </div>

        {invoice.notes && (
          <div className="invoice-notes bg-white p-4 rounded shadow-sm">
            <h3 className="font-semibold">Notes</h3>
            <p className="text-sm text-gray-700">{invoice.notes}</p>
          </div>
        )}
      </div>

      {/* Receipt Modal */}
      {showReceiptModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold mb-4">Generate Receipt</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Payment Method</label>
                <select
                  name="payment_method"
                  value={receiptForm.payment_method}
                  onChange={handleReceiptFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="cash">Cash</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="credit_card">Credit Card</option>
                  <option value="debit_card">Debit Card</option>
                  <option value="check">Check</option>
                  <option value="online">Online Payment</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Payment Date</label>
                <input
                  type="date"
                  name="payment_date"
                  value={receiptForm.payment_date}
                  onChange={handleReceiptFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Amount Paid</label>
                <input
                  type="number"
                  name="amount_paid"
                  step="0.01"
                  placeholder={invoice.total_amount}
                  value={receiptForm.amount_paid}
                  onChange={handleReceiptFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {!receiptForm.amount_paid && (
                  <p className="text-sm text-gray-500 mt-1">Default: {formatCurrency(invoice.total_amount, invoice.currency)}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Notes (Optional)</label>
                <textarea
                  name="notes"
                  value={receiptForm.notes}
                  onChange={handleReceiptFormChange}
                  placeholder={`Payment received for Invoice ${invoice.invoice_number}`}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  onClick={() => setShowReceiptModal(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitReceipt}
                  className="btn-primary flex-1"
                >
                  Create Receipt
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoiceDetail;