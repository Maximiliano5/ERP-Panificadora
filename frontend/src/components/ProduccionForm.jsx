import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Box, IconButton, Typography,
  Divider, MenuItem, CircularProgress, Paper,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  AddCircleOutline as AddAmasijoIcon,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { produccionService } from '../services/produccionService';

const nuevoInsumo = () => ({ mercaderiaId: '', cantidad: '' });
const nuevoAmasijo = () => ({ cantidadPanProducido: '', insumos: [nuevoInsumo()] });

const hoy = () => new Date().toISOString().split('T')[0];

export default function ProduccionForm({ open, onClose, onSuccess, mercaderias }) {
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    fecha: hoy(),
    observaciones: '',
    amasijos: [nuevoAmasijo()],
  });

  const resetForm = () => {
    setForm({ fecha: hoy(), observaciones: '', amasijos: [nuevoAmasijo()] });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  // — Producción —
  const handleProduccionChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  // — Amasijos —
  const agregarAmasijo = () => {
    setForm((prev) => ({
      ...prev,
      amasijos: [...prev.amasijos, nuevoAmasijo()],
    }));
  };

  const eliminarAmasijo = (ai) => {
    setForm((prev) => ({
      ...prev,
      amasijos: prev.amasijos.filter((_, i) => i !== ai),
    }));
  };

  const handleAmasijoChange = (ai, field, value) => {
    setForm((prev) => {
      const amasijos = [...prev.amasijos];
      amasijos[ai] = { ...amasijos[ai], [field]: value };
      return { ...prev, amasijos };
    });
  };

  // — Insumos —
  const agregarInsumo = (ai) => {
    setForm((prev) => {
      const amasijos = [...prev.amasijos];
      amasijos[ai] = {
        ...amasijos[ai],
        insumos: [...amasijos[ai].insumos, nuevoInsumo()],
      };
      return { ...prev, amasijos };
    });
  };

  const eliminarInsumo = (ai, ii) => {
    setForm((prev) => {
      const amasijos = [...prev.amasijos];
      amasijos[ai] = {
        ...amasijos[ai],
        insumos: amasijos[ai].insumos.filter((_, i) => i !== ii),
      };
      return { ...prev, amasijos };
    });
  };

  const handleInsumoChange = (ai, ii, field, value) => {
    setForm((prev) => {
      const amasijos = [...prev.amasijos];
      const insumos = [...amasijos[ai].insumos];
      insumos[ii] = { ...insumos[ii], [field]: value };
      amasijos[ai] = { ...amasijos[ai], insumos };
      return { ...prev, amasijos };
    });
  };

  const handleSubmit = async () => {
    if (!form.fecha) {
      enqueueSnackbar('La fecha es obligatoria', { variant: 'warning' });
      return;
    }

    const payload = {
      fecha: form.fecha,
      observaciones: form.observaciones || null,
      amasijos: form.amasijos.map((a) => ({
        cantidadPanProducido: a.cantidadPanProducido ? parseFloat(a.cantidadPanProducido) : null,
        insumos: a.insumos.map((ins) => ({
          mercaderiaId: parseInt(ins.mercaderiaId),
          cantidad: parseFloat(ins.cantidad),
        })),
      })),
    };

    setLoading(true);
    try {
      await produccionService.crear(payload);
      enqueueSnackbar('Producción registrada correctamente', { variant: 'success' });
      handleClose();
      onSuccess();
    } catch (err) {
      enqueueSnackbar(err.message || 'Error al registrar producción', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>Nueva Producción</DialogTitle>
      <DialogContent dividers>
        {/* Datos generales */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <TextField
            label="Fecha"
            type="date"
            value={form.fecha}
            onChange={(e) => handleProduccionChange('fecha', e.target.value)}
            InputLabelProps={{ shrink: true }}
            required
            sx={{ width: 200 }}
          />
          <TextField
            label="Observaciones (opcional)"
            value={form.observaciones}
            onChange={(e) => handleProduccionChange('observaciones', e.target.value)}
            multiline
            rows={1}
            fullWidth
          />
        </Box>

        <Divider sx={{ mb: 2 }} />

        {/* Amasijos */}
        {form.amasijos.map((amasijo, ai) => (
          <Paper
            key={ai}
            variant="outlined"
            sx={{ p: 2, mb: 2, borderRadius: 2, borderColor: 'primary.light' }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="subtitle1" fontWeight={600} color="primary">
                Amasijo #{ai + 1}
              </Typography>
              {form.amasijos.length > 1 && (
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => eliminarAmasijo(ai)}
                  title="Eliminar amasijo"
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              )}
            </Box>

            <TextField
              label="Cantidad de panes producidos (opcional)"
              type="number"
              value={amasijo.cantidadPanProducido}
              onChange={(e) => handleAmasijoChange(ai, 'cantidadPanProducido', e.target.value)}
              inputProps={{ min: 0, step: 1 }}
              sx={{ mb: 2, width: 280 }}
              size="small"
            />

            {/* Insumos del amasijo */}
            <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }} color="text.secondary">
              Insumos utilizados
            </Typography>

            {amasijo.insumos.map((insumo, ii) => (
              <Box key={ii} sx={{ display: 'flex', gap: 1.5, alignItems: 'center', mb: 1 }}>
                <TextField
                  select
                  label="Mercadería"
                  value={insumo.mercaderiaId}
                  onChange={(e) => handleInsumoChange(ai, ii, 'mercaderiaId', e.target.value)}
                  size="small"
                  sx={{ flex: 2, minWidth: 200 }}
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
                  onChange={(e) => handleInsumoChange(ai, ii, 'cantidad', e.target.value)}
                  size="small"
                  inputProps={{ min: 0.001, step: 0.001 }}
                  sx={{ flex: 1, minWidth: 120 }}
                  required
                />

                {amasijo.insumos.length > 1 && (
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => eliminarInsumo(ai, ii)}
                    title="Eliminar insumo"
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                )}
              </Box>
            ))}

            <Button
              size="small"
              startIcon={<AddIcon />}
              onClick={() => agregarInsumo(ai)}
              sx={{ mt: 0.5 }}
            >
              Agregar insumo
            </Button>
          </Paper>
        ))}

        <Button
          variant="outlined"
          startIcon={<AddAmasijoIcon />}
          onClick={agregarAmasijo}
          fullWidth
          sx={{ mt: 1 }}
        >
          Agregar amasijo
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
          {loading ? 'Registrando...' : 'Registrar producción'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
