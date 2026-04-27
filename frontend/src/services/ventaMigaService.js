import api from './api';

const BASE = '/ventas-miga';

export const ventaMigaService = {
  registrar: (data) => api.post(BASE, data).then((r) => r.data),
  listar: () => api.get(BASE).then((r) => r.data),
  obtener: (id) => api.get(`${BASE}/${id}`).then((r) => r.data),
  listarImpagas: () => api.get(`${BASE}/impagas`).then((r) => r.data),
  listarPorFecha: (fecha) => api.get(`${BASE}/por-fecha`, { params: { fecha } }).then((r) => r.data),
};
