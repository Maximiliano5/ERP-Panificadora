import { useLocation } from 'react-router-dom';

export const LINEAS = {
  rallado: { key: 'rallado', label: 'Pan Rallado' },
  miga: { key: 'miga', label: 'Pan de Miga' },
};

export const LINEA_DEFAULT = 'rallado';

// La línea activa se deriva del prefijo de la URL (/rallado/... o /miga/...)
export function useLinea() {
  const { pathname } = useLocation();
  const segmento = pathname.split('/')[1];
  const linea = LINEAS[segmento] ? segmento : LINEA_DEFAULT;
  return { linea, base: `/${linea}`, esRallado: linea === 'rallado', esMiga: linea === 'miga' };
}
