import axios from 'axios';

/**
 * Keystroke Service
 * 
 * Handles buffering and submission of keystroke events to the backend
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

// Create axios instance
const keystrokeAPI = axios.create({
  baseURL: `${API_URL}/api/keystrokes`,
  headers: {
    'Content-Type': 'application/json'
  }
});

/**
 * Add JWT token to keystroke requests
 */
keystrokeAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log('✓ JWT token attached to keystroke request');
  } else {
    console.warn('⚠️ No JWT token found in localStorage for keystroke request');
  }
  return config;
});

/**
 * Handle response errors
 */
keystrokeAPI.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error('❌ Keystroke API 401 Unauthorized - Token may be invalid or expired');
      console.error('Error:', error.response?.data?.error || 'Unknown error');
      localStorage.removeItem('authToken');
      localStorage.removeItem('authUser');
    }
    if (error.response?.status === 500) {
      console.error('❌ Backend error:', error.response?.data?.error);
    }
    return Promise.reject(error);
  }
);

export interface KeystrokeEventData {
  keyCode: number;
  timestamp: number;
  interKeystrokeInterval: number;
  keyType: 'keydown' | 'keyup';
}

export interface KeystrokeSubmission {
  sessionId?: string;
  events: KeystrokeEventData[];
}

/**
 * Submit keystroke events to backend
 * @param sessionId - Optional session identifier
 * @param events - Array of keystroke events
 */
export const submitKeystrokeEvents = async (
  sessionId: string | undefined,
  events: KeystrokeEventData[]
) => {
  const submission: KeystrokeSubmission = {
    sessionId,
    events
  };

  const response = await keystrokeAPI.post('/', submission);
  return response.data;
};

/**
 * Get keystroke statistics for current user
 */
export const getKeystrokeStats = async () => {
  const response = await keystrokeAPI.get('/stats');
  return response.data;
};
