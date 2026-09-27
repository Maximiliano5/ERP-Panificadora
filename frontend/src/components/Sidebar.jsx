import React, { useState } from 'react';
import {
  Box, List, ListItem, ListItemButton,
  ListItemIcon, ListItemText, Divider, IconButton, Tooltip, Typography,
  Select, MenuItem,
} from '@mui/material';
import {
  ChevronLeft as CollapseIcon,
  Menu as ExpandIcon,
  Dashboard as DashboardIcon,
  Inventory2 as InventoryIcon,
  SwapVert as MovimientosIcon,
  Calculate as CalculateIcon,
  PeopleAlt as ClientesIcon,
  PointOfSale as VentasIcon,
  Grain as StockRalladoIcon,
  BakeryDining as MigaIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import logo from '../assets/LogoRomaNegro.png';
import panIcon from '../assets/pan.png';
import { useLinea, LINEAS } from '../hooks/useLinea';

const EXPANDED_WIDTH = 220;
const COLLAPSED_WIDTH = 64;

const panImg = (
  <img src={panIcon} alt="" style={{ width: 22, height: 22, objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
);

const navItemsPorLinea = {
  rallado: [
    { label: 'Dashboard', path: '/rallado/dashboard', icon: <DashboardIcon /> },
    { label: 'Mercaderías', path: '/rallado/mercaderias', icon: <InventoryIcon /> },
    { label: 'Movimientos', path: '/rallado/movimientos', icon: <MovimientosIcon /> },
    { label: 'Clientes', path: '/rallado/clientes', icon: <ClientesIcon /> },
    { label: 'Ventas', path: '/rallado/ventas', icon: <VentasIcon /> },
    { label: 'Stock Rallado', path: '/rallado/stock', icon: <StockRalladoIcon /> },
  ],
  miga: [
    { label: 'Dashboard', path: '/miga/dashboard', icon: <DashboardIcon /> },
    { label: 'Mercaderías', path: '/miga/mercaderias', icon: <InventoryIcon /> },
    { label: 'Movimientos', path: '/miga/movimientos', icon: <MovimientosIcon /> },
    { label: 'Producción', path: '/miga/produccion', icon: panImg },
    { label: 'Costos', path: '/miga/costos', icon: <CalculateIcon /> },
    { label: 'Clientes', path: '/miga/clientes', icon: <ClientesIcon /> },
    { label: 'Ventas', path: '/miga/ventas', icon: <VentasIcon /> },
  ],
};

const lineaIcon = {
  rallado: <StockRalladoIcon />,
  miga: <MigaIcon />,
};

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { linea, base } = useLinea();
  const navItems = navItemsPorLinea[linea];
  const otraLinea = linea === 'rallado' ? 'miga' : 'rallado';

  const width = collapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH;

  const cambiarLinea = (nueva) => {
    if (nueva !== linea) navigate(`/${nueva}/dashboard`);
  };

  const isActive = (path) =>
    path.endsWith('/dashboard')
      ? location.pathname === path
      : location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <Box
      sx={{
        width,
        flexShrink: 0,
        transition: 'width 0.22s cubic-bezier(0.4, 0, 0.2, 1)',
        bgcolor: 'primary.main',
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        overflow: 'hidden',
        boxShadow: '2px 0 8px rgba(0,0,0,0.15)',
      }}
    >
      {/* Header con logo y toggle */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          px: collapsed ? 0 : 1.5,
          py: 1.5,
          minHeight: 72,
        }}
      >
        {!collapsed && (
          <Box
            onClick={() => navigate(`${base}/dashboard`)}
            sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
          >
            <img
              src={logo}
              alt="Roma Panificadora"
              style={{ height: 48, background: 'white', borderRadius: 8, padding: '4px 8px' }}
            />
          </Box>
        )}
        <IconButton
          onClick={() => setCollapsed(!collapsed)}
          sx={{ color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.15)' } }}
          size="small"
        >
          {collapsed ? <ExpandIcon /> : <CollapseIcon />}
        </IconButton>
      </Box>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.2)', mx: 1 }} />

      {/* Selector de línea de producto */}
      <Box sx={{ px: collapsed ? 0.5 : 1.5, pt: 1.5, pb: 0.5, display: 'flex', justifyContent: 'center' }}>
        {collapsed ? (
          <Tooltip
            title={`${LINEAS[linea].label} (clic para cambiar a ${LINEAS[otraLinea].label})`}
            placement="right"
            arrow
          >
            <IconButton
              onClick={() => cambiarLinea(otraLinea)}
              sx={{ color: 'primary.main', bgcolor: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.85)' } }}
            >
              {lineaIcon[linea]}
            </IconButton>
          </Tooltip>
        ) : (
          <Select
            fullWidth
            size="small"
            value={linea}
            onChange={(e) => cambiarLinea(e.target.value)}
            renderValue={(v) => (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {lineaIcon[v]}
                <Typography fontSize={14} fontWeight={700}>{LINEAS[v].label}</Typography>
              </Box>
            )}
            sx={{
              bgcolor: 'white',
              color: 'primary.main',
              borderRadius: 2,
              '& .MuiSelect-icon': { color: 'primary.main' },
              '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
            }}
          >
            {Object.values(LINEAS).map((l) => (
              <MenuItem key={l.key} value={l.key}>
                <ListItemIcon sx={{ minWidth: 34, color: 'primary.main' }}>{lineaIcon[l.key]}</ListItemIcon>
                {l.label}
              </MenuItem>
            ))}
          </Select>
        )}
      </Box>

      {/* Ítems de navegación */}
      <List sx={{ flex: 1, pt: 1, px: 0.5 }}>
        {navItems.map((item) => {
          const active = isActive(item.path);
          return (
            <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
              <Tooltip title={collapsed ? item.label : ''} placement="right" arrow>
                <ListItemButton
                  onClick={() => navigate(item.path)}
                  sx={{
                    borderRadius: 2,
                    color: 'white',
                    bgcolor: active ? 'rgba(255,255,255,0.22)' : 'transparent',
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.14)' },
                    justifyContent: collapsed ? 'center' : 'flex-start',
                    px: collapsed ? 1 : 2,
                    py: 1.1,
                    minWidth: 0,
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: 'white',
                      minWidth: 0,
                      mr: collapsed ? 0 : 1.5,
                      justifyContent: 'center',
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  {!collapsed && (
                    <ListItemText
                      primary={item.label}
                      primaryTypographyProps={{
                        fontSize: 14,
                        fontWeight: active ? 700 : 400,
                        noWrap: true,
                      }}
                    />
                  )}
                </ListItemButton>
              </Tooltip>
            </ListItem>
          );
        })}
      </List>

      {/* Footer con versión */}
      {!collapsed && (
        <Box sx={{ p: 2, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', display: 'block', textAlign: 'center' }}>
            Roma ERP v1.0
          </Typography>
        </Box>
      )}
    </Box>
  );
}
