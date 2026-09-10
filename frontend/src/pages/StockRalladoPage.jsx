import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Button, Typography, Container, TextField,
  Paper, Grid, Divider,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, InputAdornment, CircularProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Grain as RalladoIcon,
} from '@mui/icons-material';
import { stockRalladoService } from '../services/stockRalladoService';
import { useSnackbar } from 'notistack';

const today = () => new Date().toISOString().split('T')[0];

const formatKg = (n) =>
  n != null ? `${Number(n).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} kg` : '-';

const formatDate = (d) => {
  if (!d) return '-';
  const [y, m, day] = String(d).split('-');
  return `${parseInt(day)}/${parseInt(m)}/${y}`;
};

const EMPTY_INGRESO = { fecha: today(), cantidadKg: '', observaciones: '' };

export default function StockRalladoPage() {
  const { enqueueSnackbar } = useSnackbar();
  const [stockActual, setStockActual] = useState(null);
  const [movimientos, setMovimientos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(EMPTY_INGRESO);
  const [submitting, setSubmitting] = useState(false);

  const fetchData = useCallback(() => {
    setLoading(true);
    Promise.all([stockRalladoService.obtenerActual(), stockRalladoService.listarMovimientos()])
      .then(([actual, movs]) => {
        setStockActual(actual.stockActualKg);
        setMovimientos(movs);
      })
      .catch(() => enqueueSnackbar('Error al cargar el stock de pan rallado', { variant: 'error' }))
      .finally(() => setLoading(false));
  }, [enqueueSnackbar]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSubmit = async () => {
    if (!form.cantidadKg) {
      enqueueSnackbar('Ingresá la cantidad en kg', { variant: 'warning' });
      return;
    }
    setSubmitting(true);
    try {
      await stockRalladoService.registrarIngreso({
        fecha: form.fecha || null,
        cantidadKg: parseFloat(form.cantidadKg),
        observaciones: form.observaciones || null,
      });
      enqueueSnackbar('Stock cargado correctamente', { variant: 'success' });
      setForm(EMPTY_INGRESO);
      fetchData();
    } catch (e) {
      enqueueSnackbar(e.message || 'Error al cargar el stock', { variant: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={700} color="primary">Stock de Pan Rallado</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Carga manual de stock y descuento automático por cada venta
        </Typography>
      </Box>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} alignItems="center" sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={4}>
            <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="caption" color="text.secondary">Stock actual</Typography>
              <Typography variant="h4" fontWeight={700} color="primary">
                {loading ? <CircularProgress size={28} /> : formatKg(stockActual)}
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        <Typography variant="h6" fontWeight={600} gutterBottom>Cargar stock</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4} md={3}>
            <TextField
              fullWidth size="small" label="Fecha" type="date"
              value={form.fecha}
              onChange={(e) => setForm({ ...form, fecha: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={4} md={3}>
            <TextField
              fullWidth size="small" label="Cantidad" type="number"
              value={form.cantidadKg}
              onChange={(e) => setForm({ ...form, cantidadKg: e.target.value })}
              InputProps={{ endAdornment: <InputAdornment position="end">kg</InputAdornment> }}
              inputProps={{ min: 0.001, step: 0.5 }}
            />
          </Grid>
          <Grid item xs={12} sm={4} md={4}>
            <TextField
              fullWidth size="small" label="Observaciones (opcional)"
              value={form.observaciones}
              onChange={(e) => setForm({ ...form, observaciones: e.target.value })}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              variant="contained"
              startIcon={submitting ? <CircularProgress size={18} color="inherit" /> : <AddIcon />}
              onClick={handleSubmit}
              disabled={submitting}
            >
              Cargar
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          <RalladoIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
          Historial de movimientos
        </Typography>
        <Divider sx={{ mb: 2 }} />
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>
        ) : movimientos.length === 0 ? (
          <Typography color="text.secondary">No hay movimientos registrados.</Typography>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: 'grey.50' }}>
                  <TableCell sx={{ fontWeight: 700 }}>Fecha</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Tipo</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>Cantidad</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Observaciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {movimientos.map((m) => (
                  <TableRow key={m.id} hover>
                    <TableCell>{formatDate(m.fecha)}</TableCell>
                    <TableCell>
                      {m.tipo === 'INGRESO'
                        ? <Chip label="Ingreso" color="success" size="small" />
                        : <Chip label="Egreso" color="error" size="small" variant="outlined" />}
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>{formatKg(m.cantidadKg)}</TableCell>
                    <TableCell>{m.observaciones || '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Container>
  );
}
