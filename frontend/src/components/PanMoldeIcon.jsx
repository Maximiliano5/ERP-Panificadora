import React from 'react';
import { SvgIcon } from '@mui/material';

export default function PanMoldeIcon(props) {
  return (
    <SvgIcon {...props} viewBox="0 0 24 24">
      {/* Cuerpo del pan - hogaza ovalada */}
      <path d="M12 3C5 3 2 8 2 13C2 18 6 21 12 21C18 21 22 18 22 13C22 8 19 3 12 3Z" />
      {/* Corte decorativo en la parte superior */}
      <path d="M8 10C10 7.5 14 7.5 16 10C14 8.8 10 8.8 8 10Z" opacity="0.35" />
    </SvgIcon>
  );
}
