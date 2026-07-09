import api from './api';

class InvoiceService {
  // Get all invoices for the current user
  async getAllInvoices(params) {
    try {
      const options = params ? { params } : undefined;
      const response = await api.get('/invoices/', options);
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

  // Download invoice PDF (returns axios response with blob)
  async downloadInvoicePdf(id) {
    try {
      const response = await api.get(`/invoices/${id}/?format=pdf`, { responseType: 'blob' });
      return response;
    } catch (error) {
      throw error.response?.data || { error: error.message || 'Request failed' };
    }
  }

  // Templates
  async getTemplates(businessId) {
    try {
      const params = businessId ? { business: businessId } : undefined;
      const response = await api.get('/invoice-templates/', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: error.message || 'Request failed' };
    }
  }

  async getTemplate(id) {
    try {
      const response = await api.get(`/invoice-templates/${id}/`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: error.message || 'Request failed' };
    }
  }

  async createTemplate(data) {
    try {
      const response = await api.post('/invoice-templates/', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: error.message || 'Request failed' };
    }
  }

  async updateTemplate(id, data) {
    try {
      const response = await api.put(`/invoice-templates/${id}/`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: error.message || 'Request failed' };
    }
  }

  async deleteTemplate(id) {
    try {
      const response = await api.delete(`/invoice-templates/${id}/`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: error.message || 'Request failed' };
    }
  }
}

export default new InvoiceService();