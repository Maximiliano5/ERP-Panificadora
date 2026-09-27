import React, { useEffect, useState, useMemo } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Paper,
  CircularProgress, TextField, ButtonGroup, Button,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  Grain as RalladoIcon,
  AttachMoney as FacturadoIcon,
  ReportProblem as DeudaIcon,
  EmojiEvents as RankingIcon,
  BakeryDining as MigaIcon,
} from '@mui/icons-material';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import { mercaderiaService } from '../services/mercaderiaService';
import { stockRalladoService } from '../services/stockRalladoService';
import { ventaRalladoService } from '../services/ventaRalladoService';
import { ventaMigaService } from '../services/ventaMigaService';
import { clienteService } from '../services/clienteService';
import ValorStockCard from '../components/ValorStockCard';

const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
const ANIO_GRAFICO = new Date().getFullYear();

const toISO = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const startOfWeek = (d) => {
  const date = new Date(d);
  const day = date.getDay();
  date.setDate(date.getDate() + (day === 0 ? -6 : 1) - day);
  return date;
};

const startOfMonth = (d) => new Date(d.getFullYear(), d.getMonth(), 1);
const startOfYear = (d) => new Date(d.getFullYear(), 0, 1);

const formatKg = (n) =>
  n != null ? `${Number(n).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} kg` : '-';

const formatUnidades = (n) =>
  n != null ? `${Number(n).toLocaleString('es-AR', { maximumFractionDigits: 2 })} u.` : '-';

