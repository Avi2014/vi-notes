import axios from 'axios';

/**
 * Auth Service
 * 
 * Handles all authentication API calls to the backend
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

// Create axios instance with base URL
const authAPI = axios.create({
  baseURL: `${API_URL}/api/auth`,
  headers: {
    'Content-Type': 'application/json'
  }
});

/**
 * Add JWT token to all requests
 * Intercepts requests and adds Authorization header if token exists
 */
authAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Handle token expiration
 * Removes token if response is 401 (unauthorized)
 */
authAPI.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('authUser');
      // Could dispatch logout action here if using state management
    }
    return Promise.reject(error);
  }
);

/**
 * Register a new user
 * @param email - User email
 * @param password - User password (min 6 chars)
 * @returns Auth response with token and user
 */
export const registerUser = async (email: string, password: string) => {
  try {
    const response = await authAPI.post('/register', { email, password });
    return response.data.data; // Extract the data property from response
  } catch (error: any) {
    console.error('❌ Registration failed:', error.message);
    if (error.response?.data?.error) {
      console.error('   Backend error:', error.response.data.error);
    } else if (error.message === 'Network Error') {
      console.error('   Network error - Is backend running on http://localhost:5001?');
    }
    throw error;
  }
};

/**
 * Login user
 * @param email - User email
 * @param password - User password
 * @returns Auth response with token and user
 */
export const loginUser = async (email: string, password: string) => {
  try {
    const response = await authAPI.post('/login', { email, password });
    return response.data.data; // Extract the data property from response
  } catch (error: any) {
    console.error('❌ Login failed:', error.message);
    if (error.response?.data?.error) {
      console.error('   Backend error:', error.response.data.error);
    } else if (error.message === 'Network Error') {
      console.error('   Network error - Is backend running on http://localhost:5001?');
    }
    throw error;
  }
};

/**
 * Get current user info
 * Requires valid JWT token
 * @returns User data
 */
export const getCurrentUser = async () => {
  const response = await authAPI.get('/me');
  return response.data.data; // Extract the data property from response
};

/**
 * Save auth token to localStorage
 * @param token - JWT token
 * @param user - User data
 */
export const saveAuthData = (token: string, user: any) => {
  localStorage.setItem('authToken', token);
  localStorage.setItem('authUser', JSON.stringify(user));
};

/**
 * Get auth data from localStorage
 * @returns Token and user or null
 */
export const getAuthData = () => {
  const token = localStorage.getItem('authToken');
  const userStr = localStorage.getItem('authUser');
  const user = userStr ? JSON.parse(userStr) : null;
  return { token, user };
};

/**
 * Clear auth data from localStorage
 */
export const clearAuthData = () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('authUser');
};
