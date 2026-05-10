import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline, Box } from '@mui/material';
import { SnackbarProvider } from 'notistack';
import theme from './theme';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import MercaderiaPage from './pages/MercaderiaPage';
import MovimientosPage from './pages/MovimientosPage';
import ProduccionPage from './pages/ProduccionPage';
import CostoProduccionPage from './pages/CostoProduccionPage';
import ClientesPage from './pages/ClientesPage';
import ClientePerfilPage from './pages/ClientePerfilPage';
import VentasPage from './pages/VentasPage';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SnackbarProvider
        maxSnack={3}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        autoHideDuration={4000}
      >
        <BrowserRouter>
          <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'grey.50' }}>
            <Sidebar />
            <Box sx={{ flex: 1, overflow: 'auto', minWidth: 0 }}>
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/mercaderias" element={<MercaderiaPage />} />
                <Route path="/movimientos" element={<MovimientosPage />} />
                <Route path="/produccion" element={<ProduccionPage />} />
                <Route path="/costos-produccion" element={<CostoProduccionPage />} />
                <Route path="/clientes" element={<ClientesPage />} />
                <Route path="/clientes/:id" element={<ClientePerfilPage />} />
                <Route path="/ventas" element={<VentasPage />} />
              </Routes>
            </Box>
          </Box>
        </BrowserRouter>
      </SnackbarProvider>
    </ThemeProvider>
  );
}

export default App;
