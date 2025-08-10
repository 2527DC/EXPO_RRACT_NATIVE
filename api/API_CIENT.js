// src/api/client.js
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'https://api.gocab.tech/api';

const api_client = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json', // Default content type
  },
});

// Request interceptor
api_client.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log request
    console.log('📤 API Request:', {
      method: config.method?.toUpperCase(),
      url: `${config.baseURL}${config.url}`,
      headers: config.headers,
      data: config.data,
    });

    return config;
  },
  (error) => {
    console.error('❌ API Request Error:', error.message);
    return Promise.reject(error);
  }
);

// Response interceptor
api_client.interceptors.response.use(
  (response) => {
    // Log successful response
    console.log('✅ API Response:', {
      url: `${response.config.baseURL}${response.config.url}`,
      status: response.status,
      data: response.data,
    });
    return response;
  },
  (error) => {
    // Log error response
    console.error('❌ API Error Response:', {
      url: error.config ? `${error.config.baseURL}${error.config.url}` : 'N/A',
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });
    return Promise.reject(error);
  }
);


export default api_client;