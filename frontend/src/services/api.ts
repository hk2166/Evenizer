// frontend/src/services/api.ts
import axios from 'axios';
import type { LoginCredentials, RegisterData, AuthResponse, Event } from '../types';

const API_URL = 'http://localhost:4000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const { data } = await api.post('/auth/login', credentials);
    return data;
  },

  register: async (userData: RegisterData): Promise<AuthResponse> => {
    const { data } = await api.post('/auth', userData);
    return data;
  },

  getCurrentUser: async () => {
    const { data } = await api.get('/auth/me');
    return data;
  },
};

// Events API
export const eventsAPI = {
  getAll: async (): Promise<{ events: Event[] }> => {
    const { data } = await api.get('/events');
    return data;
  },

  getById: async (id: string): Promise<{ event: Event }> => {
    const { data } = await api.get(`/events/${id}`);
    return data;
  },

  create: async (eventData: Partial<Event>): Promise<{ event: Event }> => {
    const { data } = await api.post('/events', eventData);
    return data;
  },

  update: async (id: string, eventData: Partial<Event>): Promise<{ event: Event }> => {
    const { data } = await api.put(`/events/${id}`, eventData);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/events/${id}`);
  },
};

export default api;
