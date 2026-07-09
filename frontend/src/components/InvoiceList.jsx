import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import invoiceService from '../services/invoiceService';
import businessService from '../services/businessService';
import { formatCurrency } from '../utils/currency';
import Spinner from './ui/Spinner';
import ErrorBanner from './ui/ErrorBanner';
import HomeButton from './ui/HomeButton';

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
  const searchDebounceRef = useRef(null);

  // Load invoices and businesses when component mounts
  useEffect(() => {
    loadBusinesses();
    fetchInvoices(filters, currentPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadBusinesses = async () => {
    try {
      const data = await businessService.getAllBusinesses();
      setBusinesses(data);
    } catch (error) {
      console.error('Failed to load businesses:', error);
    }
  };

  // Fetch invoices and apply client-side filtering/pagination
  const fetchInvoices = async (filtersArg = {}, page = 1) => {
    try {
      setLoading(true);

      const pageSize = 10;
      const params = {
        search: filtersArg.search || undefined,
        status: filtersArg.status || undefined,
        business: filtersArg.business || undefined,
        sort_by: filtersArg.sort_by || undefined,
        page,
        page_size: pageSize
      };

      const response = await invoiceService.getAllInvoices(params);

      if (response && response.results) {
        setInvoices(response.results);
        setTotalCount(response.count || response.results.length);
        setTotalPages(Math.max(1, Math.ceil((response.count || response.results.length) / pageSize)));
      } else if (Array.isArray(response)) {
        // Fallback - non-paginated response
        const total = response.length;
        const totalPagesCalc = Math.max(1, Math.ceil(total / pageSize));
        const start = (page - 1) * pageSize;
        setInvoices(response.slice(start, start + pageSize));
        setTotalCount(total);
        setTotalPages(totalPagesCalc);
      } else {
        setInvoices([]);
        setTotalCount(0);
        setTotalPages(1);
      }

      setErrors({});
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
    const next = {
      ...filters,
      [name]: value
    };
    setFilters(next);
    setCurrentPage(1); // Reset to first page when filters change

    // Debounce search input to avoid too many fetches while typing
    if (name === 'search') {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
      searchDebounceRef.current = setTimeout(() => {
        fetchInvoices(next, 1);
      }, 300);
    } else {
      // Immediate fetch for other filter changes
      fetchInvoices(next, 1);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // Ensure any debounced search is flushed immediately
    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
      searchDebounceRef.current = null;
    }
    fetchInvoices(filters, 1);
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
      fetchInvoices(filters, newPage);
    }
  };

  // Refetch when the current page changes (covers other triggers)
  useEffect(() => {
    fetchInvoices(filters, currentPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  if (loading) {
    return <Spinner label="Loading invoices..." />;
  }

  return (
    <div className="invoice-list-container p-4">
      <div className="invoice-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <h2 className="text-xl font-semibold">Invoices</h2>
        <div className="flex flex-wrap gap-2">
          <HomeButton />
          <button onClick={() => navigate('/invoices/create')} className="btn-primary w-full sm:w-auto">
            Create Invoice
          </button>
        </div>
      </div>

      {errors.general && <ErrorBanner message={errors.general} />}

      <div className="invoice-filters mb-4">
        <form onSubmit={handleSearch} className="filter-form">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
            <div>
              <input
                type="text"
                placeholder="Search invoices..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="input w-full"
                aria-label="Search invoices"
              />
            </div>
            <div>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="input w-full"
                aria-label="Filter by status"
              >
                <option value="">All Statuses</option>
                <option value="draft">Draft</option>
                <option value="sent">Sent</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <select
                value={filters.business}
                onChange={(e) => handleFilterChange('business', e.target.value)}
                className="input w-full"
                aria-label="Filter by business"
              >
                <option value="">All Businesses</option>
                {businesses.map(business => (
                  <option key={business.id} value={business.id}>
                    {business.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <button type="submit" className="btn-secondary w-full">Search</button>
            </div>
          </div>
        </form>
      </div>

      <div className="invoice-list">
        {invoices.length === 0 ? (
          <div className="empty-state p-6 bg-white rounded shadow-sm text-center">
            <p className="mb-3">No invoices found. Create your first invoice to get started.</p>
            <button onClick={() => navigate('/invoices/create')} className="btn-primary">Create Invoice</button>
          </div>
        ) : (
          <>
            {/* Table for md+ screens */}
            <div className="hidden md:block overflow-x-auto bg-white rounded shadow-sm">
              <table className="w-full table-auto">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-3 text-left">Invoice #</th>
                    <th className="p-3 text-left">Client</th>
                    <th className="p-3">Date</th>
                    <th className="p-3">Due</th>
                    <th className="p-3">Currency</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Amount</th>
                    <th className="p-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map(invoice => (
                    <tr key={invoice.id} className="border-t">
                      <td className="p-3">{invoice.invoice_number}</td>
                      <td className="p-3">{invoice.client_name}</td>
                      <td className="p-3 text-center">{formatDate(invoice.issue_date)}</td>
                      <td className="p-3 text-center">{formatDate(invoice.due_date)}</td>
                      <td className="p-3 text-center">{invoice.currency}</td>
                      <td className="p-3 text-center"><span className={getStatusBadgeClass(invoice.status)}>{invoice.status}</span></td>
                      <td className="p-3 text-right">{formatCurrency(invoice?.total_amount ?? 0, invoice?.currency)}</td>
                      <td className="p-3 text-center"><button onClick={() => navigate(`/invoices/${invoice.id}`)} className="btn-secondary btn-sm">View</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile list for small screens */}
            <div className="md:hidden space-y-2">
              {invoices.map(inv => (
                <div key={inv.id} className="bg-white p-3 rounded shadow-sm">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-medium">{inv.invoice_number}</div>
                      <div className="text-sm text-gray-600">{inv.client_name}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm">{formatCurrency(inv.total_amount, inv.currency)}</div>
                      <div className="text-xs text-gray-500">{formatDate(inv.due_date)}</div>
                    </div>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <button onClick={() => navigate(`/invoices/${inv.id}`)} className="btn-secondary w-full">View</button>
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-4 flex items-center justify-between">
                <div>
                  <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="btn-secondary mr-2">Previous</button>
                  <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="btn-secondary">Next</button>
                </div>
                <div className="text-sm text-gray-600">Page {currentPage} of {totalPages}</div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default InvoiceList;