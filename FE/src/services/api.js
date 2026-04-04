import axiosInstance from './axiosInstance';

export const orderApi = {
  getAll: () => axiosInstance.get('/orders'),
  getById: (id) => axiosInstance.get(`/orders/${id}`),
  create: (data) => axiosInstance.post('/orders', data),
  update: (id, data) => axiosInstance.put(`/orders/${id}`, data),
  delete: (id) => axiosInstance.delete(`/orders/${id}`),
};

export const authApi = {
  login: (credentials) => axiosInstance.post('/auth/login', credentials),
  register: (data) => axiosInstance.post('/auth/register', data),
  logout: () => axiosInstance.post('/auth/logout'),
};