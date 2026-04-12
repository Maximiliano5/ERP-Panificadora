import React from 'react';
import { Card, CardContent, Typography, Box, Skeleton } from '@mui/material';
import { AttachMoney as MoneyIcon } from '@mui/icons-material';

const formatCurrency = (value) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(value ?? 0);

export default function ValorStockCard({ valorTotal, label = 'Valor total del stock', loading }) {
  return (
    <Card
      sx={{
        background: 'linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)',
        color: 'white',
        height: '100%',
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <MoneyIcon sx={{ mr: 1, opacity: 0.85 }} />
          <Typography variant="body2" sx={{ opacity: 0.85, fontWeight: 500 }}>
            {label}
          </Typography>
        </Box>
        {loading ? (
          <Skeleton variant="text" width="60%" height={48} sx={{ bgcolor: 'rgba(255,255,255,0.2)' }} />
        ) : (
          <Typography variant="h4" fontWeight={700}>
            {formatCurrency(valorTotal)}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}
