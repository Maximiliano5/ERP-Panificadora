import React from 'react';
import {
  Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, IconButton, Chip, Typography,
  Skeleton, Tooltip, Box,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';

const formatCurrency = (value) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(value ?? 0);

const formatQty = (value) =>
  new Intl.NumberFormat('es-AR', { maximumFractionDigits: 3 }).format(value ?? 0);

function StockChip({ cantidad }) {
  if (cantidad <= 0) return <Chip label="Sin stock" color="error" size="small" />;
  if (cantidad <= 10) return <Chip label={`${formatQty(cantidad)} ⚠`} color="warning" size="small" />;
  return <Chip label={formatQty(cantidad)} color="success" size="small" />;
}

export default function MercaderiaTable({ mercaderias, loading, onEdit, onDelete }) {
  if (loading) {
    return (
      <Paper>
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} variant="rectangular" height={52} sx={{ mb: 0.5 }} />
        ))}
      </Paper>
    );
  }

  if (!mercaderias.length) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Typography color="text.secondary">No se encontraron mercaderías</Typography>
      </Paper>
    );
  }

  return (
    <TableContainer component={Paper}>
      <Table size="small">
        <TableHead>
          <TableRow sx={{ '& th': { fontWeight: 700, bgcolor: 'grey.50' } }}>
            <TableCell>#</TableCell>
            <TableCell>Nombre</TableCell>
            <TableCell align="right">Precio unitario</TableCell>
            <TableCell align="center">Stock actual</TableCell>
            <TableCell align="right">Valor en stock</TableCell>
            <TableCell align="center">Acciones</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {mercaderias.map((m) => (
            <TableRow key={m.id} hover>
              <TableCell sx={{ color: 'text.secondary', fontSize: '0.8rem' }}>{m.id}</TableCell>
              <TableCell sx={{ fontWeight: 500 }}>{m.nombre}</TableCell>
              <TableCell align="right">{formatCurrency(m.precioUnitario)}</TableCell>
              <TableCell align="center">
                <StockChip cantidad={m.cantidadActual} />
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>
                {formatCurrency(m.valorTotal)}
              </TableCell>
              <TableCell align="center">
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
                  <Tooltip title="Editar">
                    <IconButton size="small" color="primary" onClick={() => onEdit(m)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Eliminar">
                    <IconButton size="small" color="error" onClick={() => onDelete(m)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
