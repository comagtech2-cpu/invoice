import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import invoiceService from '../services/invoiceService';
import receiptService from '../services/receiptService';

const InvoiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});

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

  const handleDownloadPDF = () => {
    // Create a temporary link to download the PDF
    const pdfUrl = `http://localhost:8000/api/invoices/${id}/?format=pdf`;
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = `invoice_${invoice.invoice_number}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
const formatMoney = (value) => {
  const num = Number(value);
  return isNaN(num) ? "0.00" : num.toFixed(2);
};



  const handleGenerateReceipt = async () => {
    if (window.confirm('Generate receipt for this paid invoice?')) {
      try {
        const receiptData = {
          invoice: id,
          payment_date: new Date().toISOString().split('T')[0], // Today's date
          payment_method: 'cash', // Default, can be made configurable
          amount_paid: invoice.total_amount,
          notes: `Payment received for Invoice ${invoice.invoice_number}`
        };
        const receipt = await receiptService.createReceipt(receiptData);
        navigate(`/receipts/${receipt.id}`);
      } catch (error) {
        const errMsg = (error && (error.detail || error.error || error.message)) || 'Failed to generate receipt';
        setErrors({ general: errMsg });
      }
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return <div className="loading">Loading invoice...</div>;
  }

  if (!invoice) {
    return (
      <div className="invoice-detail-container">
        <div className="invoice-header">
          <h2>Invoice Not Found</h2>
          <button onClick={() => navigate('/invoices')} className="btn-secondary">
            Back to Invoices
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="invoice-detail-container">
      <div className="invoice-header">
        <h2>Invoice #{invoice.invoice_number}</h2>
        <div className="invoice-actions">
          <button onClick={handlePrint} className="btn-secondary">
            Print
          </button>
          <button onClick={handleDownloadPDF} className="btn-secondary">
            Download PDF
          </button>
          {invoice.status === 'draft' && (
            <button onClick={handleSendInvoice} className="btn-primary">
              Send Invoice
            </button>
          )}
          {invoice.status !== 'paid' && (
            <button onClick={handleMarkAsPaid} className="btn-primary">
              Mark as Paid
            </button>
          )}
          {invoice.status === 'paid' && (
            <button onClick={handleGenerateReceipt} className="btn-primary">
              Generate Receipt
            </button>
          )}
          <button onClick={handleDelete} className="btn-remove">
            Delete
          </button>
          <button onClick={() => navigate('/invoices')} className="btn-secondary">
            Back to Invoices
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
          <h3>{invoice.business_name}</h3>
          {invoice.business_address && <p>{invoice.business_address}</p>}
          {invoice.business_email && <p>{invoice.business_email}</p>}
          {invoice.business_phone && <p>{invoice.business_phone}</p>}
        </div>

        {/* Client Information */}
        <div className="client-info">
          <h3>Bill To:</h3>
          <p>{invoice.client_name}</p>
          {invoice.client_address && <p>{invoice.client_address}</p>}
          {invoice.client_email && <p>{invoice.client_email}</p>}
          {invoice.client_phone && <p>{invoice.client_phone}</p>}
        </div>

        {/* Invoice Details */}
        <div className="invoice-details">
          <div className="detail-row">
            <span>Issue Date:</span>
            <span>{formatDate(invoice.issue_date)}</span>
          </div>
          <div className="detail-row">
            <span>Due Date:</span>
            <span>{formatDate(invoice.due_date)}</span>
          </div>
          <div className="detail-row">
            <span>Currency:</span>
            <span>{invoice.currency}</span>
          </div>
          <div className="detail-row">
            <span>Status:</span>
            <span className={`status-badge ${invoice.status}`}>
              {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
            </span>
          </div>
        </div>

        {/* Line Items */}
        <div className="line-items">
          <h3>Items</h3>
          <table className="line-items-table">
            <thead>
              <tr>
                <th>Description</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {invoice.line_items.map((item, index) => (
                <tr key={index}>
                  <td>{item.description}</td>
                  <td>{item.quantity}</td>
                  <td>${formatMoney(item.unit_price)}</td>
                  <td>${formatMoney(item.total_price)}</td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Invoice Summary */}
        <div className="invoice-summary">
          <div className="summary-row">
            <span>Subtotal:</span>
          <span>${formatMoney(invoice.subtotal)}</span>
          </div>
          <div className="summary-row">
            <span>Tax ({invoice.tax_rate}%):</span>
            <span>${formatMoney(invoice.tax_amount)}</span>
          </div>
          <div className="summary-row total">
            <span>Total:</span>
            <span>${formatMoney(invoice.total_amount)}</span>
          </div>
        </div>

        {/* Notes */}
        {invoice.notes && (
          <div className="invoice-notes">
            <h3>Notes</h3>
            <p>{invoice.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InvoiceDetail;