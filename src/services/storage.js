import { api } from './api';

export const userStorage = {
  getAll: async () => api('users'),
  getById: async (id) => (await api(`users/${id}`)),
  getByEmail: async (email) => (await api('users')).find((u) => u.email.toLowerCase() === email.toLowerCase()) || null,
  create: async (user) => api('users', { method: 'POST', body: JSON.stringify(user) }),
  update: async (id, updates) => api(`users/${id}`, { method: 'PUT', body: JSON.stringify(updates) }),
  delete: async (id) => { await api(`users/${id}`, { method: 'DELETE' }); return true; },
};

export const productStorage = {
  getAll: async () => api('products'),
  getById: async (id) => api(`products/${id}`),
  create: async (product) => api('products', { method: 'POST', body: JSON.stringify(product) }),
  update: async (id, updates) => api(`products/${id}`, { method: 'PUT', body: JSON.stringify(updates) }),
  delete: async (id) => { await api(`products/${id}`, { method: 'DELETE' }); return true; },
  search: async (query) => { const products = await api('products'); return query ? products.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()) || (p.location || '').toLowerCase().includes(query.toLowerCase())) : products; },
};

export const saleStorage = {
  getAll: async () => api('sales'),
  getByProductId: async (productId) => (await api('sales')).filter((sale) => sale.productId === productId),
  create: async (sale) => api('sales', { method: 'POST', body: JSON.stringify({ productId: sale.productId, quantity: sale.quantity, unit_price: sale.unit_price, performedAt: sale.performedAt }) }),
  delete: async (id) => { await api(`sales/${id}`, { method: 'DELETE' }); return true; },
  getRecent: async (limit = 10) => (await api('sales')).slice(0, limit),
};

export const categoryStorage = {
  getAll: async () => api('categories'),
  getById: async (id) => (await api('categories')).find((category) => category.id === id) || null,
  create: async (category) => api('categories', { method: 'POST', body: JSON.stringify(category) }),
  update: async (id, updates) => api(`categories/${id}`, { method: 'PUT', body: JSON.stringify(updates) }),
  delete: async (id) => { await api(`categories/${id}`, { method: 'DELETE' }); return true; },
};

export const authStorage = {
  async getCurrentUser() { try { return (await api('auth/me')).user; } catch { return null; } },
  async setCurrentUser() { return true; },
  async clearCurrentUser() { return true; },
};

export const initializeDefaultData = async () => {};
