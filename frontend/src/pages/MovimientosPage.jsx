import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Button } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { movimientoService } from '../services/movimientoService';
import { mercaderiaService } from '../services/mercaderiaService';
import MovimientoList from '../components/MovimientoList';
import MovimientoForm from '../components/MovimientoForm';

export default function MovimientosPage() {
  const { enqueueSnackbar } = useSnackbar();
  const [movimientos, setMovimientos] = useState([]);
  const [mercaderias, setMercaderias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);

  const fetchMovimientos = useCallback(async () => {
    setLoading(true);
    try {
      const data = await movimientoService.listar();
      setMovimientos(data);
    } catch (err) {
      enqueueSnackbar(err.message, { variant: 'error' });
    } finally {
      setLoading(false);
    }
  }, [enqueueSnackbar]);

  useEffect(() => {
    fetchMovimientos();
    mercaderiaService.listar().then(setMercaderias).catch(() => {});
  }, [fetchMovimientos]);

  const handleSave = async (data) => {
    try {
      await movimientoService.registrar(data);
      enqueueSnackbar('Movimiento registrado correctamente', { variant: 'success' });
      fetchMovimientos();
      mercaderiaService.listar().then(setMercaderias).catch(() => {});
    } catch (err) {
      enqueueSnackbar(err.message, { variant: 'error' });
      throw err;
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Typography variant="h4">Movimientos de Stock</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Historial completo de ingresos y egresos
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setFormOpen(true)}
        >
          Registrar movimiento
        </Button>
      </Box>

      <MovimientoList movimientos={movimientos} loading={loading} />

      <MovimientoForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSave={handleSave}
        mercaderias={mercaderias}
      />
    </Box>
  );
}
