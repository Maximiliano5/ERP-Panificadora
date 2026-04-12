import React from 'react';
import {
  Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Chip, Typography, Skeleton,
} from '@mui/material';
import {
  ArrowUpward as IngresoIcon,
  ArrowDownward as EgresoIcon,
} from '@mui/icons-material';

const formatCurrency = (v) =>
  new Intl.NumberFormat('es-AR', { maximumFractionDigits: 3 }).format(v ?? 0);

const formatDate = (iso) =>
  new Date(iso).toLocaleString('es-AR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

function TipoChip({ tipo }) {
  return tipo === 'INGRESO' ? (
    <Chip icon={<IngresoIcon />} label="INGRESO" color="success" size="small" />
  ) : (
    <Chip icon={<EgresoIcon />} label="EGRESO" color="warning" size="small" />
  );
}

export default function MovimientoList({ movimientos, loading }) {
  if (loading) {
    return (
      <Paper>
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} variant="rectangular" height={52} sx={{ mb: 0.5 }} />
        ))}
      </Paper>
    );
  }

  if (!movimientos.length) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Typography color="text.secondary">No hay movimientos registrados</Typography>
      </Paper>
    );
  }

  return (
    <TableContainer component={Paper}>
      <Table size="small">
        <TableHead>
          <TableRow sx={{ '& th': { fontWeight: 700, bgcolor: 'grey.50' } }}>
            <TableCell>#</TableCell>
            <TableCell>Fecha</TableCell>
            <TableCell>Tipo</TableCell>
            <TableCell>Mercadería</TableCell>
            <TableCell align="right">Cantidad</TableCell>
            <TableCell>Proveedor / Motivo</TableCell>
            <TableCell>Observaciones</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {movimientos.map((m) => (
            <TableRow key={m.id} hover>
              <TableCell sx={{ color: 'text.secondary', fontSize: '0.8rem' }}>{m.id}</TableCell>
              <TableCell sx={{ whiteSpace: 'nowrap', fontSize: '0.82rem' }}>
                {formatDate(m.fecha)}
              </TableCell>
              <TableCell>
                <TipoChip tipo={m.tipo} />
              </TableCell>
              <TableCell sx={{ fontWeight: 500 }}>{m.mercaderiaNombre}</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>
                {formatCurrency(m.cantidad)}
              </TableCell>
              <TableCell sx={{ fontSize: '0.82rem', color: 'text.secondary' }}>
                {m.tipo === 'INGRESO'
                  ? [m.proveedor, m.receptor].filter(Boolean).join(' → ')
                  : m.motivo || '—'}
              </TableCell>
              <TableCell sx={{ fontSize: '0.82rem', color: 'text.secondary', maxWidth: 180 }}>
                <Typography noWrap variant="inherit" title={m.observaciones}>
                  {m.observaciones || '—'}
                </Typography>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
