import axiosInstance from './axiosInstance';

export const orderApi = {
  getAll: () => axiosInstance.get('/orders'),
  getById: (id) => axiosInstance.get(`/orders/${id}`),
  create: (data) => axiosInstance.post('/orders', data),
  update: (id, data) => axiosInstance.put(`/orders/${id}/status?value=${data.status}`),
  delete: (id) => axiosInstance.delete(`/orders/${id}`),
};

export const inventoryApi = {
  getAll: () => axiosInstance.get('/inventory/items'),
  getMenu: () => axiosInstance.get('/inventory/menu'),
  getMenuByCategory: (category) => axiosInstance.get(`/inventory/menu/${category}`),
  getById: (id) => axiosInstance.get(`/inventory/items/${id}`),
  create: (data) => axiosInstance.post('/inventory/items', data),
  update: (id, data) => axiosInstance.put(`/inventory/items/${id}`, data),
  delete: (id) => axiosInstance.delete(`/inventory/items/${id}`),
  updateQuantity: (id, delta) => axiosInstance.patch(`/inventory/items/${id}/quantity?delta=${delta}`),
};

export const authApi = {
  login: (credentials) => axiosInstance.post('/auth/login', credentials),
  register: (data) => axiosInstance.post('/auth/register', data),
  logout: () => axiosInstance.post('/auth/logout'),
};

export const userApi = {
  getAll: () => axiosInstance.get('/auth/users'),
  getById: (id) => axiosInstance.get(`/auth/users/${id}`),
  create: (data) => axiosInstance.post('/auth/users', data),
  update: (id, data) => axiosInstance.put(`/auth/users/${id}`, data),
  delete: (id) => axiosInstance.delete(`/auth/users/${id}`),
};