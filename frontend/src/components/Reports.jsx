import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import reportService from '../services/reportService';
import api from '../services/api';

const Reports = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState({
    financial_report: [],
    invoices: []
  });
  const [filters, setFilters] = useState({
    start_date: '',
    end_date: '',
    status: '',
    business_id: ''
  });
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      const data = await reportService.getReports(filters);
      setReports(data);
    } catch (error) {
      setErrors({ general: error.error || 'Failed to load reports' });
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    loadReports();
  };

  const handleResetFilters = () => {
    setFilters({
      start_date: '',
      end_date: '',
      status: '',
      business_id: ''
    });
  };

  const handleExportCSV = async () => {
    try {
      // Create query string from filters
      const queryParams = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          queryParams.append(key, filters[key]);
        }
      });
      queryParams.append('format', 'csv');
      
      // Make API call to get CSV data
      const response = await api.get(`/reports/?${queryParams.toString()}`, {
        responseType: 'blob'
      });
      
      // Create blob and download link
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'invoices_report.csv';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting CSV:', error);
      setErrors({ general: 'Failed to export CSV' });
    }
  };

  if (loading) {
    return <div className="loading">Loading reports...</div>;
  }

  return (
    <div className="reports-container">
      <div className="reports-header">
        <h2>Financial Reports</h2>
        <button onClick={() => navigate('/dashboard')} className="btn-secondary">
          Back to Dashboard
        </button>
      </div>

      {errors.general && (
        <div className="alert alert-danger">
          {errors.general}
        </div>
      )}

      <div className="reports-filters">
        <form onSubmit={handleFilterSubmit}>
          <div className="filter-row">
            <div className="form-group">
              <label htmlFor="start_date">Start Date</label>
              <input
                type="date"
                id="start_date"
                name="start_date"
                value={filters.start_date}
                onChange={handleFilterChange}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="end_date">End Date</label>
              <input
                type="date"
                id="end_date"
                name="end_date"
                value={filters.end_date}
                onChange={handleFilterChange}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="status">Status</label>
              <select
                id="status"
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
              >
                <option value="">All Statuses</option>
                <option value="draft">Draft</option>
                <option value="sent">Sent</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="business_id">Business ID</label>
              <input
                type="number"
                id="business_id"
                name="business_id"
                value={filters.business_id}
                onChange={handleFilterChange}
              />
            </div>
          </div>
          
          <div className="filter-actions">
            <button type="submit" className="btn-primary">Apply Filters</button>
            <button type="button" className="btn-secondary" onClick={handleResetFilters}>Reset</button>
            <button type="button" className="btn-secondary" onClick={handleExportCSV}>Export CSV</button>
          </div>
        </form>
      </div>

      <div className="reports-charts">
        <div className="chart-container">
          <h3>Revenue Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={reports.financial_report}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" />
              <YAxis />
              <Tooltip formatter={(value) => [`$${value}`, 'Revenue']} />
              <Legend />
              <Bar dataKey="revenue" fill="#8884d8" name="Revenue ($)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="reports-table">
        <h3>Invoices</h3>
        <table className="table">
          <thead>
            <tr>
              <th>Invoice #</th>
              <th>Client</th>
              <th>Business</th>
              <th>Issue Date</th>
              <th>Due Date</th>
              <th>Status</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {reports.invoices.map(invoice => (
              <tr key={invoice.id}>
                <td>{invoice.invoice_number}</td>
                <td>{invoice.client_name}</td>
                <td>{invoice.business_name}</td>
                <td>{new Date(invoice.issue_date).toLocaleDateString()}</td>
                <td>{new Date(invoice.due_date).toLocaleDateString()}</td>
                <td>
                  <span className={`status-badge ${invoice.status}`}>
                    {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                  </span>
                </td>
                <td>${invoice.total_amount.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Reports;