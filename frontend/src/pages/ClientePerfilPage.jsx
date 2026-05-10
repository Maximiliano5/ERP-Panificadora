import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Button, Typography, Container, TextField,
  Paper, Grid, Chip, CircularProgress, Tabs, Tab,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  InputAdornment,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  FilterAlt as FilterIcon,
  LocationOn as DireccionIcon,
  Receipt as MigaIcon,
  Grain as RalladoIcon,
  Add as AddIcon,
  Payments as PagosIcon,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { clienteService } from '../services/clienteService';
import { useSnackbar } from 'notistack';

const formatPeso = (n) =>
  n != null
    ? `$${Number(n).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : '-';

const formatCant = (n) =>
  n != null ? Number(n).toLocaleString('es-AR', { maximumFractionDigits: 3 }) : '-';

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

const SaldoCard = ({ saldo, label }) => {
  const val = Number(saldo || 0);
  const color = val < 0 ? 'error.main' : val > 0 ? 'success.main' : 'text.secondary';
  const msg = val < 0 ? 'Tiene deuda pendiente' : val > 0 ? 'Tiene saldo a favor' : 'Sin movimientos';
  return (
    <Paper variant="outlined" sx={{ p: 2.5, height: '100%' }}>
      <Typography variant="subtitle2" color="text.secondary" gutterBottom>{label}</Typography>
      <Typography variant="h5" fontWeight={700} color={color}>{formatPeso(saldo)}</Typography>
      <Typography variant="caption" color={color}>{msg}</Typography>
    </Paper>
  );
};

const today = () => new Date().toISOString().split('T')[0];
const firstOfMonth = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
};

const EMPTY_PAGO_MIGA = { fecha: today(), monto: '', descripcion: '', tipoPago: 'MIGA' };
const EMPTY_PAGO_RALLADO = { fecha: today(), monto: '', descripcion: '', tipoPago: 'RALLADO' };

export default function ClientePerfilPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState(0);
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');

  const [formPagoMiga, setFormPagoMiga] = useState(EMPTY_PAGO_MIGA);
  const [formPagoRallado, setFormPagoRallado] = useState(EMPTY_PAGO_RALLADO);
  const [savingPagoMiga, setSavingPagoMiga] = useState(false);
  const [savingPagoRallado, setSavingPagoRallado] = useState(false);

  const fetchPerfil = useCallback(
    async (d, h) => {
      setLoading(true);
      try {
        const data = await clienteService.obtenerPerfil(id, d || undefined, h || undefined);
        setPerfil(data);
      } catch (e) {
        enqueueSnackbar(e.message || 'Error al cargar perfil', { variant: 'error' });
      } finally {
        setLoading(false);
      }
    },
    [id, enqueueSnackbar]
  );

  useEffect(() => {
    fetchPerfil('', '');
  }, [fetchPerfil]);

  const handleFiltrar = () => fetchPerfil(desde, hasta);
  const setRangoHoy = () => { const d = today(); setDesde(d); setHasta(d); fetchPerfil(d, d); };
  const setRangoMes = () => { const d = firstOfMonth(), h = today(); setDesde(d); setHasta(h); fetchPerfil(d, h); };
  const limpiarFiltro = () => { setDesde(''); setHasta(''); fetchPerfil('', ''); };

  const handleRegistrarPago = async (tipoPago) => {
    const form = tipoPago === 'MIGA' ? formPagoMiga : formPagoRallado;
    const monto = parseFloat(form.monto);
    if (!form.monto || monto <= 0) {
      enqueueSnackbar('Ingresá un monto válido', { variant: 'warning' });
      return;
    }
    if (tipoPago === 'MIGA') setSavingPagoMiga(true);
    else setSavingPagoRallado(true);
    try {
      await clienteService.registrarPago(id, {
        fecha: form.fecha || null,
        monto,
        descripcion: form.descripcion || null,
        tipoPago,
      });
      enqueueSnackbar('Pago registrado', { variant: 'success' });
      if (tipoPago === 'MIGA') setFormPagoMiga(EMPTY_PAGO_MIGA);
      else setFormPagoRallado(EMPTY_PAGO_RALLADO);
      fetchPerfil(desde, hasta);
    } catch (e) {
      enqueueSnackbar(e.message || 'Error al registrar pago', { variant: 'error' });
    } finally {
      if (tipoPago === 'MIGA') setSavingPagoMiga(false);
      else setSavingPagoRallado(false);
    }
  };

  if (loading && !perfil) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!perfil) return null;

  const { cliente } = perfil;
  const pagosMiga = (perfil.pagos || []).filter((p) => p.tipoPago === 'MIGA');
  const pagosRallado = (perfil.pagos || []).filter((p) => p.tipoPago === 'RALLADO');
  const totalPagosMiga = pagosMiga.reduce((s, p) => s + Number(p.monto), 0);
  const totalPagosRallado = pagosRallado.reduce((s, p) => s + Number(p.monto), 0);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Button startIcon={<BackIcon />} onClick={() => navigate('/clientes')} variant="outlined" size="small">
          Volver
        </Button>
        <Typography variant="h4" fontWeight={700} color="primary">
          {cliente.nombre} {cliente.apellido}
        </Typography>
      </Box>

      {/* Filtro de fechas (afecta ventas) */}
      <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
        <Typography variant="subtitle2" fontWeight={600} gutterBottom>Filtrar ventas por período</Typography>
        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap' }}>
          <TextField label="Desde" type="date" size="small" value={desde}
            onChange={(e) => setDesde(e.target.value)} InputLabelProps={{ shrink: true }} sx={{ width: 160 }} />
          <TextField label="Hasta" type="date" size="small" value={hasta}
            onChange={(e) => setHasta(e.target.value)} InputLabelProps={{ shrink: true }} sx={{ width: 160 }} />
          <Button variant="contained" size="small" startIcon={<FilterIcon />} onClick={handleFiltrar}>Filtrar</Button>
          <Button size="small" onClick={setRangoHoy}>Hoy</Button>
          <Button size="small" onClick={setRangoMes}>Este mes</Button>
          <Button size="small" color="inherit" onClick={limpiarFiltro}>Limpiar</Button>
          {loading && <CircularProgress size={20} />}
        </Box>
      </Paper>

      {/* Tabs */}
      <Paper>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab label="Resumen" />
          <Tab label="Pan de Miga" icon={<MigaIcon fontSize="small" />} iconPosition="start" />
          <Tab label="Pan Rallado" icon={<RalladoIcon fontSize="small" />} iconPosition="start" />
        </Tabs>

        {/* ── TAB RESUMEN ── */}
        {tab === 0 && (
          <Box sx={{ p: 3 }}>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6} md={3}>
                <SaldoCard saldo={cliente.saldoMiga} label="Saldo Miga" />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <SaldoCard saldo={cliente.saldoRallado} label="Saldo Rallado" />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Paper variant="outlined" sx={{ p: 2.5, height: '100%' }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>Precios acordados</Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mt: 1 }}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Pan de miga</Typography>
                      <Typography fontWeight={600}>
                        {cliente.precioMiga ? formatPeso(cliente.precioMiga) : <em style={{ color: '#aaa' }}>Sin precio fijo</em>}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Pan rallado / kg</Typography>
                      <Typography fontWeight={600}>
                        {cliente.precioRallado ? formatPeso(cliente.precioRallado) : <em style={{ color: '#aaa' }}>Sin precio fijo</em>}
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Paper variant="outlined" sx={{ p: 2.5, height: '100%' }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>Dirección</Typography>
                  {cliente.direccion ? (
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start', mt: 0.5 }}>
                      <DireccionIcon fontSize="small" color="action" sx={{ mt: 0.2 }} />
                      <Typography>{cliente.direccion}</Typography>
                    </Box>
                  ) : (
                    <Typography color="text.secondary" variant="body2" sx={{ mt: 0.5 }}>Sin dirección registrada</Typography>
                  )}
                </Paper>
              </Grid>
            </Grid>

            <Typography variant="h6" fontWeight={600} gutterBottom>Métricas del período</Typography>
            <Grid container spacing={2}>
              <Grid item xs={6} sm={3}>
                <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                  <MigaIcon color="primary" sx={{ mb: 0.5 }} />
                  <Typography variant="caption" color="text.secondary" display="block">Panes de miga</Typography>
                  <Typography variant="h5" fontWeight={700}>{formatCant(perfil.totalPanesMiga)}</Typography>
                </Paper>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                  <RalladoIcon color="primary" sx={{ mb: 0.5 }} />
                  <Typography variant="caption" color="text.secondary" display="block">Kg de rallado</Typography>
                  <Typography variant="h5" fontWeight={700}>{formatCant(perfil.totalKgRallado)}</Typography>
                </Paper>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="caption" color="text.secondary" display="block">Facturado miga</Typography>
                  <Typography variant="h6" fontWeight={700} color="primary">{formatPeso(perfil.totalFacturadoMiga)}</Typography>
                </Paper>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="caption" color="text.secondary" display="block">Facturado rallado</Typography>
                  <Typography variant="h6" fontWeight={700} color="primary">{formatPeso(perfil.totalFacturadoRallado)}</Typography>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* ── TAB PAN DE MIGA ── */}
        {tab === 1 && (
          <Box sx={{ p: 3 }}>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} md={4}>
                <SaldoCard saldo={cliente.saldoMiga} label="Saldo cuenta Miga" />
              </Grid>
            </Grid>

            {/* Registrar pago miga */}
            <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <PagosIcon color="success" />
                <Typography variant="h6" fontWeight={600}>Registrar pago</Typography>
                {pagosMiga.length > 0 && (
                  <Chip label={`Total pagado: ${formatPeso(totalPagosMiga)}`} color="success" size="small" sx={{ ml: 1 }} />
                )}
              </Box>
              <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap', mb: 2 }}>
                <TextField
                  label="Fecha" type="date" size="small"
                  value={formPagoMiga.fecha}
                  onChange={(e) => setFormPagoMiga({ ...formPagoMiga, fecha: e.target.value })}
                  InputLabelProps={{ shrink: true }} sx={{ width: 155 }}
                />
                <TextField
                  label="Monto" type="number" size="small"
                  value={formPagoMiga.monto}
                  onChange={(e) => setFormPagoMiga({ ...formPagoMiga, monto: e.target.value })}
                  InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                  inputProps={{ min: 0.01, step: 0.01 }} sx={{ width: 155 }}
                />
                <TextField
                  label="Descripción (opcional)" size="small"
                  value={formPagoMiga.descripcion}
                  onChange={(e) => setFormPagoMiga({ ...formPagoMiga, descripcion: e.target.value })}
                  sx={{ width: 220 }}
                />
                <Button
                  variant="contained" color="success" size="small"
                  startIcon={savingPagoMiga ? <CircularProgress size={16} color="inherit" /> : <AddIcon />}
                  onClick={() => handleRegistrarPago('MIGA')} disabled={savingPagoMiga}
                >
                  Registrar pago
                </Button>
              </Box>

              {pagosMiga.length === 0 ? (
                <Typography color="text.secondary" variant="body2">Sin pagos de miga registrados.</Typography>
              ) : (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ bgcolor: 'grey.50' }}>
                        <TableCell sx={{ fontWeight: 700 }}>Fecha</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700 }}>Monto</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Descripción</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {pagosMiga.map((p) => (
                        <TableRow key={p.id} hover>
                          <TableCell>{formatDate(p.fecha)}</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600, color: 'success.main' }}>{formatPeso(p.monto)}</TableCell>
                          <TableCell>{p.descripcion || <em style={{ color: '#aaa' }}>—</em>}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Paper>

            {/* Ventas miga */}
            <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>
              Ventas de Miga ({perfil.ventasMiga.length})
            </Typography>
            {perfil.ventasMiga.length === 0 ? (
              <Typography color="text.secondary">Sin ventas en el período.</Typography>
            ) : (
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'grey.50' }}>
                      <TableCell sx={{ fontWeight: 700 }}>Fecha</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>Cant.</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>P. Unit.</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>Total</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Estado</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {perfil.ventasMiga.map((v) => (
                      <TableRow key={v.id} hover>
                        <TableCell>{formatDate(v.fecha)}</TableCell>
                        <TableCell align="right">{formatCant(v.cantidad)}</TableCell>
                        <TableCell align="right">{formatPeso(v.precioUnitario)}</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>{formatPeso(v.total)}</TableCell>
                        <TableCell><EstadoPagoChip estadoPago={v.estadoPago} /></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        )}

        {/* ── TAB PAN RALLADO ── */}
        {tab === 2 && (
          <Box sx={{ p: 3 }}>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} md={4}>
                <SaldoCard saldo={cliente.saldoRallado} label="Saldo cuenta Rallado" />
              </Grid>
            </Grid>

            {/* Registrar pago rallado */}
            <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <PagosIcon color="success" />
                <Typography variant="h6" fontWeight={600}>Registrar pago</Typography>
                {pagosRallado.length > 0 && (
                  <Chip label={`Total pagado: ${formatPeso(totalPagosRallado)}`} color="success" size="small" sx={{ ml: 1 }} />
                )}
              </Box>
              <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap', mb: 2 }}>
                <TextField
                  label="Fecha" type="date" size="small"
                  value={formPagoRallado.fecha}
                  onChange={(e) => setFormPagoRallado({ ...formPagoRallado, fecha: e.target.value })}
                  InputLabelProps={{ shrink: true }} sx={{ width: 155 }}
                />
                <TextField
                  label="Monto" type="number" size="small"
                  value={formPagoRallado.monto}
                  onChange={(e) => setFormPagoRallado({ ...formPagoRallado, monto: e.target.value })}
                  InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                  inputProps={{ min: 0.01, step: 0.01 }} sx={{ width: 155 }}
                />
                <TextField
                  label="Descripción (opcional)" size="small"
                  value={formPagoRallado.descripcion}
                  onChange={(e) => setFormPagoRallado({ ...formPagoRallado, descripcion: e.target.value })}
                  sx={{ width: 220 }}
                />
                <Button
                  variant="contained" color="success" size="small"
                  startIcon={savingPagoRallado ? <CircularProgress size={16} color="inherit" /> : <AddIcon />}
                  onClick={() => handleRegistrarPago('RALLADO')} disabled={savingPagoRallado}
                >
                  Registrar pago
                </Button>
              </Box>

              {pagosRallado.length === 0 ? (
                <Typography color="text.secondary" variant="body2">Sin pagos de rallado registrados.</Typography>
              ) : (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ bgcolor: 'grey.50' }}>
                        <TableCell sx={{ fontWeight: 700 }}>Fecha</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700 }}>Monto</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Descripción</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {pagosRallado.map((p) => (
                        <TableRow key={p.id} hover>
                          <TableCell>{formatDate(p.fecha)}</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600, color: 'success.main' }}>{formatPeso(p.monto)}</TableCell>
                          <TableCell>{p.descripcion || <em style={{ color: '#aaa' }}>—</em>}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Paper>

            {/* Ventas rallado */}
            <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>
              Ventas de Pan Rallado ({perfil.ventasRallado.length})
            </Typography>
            {perfil.ventasRallado.length === 0 ? (
              <Typography color="text.secondary">Sin ventas en el período.</Typography>
            ) : (
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'grey.50' }}>
                      <TableCell sx={{ fontWeight: 700 }}>Fecha</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>Peso (kg)</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>Precio/kg</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>Total</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Estado</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {perfil.ventasRallado.map((v) => (
                      <TableRow key={v.id} hover>
                        <TableCell>{formatDate(v.fecha)}</TableCell>
                        <TableCell align="right">{formatCant(v.peso)}</TableCell>
                        <TableCell align="right">{formatPeso(v.precioPorKg)}</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>{formatPeso(v.total)}</TableCell>
                        <TableCell><EstadoPagoChip estadoPago={v.estadoPago} /></TableCell>
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
