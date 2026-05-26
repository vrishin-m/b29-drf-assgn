import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});



export const fetchNotifications = async () => {
  const response = await api.get('notifications/');
  return response.data;
};

export const markNotificationAsRead = async (id) => {
  const response = await api.patch(`notifications/${id}/`, { is_read: true });
  return response.data;
};

export default api;
