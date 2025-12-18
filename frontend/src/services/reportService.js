import api from './api';

class ReportService {
  async getReports(params = {}) {
    try {
      // Filter out empty params
      const filteredParams = {};
      Object.keys(params).forEach(key => {
        if (params[key] !== '' && params[key] !== null && params[key] !== undefined) {
          filteredParams[key] = params[key];
        }
      });
      
      // Construct URL with query parameters
      let url = '/reports/';
      if (Object.keys(filteredParams).length > 0) {
        const queryString = new URLSearchParams(filteredParams).toString();
        url += `?${queryString}`;
      }
      
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to fetch reports' };
    }
  }
}

export default new ReportService();