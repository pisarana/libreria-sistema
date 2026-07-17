import { api } from '../utils.js';

const AuthService = {
  login: (correo, password) => api('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ correo, password })
  }),
  logout: () => api('/api/auth/logout', { method: 'POST' }),
  me: () => api('/api/auth/me'),
};

export default AuthService;
