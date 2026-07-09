import api from './api';

class ReceiptService {
  // Get all receipts for the current user
  async getAllReceipts() {
    try {
      const response = await api.get('/receipts/');
      return response.data;
    } catch (error) {
      throw error.response.data;
    }
  }

  // Get a specific receipt by ID
  async getReceipt(id) {
    try {
      const response = await api.get(`/receipts/${id}/`);
      return response.data;
    } catch (error) {
      throw error.response.data;
    }
  }

  // Create a new receipt
  async createReceipt(receiptData) {
    try {
      
    console.log("Receipt payload being sent:", receiptData);
      const response = await api.post('/receipts/', receiptData);
      return response.data;
    } catch (error) {
       //console.error("Receipt error response:", error.response?.data);
      throw error.response.data;
    }
  }

  // Update an existing receipt
  async updateReceipt(id, receiptData) {
    try {
      const response = await api.put(`/receipts/${id}/`, receiptData);
      return response.data;
    } catch (error) {
      throw error.response.data;
    }
  }

  // Delete a receipt
  async deleteReceipt(id) {
    try {
      const response = await api.delete(`/receipts/${id}/`);
      return response.data;
    } catch (error) {
      throw error.response.data;
    }
  }
}

export default new ReceiptService();