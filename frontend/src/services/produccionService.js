import api from './api';

const BASE = '/producciones';

export const produccionService = {
  listar: () => api.get(BASE).then((r) => r.data),

  obtener: (id) => api.get(`${BASE}/${id}`).then((r) => r.data),

  crear: (data) => api.post(BASE, data).then((r) => r.data),

  consumoDiario: (fecha) =>
    api.get(`${BASE}/consumo-diario`, { params: { fecha } }).then((r) => r.data),

  consumoPorMercaderia: (mercaderiaId) =>
    api.get(`${BASE}/consumo-mercaderia/${mercaderiaId}`).then((r) => r.data),

  actualizarAmasijo: (id, data) => api.put(`/amasijos/${id}`, data).then((r) => r.data),

  eliminarAmasijo: (id) => api.delete(`/amasijos/${id}`),
};
