import api from './api';

const BASE = '/stock-rallado';

export const stockRalladoService = {
  registrarIngreso: (data) => api.post(`${BASE}/ingresos`, data).then((r) => r.data),
  obtenerActual: () => api.get(`${BASE}/actual`).then((r) => r.data),
  listarMovimientos: () => api.get(`${BASE}/movimientos`).then((r) => r.data),
};
