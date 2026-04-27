import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Button, Typography, Container, TextField,
  Paper, Tabs, Tab, Grid, Divider,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, FormControl, InputLabel, Select, MenuItem, InputAdornment,
  CircularProgress, FormControlLabel, Switch,
} from '@mui/material';
import {
  Add as AddIcon,
  Receipt as ReceiptIcon,
  Grain as RalladoIcon,
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

const PagoChip = ({ pagado }) =>
  pagado ? (
    <Chip label="Pagado" color="success" size="small" />
  ) : (
    <Chip label="Impago" color="error" size="small" variant="outlined" />
  );

const EMPTY_MIGA = {
  fecha: today(),
  clienteId: '',
  tipoPan: 'BLANCO',
  cantidad: '',
  unidad: 'ENTERO',
  precioUnitario: '',
  pagado: true,
};

const EMPTY_RALLADO = {
  fecha: today(),
  clienteId: '',
  peso: '',
  precioPorKg: '',
  pagado: true,
};

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
        tipoPan: formMiga.tipoPan,
        cantidad: parseFloat(formMiga.cantidad),
        unidad: formMiga.unidad,
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
        <Typography variant="h4" fontWeight={700} color="primary">
          Ventas
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Registro de ventas de pan de miga y pan rallado
        </Typography>
      </Box>

      <Paper>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab
            label="Pan de Miga"
            icon={<ReceiptIcon fontSize="small" />}
            iconPosition="start"
          />
          <Tab
            label="Pan Rallado"
            icon={<RalladoIcon fontSize="small" />}
            iconPosition="start"
          />
        </Tabs>

        {/* ── TAB MIGA ── */}
        {tab === 0 && (
          <Box sx={{ p: 3 }}>
            {/* Stats */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={4}>
                <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="caption" color="text.secondary">Total vendido</Typography>
                  <Typography variant="h6" fontWeight={700} color="primary">
                    {formatPeso(totalVentasMiga)}
                  </Typography>
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
                  <Typography variant="h6" fontWeight={700} color={impagasMiga > 0 ? 'error.main' : 'text.primary'}>
                    {impagasMiga}
                  </Typography>
                </Paper>
              </Grid>
            </Grid>

            {/* Formulario */}
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Nueva Venta de Miga
            </Typography>
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
                    onChange={(e) => setFormMiga({ ...formMiga, clienteId: e.target.value })}
                  >
                    {clientes.map((c) => (
                      <MenuItem key={c.id} value={c.id}>
                        {c.nombre} {c.apellido}
                        {c.tipo === 'REVENDEDOR' && (
                          <Chip label="Rev." size="small" color="warning" sx={{ ml: 1 }} />
                        )}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6} sm={3} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Tipo</InputLabel>
                  <Select
                    value={formMiga.tipoPan}
                    label="Tipo"
                    onChange={(e) => setFormMiga({ ...formMiga, tipoPan: e.target.value })}
                  >
                    <MenuItem value="BLANCO">Blanco</MenuItem>
                    <MenuItem value="NEGRO">Negro</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6} sm={3} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Unidad</InputLabel>
                  <Select
                    value={formMiga.unidad}
                    label="Unidad"
                    onChange={(e) => setFormMiga({ ...formMiga, unidad: e.target.value })}
                  >
                    <MenuItem value="ENTERO">Entero</MenuItem>
                    <MenuItem value="MEDIO">Medio</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6} sm={3} md={2}>
                <TextField
                  fullWidth size="small" label="Cantidad" type="number"
                  value={formMiga.cantidad}
                  onChange={(e) => setFormMiga({ ...formMiga, cantidad: e.target.value })}
                  inputProps={{ min: 0.001, step: 0.5 }}
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
              <Grid item xs={12} sm={6} md={3} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
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

            {/* Historial miga */}
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Historial
            </Typography>
            {loadingMiga ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : ventasMiga.length === 0 ? (
              <Typography color="text.secondary">No hay ventas registradas.</Typography>
            ) : (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'grey.50' }}>
                      <TableCell sx={{ fontWeight: 700 }}>Fecha</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Cliente</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Tipo</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>Cant.</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Unidad</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>P. Unit.</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>Total</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Estado</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {ventasMiga.map((v) => (
                      <TableRow key={v.id} hover>
                        <TableCell>{v.fecha}</TableCell>
                        <TableCell>{v.clienteNombre}</TableCell>
                        <TableCell>
                          <Chip
                            label={v.tipoPan}
                            size="small"
                            color={v.tipoPan === 'BLANCO' ? 'default' : 'warning'}
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell align="right">{v.cantidad}</TableCell>
                        <TableCell>{v.unidad === 'ENTERO' ? 'Entero' : 'Medio'}</TableCell>
                        <TableCell align="right">{formatPeso(v.precioUnitario)}</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>
                          {formatPeso(v.total)}
                        </TableCell>
                        <TableCell>
                          <PagoChip pagado={v.pagado} />
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
            {/* Stats */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={4}>
                <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="caption" color="text.secondary">Total vendido</Typography>
                  <Typography variant="h6" fontWeight={700} color="primary">
                    {formatPeso(totalVentasRallado)}
                  </Typography>
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
                  <Typography variant="h6" fontWeight={700} color={impagasRallado > 0 ? 'error.main' : 'text.primary'}>
                    {impagasRallado}
                  </Typography>
                </Paper>
              </Grid>
            </Grid>

            {/* Formulario */}
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Nueva Venta de Pan Rallado
            </Typography>
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
                    onChange={(e) => setFormRallado({ ...formRallado, clienteId: e.target.value })}
                  >
                    {clientes.map((c) => (
                      <MenuItem key={c.id} value={c.id}>
                        {c.nombre} {c.apellido}
                        {c.tipo === 'REVENDEDOR' && (
                          <Chip label="Rev." size="small" color="warning" sx={{ ml: 1 }} />
                        )}
                      </MenuItem>
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
              <Grid item xs={12} sm={6} md={4} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
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

            {/* Historial rallado */}
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Historial
            </Typography>
            {loadingRallado ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
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
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {ventasRallado.map((v) => (
                      <TableRow key={v.id} hover>
                        <TableCell>{v.fecha}</TableCell>
                        <TableCell>{v.clienteNombre}</TableCell>
                        <TableCell align="right">{v.peso}</TableCell>
                        <TableCell align="right">{formatPeso(v.precioPorKg)}</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>
                          {formatPeso(v.total)}
                        </TableCell>
                        <TableCell>
                          <PagoChip pagado={v.pagado} />
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
    </Container>
  );
}
