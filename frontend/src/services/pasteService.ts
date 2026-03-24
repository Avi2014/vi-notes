import axios from 'axios';

/**
 * Paste Service
 * 
 * Handles buffering and submission of paste events to the backend
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

// Create axios instance
const pasteAPI = axios.create({
  baseURL: `${API_URL}/api/pastes`,
  headers: {
    'Content-Type': 'application/json'
  }
});

/**
 * Add JWT token to paste requests
 */
pasteAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log('✓ JWT token attached to paste request');
  } else {
    console.warn('⚠️ No JWT token found in localStorage for paste request');
  }
  return config;
});

/**
 * Handle response errors
 */
pasteAPI.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error('❌ Paste API 401 Unauthorized - Token may be invalid or expired');
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

export interface PasteEventData {
  pastedLength: number;
  isMultiline: boolean;
  timestamp: number;
}

/**
 * Submit a batch of paste events to the backend
 * 
 * @param sessionId - Session ID for grouping events
 * @param events - Array of paste events
 * @returns Response from backend with insert count
 */
export const submitPasteEvents = async (
  sessionId: string | undefined,
  events: PasteEventData[]
): Promise<any> => {
  try {
    const response = await pasteAPI.post('/', {
      sessionId,
      events
    });

    return response.data.data;
  } catch (error: any) {
    console.error('Failed to submit paste events:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Get paste statistics for the current user
 * 
 * @param days - Number of days to look back (default: 7)
 * @returns Paste statistics including count, average length, and breakdown by day
 */
export const getPasteStats = async (days: number = 7): Promise<any> => {
  try {
    const response = await pasteAPI.get('/stats', {
      params: { days }
    });

    return response.data.data;
  } catch (error: any) {
    console.error('Failed to fetch paste stats:', error.response?.data || error.message);
    throw error;
  }
};
