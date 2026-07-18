import { api } from '../utils.js';

const UsuarioService = {
  listar: (params) => api(`/api/usuarios?${new URLSearchParams(params)}`),
  buscarPorId: (id) => api(`/api/usuarios/${id}`),
  crear: (data) => api('/api/usuarios', { method: 'POST', body: JSON.stringify(data) }),
  actualizar: (id, data) => api(`/api/usuarios/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  eliminar: (id) => api(`/api/usuarios/${id}`, { method: 'DELETE' }),
  cambiarEstado: (id, estado) => api(`/api/usuarios/${id}/estado?estado=${estado}`, { method: 'PATCH' }),
};

export default UsuarioService;
