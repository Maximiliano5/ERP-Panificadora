import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Stack, CircularProgress,
} from '@mui/material';

const EMPTY = { nombre: '', precioUnitario: '' };

export default function MercaderiaForm({ open, onClose, onSave, mercaderia }) {
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(mercaderia
        ? { nombre: mercaderia.nombre, precioUnitario: mercaderia.precioUnitario }
        : EMPTY
      );
      setErrors({});
    }
  }, [open, mercaderia]);

  const validate = () => {
    const e = {};
    if (!form.nombre.trim()) e.nombre = 'El nombre es obligatorio';
    const precio = parseFloat(form.precioUnitario);
    if (!form.precioUnitario || isNaN(precio) || precio <= 0)
      e.precioUnitario = 'El precio debe ser mayor a 0';
    return e;
  };

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) setErrors((prev) => ({ ...prev, [e.target.name]: '' }));
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    setSaving(true);
    try {
      await onSave({ nombre: form.nombre.trim(), precioUnitario: parseFloat(form.precioUnitario) });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{mercaderia ? 'Editar mercadería' : 'Nueva mercadería'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label="Nombre"
            name="nombre"
            value={form.nombre}
            onChange={handleChange}
            error={!!errors.nombre}
            helperText={errors.nombre}
            fullWidth
            autoFocus
          />
          <TextField
            label="Precio unitario ($)"
            name="precioUnitario"
            type="number"
            value={form.precioUnitario}
            onChange={handleChange}
            error={!!errors.precioUnitario}
            helperText={errors.precioUnitario}
            fullWidth
            inputProps={{ min: 0, step: '0.01' }}
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={saving}>Cancelar</Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={saving}
          startIcon={saving && <CircularProgress size={16} />}
        >
          {mercaderia ? 'Guardar cambios' : 'Crear'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
