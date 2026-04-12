import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Button, TextField, InputAdornment,
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions,
  Grid,
} from '@mui/material';
import { Add as AddIcon, Search as SearchIcon } from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { mercaderiaService } from '../services/mercaderiaService';
import MercaderiaTable from '../components/MercaderiaTable';
import MercaderiaForm from '../components/MercaderiaForm';
import ValorStockCard from '../components/ValorStockCard';

export default function MercaderiaPage() {
  const { enqueueSnackbar } = useSnackbar();
  const [mercaderias, setMercaderias] = useState([]);
  const [valorTotal, setValorTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchData = useCallback(async (nombre = '') => {
    setLoading(true);
    try {
      const data = await mercaderiaService.valorTotal(nombre);
      setMercaderias(data.mercaderias);
      setValorTotal(data.valorTotal);
    } catch (err) {
      enqueueSnackbar(err.message, { variant: 'error' });
    } finally {
      setLoading(false);
    }
  }, [enqueueSnackbar]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => fetchData(search), 350);
    return () => clearTimeout(timer);
  }, [search, fetchData]);

  const handleSave = async (data) => {
    try {
      if (editTarget) {
        await mercaderiaService.actualizar(editTarget.id, data);
        enqueueSnackbar('Mercadería actualizada', { variant: 'success' });
      } else {
        await mercaderiaService.crear(data);
        enqueueSnackbar('Mercadería creada', { variant: 'success' });
      }
      fetchData(search);
    } catch (err) {
      enqueueSnackbar(err.message, { variant: 'error' });
      throw err;
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await mercaderiaService.eliminar(deleteTarget.id);
      enqueueSnackbar('Mercadería eliminada', { variant: 'success' });
      setDeleteTarget(null);
      fetchData(search);
    } catch (err) {
      enqueueSnackbar(err.message, { variant: 'error' });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Mercaderías</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => { setEditTarget(null); setFormOpen(true); }}
        >
          Nueva mercadería
        </Button>
      </Box>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={5}>
          <TextField
            fullWidth
            placeholder="Buscar por nombre..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <ValorStockCard
            valorTotal={valorTotal}
            label={search ? `Valor filtrado: "${search}"` : 'Valor total del stock'}
            loading={loading}
          />
        </Grid>
      </Grid>

      <MercaderiaTable
        mercaderias={mercaderias}
        loading={loading}
        onEdit={(m) => { setEditTarget(m); setFormOpen(true); }}
        onDelete={setDeleteTarget}
      />

      <MercaderiaForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSave={handleSave}
        mercaderia={editTarget}
      />

      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)}>
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Eliminar <strong>{deleteTarget?.nombre}</strong>? Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)} disabled={deleting}>Cancelar</Button>
          <Button color="error" variant="contained" onClick={handleDelete} disabled={deleting}>
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
