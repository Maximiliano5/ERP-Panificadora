import api from './api';

const BASE = '/mercaderias';

export const mercaderiaService = {
  listar: (nombre = '') => {
    const params = nombre ? { nombre } : {};
    return api.get(BASE, { params }).then((r) => r.data);
  },

  obtener: (id) => api.get(`${BASE}/${id}`).then((r) => r.data),

  crear: (data) => api.post(BASE, data).then((r) => r.data),

  actualizar: (id, data) => api.put(`${BASE}/${id}`, data).then((r) => r.data),

  eliminar: (id) => api.delete(`${BASE}/${id}`),

  valorTotal: (nombre = '') => {
    const params = nombre ? { nombre } : {};
    return api.get(`${BASE}/valor-total`, { params }).then((r) => r.data);
  },
};