const formatPeso = (n) =>
  n != null
    ? `$${Number(n).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : '-';

function StatCard({ icon, label, value, color, onClick }) {
  return (
    <Card sx={{ height: '100%', cursor: onClick ? 'pointer' : 'default' }} onClick={onClick}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Box
            sx={{
              bgcolor: `${color}.light`,
              color: `${color}.dark`,
              borderRadius: 2,
              p: 1,
              mr: 1.5,
              display: 'flex',
            }}
          >
            {icon}
          </Box>
          <Typography variant="body2" color="text.secondary" fontWeight={500}>
            {label}
          </Typography>
        </Box>
        <Typography variant="h5" fontWeight={700}>
          {value ?? <CircularProgress size={24} />}
        </Typography>
      </CardContent>
    </Card>
  );
}

export default function Dashboard({ linea = 'rallado' }) {
  const theme = useTheme();
  const navigate = useNavigate();
  const esMiga = linea === 'miga';

  const [valorData, setValorData] = useState(null);
  const [stockRallado, setStockRallado] = useState(null);
  const [ventas, setVentas] = useState([]);
  const [deudores, setDeudores] = useState([]);
  const [loading, setLoading] = useState(true);

  const today = useMemo(() => new Date(), []);
  const [preset, setPreset] = useState('mes');
  const [desde, setDesde] = useState(toISO(startOfMonth(today)));
  const [hasta, setHasta] = useState(toISO(today));

  useEffect(() => {
    Promise.all([
      mercaderiaService.valorTotal(),
      esMiga ? Promise.resolve(null) : stockRalladoService.obtenerActual(),
      esMiga ? ventaMigaService.listar() : ventaRalladoService.listar(),
      clienteService.listarDeudores(),
    ]).then(([valor, stockRal, vts, deud]) => {
      setValorData(valor);
      setStockRallado(stockRal?.stockActualKg ?? null);
      setVentas(vts);
      setDeudores(deud);
    }).finally(() => setLoading(false));
  }, [esMiga]);

  const aplicarPreset = (p) => {
    setPreset(p);
    if (p === 'semana') setDesde(toISO(startOfWeek(today)));
    else if (p === 'mes') setDesde(toISO(startOfMonth(today)));
    else if (p === 'anio') setDesde(toISO(startOfYear(today)));
    setHasta(toISO(today));
  };

  // Miga se mide en unidades (cantidad); rallado en kg (peso)
  const cantidadDe = (v) => Number(esMiga ? v.cantidad : v.peso);
  const formatCantidad = esMiga ? formatUnidades : formatKg;

  const ventasPeriodo = useMemo(
    () => ventas.filter((v) => v.fecha >= desde && v.fecha <= hasta),
    [ventas, desde, hasta]
  );

  const cantidadVendidaPeriodo = ventasPeriodo.reduce((s, v) => s + cantidadDe(v), 0);
  const facturadoPeriodo = ventasPeriodo.reduce((s, v) => s + Number(v.total), 0);

  const ventasPorMesAnio = useMemo(() => {
    const totales = Array(12).fill(0);
    ventas.forEach((v) => {
      const [y, m] = v.fecha.split('-');
      if (Number(y) === ANIO_GRAFICO) totales[Number(m) - 1] += Number(esMiga ? v.cantidad : v.peso);
    });
    return MESES.map((mes, i) => ({ mes, cantidad: Number(totales[i].toFixed(2)) }));
  }, [ventas, esMiga]);

  const rankingClientesAnio = useMemo(() => {
    if (esMiga) return [];
    const porCliente = new Map();
    ventas.forEach((v) => {
      if (Number(v.fecha.split('-')[0]) !== ANIO_GRAFICO) return;
      const actual = porCliente.get(v.clienteId) ?? { clienteId: v.clienteId, nombre: v.clienteNombre, kg: 0, facturado: 0 };
      actual.kg += Number(v.peso);
      actual.facturado += Number(v.total);
      porCliente.set(v.clienteId, actual);
    });
    return [...porCliente.values()].sort((a, b) => b.kg - a.kg);
  }, [ventas, esMiga]);

  const totalKgAnio = rankingClientesAnio.reduce((s, c) => s + c.kg, 0);

  const deudoresConMonto = useMemo(() => {
    return deudores
      .map((c) => {
        const saldo = Number(esMiga ? c.saldoMiga : c.saldoRallado);
        return { ...c, deuda: saldo < 0 ? -saldo : 0 };
      })
      .filter((c) => c.deuda > 0)
      .sort((a, b) => b.deuda - a.deuda);
  }, [deudores, esMiga]);

  const totalDeuda = deudoresConMonto.reduce((s, c) => s + c.deuda, 0);
  const producto = esMiga ? 'pan de miga' : 'pan rallado';

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Typography variant="h4" gutterBottom>
        Dashboard — {esMiga ? 'Pan de Miga' : 'Pan Rallado'}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Resumen general de {producto}
      </Typography>

      <Paper sx={{ p: 2, mb: 3, display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
        <Typography variant="body2" fontWeight={600} color="text.secondary">
          Período:
        </Typography>
        <ButtonGroup size="small" variant="outlined">
          <Button variant={preset === 'semana' ? 'contained' : 'outlined'} onClick={() => aplicarPreset('semana')}>
            Esta semana
          </Button>
          <Button variant={preset === 'mes' ? 'contained' : 'outlined'} onClick={() => aplicarPreset('mes')}>
            Este mes
          </Button>
          <Button variant={preset === 'anio' ? 'contained' : 'outlined'} onClick={() => aplicarPreset('anio')}>
            Este año
          </Button>
        </ButtonGroup>
        <TextField
          size="small" type="date" label="Desde"
          value={desde}
          onChange={(e) => { setDesde(e.target.value); setPreset('custom'); }}
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          size="small" type="date" label="Hasta"
          value={hasta}
          onChange={(e) => { setHasta(e.target.value); setPreset('custom'); }}
          InputLabelProps={{ shrink: true }}
        />
      </Paper>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <ValorStockCard valorTotal={valorData?.valorTotal} loading={loading} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          {esMiga ? (
            <StatCard
              icon={<DeudaIcon />}
              label="Deuda de clientes (miga)"
              value={loading ? null : formatPeso(totalDeuda)}
              color="error"
              onClick={() => navigate('/miga/clientes')}
            />
          ) : (
            <StatCard
              icon={<RalladoIcon />}
              label="Stock actual de pan rallado"
              value={loading ? null : formatKg(stockRallado)}
              color="warning"
              onClick={() => navigate('/rallado/stock')}
            />
          )}
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={esMiga ? <MigaIcon /> : <RalladoIcon />}
            label={`${esMiga ? 'Pan de miga' : 'Pan rallado'} vendido (período)`}
            value={loading ? null : formatCantidad(cantidadVendidaPeriodo)}
            color="secondary"
            onClick={() => navigate(`/${linea}/ventas`)}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<FacturadoIcon />}
            label="Facturado (período)"
            value={loading ? null : formatPeso(facturadoPeriodo)}
            color="primary"
            onClick={() => navigate(`/${linea}/ventas`)}
          />
        </Grid>
      </Grid>

      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Ventas de {producto} — {ANIO_GRAFICO}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {esMiga ? 'Unidades vendidas por mes' : 'Kilogramos vendidos por mes'}
          </Typography>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box>
          ) : (
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={ventasPorMesAnio} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e0e0" />
                <XAxis dataKey="mes" tick={{ fontSize: 12 }} tickLine={false} axisLine={{ stroke: '#ccc' }} />
                <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} width={48} />
                <Tooltip
                  formatter={(value) => [formatCantidad(value), 'Vendido']}
                  labelFormatter={(label) => `${label} ${ANIO_GRAFICO}`}
                  contentStyle={{ borderRadius: 8, fontSize: 13 }}
                />
                <Bar dataKey="cantidad" fill={theme.palette.primary.main} radius={[4, 4, 0, 0]} maxBarSize={44} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {!esMiga && (
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6" fontWeight={600}>
                <RankingIcon sx={{ verticalAlign: 'middle', mr: 1, color: 'warning.main' }} />
                Ranking de clientes — {ANIO_GRAFICO}
              </Typography>
              <Typography variant="body2" fontWeight={700} color="text.secondary">
                Total: {formatKg(totalKgAnio)}
              </Typography>
            </Box>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>
            ) : rankingClientesAnio.length === 0 ? (
              <Typography color="text.secondary">No hay ventas de pan rallado en {ANIO_GRAFICO}.</Typography>
            ) : (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'grey.50' }}>
                      <TableCell sx={{ fontWeight: 700, width: 48 }}>#</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Cliente</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>Kg comprados</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>% del total</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>Facturado</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rankingClientesAnio.map((c, i) => (
                      <TableRow key={c.clienteId} hover sx={{ cursor: 'pointer' }} onClick={() => navigate(`/${linea}/clientes/${c.clienteId}`)}>
                        <TableCell sx={{ fontWeight: 700 }}>{i + 1}</TableCell>
                        <TableCell>{c.nombre}</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700 }}>{formatKg(c.kg)}</TableCell>
                        <TableCell align="right">
                          {totalKgAnio > 0 ? `${((c.kg / totalKgAnio) * 100).toLocaleString('es-AR', { maximumFractionDigits: 1 })}%` : '-'}
                        </TableCell>
                        <TableCell align="right">{formatPeso(c.facturado)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6" fontWeight={600}>
              <DeudaIcon sx={{ verticalAlign: 'middle', mr: 1, color: 'error.main' }} />
              Clientes deudores ({esMiga ? 'miga' : 'rallado'})
            </Typography>
            <Typography variant="body2" fontWeight={700} color="error.main">
              Total: {formatPeso(totalDeuda)}
            </Typography>
          </Box>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>
          ) : deudoresConMonto.length === 0 ? (
            <Typography color="text.secondary">No hay clientes con deuda pendiente.</Typography>
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: 'grey.50' }}>
                    <TableCell sx={{ fontWeight: 700 }}>Cliente</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>Debe</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {deudoresConMonto.map((c) => (
                    <TableRow key={c.id} hover sx={{ cursor: 'pointer' }} onClick={() => navigate(`/${linea}/clientes/${c.id}`)}>
                      <TableCell>{c.nombre} {c.apellido}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, color: 'error.main' }}>{formatPeso(c.deuda)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
