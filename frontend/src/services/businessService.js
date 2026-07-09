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
      // Check for file presence; if present use FormData
      let payload = businessData;
      let config = { headers: { 'Content-Type': 'application/json' } };
      if (businessData && businessData.logo instanceof File) {
        payload = new FormData();
        Object.keys(businessData).forEach((key) => {
          if (businessData[key] !== undefined && businessData[key] !== null) {
            payload.append(key, businessData[key]);
          }
        });
        config = { headers: { 'Content-Type': 'multipart/form-data' } };
      }

      const response = await api.post('/businesses/', payload, config);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: error.message || 'Request failed' };
    }
  }

  // Update an existing business
  async updateBusiness(id, businessData) {
    try {
      let payload = businessData;
      let config = { headers: { 'Content-Type': 'application/json' } };
      if (businessData && businessData.logo instanceof File) {
        payload = new FormData();
        Object.keys(businessData).forEach((key) => {
          if (businessData[key] !== undefined && businessData[key] !== null) {
            payload.append(key, businessData[key]);
          }
        });
        config = { headers: { 'Content-Type': 'multipart/form-data' } };
      }

      const response = await api.put(`/businesses/${id}/`, payload, config);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: error.message || 'Request failed' };
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

  // Clients
  async getClients() {
    try {
      const response = await api.get('/clients/');
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: error.message || 'Request failed' };
    }
  }

  async getClient(id) {
    try {
      const response = await api.get(`/clients/${id}/`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: error.message || 'Request failed' };
    }
  }

  async createClient(clientData) {
    try {
      const response = await api.post('/clients/', clientData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: error.message || 'Request failed' };
    }
  }

  async updateClient(id, clientData) {
    try {
      const response = await api.put(`/clients/${id}/`, clientData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: error.message || 'Request failed' };
    }
  }

  async deleteClient(id) {
    try {
      const response = await api.delete(`/clients/${id}/`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: error.message || 'Request failed' };
    }
  }
}

export default new BusinessService();