import * as migration_20261014_182131_initial from './20261014_182131_initial';
import * as migration_20261015_132241_imagenes_y_datos_rapidos from './20261015_132241_imagenes_y_datos_rapidos';
import * as migration_20261015_140457_plataforma_editorial from './20261015_140457_plataforma_editorial';

export const migrations = [
  {
    up: migration_20261014_182131_initial.up,
    down: migration_20261014_182131_initial.down,
    name: '20261014_182131_initial',
  },
  {
    up: migration_20261015_132241_imagenes_y_datos_rapidos.up,
    down: migration_20261015_132241_imagenes_y_datos_rapidos.down,
    name: '20261015_132241_imagenes_y_datos_rapidos',
  },
  {
    up: migration_20261015_140457_plataforma_editorial.up,
    down: migration_20261015_140457_plataforma_editorial.down,
    name: '20261015_140457_plataforma_editorial'
  },
];
