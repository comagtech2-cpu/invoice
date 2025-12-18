import api from './api';

class DashboardService {
  async getSummary() {
    try {
      const response = await api.get('/dashboard/summary/');
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to fetch dashboard summary' };
    }
  }
}

export default new DashboardService();