import { api } from '../utils.js';

const LibroService = {
  listar: (params) => api(`/api/libros?${new URLSearchParams(params)}`),
  buscarPorId: (id) => api(`/api/libros/${id}`),
  buscarPorIsbn: (isbn) => api(`/api/libros/isbn/${isbn}`),
  crear: (data) => api('/api/libros', { method: 'POST', body: JSON.stringify(data) }),
  actualizar: (id, data) => api(`/api/libros/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  eliminar: (id) => api(`/api/libros/${id}`, { method: 'DELETE' }),
};

export default LibroService;
