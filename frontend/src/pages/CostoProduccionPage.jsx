import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Button, Typography, Container, TextField,
  Paper, Tabs, Tab, Grid, IconButton, Divider,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, Accordion, AccordionSummary, AccordionDetails,
  CircularProgress, FormControl, InputLabel, Select, MenuItem,
  InputAdornment,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Calculate as CalculateIcon,
  ExpandMore as ExpandMoreIcon,
  History as HistoryIcon,
} from '@mui/icons-material';
import { costoProduccionService } from '../services/costoProduccionService';
import { mercaderiaService } from '../services/mercaderiaService';
import { useSnackbar } from 'notistack';

const formatPeso = (n) =>
  n != null
    ? `$${Number(n).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : '-';

const FIXED_FIELDS = [
  { key: 'costoAmasado', label: 'Amasado' },
  { key: 'costoCoccion', label: 'Cocción' },
  { key: 'costoCorte', label: 'Corte' },
  { key: 'costoDistribucion', label: 'Distribución' },
  { key: 'costoElectricidad', label: 'Electricidad' },
  { key: 'costoAgua', label: 'Agua' },
  { key: 'costoGas', label: 'Gas' },
];

const EMPTY_COSTOS_FIJOS = Object.fromEntries(FIXED_FIELDS.map((f) => [f.key, '']));

export default function CostoProduccionPage() {
  const { enqueueSnackbar } = useSnackbar();
  const [tab, setTab] = useState(0);
  const [mercaderias, setMercaderias] = useState([]);
  const [historial, setHistorial] = useState([]);
  const [loadingHistorial, setLoadingHistorial] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [resultado, setResultado] = useState(null);

  const [nombre, setNombre] = useState('');
  const [cantidadUnidades, setCantidadUnidades] = useState('');
  const [costoBolsa, setCostoBolsa] = useState('');
  const [insumos, setInsumos] = useState([{ mercaderiaId: '', cantidad: 1, porcentajeUso: '' }]);
  const [costosFijos, setCostosFijos] = useState(EMPTY_COSTOS_FIJOS);
  const [costosAdicionales, setCostosAdicionales] = useState([]);

  useEffect(() => {
    mercaderiaService.listar().then(setMercaderias).catch(() => {});
  }, []);

  const fetchHistorial = useCallback(() => {
    setLoadingHistorial(true);
    costoProduccionService
      .listar()
      .then(setHistorial)
      .catch(() => enqueueSnackbar('Error al cargar historial', { variant: 'error' }))
      .finally(() => setLoadingHistorial(false));
  }, [enqueueSnackbar]);

  useEffect(() => {
    if (tab === 1) fetchHistorial();
  }, [tab, fetchHistorial]);

  const addInsumo = () => setInsumos([...insumos, { mercaderiaId: '', cantidad: 1, porcentajeUso: '' }]);
  const removeInsumo = (i) => setInsumos(insumos.filter((_, idx) => idx !== i));
  const updateInsumo = (i, field, value) => {
    const updated = [...insumos];
    updated[i] = { ...updated[i], [field]: value };
    setInsumos(updated);
  };

  const addAdicional = () => setCostosAdicionales([...costosAdicionales, { nombre: '', monto: '' }]);
  const removeAdicional = (i) => setCostosAdicionales(costosAdicionales.filter((_, idx) => idx !== i));
  const updateAdicional = (i, field, value) => {
    const updated = [...costosAdicionales];
    updated[i] = { ...updated[i], [field]: value };
    setCostosAdicionales(updated);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const payload = {
        nombre,
        cantidadUnidadesProducidas: parseInt(cantidadUnidades, 10),
        costoBolsasUnitario: parseFloat(costoBolsa) || 0,
        insumos: insumos.map((ins) => ({
          mercaderiaId: parseInt(ins.mercaderiaId, 10),
          cantidad: parseInt(ins.cantidad, 10) || 1,
          porcentajeUso: parseFloat(ins.porcentajeUso),
        })),
        costosFijos: {
          ...Object.fromEntries(FIXED_FIELDS.map((f) => [f.key, parseFloat(costosFijos[f.key]) || 0])),
          costosAdicionales: costosAdicionales.map((a) => ({
            nombre: a.nombre,
            monto: parseFloat(a.monto) || 0,
          })),
        },
      };
      const result = await costoProduccionService.crear(payload);
      setResultado(result);
      enqueueSnackbar('Costo calculado y guardado correctamente', { variant: 'success' });
    } catch (e) {
      enqueueSnackbar(e.message || 'Error al calcular el costo', { variant: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={700} color="primary">
          Costo de Producción
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Calcula el costo teórico de un amasijo de pan de miga sin afectar el stock
        </Typography>
      </Box>

      <Paper>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab
            label="Nuevo Cálculo"
            icon={<CalculateIcon fontSize="small" />}
            iconPosition="start"
          />
          <Tab
            label="Historial"
            icon={<HistoryIcon fontSize="small" />}
            iconPosition="start"
          />
        </Tabs>

        {tab === 0 && (
          <Box sx={{ p: 3 }}>
            <Grid container spacing={3}>

              {/* Datos generales */}
              <Grid item xs={12}>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Datos Generales
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="Nombre del amasijo"
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="Unidades producidas"
                      type="number"
                      value={cantidadUnidades}
                      onChange={(e) => setCantidadUnidades(e.target.value)}
                      size="small"
                      inputProps={{ min: 1 }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="Costo por bolsa"
                      type="number"
                      value={costoBolsa}
                      onChange={(e) => setCostoBolsa(e.target.value)}
                      size="small"
                      InputProps={{
                        startAdornment: <InputAdornment position="start">$</InputAdornment>,
                      }}
                      helperText="El sistema calcula 2 bolsas por unidad"
                    />
                  </Grid>
                </Grid>
              </Grid>

              {/* Insumos */}
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                  <Typography variant="h6" fontWeight={600}>
                    Insumos (Materia Prima)
                  </Typography>
                  <Button size="small" startIcon={<AddIcon />} onClick={addInsumo} variant="outlined">
                    Agregar insumo
                  </Button>
                </Box>
                {insumos.map((insumo, i) => (
                  <Box key={i} sx={{ display: 'flex', gap: 1.5, mb: 1.5, alignItems: 'center', flexWrap: 'wrap' }}>
                    <FormControl size="small" sx={{ minWidth: 260 }}>
                      <InputLabel>Mercadería</InputLabel>
                      <Select
                        value={insumo.mercaderiaId}
                        label="Mercadería"
                        onChange={(e) => updateInsumo(i, 'mercaderiaId', e.target.value)}
                      >
                        {mercaderias.map((m) => (
                          <MenuItem key={m.id} value={m.id}>
                            {m.nombre} — {formatPeso(m.precioUnitario)}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <TextField
                      size="small"
                      label="Cant. (uds)"
                      type="number"
                      value={insumo.cantidad}
                      onChange={(e) => updateInsumo(i, 'cantidad', e.target.value)}
                      sx={{ width: 110 }}
                      inputProps={{ min: 1, step: 1 }}
                    />
                    <TextField
                      size="small"
                      label="% de uso"
                      type="number"
                      value={insumo.porcentajeUso}
                      onChange={(e) => updateInsumo(i, 'porcentajeUso', e.target.value)}
                      sx={{ width: 140 }}
                      InputProps={{
                        endAdornment: <InputAdornment position="end">%</InputAdornment>,
                      }}
                      inputProps={{ min: 0.01, max: 100, step: 0.01 }}
                    />
                    {insumos.length > 1 && (
                      <IconButton size="small" color="error" onClick={() => removeInsumo(i)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    )}
                  </Box>
                ))}
              </Grid>

              {/* Costos fijos */}
              <Grid item xs={12}>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Costos Fijos
                </Typography>
                <Grid container spacing={2}>
                  {FIXED_FIELDS.map((f) => (
                    <Grid item xs={12} sm={6} md={3} key={f.key}>
                      <TextField
                        fullWidth
                        label={f.label}
                        type="number"
                        value={costosFijos[f.key]}
                        onChange={(e) => setCostosFijos({ ...costosFijos, [f.key]: e.target.value })}
                        size="small"
                        InputProps={{
                          startAdornment: <InputAdornment position="start">$</InputAdornment>,
                        }}
                        inputProps={{ min: 0, step: 0.01 }}
                      />
                    </Grid>
                  ))}
                </Grid>

                {/* Costos adicionales */}
                <Box sx={{ mt: 2.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Costos adicionales (opcional)
                    </Typography>
                    <Button size="small" startIcon={<AddIcon />} onClick={addAdicional}>
                      Agregar
                    </Button>
                  </Box>
                  {costosAdicionales.map((a, i) => (
                    <Box key={i} sx={{ display: 'flex', gap: 1.5, mb: 1, alignItems: 'center' }}>
                      <TextField
                        size="small"
                        label="Concepto"
                        value={a.nombre}
                        onChange={(e) => updateAdicional(i, 'nombre', e.target.value)}
                        sx={{ width: 220 }}
                      />
                      <TextField
                        size="small"
                        label="Monto"
                        type="number"
                        value={a.monto}
                        onChange={(e) => updateAdicional(i, 'monto', e.target.value)}
                        sx={{ width: 150 }}
                        InputProps={{
                          startAdornment: <InputAdornment position="start">$</InputAdornment>,
                        }}
                      />
                      <IconButton size="small" color="error" onClick={() => removeAdicional(i)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  ))}
                </Box>
              </Grid>

              {/* Botón calcular */}
              <Grid item xs={12}>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={
                    submitting ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : (
                      <CalculateIcon />
                    )
                  }
                  onClick={handleSubmit}
                  disabled={submitting}
                >
                  Calcular Costo
                </Button>
              </Grid>

              {/* Resultado */}
              {resultado && (
                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    Resultado — {resultado.nombre}
                  </Typography>

                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid item xs={12} sm={6} md={3}>
                      <Paper
                        variant="outlined"
                        sx={{ p: 2, textAlign: 'center', borderColor: 'primary.main', bgcolor: 'primary.50' }}
                      >
                        <Typography variant="caption" color="text.secondary">
                          Costo Total
                        </Typography>
                        <Typography variant="h5" fontWeight={700} color="primary">
                          {formatPeso(resultado.costoTotal)}
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="caption" color="text.secondary">
                          Costo Unitario
                        </Typography>
                        <Typography variant="h5" fontWeight={700} color="secondary">
                          {formatPeso(resultado.costoUnitario)}
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="caption" color="text.secondary">
                          Total Insumos
                        </Typography>
                        <Typography variant="h6" fontWeight={600}>
                          {formatPeso(resultado.totalInsumos)}
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="caption" color="text.secondary">
                          Bolsas ({resultado.cantidadUnidadesProducidas * 2} bolsas)
                        </Typography>
                        <Typography variant="h6" fontWeight={600}>
                          {formatPeso(resultado.costoTotalBolsas)}
                        </Typography>
                      </Paper>
                    </Grid>
                  </Grid>

                  {/* Desglose insumos */}
                  <Accordion defaultExpanded>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography fontWeight={600}>
                        Desglose de Insumos — {formatPeso(resultado.totalInsumos)}
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails sx={{ p: 0 }}>
                      <TableContainer>
                        <Table size="small">
                          <TableHead>
                            <TableRow sx={{ bgcolor: 'grey.50' }}>
                              <TableCell sx={{ fontWeight: 700 }}>Mercadería</TableCell>
                              <TableCell align="right" sx={{ fontWeight: 700 }}>Cant.</TableCell>
                              <TableCell align="right" sx={{ fontWeight: 700 }}>Precio unitario</TableCell>
                              <TableCell align="right" sx={{ fontWeight: 700 }}>% Uso</TableCell>
                              <TableCell align="right" sx={{ fontWeight: 700 }}>Costo calculado</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {resultado.insumos.map((ins) => (
                              <TableRow key={ins.id} hover>
                                <TableCell>{ins.mercaderiaNombre}</TableCell>
                                <TableCell align="right">{ins.cantidad}</TableCell>
                                <TableCell align="right">
                                  {formatPeso(ins.precioUnitarioMercaderia)}
                                </TableCell>
                                <TableCell align="right">{ins.porcentajeUso}%</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 600 }}>
                                  {formatPeso(ins.costoCalculado)}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </AccordionDetails>
                  </Accordion>

                  {/* Desglose costos fijos */}
                  <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography fontWeight={600}>
                        Desglose de Costos Fijos — {formatPeso(resultado.totalCostosFijos)}
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Grid container spacing={2}>
                        {FIXED_FIELDS.map((f) => (
                          <Grid item xs={6} sm={4} md={3} key={f.key}>
                            <Typography variant="caption" color="text.secondary">
                              {f.label}
                            </Typography>
                            <Typography fontWeight={500}>
                              {formatPeso(resultado.costosFijos[f.key])}
                            </Typography>
                          </Grid>
                        ))}
                        {resultado.costosFijos.costosAdicionales.length > 0 && (
                          <>
                            <Grid item xs={12}>
                              <Divider />
                            </Grid>
                            {resultado.costosFijos.costosAdicionales.map((a, i) => (
                              <Grid item xs={6} sm={4} md={3} key={i}>
                                <Typography variant="caption" color="text.secondary">
                                  {a.nombre}
                                </Typography>
                                <Typography fontWeight={500}>{formatPeso(a.monto)}</Typography>
                              </Grid>
                            ))}
                          </>
                        )}
                      </Grid>
                    </AccordionDetails>
                  </Accordion>

                  {/* Costo bolsas */}
                  <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography fontWeight={600}>
                        Costo de Bolsas — {formatPeso(resultado.costoTotalBolsas)}
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Grid container spacing={2}>
                        <Grid item xs={6} sm={4}>
                          <Typography variant="caption" color="text.secondary">
                            Costo por bolsa
                          </Typography>
                          <Typography fontWeight={500}>
                            {formatPeso(resultado.costoBolsasUnitario)}
                          </Typography>
                        </Grid>
                        <Grid item xs={6} sm={4}>
                          <Typography variant="caption" color="text.secondary">
                            Bolsas totales ({resultado.cantidadUnidadesProducidas} unidades × 2)
                          </Typography>
                          <Typography fontWeight={500}>
                            {resultado.cantidadUnidadesProducidas * 2} bolsas
                          </Typography>
                        </Grid>
                        <Grid item xs={6} sm={4}>
                          <Typography variant="caption" color="text.secondary">
                            Total bolsas
                          </Typography>
                          <Typography fontWeight={600}>{formatPeso(resultado.costoTotalBolsas)}</Typography>
                        </Grid>
                      </Grid>
                    </AccordionDetails>
                  </Accordion>
                </Grid>
              )}
            </Grid>
          </Box>
        )}

        {tab === 1 && (
          <Box sx={{ p: 2 }}>
            {loadingHistorial ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : historial.length === 0 ? (
              <Typography color="text.secondary" sx={{ py: 2 }}>
                No hay cálculos registrados.
              </Typography>
            ) : (
              historial.map((item) => (
                <Accordion key={item.id} sx={{ mb: 1 }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        width: '100%',
                        pr: 2,
                        flexWrap: 'wrap',
                      }}
                    >
                      <Box sx={{ flex: 1 }}>
                        <Typography fontWeight={600}>{item.nombre}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {item.fecha} — {item.cantidadUnidadesProducidas} unidades
                        </Typography>
                      </Box>
                      <Chip
                        label={`Total: ${formatPeso(item.costoTotal)}`}
                        color="primary"
                        size="small"
                      />
                      <Chip
                        label={`Unitario: ${formatPeso(item.costoUnitario)}`}
                        variant="outlined"
                        size="small"
                      />
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Grid container spacing={2} sx={{ mb: 2 }}>
                      <Grid item xs={12} sm={4}>
                        <Typography variant="caption" color="text.secondary">
                          Insumos
                        </Typography>
                        <Typography fontWeight={600}>{formatPeso(item.totalInsumos)}</Typography>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Typography variant="caption" color="text.secondary">
                          Costos Fijos
                        </Typography>
                        <Typography fontWeight={600}>{formatPeso(item.totalCostosFijos)}</Typography>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Typography variant="caption" color="text.secondary">
                          Bolsas ({item.cantidadUnidadesProducidas * 2})
                        </Typography>
                        <Typography fontWeight={600}>{formatPeso(item.costoTotalBolsas)}</Typography>
                      </Grid>
                    </Grid>
                    <Divider sx={{ mb: 1.5 }} />
                    <Typography variant="subtitle2" gutterBottom>
                      Insumos utilizados
                    </Typography>
                    <TableContainer component={Paper} variant="outlined">
                      <Table size="small">
                        <TableHead>
                          <TableRow sx={{ bgcolor: 'grey.50' }}>
                            <TableCell sx={{ fontWeight: 700 }}>Mercadería</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 700 }}>Cant.</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 700 }}>% Uso</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 700 }}>Costo</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {item.insumos.map((ins) => (
                            <TableRow key={ins.id} hover>
                              <TableCell>{ins.mercaderiaNombre}</TableCell>
                              <TableCell align="right">{ins.cantidad}</TableCell>
                              <TableCell align="right">{ins.porcentajeUso}%</TableCell>
                              <TableCell align="right">{formatPeso(ins.costoCalculado)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </AccordionDetails>
                </Accordion>
              ))
            )}
          </Box>
        )}
      </Paper>
    </Container>
  );
}
