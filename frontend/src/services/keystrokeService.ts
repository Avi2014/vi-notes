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
  }
  return config;
});

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
