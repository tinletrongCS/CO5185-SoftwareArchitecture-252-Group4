import axiosInstance from './axiosInstance';

export const orderApi = {
  getAll: () => axiosInstance.get('/orders'),
  getByUser: (userName) => axiosInstance.get(`/orders/user/${userName}`),
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

export const tableApi = {
  getAll: () => axiosInstance.get('/inventory/tables'),
  getAvailable: () => axiosInstance.get('/inventory/tables/available'),
  getById: (id) => axiosInstance.get(`/inventory/tables/${id}`),
  create: (data) => axiosInstance.post('/inventory/tables', data),
  update: (id, data) => axiosInstance.put(`/inventory/tables/${id}`, data),
  delete: (id) => axiosInstance.delete(`/inventory/tables/${id}`),
  updateStatus: (id, available) => axiosInstance.put(`/inventory/tables/${id}/status?available=${available}`),
};

export const authApi = {
  login: (credentials) => axiosInstance.post('/auth/login', credentials),
  register: (data) => axiosInstance.post('/auth/register', data),
  logout: () => axiosInstance.post('/auth/logout'),
};

export const userApi = {
  getAll: () => axiosInstance.get('/auth/users'),
  getById: (id) => axiosInstance.get(`/auth/users/${id}`),
  getByUsername: (username) => axiosInstance.get(`/auth/users/username/${username}`),
  getMe: () => axiosInstance.get('/auth/me'),
  create: (data) => axiosInstance.post('/auth/users', data),
  update: (id, data) => axiosInstance.put(`/auth/users/${id}`, data),
  delete: (id) => axiosInstance.delete(`/auth/users/${id}`),
};

export const paymentApi = {
  createInvoice: (orderId) => axiosInstance.post(`/payment/invoice/${orderId}`),
  getTaxConfig: () => axiosInstance.get('/payment/tax-config'),
  updateTaxConfig: (data) => axiosInstance.put('/payment/tax-config', data),
  getTransactions: () => axiosInstance.get('/payment/transactions'),
  getTransactionByOrder: (orderId) => axiosInstance.get(`/payment/transactions/order/${orderId}`),
};