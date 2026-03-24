import axios from 'axios';

/**
 * Session Service
 * 
 * Handles all session management API calls to the backend
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

// Create axios instance with base URL
const sessionAPI = axios.create({
  baseURL: `${API_URL}/api/sessions`,
  headers: {
    'Content-Type': 'application/json'
  }
});

/**
 * Add JWT token to all requests
 */
sessionAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  console.log(`🔐 Session API token check:`, token ? `Found (${token.substring(0, 20)}...)` : 'Not found');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
    console.log(`✓ Authorization header set for session request`);
  } else {
    console.warn(`❌ No token found in localStorage for session request`);
  }
  return config;
});

/**
 * Handle auth errors
 */
sessionAPI.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error('❌ Session API 401 Error:', error.response.data);
      localStorage.removeItem('authToken');
      localStorage.removeItem('authUser');
    }
    return Promise.reject(error);
  }
);

export interface SessionData {
  sessionId: string;
  title: string;
  description?: string;
  content: string;
  pasteCount?: number;
  keystrokeCount?: number;
}

export interface Session {
  id: string;
  sessionId: string;
  title: string;
  description?: string;
  content?: string;
  wordCount: number;
  characterCount: number;
  pasteCount?: number;
  keystrokeCount?: number;
  createdAt: string;
  startedAt?: string;
  endedAt?: string;
}

/**
 * Create a new writing session
 */
export const createSession = async (sessionData: SessionData): Promise<Session> => {
  const response = await sessionAPI.post('/', sessionData);
  return response.data.data;
};

/**
 * Get all sessions for current user
 */
export const getSessions = async (skip = 0, limit = 20, search = ''): Promise<{
  sessions: Session[];
  total: number;
  skip: number;
  limit: number;
}> => {
  const response = await sessionAPI.get('/', {
    params: { skip, limit, search }
  });
  return response.data.data;
};

/**
 * Get a specific session by ID
 */
export const getSession = async (sessionId: string): Promise<Session> => {
  const response = await sessionAPI.get(`/${sessionId}`);
  return response.data.data;
};

/**
 * Update a session
 */
export const updateSession = async (
  sessionId: string,
  updates: Partial<SessionData>
): Promise<Session> => {
  const response = await sessionAPI.put(`/${sessionId}`, updates);
  return response.data.data;
};

/**
 * Delete a session
 */
export const deleteSession = async (sessionId: string): Promise<{ message: string }> => {
  const response = await sessionAPI.delete(`/${sessionId}`);
  return response.data.data;
};

/**
 * Get detailed statistics for a session
 */
export const getSessionStats = async (sessionId: string): Promise<any> => {
  const response = await sessionAPI.get(`/${sessionId}/stats`);
  return response.data.data;
};
