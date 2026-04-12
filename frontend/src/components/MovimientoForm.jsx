import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Stack, MenuItem, CircularProgress,
  Divider, Typography,
} from '@mui/material';

const EMPTY = {
  tipo: 'INGRESO',
  mercaderiaId: '',
  cantidad: '',
  observaciones: '',
  proveedor: '',
  receptor: '',
  motivo: '',
};

export default function MovimientoForm({ open, onClose, onSave, mercaderias }) {
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) { setForm(EMPTY); setErrors({}); }
  }, [open]);

  const validate = () => {
    const e = {};
    if (!form.mercaderiaId) e.mercaderiaId = 'Seleccioná una mercadería';
    const cant = parseFloat(form.cantidad);
    if (!form.cantidad || isNaN(cant) || cant <= 0) e.cantidad = 'La cantidad debe ser mayor a 0';
    if (form.tipo === 'INGRESO') {
      if (!form.proveedor?.trim()) e.proveedor = 'El proveedor es obligatorio para ingresos';
      if (!form.receptor?.trim()) e.receptor = 'El receptor es obligatorio para ingresos';
    }
    return e;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    setSaving(true);
    try {
      await onSave({
        tipo: form.tipo,
        mercaderiaId: parseInt(form.mercaderiaId),
        cantidad: parseFloat(form.cantidad),
        observaciones: form.observaciones || null,
        proveedor: form.tipo === 'INGRESO' ? form.proveedor : null,
        receptor: form.tipo === 'INGRESO' ? form.receptor : null,
        motivo: form.tipo === 'EGRESO' ? form.motivo : null,
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Registrar movimiento de stock</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            select
            label="Tipo de movimiento"
            name="tipo"
            value={form.tipo}
            onChange={handleChange}
            fullWidth
          >
            <MenuItem value="INGRESO">INGRESO</MenuItem>
            <MenuItem value="EGRESO">EGRESO</MenuItem>
          </TextField>

          <TextField
            select
            label="Mercadería"
            name="mercaderiaId"
            value={form.mercaderiaId}
            onChange={handleChange}
            error={!!errors.mercaderiaId}
            helperText={errors.mercaderiaId}
            fullWidth
          >
            {mercaderias.map((m) => (
              <MenuItem key={m.id} value={m.id}>
                {m.nombre} (stock: {m.cantidadActual})
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Cantidad"
            name="cantidad"
            type="number"
            value={form.cantidad}
            onChange={handleChange}
            error={!!errors.cantidad}
            helperText={errors.cantidad}
            fullWidth
            inputProps={{ min: 0, step: '0.001' }}
          />

          <TextField
            label="Observaciones"
            name="observaciones"
            value={form.observaciones}
            onChange={handleChange}
            multiline
            rows={2}
            fullWidth
          />

          <Divider />
          <Typography variant="caption" color="text.secondary" fontWeight={600}>
            {form.tipo === 'INGRESO' ? 'DATOS DEL INGRESO' : 'DATOS DEL EGRESO'}
          </Typography>

          {form.tipo === 'INGRESO' ? (
            <>
              <TextField
                label="Proveedor"
                name="proveedor"
                value={form.proveedor}
                onChange={handleChange}
                error={!!errors.proveedor}
                helperText={errors.proveedor}
                fullWidth
              />
              <TextField
                label="Receptor"
                name="receptor"
                value={form.receptor}
                onChange={handleChange}
                error={!!errors.receptor}
                helperText={errors.receptor}
                fullWidth
              />
            </>
          ) : (
            <TextField
              label="Motivo del egreso"
              name="motivo"
              value={form.motivo}
              onChange={handleChange}
              placeholder="Ej: Producción, merma, etc."
              fullWidth
            />
          )}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={saving}>Cancelar</Button>
        <Button
          variant="contained"
          color={form.tipo === 'INGRESO' ? 'success' : 'warning'}
          onClick={handleSubmit}
          disabled={saving}
          startIcon={saving && <CircularProgress size={16} />}
        >
          Registrar {form.tipo}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
