import React, { useState } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Typography, Box, Collapse, IconButton, Chip,
} from '@mui/material';
import {
  KeyboardArrowDown as ArrowDownIcon,
  KeyboardArrowUp as ArrowUpIcon,
  BakeryDining as PanIcon,
} from '@mui/icons-material';

const formatDate = (dateStr) =>
  new Date(dateStr + 'T00:00:00').toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

const formatQty = (n) =>
  n != null ? Number(n).toLocaleString('es-AR', { maximumFractionDigits: 3 }) : '—';

function FilaProduccion({ produccion }) {
  const [open, setOpen] = useState(false);

  const totalPanes = produccion.amasijos.reduce(
    (acc, a) => acc + (a.cantidadPanProducido ? Number(a.cantidadPanProducido) : 0),
    0
  );

  return (
    <>
      <TableRow hover sx={{ '& > *': { borderBottom: 'unset' } }}>
        <TableCell>
          <IconButton size="small" onClick={() => setOpen(!open)}>
            {open ? <ArrowUpIcon /> : <ArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell sx={{ fontWeight: 600 }}>{formatDate(produccion.fecha)}</TableCell>
        <TableCell align="center">
          <Chip label={produccion.amasijos.length} size="small" color="primary" variant="outlined" />
        </TableCell>
        <TableCell align="center">
          {totalPanes > 0 ? (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
              <PanIcon fontSize="small" color="secondary" />
              <Typography variant="body2" fontWeight={600}>
                {formatQty(totalPanes)}
              </Typography>
            </Box>
          ) : (
            <Typography variant="body2" color="text.secondary">
              —
            </Typography>
          )}
        </TableCell>
        <TableCell>
          <Typography variant="body2" color="text.secondary">
            {produccion.observaciones || '—'}
          </Typography>
        </TableCell>
      </TableRow>

      {/* Detalle expandible */}
      <TableRow>
        <TableCell colSpan={5} sx={{ py: 0 }}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ m: 1, mb: 2 }}>
              {produccion.amasijos.map((amasijo, idx) => (
                <Box key={amasijo.id} sx={{ mb: 2 }}>
                  <Typography
                    variant="subtitle2"
                    fontWeight={700}
                    color="primary"
                    sx={{ mb: 0.5 }}
                  >
                    Amasijo #{idx + 1}
                    {amasijo.cantidadPanProducido != null && (
                      <Typography component="span" variant="caption" sx={{ ml: 1 }} color="text.secondary">
                        — {formatQty(amasijo.cantidadPanProducido)} panes producidos
                      </Typography>
                    )}
                  </Typography>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600 }}>Mercadería</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>Cantidad utilizada</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {amasijo.insumos.map((ins) => (
                        <TableRow key={ins.id}>
                          <TableCell>{ins.mercaderiaNombre}</TableCell>
                          <TableCell align="right">{formatQty(ins.cantidadUtilizada)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Box>
              ))}
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}

export default function ProduccionList({ producciones, loading }) {
  if (loading) {
    return (
      <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
        Cargando producciones...
      </Typography>
    );
  }

  if (!producciones.length) {
    return (
      <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
        No hay producciones registradas todavía.
      </Typography>
    );
  }

  return (
    <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
      <Table>
        <TableHead>
          <TableRow sx={{ bgcolor: 'grey.50' }}>
            <TableCell sx={{ width: 48 }} />
            <TableCell sx={{ fontWeight: 700 }}>Fecha</TableCell>
            <TableCell align="center" sx={{ fontWeight: 700 }}>Amasijos</TableCell>
            <TableCell align="center" sx={{ fontWeight: 700 }}>Panes producidos</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Observaciones</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {producciones.map((p) => (
            <FilaProduccion key={p.id} produccion={p} />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
