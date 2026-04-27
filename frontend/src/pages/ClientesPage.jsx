import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Button, Typography, Container, TextField,
  Paper, Tabs, Tab, Grid, IconButton,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, Dialog, DialogTitle, DialogContent, DialogActions,
  FormControl, InputLabel, Select, MenuItem, InputAdornment,
  CircularProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  AccountBalanceWallet as SaldoIcon,
  People as PeopleIcon,
  TrendingDown as DeudaIcon,
  TrendingUp as SaldoFavorIcon,
  PersonSearch as PerfilIcon,
} from '@mui/icons-material';
import { clienteService } from '../services/clienteService';
import { useSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';

const formatPeso = (n) =>
  n != null
    ? `$${Number(n).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : '-';

const TIPO_OPTIONS = ['CLIENTE', 'REVENDEDOR'];

const EMPTY_FORM = { nombre: '', apellido: '', tipo: 'CLIENTE', direccion: '', precioMiga: '', precioRallado: '' };

const SaldoChip = ({ saldo }) => {
  const val = Number(saldo);
  if (val < 0)
    return (
      <Typography fontWeight={600} color="error.main">
        {formatPeso(saldo)}
      </Typography>
    );
  if (val > 0)
    return (
      <Typography fontWeight={600} color="success.main">
        {formatPeso(saldo)}
      </Typography>
    );
  return <Typography color="text.secondary">{formatPeso(saldo)}</Typography>;
};

export default function ClientesPage() {
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const [clientes, setClientes] = useState([]);
  const [resumen, setResumen] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState(0);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const [saldoDialogOpen, setSaldoDialogOpen] = useState(false);
  const [saldoTarget, setSaldoTarget] = useState(null);
  const [nuevoSaldo, setNuevoSaldo] = useState('');
  const [savingSaldo, setSavingSaldo] = useState(false);

  const fetchClientes = useCallback(async () => {
    setLoading(true);
    try {
      const [lista, res] = await Promise.all([
        clienteService.listar(),
        clienteService.resumen(),
      ]);
      setClientes(lista);
      setResumen(res);
    } catch {
      enqueueSnackbar('Error al cargar clientes', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  }, [enqueueSnackbar]);

  useEffect(() => {
    fetchClientes();
  }, [fetchClientes]);

  const clientesFiltrados = clientes.filter((c) => {
    if (tab === 1) return Number(c.saldo) < 0;
    if (tab === 2) return Number(c.saldo) > 0;
    return true;
  });

  const openCreate = () => {
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  };

  const openEdit = (cliente) => {
    setEditTarget(cliente);
    setForm({
      nombre: cliente.nombre,
      apellido: cliente.apellido,
      tipo: cliente.tipo,
      direccion: cliente.direccion || '',
      precioMiga: cliente.precioMiga ?? '',
      precioRallado: cliente.precioRallado ?? '',
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.nombre.trim() || !form.apellido.trim()) {
      enqueueSnackbar('Nombre y apellido son obligatorios', { variant: 'warning' });
      return;
    }
    setSaving(true);
    const payload = {
      nombre: form.nombre,
      apellido: form.apellido,
      tipo: form.tipo,
      direccion: form.direccion || null,
      precioMiga: form.precioMiga !== '' ? parseFloat(form.precioMiga) : null,
      precioRallado: form.precioRallado !== '' ? parseFloat(form.precioRallado) : null,
    };
    try {
      if (editTarget) {
        await clienteService.actualizar(editTarget.id, payload);
        enqueueSnackbar('Cliente actualizado', { variant: 'success' });
      } else {
        await clienteService.crear(payload);
        enqueueSnackbar('Cliente creado', { variant: 'success' });
      }
      setDialogOpen(false);
      fetchClientes();
    } catch (e) {
      enqueueSnackbar(e.message || 'Error al guardar', { variant: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (cliente) => {
    if (!window.confirm(`¿Eliminar a ${cliente.nombre} ${cliente.apellido}?`)) return;
    try {
      await clienteService.eliminar(cliente.id);
      enqueueSnackbar('Cliente eliminado', { variant: 'success' });
      fetchClientes();
    } catch (e) {
      enqueueSnackbar(e.message || 'Error al eliminar', { variant: 'error' });
    }
  };

  const openSaldo = (cliente) => {
    setSaldoTarget(cliente);
    setNuevoSaldo(String(cliente.saldo));
    setSaldoDialogOpen(true);
  };

  const handleSaveSaldo = async () => {
    const valor = parseFloat(nuevoSaldo);
    if (isNaN(valor)) {
      enqueueSnackbar('Ingresá un valor numérico válido', { variant: 'warning' });
      return;
    }
    setSavingSaldo(true);
    try {
      await clienteService.actualizarSaldo(saldoTarget.id, valor);
      enqueueSnackbar('Saldo actualizado', { variant: 'success' });
      setSaldoDialogOpen(false);
      fetchClientes();
    } catch (e) {
      enqueueSnackbar(e.message || 'Error al actualizar saldo', { variant: 'error' });
    } finally {
      setSavingSaldo(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography variant="h4" fontWeight={700} color="primary">
            Clientes y Revendedores
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Gestión de clientes, revendedores y estado de deuda
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
          Nuevo cliente
        </Button>
      </Box>

      {/* Resumen */}
      {resumen && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={4}>
            <Paper variant="outlined" sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <PeopleIcon color="primary" />
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Total activos
                </Typography>
                <Typography variant="h6" fontWeight={700}>
                  {resumen.totalActivos}
                </Typography>
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Paper variant="outlined" sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <DeudaIcon color="error" />
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Deuda total ({resumen.cantidadDeudores} deudores)
                </Typography>
                <Typography variant="h6" fontWeight={700} color="error.main">
                  {formatPeso(resumen.totalDeuda)}
                </Typography>
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Paper variant="outlined" sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <SaldoFavorIcon color="success" />
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Saldo a favor ({resumen.cantidadConSaldo} clientes)
                </Typography>
                <Typography variant="h6" fontWeight={700} color="success.main">
                  {formatPeso(resumen.totalSaldoAFavor)}
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Tabla */}
      <Paper>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label={`Todos (${clientes.length})`} />
          <Tab
            label={`Deudores (${clientes.filter((c) => Number(c.saldo) < 0).length})`}
            sx={{ color: 'error.main' }}
          />
          <Tab
            label={`Con saldo (${clientes.filter((c) => Number(c.saldo) > 0).length})`}
            sx={{ color: 'success.main' }}
          />
        </Tabs>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress />
          </Box>
        ) : clientesFiltrados.length === 0 ? (
          <Typography color="text.secondary" sx={{ p: 3 }}>
            No hay clientes en esta categoría.
          </Typography>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'grey.50' }}>
                  <TableCell sx={{ fontWeight: 700 }}>Nombre</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Tipo</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>
                    Saldo
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>
                    Acciones
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {clientesFiltrados.map((c) => (
                  <TableRow key={c.id} hover>
                    <TableCell
                      sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline', color: 'primary.main' } }}
                      onClick={() => navigate(`/clientes/${c.id}`)}
                    >
                      {c.nombre} {c.apellido}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={c.tipo}
                        size="small"
                        color={c.tipo === 'REVENDEDOR' ? 'warning' : 'info'}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <SaldoChip saldo={c.saldo} />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        title="Ajustar saldo"
                        onClick={() => openSaldo(c)}
                        color="primary"
                      >
                        <SaldoIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" title="Editar" onClick={() => openEdit(c)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        title="Eliminar"
                        color="error"
                        onClick={() => handleDelete(c)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Dialog crear/editar */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>{editTarget ? 'Editar cliente' : 'Nuevo cliente'}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          <TextField
            label="Nombre"
            value={form.nombre}
            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            size="small"
            fullWidth
            autoFocus
          />
          <TextField
            label="Apellido"
            value={form.apellido}
            onChange={(e) => setForm({ ...form, apellido: e.target.value })}
            size="small"
            fullWidth
          />
          <FormControl size="small" fullWidth>
            <InputLabel>Tipo</InputLabel>
            <Select
              value={form.tipo}
              label="Tipo"
              onChange={(e) => setForm({ ...form, tipo: e.target.value })}
            >
              {TIPO_OPTIONS.map((t) => (
                <MenuItem key={t} value={t}>
                  {t}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {form.tipo === 'CLIENTE' && (
            <TextField
              label="Dirección del local (opcional)"
              value={form.direccion}
              onChange={(e) => setForm({ ...form, direccion: e.target.value })}
              size="small"
              fullWidth
            />
          )}
          <TextField
            label="Precio fijo miga (opcional)"
            type="number"
            value={form.precioMiga}
            onChange={(e) => setForm({ ...form, precioMiga: e.target.value })}
            size="small"
            fullWidth
            InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
            inputProps={{ min: 0.01, step: 0.01 }}
          />
          <TextField
            label="Precio fijo rallado / kg (opcional)"
            type="number"
            value={form.precioRallado}
            onChange={(e) => setForm({ ...form, precioRallado: e.target.value })}
            size="small"
            fullWidth
            InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
            inputProps={{ min: 0.01, step: 0.01 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving}>
            {saving ? <CircularProgress size={20} /> : 'Guardar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog actualizar saldo */}
      <Dialog open={saldoDialogOpen} onClose={() => setSaldoDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>
          Actualizar saldo — {saldoTarget?.nombre} {saldoTarget?.apellido}
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Positivo = saldo a favor · Negativo = deuda
          </Typography>
          <TextField
            label="Nuevo saldo"
            type="number"
            value={nuevoSaldo}
            onChange={(e) => setNuevoSaldo(e.target.value)}
            size="small"
            fullWidth
            autoFocus
            InputProps={{
              startAdornment: <InputAdornment position="start">$</InputAdornment>,
            }}
            inputProps={{ step: 0.01 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSaldoDialogOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleSaveSaldo} disabled={savingSaldo}>
            {savingSaldo ? <CircularProgress size={20} /> : 'Guardar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
