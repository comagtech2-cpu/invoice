import api from './api';

class AuthService {
  // Register a new user
  async register(userData) {
    try {
      const response = await api.post('/auth/register/', userData);
      const { access, refresh, user } = response.data;
      
      // Store tokens in localStorage
      localStorage.setItem('accessToken', access);
      localStorage.setItem('refreshToken', refresh);
      
      return user;
    } catch (error) {
      throw error.response.data;
    }
  }

  // Login user
  async login(credentials) {
    try {
      const response = await api.post('/auth/login/', credentials);
      const { access, refresh, user } = response.data;
      
      // Store tokens in localStorage
      localStorage.setItem('accessToken', access);
      localStorage.setItem('refreshToken', refresh);
      
      return user;
    } catch (error) {
      throw error.response.data;
    }
  }

  // Logout user
  logout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  // Get current user
  async getCurrentUser() {
    try {
      const response = await api.get('/auth/user/');
      return response.data;
    } catch (error) {
      throw error.response.data;
    }
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!localStorage.getItem('accessToken');
  }
}

export default new AuthService();