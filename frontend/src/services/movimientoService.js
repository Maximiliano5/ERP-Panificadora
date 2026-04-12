import api from './api';

const BASE = '/movimientos';

export const movimientoService = {
  listar: () => api.get(BASE).then((r) => r.data),

  listarPorMercaderia: (mercaderiaId) =>
    api.get(`${BASE}/mercaderia/${mercaderiaId}`).then((r) => r.data),

  registrar: (data) => api.post(BASE, data).then((r) => r.data),
};
