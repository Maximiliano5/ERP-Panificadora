import React, { useState } from 'react';
import {
  AppBar, Toolbar, Button, Box,
  IconButton, Drawer, List, ListItem, ListItemButton,
  ListItemIcon, ListItemText, useMediaQuery, useTheme, Divider,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Inventory2 as InventoryIcon,
  SwapVert as MovimientosIcon,
  Menu as MenuIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import logo from '../assets/LogoROMA.jpg';

const navItems = [
  { label: 'Dashboard', path: '/dashboard', icon: <DashboardIcon /> },
  { label: 'Mercaderías', path: '/mercaderias', icon: <InventoryIcon /> },
  { label: 'Movimientos', path: '/movimientos', icon: <MovimientosIcon /> },
];

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      <AppBar position="sticky" elevation={0} sx={{ borderBottom: '1px solid rgba(255,255,255,0.15)' }}>
        <Toolbar>
          <Box
            onClick={() => navigate('/dashboard')}
            sx={{
              bgcolor: 'white',
              borderRadius: 2,
              px: 1.5,
              py: 0.5,
              mr: 2,
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            <img src={logo} alt="Roma Panificadora" style={{ height: 52 }} />
          </Box>
          <Box sx={{ flexGrow: 1 }} />

          {isMobile ? (
            <IconButton color="inherit" onClick={() => setDrawerOpen(true)}>
              <MenuIcon />
            </IconButton>
          ) : (
            <Box sx={{ display: 'flex', gap: 1 }}>
              {navItems.map((item) => (
                <Button
                  key={item.path}
                  color="inherit"
                  startIcon={item.icon}
                  onClick={() => navigate(item.path)}
                  sx={{
                    opacity: location.pathname === item.path ? 1 : 0.75,
                    borderBottom: location.pathname === item.path ? '2px solid white' : 'none',
                    borderRadius: 0,
                    pb: 0.5,
                  }}
                >
                  {item.label}
                </Button>
              ))}
            </Box>
          )}
        </Toolbar>
      </AppBar>

      <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box sx={{ width: 240 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 2, bgcolor: 'primary.main' }}>
            <img src={logo} alt="Roma Panificadora" style={{ height: 64, borderRadius: 8, background: 'white', padding: '4px 10px' }} />
          </Box>
          <Divider />
          <List>
            {navItems.map((item) => (
              <ListItem key={item.path} disablePadding>
                <ListItemButton
                  selected={location.pathname === item.path}
                  onClick={() => { navigate(item.path); setDrawerOpen(false); }}
                >
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.label} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
    </>
  );
}
