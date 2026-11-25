import { api, setToken } from './api';

export const authService = {
  async initialize() { /* Accounts are managed by the server; no local default user is created. */ },
  async login(email, password) {
    const result = await api('auth/login', { method: 'POST', body: JSON.stringify({ email: email.trim(), password }) });
    await setToken(result.token);
    return result.user;
  },
  async register(email, password, name) {
    const result = await api('auth/register', { method: 'POST', body: JSON.stringify({ email: email.trim(), password, name: name || email.split('@')[0] }) });
    await setToken(result.token);
    return result.user;
  },
  async logout() { try { await api('auth/logout', { method: 'POST' }); } finally { await setToken(null); } },
  async getCurrentUser() { try { const result = await api('auth/me'); return result.user; } catch (error) { if (String(error.message).includes('sign in')) await setToken(null); return null; } },
  async updatePassword(_userId, newPassword, currentPassword) { return api('auth/me', { method: 'PATCH', body: JSON.stringify({ currentPassword, password: newPassword }) }); },
};
