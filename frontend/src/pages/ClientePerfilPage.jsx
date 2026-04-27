import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Button, Typography, Container, TextField,
  Paper, Grid, Divider, Chip, CircularProgress,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  InputAdornment,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  FilterAlt as FilterIcon,
  LocationOn as DireccionIcon,
  Receipt as MigaIcon,
  Grain as RalladoIcon,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { clienteService } from '../services/clienteService';
import { useSnackbar } from 'notistack';

const formatPeso = (n) =>
  n != null
    ? `$${Number(n).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : '-';

const formatNum = (n, dec = 2) =>
  n != null ? Number(n).toLocaleString('es-AR', { minimumFractionDigits: dec, maximumFractionDigits: dec }) : '-';

const PagoChip = ({ pagado }) =>
  pagado ? (
    <Chip label="Pagado" color="success" size="small" />
  ) : (
    <Chip label="Impago" color="error" size="small" variant="outlined" />
  );

const SaldoText = ({ saldo }) => {
  const val = Number(saldo);
  if (val < 0) return <Typography fontWeight={700} color="error.main" variant="h5">{formatPeso(saldo)}</Typography>;
  if (val > 0) return <Typography fontWeight={700} color="success.main" variant="h5">{formatPeso(saldo)}</Typography>;
  return <Typography fontWeight={700} variant="h5" color="text.secondary">{formatPeso(saldo)}</Typography>;
};

const today = () => new Date().toISOString().split('T')[0];
const firstOfMonth = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
};

export default function ClientePerfilPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(false);
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');

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

  const setRangoHoy = () => {
    const d = today();
    setDesde(d);
    setHasta(d);
    fetchPerfil(d, d);
  };

  const setRangoMes = () => {
    const d = firstOfMonth();
    const h = today();
    setDesde(d);
    setHasta(h);
    fetchPerfil(d, h);
  };

  const limpiarFiltro = () => {
    setDesde('');
    setHasta('');
    fetchPerfil('', '');
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

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Button startIcon={<BackIcon />} onClick={() => navigate('/clientes')} variant="outlined" size="small">
          Volver
        </Button>
        <Box>
          <Typography variant="h4" fontWeight={700} color="primary">
            {cliente.nombre} {cliente.apellido}
          </Typography>
          <Chip
            label={cliente.tipo}
            size="small"
            color={cliente.tipo === 'REVENDEDOR' ? 'warning' : 'info'}
            variant="outlined"
            sx={{ mt: 0.5 }}
          />
        </Box>
      </Box>

      {/* Info del cliente */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Paper variant="outlined" sx={{ p: 2.5, height: '100%' }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Saldo actual
            </Typography>
            <SaldoText saldo={cliente.saldo} />
            {cliente.saldo < 0 && (
              <Typography variant="caption" color="error">Tiene deuda pendiente</Typography>
            )}
            {cliente.saldo > 0 && (
              <Typography variant="caption" color="success.main">Tiene saldo a favor</Typography>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper variant="outlined" sx={{ p: 2.5, height: '100%' }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Precios fijos acordados
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 1 }}>
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

        <Grid item xs={12} md={4}>
          <Paper variant="outlined" sx={{ p: 2.5, height: '100%' }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Dirección del local
            </Typography>
            {cliente.direccion ? (
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start', mt: 0.5 }}>
                <DireccionIcon fontSize="small" color="action" sx={{ mt: 0.2 }} />
                <Typography>{cliente.direccion}</Typography>
              </Box>
            ) : (
              <Typography color="text.secondary" variant="body2" sx={{ mt: 0.5 }}>
                Sin dirección registrada
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Filtro de fechas */}
      <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
        <Typography variant="subtitle2" fontWeight={600} gutterBottom>
          Filtrar por período
        </Typography>
        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap' }}>
          <TextField
            label="Desde"
            type="date"
            size="small"
            value={desde}
            onChange={(e) => setDesde(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ width: 160 }}
          />
          <TextField
            label="Hasta"
            type="date"
            size="small"
            value={hasta}
            onChange={(e) => setHasta(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ width: 160 }}
          />
          <Button variant="contained" size="small" startIcon={<FilterIcon />} onClick={handleFiltrar}>
            Filtrar
          </Button>
          <Button size="small" onClick={setRangoHoy}>Hoy</Button>
          <Button size="small" onClick={setRangoMes}>Este mes</Button>
          <Button size="small" color="inherit" onClick={limpiarFiltro}>Limpiar</Button>
          {loading && <CircularProgress size={20} />}
        </Box>
      </Paper>

      {/* Métricas */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={3}>
          <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
            <MigaIcon color="primary" sx={{ mb: 0.5 }} />
            <Typography variant="caption" color="text.secondary" display="block">
              Panes de miga
            </Typography>
            <Typography variant="h5" fontWeight={700}>{formatNum(perfil.totalPanesMiga)}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
            <RalladoIcon color="primary" sx={{ mb: 0.5 }} />
            <Typography variant="caption" color="text.secondary" display="block">
              Kg de rallado
            </Typography>
            <Typography variant="h5" fontWeight={700}>{formatNum(perfil.totalKgRallado)}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary" display="block">
              Facturado miga
            </Typography>
            <Typography variant="h6" fontWeight={700} color="primary">
              {formatPeso(perfil.totalFacturadoMiga)}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary" display="block">
              Facturado rallado
            </Typography>
            <Typography variant="h6" fontWeight={700} color="primary">
              {formatPeso(perfil.totalFacturadoRallado)}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Historial miga */}
      <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>
        Ventas de Pan de Miga ({perfil.ventasMiga.length})
      </Typography>
      {perfil.ventasMiga.length === 0 ? (
        <Typography color="text.secondary" sx={{ mb: 3 }}>Sin ventas en el período.</Typography>
      ) : (
        <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.50' }}>
                <TableCell sx={{ fontWeight: 700 }}>Fecha</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Tipo</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>Cant.</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Unidad</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>P. Unit.</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>Total</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Estado</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {perfil.ventasMiga.map((v) => (
                <TableRow key={v.id} hover>
                  <TableCell>{v.fecha}</TableCell>
                  <TableCell>
                    <Chip label={v.tipoPan} size="small" color={v.tipoPan === 'BLANCO' ? 'default' : 'warning'} variant="outlined" />
                  </TableCell>
                  <TableCell align="right">{formatNum(v.cantidad)}</TableCell>
                  <TableCell>{v.unidad === 'ENTERO' ? 'Entero' : 'Medio'}</TableCell>
                  <TableCell align="right">{formatPeso(v.precioUnitario)}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>{formatPeso(v.total)}</TableCell>
                  <TableCell><PagoChip pagado={v.pagado} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Divider sx={{ my: 2 }} />

      {/* Historial rallado */}
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
                  <TableCell>{v.fecha}</TableCell>
                  <TableCell align="right">{formatNum(v.peso, 3)}</TableCell>
                  <TableCell align="right">{formatPeso(v.precioPorKg)}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>{formatPeso(v.total)}</TableCell>
                  <TableCell><PagoChip pagado={v.pagado} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
}
