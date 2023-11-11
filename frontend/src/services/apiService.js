// src/services/api.js
import axios from 'axios';

const BASE_URL = 'http://localhost:5000'

const api = axios.create({
  baseURL: BASE_URL,
});

const handleError = (error) => {
  console.error('API Error:', error);
  throw error;
};

const apiService = {
  // ... other methods

  getTest: async () => {
    try {
      const response = await api.get('/api');
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },

};

export default apiService;
