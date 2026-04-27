import api from './api';

const BASE = '/clientes';

export const clienteService = {
  listar: () => api.get(BASE).then((r) => r.data),
  listarDeudores: () => api.get(`${BASE}/deudores`).then((r) => r.data),
  listarConSaldo: () => api.get(`${BASE}/con-saldo`).then((r) => r.data),
  resumen: () => api.get(`${BASE}/resumen`).then((r) => r.data),
  obtener: (id) => api.get(`${BASE}/${id}`).then((r) => r.data),
  crear: (data) => api.post(BASE, data).then((r) => r.data),
  actualizar: (id, data) => api.put(`${BASE}/${id}`, data).then((r) => r.data),
  eliminar: (id) => api.delete(`${BASE}/${id}`),
  actualizarSaldo: (id, nuevoSaldo) =>
    api.post(`${BASE}/${id}/saldo`, { nuevoSaldo }).then((r) => r.data),
  obtenerPerfil: (id, desde, hasta) => {
    const params = {};
    if (desde) params.desde = desde;
    if (hasta) params.hasta = hasta;
    return api.get(`${BASE}/${id}/perfil`, { params }).then((r) => r.data);
  },
};
