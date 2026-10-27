import type { TitleLines } from './types';

export const caso: {
  enabled: boolean;
  label: string;
  badge: string;
  titleLines: TitleLines;
  text: string;
  bullets: readonly string[];
  table: {
    caption: string;
    headers: readonly string[];
    rows: readonly (readonly string[])[];
  };
} = {
  enabled: false, // activar cuando haya un caso real con permiso
  label: 'Caso real',
  badge: 'En prueba',
  titleLines: ['Factura a Costo', 'de la foto al precio de venta.'],
  text: 'Lee la foto de una boleta de proveedor y calcula el costo real y el precio de venta de cada producto.',
  bullets: [
    'Lee la boleta desde una foto',
    'Costo real: descuentos, impuestos internos e IVA',
    'Precio de venta con margen por rubro',
    'Deuda acumulada por proveedor',
  ],
  table: {
    caption: 'Ejemplo ilustrativo',
    headers: ['Producto', 'Lista', 'Costo real', 'Venta'],
    rows: [
      ['Producto A', '$ 3.200', '$ 2.950', '$ 3.900'],
      ['Producto B', '$ 1.850', '$ 1.720', '$ 2.300'],
      ['Producto C', '$ 5.400', '$ 5.010', '$ 6.600'],
    ],
  },
};
