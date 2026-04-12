import React, { useEffect, useState } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Button,
  CircularProgress, Divider,
} from '@mui/material';
import {
  Inventory2 as InventoryIcon,
  SwapVert as MovimientosIcon,
  TrendingUp as TrendingIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { mercaderiaService } from '../services/mercaderiaService';
import { movimientoService } from '../services/movimientoService';
import ValorStockCard from '../components/ValorStockCard';
import MovimientoList from '../components/MovimientoList';

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
        <Typography variant="h4" fontWeight={700}>
          {value ?? <CircularProgress size={24} />}
        </Typography>
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [valorData, setValorData] = useState(null);
  const [movimientos, setMovimientos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      mercaderiaService.valorTotal(),
      movimientoService.listar(),
    ]).then(([valor, movs]) => {
      setValorData(valor);
      setMovimientos(movs);
    }).finally(() => setLoading(false));
  }, []);

  const totalMercaderias = valorData?.mercaderias?.length ?? null;
  const sinStock = valorData?.mercaderias?.filter((m) => m.cantidadActual <= 0).length ?? null;

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Resumen general del stock de la panificadora
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <ValorStockCard valorTotal={valorData?.valorTotal} loading={loading} />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            icon={<InventoryIcon />}
            label="Tipos de mercadería"
            value={loading ? null : totalMercaderias}
            color="primary"
            onClick={() => navigate('/mercaderias')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            icon={<TrendingIcon />}
            label="Movimientos registrados"
            value={loading ? null : movimientos.length}
            color="secondary"
            onClick={() => navigate('/movimientos')}
          />
        </Grid>
      </Grid>

      {sinStock > 0 && (
        <Card sx={{ mb: 3, borderLeft: '4px solid', borderColor: 'error.main' }}>
          <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography color="error.main" fontWeight={600}>
              {sinStock} mercadería{sinStock > 1 ? 's' : ''} sin stock
            </Typography>
            <Button size="small" color="error" onClick={() => navigate('/mercaderias')}>
              Ver detalle
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">
              <MovimientosIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
              Últimos movimientos
            </Typography>
            <Button size="small" onClick={() => navigate('/movimientos')}>
              Ver todos
            </Button>
          </Box>
          <Divider sx={{ mb: 2 }} />
          <MovimientoList movimientos={movimientos.slice(0, 8)} loading={loading} />
        </CardContent>
      </Card>
    </Box>
  );
}
