import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
});

// Attach JWT token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Products
export const productAPI = {
  getAll: () => API.get('/products'),
  getOne: (id) => API.get(`/products/${id}`),
  create: (data) => API.post('/products', data),
  update: (id, d) => API.put(`/products/${id}`, d),
  remove: (id) => API.delete(`/products/${id}`),
  toggle: (id) => API.patch(`/products/${id}/toggle`),
};

// Auth
export const authAPI = {
  register: (data) => API.post('/auth/register', data),
  login: (data) => API.post('/auth/login', data),
  getMe: () => API.get('/auth/me'),
};

// Coupons
export const couponAPI = {
  getAll: () => API.get('/coupons'),
  getOne: (id) => API.get(`/coupons/${id}`),
  create: (data) => API.post('/coupons', data),
  update: (id, d) => API.put(`/coupons/${id}`, d),
  remove: (id) => API.delete(`/coupons/${id}`),
  toggle: (id) => API.patch(`/coupons/${id}/toggle`),
  validate: (data) => API.post('/coupons/validate', data),
};

// Orders
export const orderAPI = {
  create: (data) => API.post('/orders', data),
  getMy: () => API.get('/orders/my'),
  getAll: () => API.get('/orders'),
};

// Users
export const userAPI = {
  getAll: () => API.get('/users'),
  create: (data) => API.post('/users', data),
  update: (id, d) => API.put(`/users/${id}`, d),
  remove: (id) => API.delete(`/users/${id}`),
};

// Reports
export const reportAPI = {
  summary: () => API.get('/reports/summary'),
  performance: () => API.get('/reports/coupon-performance'),
  monthly: () => API.get('/reports/monthly'),
};

export default API;
