import { api } from '../utils.js';

const InventarioService = {
  listar: (params) => api(`/api/inventario?${new URLSearchParams(params)}`),
  alertas: () => api('/api/inventario/alertas'),
  ajustarStock: (id, cantidad, motivo) => api(`/api/inventario/${id}/stock`, {
    method: 'PUT',
    body: JSON.stringify({ cantidad, motivo })
  }),
};

export default InventarioService;
