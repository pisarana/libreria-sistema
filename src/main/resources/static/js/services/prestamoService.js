import { api } from '../utils.js';

const PrestamoService = {
  listar: (params) => api(`/api/prestamos?${new URLSearchParams(params)}`),
  buscarPorId: (id) => api(`/api/prestamos/${id}`),
  crear: (data) => api('/api/prestamos', { method: 'POST', body: JSON.stringify(data) }),
  devolver: (id) => api(`/api/prestamos/${id}/devolver`, { method: 'PUT' }),
  eliminar: (id) => api(`/api/prestamos/${id}`, { method: 'DELETE' }),
};

export default PrestamoService;
