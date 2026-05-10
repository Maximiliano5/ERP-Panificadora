import React, { useState } from 'react';
import {
  Box, List, ListItem, ListItemButton,
  ListItemIcon, ListItemText, Divider, IconButton, Tooltip, Typography,
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
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import logo from '../assets/LogoRomaNegro.png';
import panIcon from '../assets/pan.png';

const EXPANDED_WIDTH = 220;
const COLLAPSED_WIDTH = 64;

const navItems = [
  { label: 'Dashboard', path: '/dashboard', icon: <DashboardIcon /> },
  { label: 'Mercaderías', path: '/mercaderias', icon: <InventoryIcon /> },
  { label: 'Movimientos', path: '/movimientos', icon: <MovimientosIcon /> },
  { label: 'Producción', path: '/produccion', icon: <img src={panIcon} alt="" style={{ width: 22, height: 22, objectFit: 'contain', filter: 'brightness(0) invert(1)' }} /> },
  { label: 'Costos', path: '/costos-produccion', icon: <CalculateIcon /> },
  { label: 'Clientes', path: '/clientes', icon: <ClientesIcon /> },
  { label: 'Ventas', path: '/ventas', icon: <VentasIcon /> },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const width = collapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH;

  const isActive = (path) =>
    path === '/dashboard'
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
            onClick={() => navigate('/dashboard')}
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
