import React, { useState, useCallback, useEffect } from 'react';
import {
  Box, Button, Typography, Container, TextField,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Tabs, Tab, CircularProgress,
} from '@mui/material';
import { Add as AddIcon, Analytics as AnalyticsIcon } from '@mui/icons-material';
import { produccionService } from '../services/produccionService';
import { mercaderiaService } from '../services/mercaderiaService';
import ProduccionForm from '../components/ProduccionForm';
import ProduccionList from '../components/ProduccionList';
import { useSnackbar } from 'notistack';

const hoy = () => new Date().toISOString().split('T')[0];

const formatQty = (n) =>
  n != null ? Number(n).toLocaleString('es-AR', { maximumFractionDigits: 3 }) : '—';

export default function ProduccionPage() {
  const { enqueueSnackbar } = useSnackbar();
  const [producciones, setProducciones] = useState([]);
  const [mercaderias, setMercaderias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [tab, setTab] = useState(0);

  // Consumo diario
  const [fechaConsumo, setFechaConsumo] = useState(hoy());
  const [consumoDiario, setConsumoDiario] = useState([]);
  const [loadingConsumo, setLoadingConsumo] = useState(false);

  const fetchProducciones = useCallback(() => {
    setLoading(true);
    produccionService
      .listar()
      .then(setProducciones)
      .catch(() => enqueueSnackbar('Error al cargar producciones', { variant: 'error' }))
      .finally(() => setLoading(false));
  }, [enqueueSnackbar]);

  const fetchConsumoDiario = useCallback(() => {
    if (!fechaConsumo) return;
    setLoadingConsumo(true);
    produccionService
      .consumoDiario(fechaConsumo)
      .then(setConsumoDiario)
      .catch(() => enqueueSnackbar('Error al cargar consumo diario', { variant: 'error' }))
      .finally(() => setLoadingConsumo(false));
  }, [fechaConsumo, enqueueSnackbar]);

  useEffect(() => {
    fetchProducciones();
    mercaderiaService.listar().then(setMercaderias).catch(() => {});
  }, [fetchProducciones]);

  useEffect(() => {
    if (tab === 1) fetchConsumoDiario();
  }, [tab, fetchConsumoDiario]);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Encabezado */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight={700} color="primary">
            Producción
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Registro diario de amasijos y consumo de insumos
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setFormOpen(true)}
          size="large"
        >
          Nueva producción
        </Button>
      </Box>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab label="Historial de producciones" />
          <Tab label="Consumo diario" icon={<AnalyticsIcon fontSize="small" />} iconPosition="start" />
        </Tabs>

        {/* Tab 0: Historial */}
        {tab === 0 && (
          <Box sx={{ p: 2 }}>
            <ProduccionList producciones={producciones} loading={loading} />
          </Box>
        )}

        {/* Tab 1: Consumo diario */}
        {tab === 1 && (
          <Box sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <TextField
                label="Fecha"
                type="date"
                value={fechaConsumo}
                onChange={(e) => setFechaConsumo(e.target.value)}
                InputLabelProps={{ shrink: true }}
                size="small"
                sx={{ width: 200 }}
              />
              <Button variant="outlined" onClick={fetchConsumoDiario} disabled={loadingConsumo}>
                {loadingConsumo ? <CircularProgress size={20} /> : 'Consultar'}
              </Button>
            </Box>

            {consumoDiario.length === 0 ? (
              <Typography color="text.secondary" sx={{ py: 2 }}>
                No hay consumo registrado para esa fecha.
              </Typography>
            ) : (
              <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'grey.50' }}>
                      <TableCell sx={{ fontWeight: 700 }}>Mercadería</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>Total consumido</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {consumoDiario.map((row) => (
                      <TableRow key={row.mercaderiaId} hover>
                        <TableCell>{row.mercaderiaNombre}</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>
                          {formatQty(row.totalConsumido)}
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

      <ProduccionForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSuccess={fetchProducciones}
        mercaderias={mercaderias}
      />
    </Container>
  );
}
