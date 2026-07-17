import { api } from '../utils.js';

const AutorService = {
  listar: () => api('/api/autores'),
  buscarPorId: (id) => api(`/api/autores/${id}`),
  buscar: (q) => api(`/api/autores/buscar?q=${encodeURIComponent(q)}`),
  crear: (data) => api('/api/autores', { method: 'POST', body: JSON.stringify(data) }),
  actualizar: (id, data) => api(`/api/autores/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  eliminar: (id) => api(`/api/autores/${id}`, { method: 'DELETE' }),
};

export default AutorService;
