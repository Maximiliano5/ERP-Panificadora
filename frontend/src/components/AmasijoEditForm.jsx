import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Box, IconButton, Typography,
  MenuItem, CircularProgress,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { produccionService } from '../services/produccionService';

const nuevoInsumo = () => ({ mercaderiaId: '', cantidad: '' });

export default function AmasijoEditForm({ open, onClose, onSuccess, amasijo, mercaderias }) {
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ cantidadPanProducido: '', insumos: [nuevoInsumo()] });

  useEffect(() => {
    if (amasijo) {
      setForm({
        cantidadPanProducido: amasijo.cantidadPanProducido ?? '',
        insumos: amasijo.insumos.map((i) => ({
          mercaderiaId: i.mercaderiaId,
          cantidad: i.cantidadUtilizada,
        })),
      });
    }
  }, [amasijo]);

  const handleClose = () => {
    onClose();
  };

  const agregarInsumo = () => {
    setForm((prev) => ({ ...prev, insumos: [...prev.insumos, nuevoInsumo()] }));
  };

  const eliminarInsumo = (idx) => {
    setForm((prev) => ({ ...prev, insumos: prev.insumos.filter((_, i) => i !== idx) }));
  };

  const handleInsumoChange = (idx, field, value) => {
    setForm((prev) => {
      const insumos = [...prev.insumos];
      insumos[idx] = { ...insumos[idx], [field]: value };
      return { ...prev, insumos };
    });
  };

  const handleSubmit = async () => {
    const payload = {
      cantidadPanProducido: form.cantidadPanProducido ? parseFloat(form.cantidadPanProducido) : null,
      insumos: form.insumos.map((i) => ({
        mercaderiaId: parseInt(i.mercaderiaId),
        cantidad: parseFloat(i.cantidad),
      })),
    };

    setLoading(true);
    try {
      await produccionService.actualizarAmasijo(amasijo.id, payload);
      enqueueSnackbar('Amasijo actualizado correctamente', { variant: 'success' });
      handleClose();
      onSuccess();
    } catch (err) {
      enqueueSnackbar(err.message || 'Error al actualizar el amasijo', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>Editar amasijo</DialogTitle>
      <DialogContent dividers>
        <TextField
          label="Cantidad de panes producidos (opcional)"
          type="number"
          value={form.cantidadPanProducido}
          onChange={(e) => setForm((prev) => ({ ...prev, cantidadPanProducido: e.target.value }))}
          inputProps={{ min: 0, step: 1 }}
          sx={{ mb: 3, width: 280 }}
          size="small"
        />

        <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }} color="text.secondary">
          Insumos utilizados
        </Typography>

        {form.insumos.map((insumo, idx) => (
          <Box key={idx} sx={{ display: 'flex', gap: 1.5, alignItems: 'center', mb: 1 }}>
            <TextField
              select
              label="Mercadería"
              value={insumo.mercaderiaId}
              onChange={(e) => handleInsumoChange(idx, 'mercaderiaId', e.target.value)}
              size="small"
              sx={{ flex: 2, minWidth: 180 }}
              required
            >
              <MenuItem value="">Seleccioná una mercadería</MenuItem>
              {mercaderias.map((m) => (
                <MenuItem key={m.id} value={m.id}>
                  {m.nombre}
                  <Typography
                    component="span"
                    variant="caption"
                    sx={{ ml: 1, color: m.cantidadActual <= 0 ? 'error.main' : 'text.secondary' }}
                  >
                    (stock: {m.cantidadActual})
                  </Typography>
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="Cantidad"
              type="number"
              value={insumo.cantidad}
              onChange={(e) => handleInsumoChange(idx, 'cantidad', e.target.value)}
              size="small"
              inputProps={{ min: 0.001, step: 0.001 }}
              sx={{ flex: 1, minWidth: 110 }}
              required
            />

            {form.insumos.length > 1 && (
              <IconButton size="small" color="error" onClick={() => eliminarInsumo(idx)}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            )}
          </Box>
        ))}

        <Button size="small" startIcon={<AddIcon />} onClick={agregarInsumo} sx={{ mt: 0.5 }}>
          Agregar insumo
        </Button>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={handleClose} disabled={loading}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={16} color="inherit" /> : null}
        >
          {loading ? 'Guardando...' : 'Guardar cambios'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
