import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import invoiceService from '../services/invoiceService';
import businessService from '../services/businessService';

const InvoiceList = () => {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    business: '',
    sort_by: '-created_at'
  });
  const [errors, setErrors] = useState({});

  // Load invoices and businesses when component mounts
  useEffect(() => {
    loadBusinesses();
    loadInvoices();
  }, [currentPage, filters]);

  const loadBusinesses = async () => {
    try {
      const data = await businessService.getAllBusinesses();
      setBusinesses(data);
    } catch (error) {
      console.error('Failed to load businesses:', error);
    }
  };

  const loadInvoices = async () => {
    try {
      setLoading(true);
      // In a real implementation, we would pass filters and pagination params
      // For now, we'll load all invoices
      const response = await invoiceService.getAllInvoices();
      // Handle paginated response
      if (response.results) {
        setInvoices(response.results);
        setTotalCount(response.count);
        setTotalPages(Math.ceil(response.count / 10)); // Assuming page size of 10
      } else {
        // Fallback for non-paginated response
        setInvoices(Array.isArray(response) ? response : []);
        setTotalCount(Array.isArray(response) ? response.length : 0);
        setTotalPages(1);
      }
    } catch (error) {
      const errMsg = (error && (error.detail || error.error || error.message)) || 'Failed to load invoices';
      setErrors({ general: errMsg });
      setInvoices([]);
      setTotalCount(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (name, value) => {
    setFilters({
      ...filters,
      [name]: value
    });
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadInvoices();
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'draft':
        return 'status-badge draft';
      case 'sent':
        return 'status-badge sent';
      case 'paid':
        return 'status-badge paid';
      case 'overdue':
        return 'status-badge overdue';
      case 'cancelled':
        return 'status-badge cancelled';
      default:
        return 'status-badge';
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const handleSort = (sortBy) => {
    handleFilterChange('sort_by', sortBy);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  if (loading) {
    return <div className="loading">Loading invoices...</div>;
  }

  return (
    <div className="invoice-list-container">
      <div className="invoice-header">
        <h2>Invoices</h2>
        <div className="invoice-actions">
          <button onClick={() => navigate('/dashboard')} className="btn-secondary">
            Back to Dashboard
          </button>
          <button onClick={() => navigate('/invoices/create')} className="btn-primary">
            Create Invoice
          </button>
        </div>
      </div>

      {errors.general && (
        <div className="alert alert-danger">
          {errors.general}
        </div>
      )}

      <div className="invoice-filters">
        <form onSubmit={handleSearch} className="filter-form">
          <div className="form-row">
            <div className="form-group">
              <input
                type="text"
                placeholder="Search invoices..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>
            <div className="form-group">
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="draft">Draft</option>
                <option value="sent">Sent</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div className="form-group">
              <select
                value={filters.business}
                onChange={(e) => handleFilterChange('business', e.target.value)}
              >
                <option value="">All Businesses</option>
                {businesses.map(business => (
                  <option key={business.id} value={business.id}>
                    {business.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <button type="submit" className="btn-secondary">Search</button>
            </div>
          </div>
        </form>
      </div>

      <div className="invoice-list">
        {invoices.length === 0 ? (
          <div className="empty-state">
            <p>No invoices found. Create your first invoice to get started.</p>
            <button onClick={() => navigate('/invoices/create')} className="btn-primary">
              Create Invoice
            </button>
          </div>
        ) : (
          <>
            <div className="invoice-table">
              <div className="table-header">
                <div className="table-cell sortable" onClick={() => handleSort(filters.sort_by === 'invoice_number' ? '-invoice_number' : 'invoice_number')}>
                  Invoice # {filters.sort_by === 'invoice_number' ? '↑' : filters.sort_by === '-invoice_number' ? '↓' : ''}
                </div>
                <div className="table-cell sortable" onClick={() => handleSort(filters.sort_by === 'client_name' ? '-client_name' : 'client_name')}>
                  Client {filters.sort_by === 'client_name' ? '↑' : filters.sort_by === '-client_name' ? '↓' : ''}
                </div>
                <div className="table-cell sortable" onClick={() => handleSort(filters.sort_by === 'issue_date' ? '-issue_date' : 'issue_date')}>
                  Date {filters.sort_by === 'issue_date' ? '↑' : filters.sort_by === '-issue_date' ? '↓' : ''}
                </div>
                <div className="table-cell sortable" onClick={() => handleSort(filters.sort_by === 'due_date' ? '-due_date' : 'due_date')}>
                  Due Date {filters.sort_by === 'due_date' ? '↑' : filters.sort_by === '-due_date' ? '↓' : ''}
                </div>
                <div className="table-cell">Currency</div>
                <div className="table-cell sortable" onClick={() => handleSort(filters.sort_by === 'status' ? '-status' : 'status')}>
                  Status {filters.sort_by === 'status' ? '↑' : filters.sort_by === '-status' ? '↓' : ''}
                </div>
                <div className="table-cell sortable" onClick={() => handleSort(filters.sort_by === 'total_amount' ? '-total_amount' : 'total_amount')}>
                  Amount {filters.sort_by === 'total_amount' ? '↑' : filters.sort_by === '-total_amount' ? '↓' : ''}
                </div>
                <div className="table-cell">Actions</div>
              </div>
              {invoices.map(invoice => (
                <div key={invoice.id} className="table-row">
                  <div className="table-cell">{invoice.invoice_number}</div>
                  <div className="table-cell">{invoice.client_name}</div>
                  <div className="table-cell">{formatDate(invoice.issue_date)}</div>
                  <div className="table-cell">{formatDate(invoice.due_date)}</div>
                  <div className="table-cell">{invoice.currency}</div>
                  <div className="table-cell">
                    <span className={getStatusBadgeClass(invoice.status)}>
                      {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                    </span>
                  </div>
                  <div className="table-cell">${Number(invoice?.total_amount ?? 0).toFixed(2)
}</div>
                  <div className="table-cell">
                    <button
                      onClick={() => navigate(`/invoices/${invoice.id}`)}
                      className="btn-secondary btn-small"
                    >
                      View
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="pagination">
                <button 
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="btn-secondary"
                >
                  Previous
                </button>
                <span>Page {currentPage} of {totalPages}</span>
                <button 
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="btn-secondary"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default InvoiceList;