import api from './api';

class InvoiceService {
  // Get all invoices for the current user
  async getAllInvoices() {
    try {
      const response = await api.get('/invoices/');
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: error.message || 'Request failed' };
    }
  }

  // Get a specific invoice by ID
  async getInvoice(id) {
    try {
      const response = await api.get(`/invoices/${id}/`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: error.message || 'Request failed' };
    }
  }

  // Create a new invoice
  async createInvoice(invoiceData) {
    try {
      const response = await api.post('/invoices/', invoiceData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: error.message || 'Request failed' };
    }
  }

  // Update an existing invoice
  async updateInvoice(id, invoiceData) {
    try {
      const response = await api.put(`/invoices/${id}/`, invoiceData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: error.message || 'Request failed' };
    }
  }

  // Delete an invoice
  async deleteInvoice(id) {
    try {
      const response = await api.delete(`/invoices/${id}/`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: error.message || 'Request failed' };
    }
  }
}

export default new InvoiceService();