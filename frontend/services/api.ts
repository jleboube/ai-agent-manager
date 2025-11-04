import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Send cookies with requests
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auth API
export const authApi = {
  getGoogleAuthUrl: async () => {
    const { data } = await api.get('/auth/google/url');
    return data;
  },

  getCurrentUser: async () => {
    const { data } = await api.get('/auth/me');
    return data;
  },

  logout: async () => {
    await api.post('/auth/logout');
  },
};

// AI API
export const aiApi = {
  generateAgent: async (description: string, agentType: string = 'custom') => {
    const { data } = await api.post('/ai/generate', {
      description,
      agentType,
    });
    return data;
  },

  getGroundedAdvice: async (prompt: string) => {
    const { data } = await api.post('/ai/advice', { prompt });
    return data;
  },
};

// Subscription API
export const subscriptionApi = {
  createCheckoutSession: async (plan: 'monthly' | 'yearly') => {
    const { data } = await api.post('/subscription/create-checkout', { plan });
    return data;
  },

  getSubscriptionStatus: async () => {
    const { data } = await api.get('/subscription/status');
    return data;
  },

  cancelSubscription: async () => {
    const { data } = await api.post('/subscription/cancel');
    return data;
  },

  reactivateSubscription: async () => {
    const { data } = await api.post('/subscription/reactivate');
    return data;
  },
};

// User API
export const userApi = {
  getProfile: async () => {
    const { data } = await api.get('/user/profile');
    return data;
  },

  getGenerations: async (page: number = 1, limit: number = 20) => {
    const { data } = await api.get('/user/generations', {
      params: { page, limit },
    });
    return data;
  },
};

export default api;
