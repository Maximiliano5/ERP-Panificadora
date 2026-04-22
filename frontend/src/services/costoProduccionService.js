import api from './api';

const BASE = '/costos-produccion';

export const costoProduccionService = {
  listar: () => api.get(BASE).then((r) => r.data),
  obtener: (id) => api.get(`${BASE}/${id}`).then((r) => r.data),
  crear: (data) => api.post(BASE, data).then((r) => r.data),
};
