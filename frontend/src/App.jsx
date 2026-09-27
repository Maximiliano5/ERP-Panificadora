import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';
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
import StockRalladoPage from './pages/StockRalladoPage';

// Compatibilidad con URLs viejas (/clientes/:id sin prefijo de línea)
function RedirectClientePerfil() {
  const { id } = useParams();
  return <Navigate to={`/rallado/clientes/${id}`} replace />;
}

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
                <Route path="/" element={<Navigate to="/rallado/dashboard" replace />} />

                {/* ── Pan Rallado ── */}
                <Route path="/rallado" element={<Navigate to="/rallado/dashboard" replace />} />
                <Route path="/rallado/dashboard" element={<Dashboard key="rallado" linea="rallado" />} />
                <Route path="/rallado/mercaderias" element={<MercaderiaPage />} />
                <Route path="/rallado/movimientos" element={<MovimientosPage />} />
                <Route path="/rallado/clientes" element={<ClientesPage key="rallado" linea="rallado" />} />
                <Route path="/rallado/clientes/:id" element={<ClientePerfilPage key="rallado" linea="rallado" />} />
                <Route path="/rallado/ventas" element={<VentasPage key="rallado" linea="rallado" />} />
                <Route path="/rallado/stock" element={<StockRalladoPage />} />

                {/* ── Pan de Miga ── */}
                <Route path="/miga" element={<Navigate to="/miga/dashboard" replace />} />
                <Route path="/miga/dashboard" element={<Dashboard key="miga" linea="miga" />} />
                <Route path="/miga/mercaderias" element={<MercaderiaPage />} />
                <Route path="/miga/movimientos" element={<MovimientosPage />} />
                <Route path="/miga/produccion" element={<ProduccionPage />} />
                <Route path="/miga/costos" element={<CostoProduccionPage />} />
                <Route path="/miga/clientes" element={<ClientesPage key="miga" linea="miga" />} />
                <Route path="/miga/clientes/:id" element={<ClientePerfilPage key="miga" linea="miga" />} />
                <Route path="/miga/ventas" element={<VentasPage key="miga" linea="miga" />} />

                {/* ── URLs anteriores ── */}
                <Route path="/dashboard" element={<Navigate to="/rallado/dashboard" replace />} />
                <Route path="/mercaderias" element={<Navigate to="/rallado/mercaderias" replace />} />
                <Route path="/movimientos" element={<Navigate to="/rallado/movimientos" replace />} />
                <Route path="/clientes" element={<Navigate to="/rallado/clientes" replace />} />
                <Route path="/clientes/:id" element={<RedirectClientePerfil />} />
                <Route path="/ventas" element={<Navigate to="/rallado/ventas" replace />} />
                <Route path="/stock-rallado" element={<Navigate to="/rallado/stock" replace />} />
                <Route path="/produccion" element={<Navigate to="/miga/produccion" replace />} />
                <Route path="/costos-produccion" element={<Navigate to="/miga/costos" replace />} />
                <Route path="*" element={<Navigate to="/rallado/dashboard" replace />} />
              </Routes>
            </Box>
          </Box>
        </BrowserRouter>
      </SnackbarProvider>
    </ThemeProvider>
  );
}

export default App;
