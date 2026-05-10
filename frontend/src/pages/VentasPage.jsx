import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Button, Typography, Container, TextField,
  Paper, Tabs, Tab, Grid, Divider, IconButton,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, FormControl, InputLabel, Select, MenuItem, InputAdornment,
  CircularProgress, FormControlLabel, Switch, Dialog, DialogTitle,
  DialogContent, DialogActions,
} from '@mui/material';
import {
  Add as AddIcon,
  Receipt as ReceiptIcon,
  Grain as RalladoIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { ventaMigaService } from '../services/ventaMigaService';
import { ventaRalladoService } from '../services/ventaRalladoService';
import { clienteService } from '../services/clienteService';
import { useSnackbar } from 'notistack';

const today = () => new Date().toISOString().split('T')[0];

const formatPeso = (n) =>
  n != null
    ? `$${Number(n).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : '-';

const formatDate = (d) => {
  if (!d) return '-';
  const [y, m, day] = String(d).split('-');
  return `${parseInt(day)}/${parseInt(m)}/${y}`;
};

const EstadoPagoChip = ({ estadoPago }) => {
  if (estadoPago === 'PAGADO') return <Chip label="Pagado" color="success" size="small" />;
  if (estadoPago === 'INCOMPLETO')
    return <Chip label="Pago incompleto" size="small" sx={{ bgcolor: '#ff9800', color: 'white' }} />;
  return <Chip label="Impago" color="error" size="small" variant="outlined" />;
};

const EMPTY_MIGA = { fecha: today(), clienteId: '', cantidad: '', precioUnitario: '', pagado: true };
const EMPTY_RALLADO = { fecha: today(), clienteId: '', peso: '', precioPorKg: '', pagado: true };

export default function VentasPage() {
  const { enqueueSnackbar } = useSnackbar();
  const [tab, setTab] = useState(0);
  const [clientes, setClientes] = useState([]);

  const [ventasMiga, setVentasMiga] = useState([]);
  const [ventasRallado, setVentasRallado] = useState([]);
  const [loadingMiga, setLoadingMiga] = useState(false);
  const [loadingRallado, setLoadingRallado] = useState(false);

  const [formMiga, setFormMiga] = useState(EMPTY_MIGA);
  const [formRallado, setFormRallado] = useState(EMPTY_RALLADO);
  const [submittingMiga, setSubmittingMiga] = useState(false);
  const [submittingRallado, setSubmittingRallado] = useState(false);

  const [editMiga, setEditMiga] = useState(null);
  const [editRallado, setEditRallado] = useState(null);
  const [savingEditMiga, setSavingEditMiga] = useState(false);
  const [savingEditRallado, setSavingEditRallado] = useState(false);

  useEffect(() => {
    clienteService.listar().then(setClientes).catch(() => {});
  }, []);

  const fetchMiga = useCallback(() => {
    setLoadingMiga(true);
    ventaMigaService
      .listar()
      .then(setVentasMiga)
      .catch(() => enqueueSnackbar('Error al cargar ventas de miga', { variant: 'error' }))
      .finally(() => setLoadingMiga(false));
  }, [enqueueSnackbar]);

  const fetchRallado = useCallback(() => {
    setLoadingRallado(true);
    ventaRalladoService
      .listar()
      .then(setVentasRallado)
      .catch(() => enqueueSnackbar('Error al cargar ventas de rallado', { variant: 'error' }))
      .finally(() => setLoadingRallado(false));
  }, [enqueueSnackbar]);

  useEffect(() => {
    if (tab === 0) fetchMiga();
    else fetchRallado();
  }, [tab, fetchMiga, fetchRallado]);

  const totalVentasMiga = ventasMiga.reduce((s, v) => s + Number(v.total), 0);
  const impagasMiga = ventasMiga.filter((v) => !v.pagado).length;
  const totalVentasRallado = ventasRallado.reduce((s, v) => s + Number(v.total), 0);
  const impagasRallado = ventasRallado.filter((v) => !v.pagado).length;

  const handleSubmitMiga = async () => {
    if (!formMiga.clienteId || !formMiga.cantidad || !formMiga.precioUnitario) {
      enqueueSnackbar('Completá todos los campos requeridos', { variant: 'warning' });
      return;
    }
    setSubmittingMiga(true);
    try {
      await ventaMigaService.registrar({
        fecha: formMiga.fecha || null,
        clienteId: parseInt(formMiga.clienteId, 10),
        cantidad: parseFloat(formMiga.cantidad),
        precioUnitario: parseFloat(formMiga.precioUnitario),
        pagado: formMiga.pagado,
      });
      enqueueSnackbar('Venta de miga registrada', { variant: 'success' });
      setFormMiga(EMPTY_MIGA);
      fetchMiga();
    } catch (e) {
      enqueueSnackbar(e.message || 'Error al registrar venta', { variant: 'error' });
    } finally {
      setSubmittingMiga(false);
    }
  };

  const handleSubmitRallado = async () => {
    if (!formRallado.clienteId || !formRallado.peso || !formRallado.precioPorKg) {
      enqueueSnackbar('Completá todos los campos requeridos', { variant: 'warning' });
      return;
    }
    setSubmittingRallado(true);
    try {
      await ventaRalladoService.registrar({
        fecha: formRallado.fecha || null,
        clienteId: parseInt(formRallado.clienteId, 10),
        peso: parseFloat(formRallado.peso),
        precioPorKg: parseFloat(formRallado.precioPorKg),
        pagado: formRallado.pagado,
      });
      enqueueSnackbar('Venta de rallado registrada', { variant: 'success' });
      setFormRallado(EMPTY_RALLADO);
      fetchRallado();
    } catch (e) {
      enqueueSnackbar(e.message || 'Error al registrar venta', { variant: 'error' });
    } finally {
      setSubmittingRallado(false);
    }
  };

  const openEditMiga = (v) =>
    setEditMiga({ id: v.id, fecha: v.fecha, cantidad: String(v.cantidad), precioUnitario: String(v.precioUnitario), pagado: v.pagado });

  const handleSaveEditMiga = async () => {
    if (!editMiga.cantidad || !editMiga.precioUnitario) {
      enqueueSnackbar('Completá todos los campos', { variant: 'warning' });
      return;
    }
    setSavingEditMiga(true);
    try {
      await ventaMigaService.actualizar(editMiga.id, {
        fecha: editMiga.fecha || null,
        cantidad: parseFloat(editMiga.cantidad),
        precioUnitario: parseFloat(editMiga.precioUnitario),
        pagado: editMiga.pagado,
      });
      enqueueSnackbar('Venta actualizada', { variant: 'success' });
      setEditMiga(null);
      fetchMiga();
    } catch (e) {
      enqueueSnackbar(e.message || 'Error al actualizar', { variant: 'error' });
    } finally {
      setSavingEditMiga(false);
    }
  };

  const handleDeleteMiga = async (id) => {
    if (!window.confirm('¿Eliminar esta venta? Se revertirá el saldo del cliente.')) return;
    try {
      await ventaMigaService.eliminar(id);
      enqueueSnackbar('Venta eliminada', { variant: 'success' });
      fetchMiga();
    } catch (e) {
      enqueueSnackbar(e.message || 'Error al eliminar', { variant: 'error' });
    }
  };

  const openEditRallado = (v) =>
    setEditRallado({ id: v.id, fecha: v.fecha, peso: String(v.peso), precioPorKg: String(v.precioPorKg), pagado: v.pagado });

  const handleSaveEditRallado = async () => {
    if (!editRallado.peso || !editRallado.precioPorKg) {
      enqueueSnackbar('Completá todos los campos', { variant: 'warning' });
      return;
    }
    setSavingEditRallado(true);
    try {
      await ventaRalladoService.actualizar(editRallado.id, {
        fecha: editRallado.fecha || null,
        peso: parseFloat(editRallado.peso),
        precioPorKg: parseFloat(editRallado.precioPorKg),
        pagado: editRallado.pagado,
      });
      enqueueSnackbar('Venta actualizada', { variant: 'success' });
      setEditRallado(null);
      fetchRallado();
    } catch (e) {
      enqueueSnackbar(e.message || 'Error al actualizar', { variant: 'error' });
    } finally {
      setSavingEditRallado(false);
    }
  };

  const handleDeleteRallado = async (id) => {
    if (!window.confirm('¿Eliminar esta venta? Se revertirá el saldo del cliente.')) return;
    try {
      await ventaRalladoService.eliminar(id);
      enqueueSnackbar('Venta eliminada', { variant: 'success' });
      fetchRallado();
    } catch (e) {
      enqueueSnackbar(e.message || 'Error al eliminar', { variant: 'error' });
    }
  };

  const previewTotalMiga =
    formMiga.cantidad && formMiga.precioUnitario
      ? (parseFloat(formMiga.cantidad) * parseFloat(formMiga.precioUnitario)).toFixed(2)
      : null;

  const previewTotalRallado =
    formRallado.peso && formRallado.precioPorKg
      ? (parseFloat(formRallado.peso) * parseFloat(formRallado.precioPorKg)).toFixed(2)
      : null;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={700} color="primary">Ventas</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Registro de ventas de pan de miga y pan rallado
        </Typography>
      </Box>

      <Paper>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab label="Pan de Miga" icon={<ReceiptIcon fontSize="small" />} iconPosition="start" />
          <Tab label="Pan Rallado" icon={<RalladoIcon fontSize="small" />} iconPosition="start" />
        </Tabs>

        {/* ── TAB MIGA ── */}
        {tab === 0 && (
          <Box sx={{ p: 3 }}>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={4}>
                <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="caption" color="text.secondary">Total vendido</Typography>
                  <Typography variant="h6" fontWeight={700} color="primary">{formatPeso(totalVentasMiga)}</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="caption" color="text.secondary">Ventas registradas</Typography>
                  <Typography variant="h6" fontWeight={700}>{ventasMiga.length}</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="caption" color="text.secondary">Impagas</Typography>
                  <Typography variant="h6" fontWeight={700} color={impagasMiga > 0 ? 'error.main' : 'text.primary'}>{impagasMiga}</Typography>
                </Paper>
              </Grid>
            </Grid>

            <Typography variant="h6" fontWeight={600} gutterBottom>Nueva Venta de Miga</Typography>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth size="small" label="Fecha" type="date"
                  value={formMiga.fecha}
                  onChange={(e) => setFormMiga({ ...formMiga, fecha: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Cliente</InputLabel>
                  <Select
                    value={formMiga.clienteId}
                    label="Cliente"
                    onChange={(e) => {
                      const clienteId = e.target.value;
                      const c = clientes.find((x) => x.id === clienteId);
                      setFormMiga({
                        ...formMiga,
                        clienteId,
                        precioUnitario: c?.precioMiga != null ? String(c.precioMiga) : formMiga.precioUnitario,
                      });
                    }}
                  >
                    {clientes.map((c) => (
                      <MenuItem key={c.id} value={c.id}>{c.nombre} {c.apellido}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6} sm={3} md={2}>
                <TextField
                  fullWidth size="small" label="Cantidad" type="number"
                  value={formMiga.cantidad}
                  onChange={(e) => setFormMiga({ ...formMiga, cantidad: e.target.value })}
                  inputProps={{ min: 1, step: 1 }}
                />
              </Grid>
              <Grid item xs={6} sm={3} md={2}>
                <TextField
                  fullWidth size="small" label="Precio unitario" type="number"
                  value={formMiga.precioUnitario}
                  onChange={(e) => setFormMiga({ ...formMiga, precioUnitario: e.target.value })}
                  InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                  inputProps={{ min: 0.01, step: 0.01 }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={2} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formMiga.pagado}
                      onChange={(e) => setFormMiga({ ...formMiga, pagado: e.target.checked })}
                      color="success"
                    />
                  }
                  label={formMiga.pagado ? 'Pagado' : 'Impago'}
                />
                {previewTotalMiga && (
                  <Typography variant="body2" fontWeight={600} color="primary">
                    Total: {formatPeso(previewTotalMiga)}
                  </Typography>
                )}
              </Grid>
              <Grid item xs={12}>
                <Button
                  variant="contained"
                  startIcon={submittingMiga ? <CircularProgress size={18} color="inherit" /> : <AddIcon />}
                  onClick={handleSubmitMiga}
                  disabled={submittingMiga}
                >
                  Registrar venta
                </Button>
              </Grid>
            </Grid>

            <Divider sx={{ my: 2 }} />

            <Typography variant="h6" fontWeight={600} gutterBottom>Historial</Typography>
            {loadingMiga ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>
            ) : ventasMiga.length === 0 ? (
              <Typography color="text.secondary">No hay ventas registradas.</Typography>
            ) : (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'grey.50' }}>
                      <TableCell sx={{ fontWeight: 700 }}>Fecha</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Cliente</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>Cant.</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>P. Unit.</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>Total</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Estado</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {ventasMiga.map((v) => (
                      <TableRow key={v.id} hover>
                        <TableCell>{formatDate(v.fecha)}</TableCell>
                        <TableCell>{v.clienteNombre}</TableCell>
                        <TableCell align="right">{v.cantidad}</TableCell>
                        <TableCell align="right">{formatPeso(v.precioUnitario)}</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>{formatPeso(v.total)}</TableCell>
                        <TableCell><EstadoPagoChip estadoPago={v.estadoPago} /></TableCell>
                        <TableCell align="right">
                          <IconButton size="small" title="Editar" onClick={() => openEditMiga(v)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton size="small" title="Eliminar" color="error" onClick={() => handleDeleteMiga(v.id)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        )}

        {/* ── TAB RALLADO ── */}
        {tab === 1 && (
          <Box sx={{ p: 3 }}>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={4}>
                <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="caption" color="text.secondary">Total vendido</Typography>
                  <Typography variant="h6" fontWeight={700} color="primary">{formatPeso(totalVentasRallado)}</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="caption" color="text.secondary">Ventas registradas</Typography>
                  <Typography variant="h6" fontWeight={700}>{ventasRallado.length}</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="caption" color="text.secondary">Impagas</Typography>
                  <Typography variant="h6" fontWeight={700} color={impagasRallado > 0 ? 'error.main' : 'text.primary'}>{impagasRallado}</Typography>
                </Paper>
              </Grid>
            </Grid>

            <Typography variant="h6" fontWeight={600} gutterBottom>Nueva Venta de Pan Rallado</Typography>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth size="small" label="Fecha" type="date"
                  value={formRallado.fecha}
                  onChange={(e) => setFormRallado({ ...formRallado, fecha: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Cliente</InputLabel>
                  <Select
                    value={formRallado.clienteId}
                    label="Cliente"
                    onChange={(e) => {
                      const clienteId = e.target.value;
                      const c = clientes.find((x) => x.id === clienteId);
                      setFormRallado({
                        ...formRallado,
                        clienteId,
                        precioPorKg: c?.precioRallado != null ? String(c.precioRallado) : formRallado.precioPorKg,
                      });
                    }}
                  >
                    {clientes.map((c) => (
                      <MenuItem key={c.id} value={c.id}>{c.nombre} {c.apellido}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6} sm={3} md={2}>
                <TextField
                  fullWidth size="small" label="Peso (kg)" type="number"
                  value={formRallado.peso}
                  onChange={(e) => setFormRallado({ ...formRallado, peso: e.target.value })}
                  InputProps={{ endAdornment: <InputAdornment position="end">kg</InputAdornment> }}
                  inputProps={{ min: 0.001, step: 0.5 }}
                />
              </Grid>
              <Grid item xs={6} sm={3} md={2}>
                <TextField
                  fullWidth size="small" label="Precio por kg" type="number"
                  value={formRallado.precioPorKg}
                  onChange={(e) => setFormRallado({ ...formRallado, precioPorKg: e.target.value })}
                  InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                  inputProps={{ min: 0.01, step: 0.01 }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={2} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formRallado.pagado}
                      onChange={(e) => setFormRallado({ ...formRallado, pagado: e.target.checked })}
                      color="success"
                    />
                  }
                  label={formRallado.pagado ? 'Pagado' : 'Impago'}
                />
                {previewTotalRallado && (
                  <Typography variant="body2" fontWeight={600} color="primary">
                    Total: {formatPeso(previewTotalRallado)}
                  </Typography>
                )}
              </Grid>
              <Grid item xs={12}>
                <Button
                  variant="contained"
                  startIcon={submittingRallado ? <CircularProgress size={18} color="inherit" /> : <AddIcon />}
                  onClick={handleSubmitRallado}
                  disabled={submittingRallado}
                >
                  Registrar venta
                </Button>
              </Grid>
            </Grid>

            <Divider sx={{ my: 2 }} />

            <Typography variant="h6" fontWeight={600} gutterBottom>Historial</Typography>
            {loadingRallado ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>
            ) : ventasRallado.length === 0 ? (
              <Typography color="text.secondary">No hay ventas registradas.</Typography>
            ) : (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'grey.50' }}>
                      <TableCell sx={{ fontWeight: 700 }}>Fecha</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Cliente</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>Peso (kg)</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>Precio/kg</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>Total</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Estado</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {ventasRallado.map((v) => (
                      <TableRow key={v.id} hover>
                        <TableCell>{formatDate(v.fecha)}</TableCell>
                        <TableCell>{v.clienteNombre}</TableCell>
                        <TableCell align="right">{v.peso}</TableCell>
                        <TableCell align="right">{formatPeso(v.precioPorKg)}</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>{formatPeso(v.total)}</TableCell>
                        <TableCell><EstadoPagoChip estadoPago={v.estadoPago} /></TableCell>
                        <TableCell align="right">
                          <IconButton size="small" title="Editar" onClick={() => openEditRallado(v)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton size="small" title="Eliminar" color="error" onClick={() => handleDeleteRallado(v.id)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        )}
      </Paper>

      {/* Dialog editar miga */}
      {editMiga && (
        <Dialog open onClose={() => setEditMiga(null)} maxWidth="xs" fullWidth>
          <DialogTitle>Editar venta de miga</DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <TextField
              label="Fecha" type="date" size="small" fullWidth
              value={editMiga.fecha}
              onChange={(e) => setEditMiga({ ...editMiga, fecha: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Cantidad" type="number" size="small" fullWidth
              value={editMiga.cantidad}
              onChange={(e) => setEditMiga({ ...editMiga, cantidad: e.target.value })}
              inputProps={{ min: 1, step: 1 }}
            />
            <TextField
              label="Precio unitario" type="number" size="small" fullWidth
              value={editMiga.precioUnitario}
              onChange={(e) => setEditMiga({ ...editMiga, precioUnitario: e.target.value })}
              InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
              inputProps={{ min: 0.01, step: 0.01 }}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={editMiga.pagado}
                  onChange={(e) => setEditMiga({ ...editMiga, pagado: e.target.checked })}
                  color="success"
                />
              }
              label={editMiga.pagado ? 'Pagado' : 'Impago'}
            />
            {editMiga.cantidad && editMiga.precioUnitario && (
              <Typography variant="body2" fontWeight={600} color="primary">
                Total: {formatPeso((parseFloat(editMiga.cantidad) * parseFloat(editMiga.precioUnitario)).toFixed(2))}
              </Typography>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditMiga(null)}>Cancelar</Button>
            <Button variant="contained" onClick={handleSaveEditMiga} disabled={savingEditMiga}>
              {savingEditMiga ? <CircularProgress size={20} /> : 'Guardar'}
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {/* Dialog editar rallado */}
      {editRallado && (
        <Dialog open onClose={() => setEditRallado(null)} maxWidth="xs" fullWidth>
          <DialogTitle>Editar venta de rallado</DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <TextField
              label="Fecha" type="date" size="small" fullWidth
              value={editRallado.fecha}
              onChange={(e) => setEditRallado({ ...editRallado, fecha: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Peso (kg)" type="number" size="small" fullWidth
              value={editRallado.peso}
              onChange={(e) => setEditRallado({ ...editRallado, peso: e.target.value })}
              InputProps={{ endAdornment: <InputAdornment position="end">kg</InputAdornment> }}
              inputProps={{ min: 0.001, step: 0.5 }}
            />
            <TextField
              label="Precio por kg" type="number" size="small" fullWidth
              value={editRallado.precioPorKg}
              onChange={(e) => setEditRallado({ ...editRallado, precioPorKg: e.target.value })}
              InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
              inputProps={{ min: 0.01, step: 0.01 }}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={editRallado.pagado}
                  onChange={(e) => setEditRallado({ ...editRallado, pagado: e.target.checked })}
                  color="success"
                />
              }
              label={editRallado.pagado ? 'Pagado' : 'Impago'}
            />
            {editRallado.peso && editRallado.precioPorKg && (
              <Typography variant="body2" fontWeight={600} color="primary">
                Total: {formatPeso((parseFloat(editRallado.peso) * parseFloat(editRallado.precioPorKg)).toFixed(2))}
              </Typography>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditRallado(null)}>Cancelar</Button>
            <Button variant="contained" onClick={handleSaveEditRallado} disabled={savingEditRallado}>
              {savingEditRallado ? <CircularProgress size={20} /> : 'Guardar'}
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Container>
  );
}
