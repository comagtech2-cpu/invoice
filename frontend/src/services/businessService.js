import api from './api';

class BusinessService {
  // Get all businesses for the current user
  async getAllBusinesses() {
    try {
      const response = await api.get('/businesses/');
      return response.data;
    } catch (error) {
      throw error.response.data;
    }
  }

  // Get a specific business by ID
  async getBusiness(id) {
    try {
      const response = await api.get(`/businesses/${id}/`);
      return response.data;
    } catch (error) {
      throw error.response.data;
    }
  }

  // Create a new business
  async createBusiness(businessData) {
    try {
      const response = await api.post('/businesses/', businessData);
      return response.data;
    } catch (error) {
      throw error.response.data;
    }
  }

  // Update an existing business
  async updateBusiness(id, businessData) {
    try {
      const response = await api.put(`/businesses/${id}/`, businessData);
      return response.data;
    } catch (error) {
      throw error.response.data;
    }
  }

  // Delete a business
  async deleteBusiness(id) {
    try {
      const response = await api.delete(`/businesses/${id}/`);
      return response.data;
    } catch (error) {
      throw error.response.data;
    }
  }
}

export default new BusinessService();