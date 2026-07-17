import { api } from '../utils.js';

const CategoriaService = {
  listar: () => api('/api/categorias'),
  buscarPorId: (id) => api(`/api/categorias/${id}`),
  crear: (data) => api('/api/categorias', { method: 'POST', body: JSON.stringify(data) }),
  actualizar: (id, data) => api(`/api/categorias/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  eliminar: (id) => api(`/api/categorias/${id}`, { method: 'DELETE' }),
};

export default CategoriaService;
