import * as migration_20261014_182131_initial from './20261014_182131_initial'

export const migrations = [
  {
    up: migration_20261014_182131_initial.up,
    down: migration_20261014_182131_initial.down,
    name: '20261014_182131_initial',
  },
]
